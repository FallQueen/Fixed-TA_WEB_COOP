# ==========================================
# SEMUA IMPORT YANG DIBUTUHKAN
# ==========================================
import secrets
from urllib.parse import urlencode

import requests
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated 
from rest_framework.views import APIView 
from rest_framework.response import Response
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import mixins, viewsets, permissions, status 
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token

# Import models
from .models import Certificate, DocumentTemplate, FinalReport, MonthlyReport, Notification, SupervisorEvaluation, User, UtsReport, Vacancy, Application, Placement, WeeklyHuntReport

# Import serializers dari file serializers.py sebelah
from .serializers import (
    CertificateReadSerializer, CertificateWriteSerializer, DocumentTemplateSerializer, 
    FinalReportSerializer, MonthlyReportSerializer, NotificationSerializer, SupervisorEvaluationReadSerializer, 
    SupervisorEvaluationWriteSerializer, UserProfileSerializer, VacancySerializer, 
    ApplicationSerializer, PlacementSerializer, WeeklyHuntReportSerializer, 
    UtsReportSerializer, ChangePasswordSerializer, MIN_INTERNSHIP_WORKING_DAYS, count_working_days
)

REQUIRED_REGISTRATION_DOCUMENTS = {
    'bukti_konsul_file': 'Bukti Konsul',
    'sptjm_file': 'SPTJM',
}

MICROSOFT_OAUTH_STATE_SALT = 'coop.microsoft-sso.state'
MICROSOFT_REGISTER_TOKEN_SALT = 'coop.microsoft-sso.register-token'
MICROSOFT_GRAPH_ME_URL = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,givenName,surname'
MICROSOFT_ADMIN_LINK_FLOW = 'admin_link'


def invalid_login_response():
    return Response(
        {'non_field_errors': ['Unable to log in with provided credentials.']},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    identifier = (request.data.get('username') or request.data.get('email') or '').strip()
    password = request.data.get('password') or ''

    if not identifier or not password:
        return invalid_login_response()

    user = User.objects.filter(username__iexact=identifier).first()

    if user is None and '@' in identifier:
        user = User.objects.filter(email__iexact=identifier).first()

    if user is None:
        return invalid_login_response()

    authenticated_user = authenticate(
        request=request,
        username=user.username,
        password=password,
    )

    if authenticated_user is None:
        return invalid_login_response()

    if not authenticated_user.is_active:
        return Response(
            {'non_field_errors': ['User account is disabled.']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token, _ = Token.objects.get_or_create(user=authenticated_user)
    return Response({'token': token.key})


def get_frontend_url(path='', **query_params):
    base_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    normalized_path = path if path.startswith('/') else f'/{path}'
    query_string = urlencode({key: value for key, value in query_params.items() if value})

    return f'{base_url}{normalized_path}{f"?{query_string}" if query_string else ""}'


def get_microsoft_sso_config():
    client_id = getattr(settings, 'MICROSOFT_SSO_CLIENT_ID', '')
    tenant_id = getattr(settings, 'MICROSOFT_SSO_TENANT_ID', '')
    client_secret = getattr(settings, 'MICROSOFT_SSO_CLIENT_SECRET', '')
    redirect_uri = getattr(settings, 'MICROSOFT_SSO_REDIRECT_URI', '')

    if not all([client_id, tenant_id, client_secret, redirect_uri]):
        raise ValidationError({
            'error': 'Konfigurasi Microsoft SSO belum lengkap. Isi MICROSOFT_SSO_CLIENT_ID, MICROSOFT_SSO_TENANT_ID, MICROSOFT_SSO_CLIENT_SECRET, dan MICROSOFT_SSO_REDIRECT_URI.'
        })

    return {
        'client_id': client_id,
        'tenant_id': tenant_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'scopes': getattr(settings, 'MICROSOFT_SSO_SCOPES', ['openid', 'profile', 'email', 'User.Read']),
    }


def microsoft_sso_error_redirect(message):
    return redirect(get_frontend_url('/login', microsoft_error=message))


def microsoft_register_error_redirect(message):
    return redirect(get_frontend_url('/register', microsoft_error=message))


def microsoft_admin_link_redirect(message=''):
    query_params = {
        'tab': 'pengaturan',
        'microsoft_link_error': message,
    }
    if not message:
        query_params['microsoft_linked'] = '1'

    return redirect(get_frontend_url('/admin-dashboard', **query_params))


def get_microsoft_error_redirect(flow):
    if flow == 'register':
        return microsoft_register_error_redirect
    if flow == MICROSOFT_ADMIN_LINK_FLOW:
        return microsoft_admin_link_redirect
    return microsoft_sso_error_redirect


def get_microsoft_flow(state_payload):
    flow = state_payload.get('flow')
    if flow in ['register', MICROSOFT_ADMIN_LINK_FLOW]:
        return flow
    return 'login'


def build_microsoft_authorization_url(config, state):
    return (
        f"https://login.microsoftonline.com/{config['tenant_id']}/oauth2/v2.0/authorize?"
        + urlencode({
            'client_id': config['client_id'],
            'response_type': 'code',
            'redirect_uri': config['redirect_uri'],
            'response_mode': 'query',
            'scope': ' '.join(config['scopes']),
            'state': state,
            'prompt': 'select_account',
        })
    )


def split_display_name(display_name):
    if not display_name:
        return '', ''

    name_parts = display_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''

    return first_name, last_name


def build_microsoft_registration_payload(profile, email):
    first_name = profile.get('givenName') or ''
    last_name = profile.get('surname') or ''

    if not first_name:
        first_name, last_name = split_display_name(profile.get('displayName') or '')

    return {
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
        'microsoft_id': profile.get('id') or '',
    }


def get_microsoft_user(access_token):
    response = requests.get(
        MICROSOFT_GRAPH_ME_URL,
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=10,
    )
    response.raise_for_status()
    profile = response.json()
    email = (profile.get('mail') or profile.get('userPrincipalName') or '').strip().lower()

    if not email:
        raise ValidationError({'error': 'Email Microsoft tidak ditemukan pada profil user.'})

    return profile, email


def get_microsoft_profile_id(profile):
    return str(profile.get('id') or '').strip()


def find_user_for_microsoft_profile(profile, email):
    microsoft_id = get_microsoft_profile_id(profile)
    if microsoft_id:
        linked_user = User.objects.filter(microsoft_id=microsoft_id).first()
        if linked_user:
            return linked_user

    return User.objects.filter(
        Q(email__iexact=email)
        | Q(username__iexact=email)
        | Q(microsoft_email__iexact=email)
    ).first()


def is_pdf_upload(file):
    file_name = getattr(file, 'name', '').lower()
    content_type = getattr(file, 'content_type', '')
    return content_type == 'application/pdf' or file_name.endswith('.pdf')


def archive_replaced_placements(student, replacement_placement, previous_placement_end_date=None):
    old_placements = Placement.objects.filter(
        student=student,
        status__in=['pending', 'verified'],
    )

    if replacement_placement:
        old_placements = old_placements.exclude(id=replacement_placement.id)

    for old_placement in old_placements:
        was_verified = old_placement.status == 'verified'
        old_placement.status = 'resigned'
        old_placement.is_approved = False
        update_fields = ['status', 'is_approved']

        if was_verified and previous_placement_end_date:
            old_placement.end_date = previous_placement_end_date
            update_fields.append('end_date')

        old_placement.save(update_fields=update_fields)


@api_view(['GET'])
@permission_classes([AllowAny])
def microsoft_sso_login(request):
    flow = 'register' if request.GET.get('flow') == 'register' else 'login'
    error_redirect = get_microsoft_error_redirect(flow)

    try:
        config = get_microsoft_sso_config()
    except ValidationError as error:
        return error_redirect(error.detail.get('error', 'Microsoft SSO belum dikonfigurasi.'))

    state = signing.dumps(
        {'nonce': secrets.token_urlsafe(24), 'flow': flow},
        salt=MICROSOFT_OAUTH_STATE_SALT,
    )
    authorization_url = build_microsoft_authorization_url(config, state)

    return redirect(authorization_url)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def microsoft_sso_admin_link(request):
    if not request.user.is_staff:
        return Response(
            {'detail': 'Hanya admin yang dapat menghubungkan akun Microsoft administrator.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        config = get_microsoft_sso_config()
    except ValidationError as error:
        return Response(
            {'detail': error.detail.get('error', 'Microsoft SSO belum dikonfigurasi.')},
            status=status.HTTP_400_BAD_REQUEST,
        )

    state = signing.dumps(
        {
            'nonce': secrets.token_urlsafe(24),
            'flow': MICROSOFT_ADMIN_LINK_FLOW,
            'user_id': request.user.id,
        },
        salt=MICROSOFT_OAUTH_STATE_SALT,
    )

    return Response({
        'authorization_url': build_microsoft_authorization_url(config, state),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def microsoft_sso_admin_unlink(request):
    if not request.user.is_staff:
        return Response(
            {'detail': 'Hanya admin yang dapat memutuskan akun Microsoft administrator.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    request.user.microsoft_id = None
    request.user.microsoft_email = ''
    request.user.save(update_fields=['microsoft_id', 'microsoft_email'])

    return Response({'message': 'Koneksi akun Microsoft berhasil diputuskan.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def microsoft_sso_callback(request):
    flow = 'login'
    error_redirect = microsoft_sso_error_redirect
    state_payload = {}
    state = request.GET.get('state')

    if state:
        try:
            state_payload = signing.loads(state, salt=MICROSOFT_OAUTH_STATE_SALT, max_age=600)
            flow = get_microsoft_flow(state_payload)
            error_redirect = get_microsoft_error_redirect(flow)
        except signing.SignatureExpired:
            return error_redirect('Sesi SSO kedaluwarsa. Silakan coba login ulang.')
        except signing.BadSignature:
            return error_redirect('State SSO tidak valid. Silakan coba login ulang.')

    error = request.GET.get('error')
    if error:
        return error_redirect(request.GET.get('error_description') or error)

    code = request.GET.get('code')

    if not code or not state:
        return error_redirect('Callback Microsoft tidak lengkap.')

    try:
        config = get_microsoft_sso_config()
    except ValidationError as error:
        return error_redirect(error.detail.get('error', 'Microsoft SSO belum dikonfigurasi.'))

    token_url = f"https://login.microsoftonline.com/{config['tenant_id']}/oauth2/v2.0/token"

    try:
        token_response = requests.post(
            token_url,
            data={
                'client_id': config['client_id'],
                'client_secret': config['client_secret'],
                'code': code,
                'redirect_uri': config['redirect_uri'],
                'grant_type': 'authorization_code',
                'scope': ' '.join(config['scopes']),
            },
            timeout=10,
        )
        token_response.raise_for_status()
        access_token = token_response.json().get('access_token')

        if not access_token:
            return error_redirect('Microsoft tidak mengembalikan access token.')

        profile, email = get_microsoft_user(access_token)
    except requests.RequestException:
        return error_redirect('Gagal terhubung ke Microsoft SSO. Silakan coba lagi.')
    except ValidationError as error:
        return error_redirect(error.detail.get('error', 'Profil Microsoft tidak valid.'))

    microsoft_id = get_microsoft_profile_id(profile)
    user = find_user_for_microsoft_profile(profile, email)

    if flow == MICROSOFT_ADMIN_LINK_FLOW:
        admin_user = User.objects.filter(
            id=state_payload.get('user_id'),
            is_staff=True,
            is_active=True,
        ).first()

        if not admin_user:
            return error_redirect('Akun admin untuk integrasi Microsoft tidak ditemukan atau sudah tidak aktif.')

        if not microsoft_id:
            return error_redirect('ID akun Microsoft tidak ditemukan pada profil Outlook.')

        conflicting_user = User.objects.filter(microsoft_id=microsoft_id).exclude(id=admin_user.id).first()
        if conflicting_user:
            return error_redirect('Akun Microsoft tersebut sudah terhubung ke akun portal lain.')

        conflicting_email_user = User.objects.filter(
            Q(email__iexact=email)
            | Q(username__iexact=email)
            | Q(microsoft_email__iexact=email)
        ).exclude(id=admin_user.id).first()
        if conflicting_email_user:
            return error_redirect('Email Microsoft tersebut sudah terhubung ke akun portal lain.')

        admin_user.microsoft_id = microsoft_id
        admin_user.microsoft_email = email
        admin_user.save(update_fields=['microsoft_id', 'microsoft_email'])

        return microsoft_admin_link_redirect()

    if flow == 'register':
        if user:
            if user.is_active:
                return microsoft_sso_error_redirect(
                    f'Akun {email} sudah terdaftar. Silakan masuk dengan Microsoft.'
                )

            if user.registration_status != 'rejected':
                return microsoft_register_error_redirect(
                    f'Akun {email} sudah terdaftar dan sedang menunggu persetujuan admin.'
                )

        registration_payload = build_microsoft_registration_payload(profile, email)
        registration_token = signing.dumps(
            registration_payload,
            salt=MICROSOFT_REGISTER_TOKEN_SALT,
            compress=True,
        )

        return redirect(get_frontend_url(
            '/register',
            microsoft_registration_token=registration_token,
            email=registration_payload['email'],
            first_name=registration_payload['first_name'],
            last_name=registration_payload['last_name'],
        ))

    if not user:
        return microsoft_sso_error_redirect(
            'Email Outlook Anda belum terdaftar di Portal Co-op. '
            'Silakan daftar dengan Microsoft terlebih dahulu, lalu lengkapi data pendaftaran.'
        )

    if not user.is_active:
        if user.registration_status == 'rejected':
            return microsoft_sso_error_redirect(
                'Pendaftaran akun Anda ditolak dan perlu diperbaiki. Silakan cek email kampus, lalu daftar ulang.'
            )
        return microsoft_sso_error_redirect('Akun Anda belum disetujui oleh Admin. Harap tunggu.')

    if user.microsoft_id and user.microsoft_id != microsoft_id:
        return microsoft_sso_error_redirect(
            'Akun Microsoft ini tidak sesuai dengan identitas Microsoft yang sudah terhubung ke portal.'
        )

    if user.is_staff and not user.microsoft_id:
        return microsoft_sso_error_redirect(
            'Akun admin belum dihubungkan ke Microsoft. Masuk dengan ID login dan password terlebih dahulu, '
            'lalu hubungkan Outlook melalui Pengaturan Keamanan.'
        )

    if microsoft_id and not user.microsoft_id:
        user.microsoft_id = microsoft_id
        user.microsoft_email = email
        user.save(update_fields=['microsoft_id', 'microsoft_email'])

    if not user.first_name and profile.get('givenName'):
        user.first_name = profile.get('givenName') or ''
        user.last_name = profile.get('surname') or ''
        user.save(update_fields=['first_name', 'last_name'])

    token, _ = Token.objects.get_or_create(user=user)
    callback_path = getattr(settings, 'MICROSOFT_SSO_FRONTEND_CALLBACK_PATH', '/auth/microsoft/callback')

    return redirect(get_frontend_url(callback_path, token=token.key))


def create_student_notification(
    student,
    title,
    message,
    notification_type='general',
    target_tab='',
    action_url='',
    action_label='',
):
    if not student:
        return None

    return Notification.objects.create(
        student=student,
        title=title,
        message=message,
        notification_type=notification_type,
        target_tab=target_tab or '',
        action_url=action_url or '',
        action_label=action_label or '',
    )


def create_bulk_student_notifications(students, title, message, notification_type='general', target_tab=''):
    notifications = [
        Notification(
            student=student,
            title=title,
            message=message,
            notification_type=notification_type,
            target_tab=target_tab or '',
        )
        for student in students
    ]

    if notifications:
        Notification.objects.bulk_create(notifications)


def get_supervisor_evaluation_form_url(evaluation):
    frontend_base_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    return f"{frontend_base_url}/evaluasi/{evaluation.id}"


def send_supervisor_evaluation_request_email(evaluation, form_url, request_data=None):
    request_data = request_data or {}
    placement = evaluation.placement
    student = placement.student
    supervisor_email = (placement.supervisor_email or '').strip()

    if not supervisor_email:
        raise ValidationError({'supervisor_email': 'Email supervisor belum tersedia.'})

    student_name = f"{student.first_name} {student.last_name}".strip() or student.email
    supervisor_name = placement.supervisor_name or 'Supervisor'
    type_label = 'Kemajuan (UTS)' if evaluation.eval_type == 'UTS' else 'Akhir (UAS)'
    subject = (request_data.get('subject') or f"Permohonan Pengisian Form Evaluasi {type_label} - {student_name}").strip()
    custom_message = (request_data.get('message') or '').strip()

    if custom_message:
        message = custom_message.replace('[Otomatis]', form_url)
        if form_url not in message:
            message = f"{message}\n\nTautan form evaluasi:\n{form_url}"
    else:
        message = (
            f"Yth. Bapak/Ibu {supervisor_name},\n\n"
            f"Mohon kesediaannya mengisi form Evaluasi {type_label} untuk mahasiswa berikut:\n\n"
            f"Nama: {student_name}\n"
            f"NIM: {student.nim or '-'}\n"
            f"Perusahaan: {placement.company_name}\n"
            f"Posisi: {placement.position}\n\n"
            f"Tautan form evaluasi:\n{form_url}\n\n"
            "Terima kasih,\n"
            "Admin Unit Co-op"
        )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [supervisor_email],
        fail_silently=False,
    )


def send_student_approval_email(user):
    login_url = f"{getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')}/login"
    student_name = f"{user.first_name} {user.last_name}".strip() or user.email
    subject = "Akun Co-op Anda Sudah Disetujui"
    message = (
        f"Halo {student_name},\n\n"
        "Akun Co-op Anda telah disetujui oleh Admin Unit Co-op.\n"
        "Sekarang Anda sudah bisa login ke sistem.\n\n"
        f"Silakan masuk melalui tautan berikut:\n{login_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_student_registration_rejection_email(user):
    register_url = get_frontend_url('/register')
    student_name = f"{user.first_name} {user.last_name}".strip() or user.email
    subject = "Pendaftaran Akun Co-op Perlu Diperbaiki"
    message = (
        f"Halo {student_name},\n\n"
        "Pendaftaran akun Co-op Anda belum dapat disetujui oleh Admin Unit Co-op.\n\n"
        "Alasan penolakan:\n"
        f"{user.registration_rejection_reason}\n\n"
        "Silakan daftar ulang menggunakan email kampus yang sama setelah data atau dokumen diperbaiki. "
        "Pendaftaran ulang Anda akan kembali masuk ke antrean persetujuan admin.\n\n"
        f"Daftar ulang melalui tautan berikut:\n{register_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def build_password_reset_url(user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return get_frontend_url(f'/reset-password/{uidb64}/{token}')


def get_password_reset_user(uidb64):
    try:
        user_id = force_str(urlsafe_base64_decode(uidb64))
        return User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist, UnicodeDecodeError):
        return None


def send_password_reset_link_email(user, reset_url):
    student_name = f"{user.first_name} {user.last_name}".strip() or user.email
    subject = "Link Reset Password Akun Co-op"
    message = (
        f"Halo {student_name},\n\n"
        "Admin Unit Co-op telah mengirimkan permintaan reset password untuk akun Co-op Anda.\n\n"
        "Silakan klik tautan berikut untuk membuat password baru:\n"
        f"{reset_url}\n\n"
        "Tautan ini hanya dapat digunakan selama masih berlaku dan akan otomatis tidak valid setelah password berhasil diganti.\n\n"
        "Jika Anda tidak meminta reset password ini, segera hubungi Admin Unit Co-op.\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_placement_approval_email(placement):
    dashboard_url = f"{getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')}/dashboard"
    student = placement.student
    student_name = f"{student.first_name} {student.last_name}".strip() or student.email
    subject = "Data Magang Anda Sudah Disetujui"
    message = (
        f"Halo {student_name},\n\n"
        "Data magang yang Anda input telah disetujui oleh Admin Unit Co-op.\n\n"
        f"Perusahaan: {placement.company_name}\n"
        f"Posisi: {placement.position}\n\n"
        "Anda sekarang dapat melanjutkan proses Co-op di sistem, termasuk pengisian laporan yang diperlukan.\n\n"
        f"Silakan buka dashboard melalui tautan berikut:\n{dashboard_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=False,
    )


def send_placement_rejection_email(placement):
    dashboard_url = get_frontend_url('/dashboard')
    student = placement.student
    student_name = f"{student.first_name} {student.last_name}".strip() or student.email
    subject = "Pengajuan Tempat Magang Perlu Diperbaiki"
    message = (
        f"Halo {student_name},\n\n"
        f"Pengajuan tempat magang Anda di {placement.company_name} belum dapat disetujui oleh Admin Unit Co-op.\n\n"
        "Alasan penolakan:\n"
        f"{placement.rejection_reason}\n\n"
        "Silakan perbaiki data atau dokumen yang diperlukan, lalu ajukan kembali melalui Portal Co-op.\n\n"
        f"Buka portal melalui tautan berikut:\n{dashboard_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=False,
    )


def get_vacancy_notification_targets():
    return list(
        User.objects.filter(is_mahasiswa=True, is_active=True)
        .exclude(placement__is_approved=True)
        .exclude(placement__status__in=['verified', 'completed', 'finished'])
        .distinct()
    )


def send_vacancy_notification_email(vacancy, students):
    emails = [student.email for student in students if student.email]
    if not emails:
        return 0

    contact_name = (vacancy.supervisor_name or 'Admin Co-op Prasmul').strip()
    contact_email = (vacancy.supervisor_email or 'coop@prasetiyamulya.ac.id').strip()
    contact_phone = (vacancy.supervisor_phone or '+62 851-1751-2341').strip()
    frontend_base_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    dashboard_url = f"{frontend_base_url}/dashboard"
    apply_url = vacancy.external_apply_link or dashboard_url
    deadline_text = vacancy.expires_at.strftime('%d %B %Y') if vacancy.expires_at else '-'
    subject = f"Lowongan Magang Baru: {vacancy.title} - {vacancy.company_name}"
    message = (
        "Halo mahasiswa,\n\n"
        "Ada lowongan magang baru yang telah dipublikasikan di Portal Co-op.\n\n"
        f"Posisi: {vacancy.title}\n"
        f"Perusahaan: {vacancy.company_name}\n"
        f"Batas akhir: {deadline_text}\n\n"
        f"Deskripsi singkat:\n{vacancy.description}\n\n"
        f"Persyaratan:\n{vacancy.requirements}\n\n"
        f"Kontak: {contact_name}\n"
        f"Email: {contact_email}\n"
        f"WhatsApp: {contact_phone}\n\n"
        f"Silakan cek detail dan ajukan lamaran melalui tautan berikut:\n{apply_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        bcc=emails,
    )
    email.send(fail_silently=False)
    return len(emails)


APPLICATION_STATUS_MESSAGES = {
    'reviewed': {
        'title': 'Lamaranmu diteruskan ke perusahaan',
        'message': 'Lamaran kamu sudah direview Admin Co-op dan diteruskan ke pihak perusahaan.',
    },
    'accepted': {
        'title': 'Lamaranmu diterima perusahaan',
        'message': 'Selamat! Lamaran kamu telah diterima perusahaan.',
    },
    'rejected': {
        'title': 'Lamaranmu belum diterima',
        'message': 'Lamaran kamu belum diterima untuk lowongan ini. Tetap pantau peluang magang lain di Portal Co-op.',
    },
}


def send_application_status_email(application, old_status):
    student = application.student
    if not student.email or application.status not in APPLICATION_STATUS_MESSAGES:
        return False

    status_meta = APPLICATION_STATUS_MESSAGES[application.status]
    frontend_base_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173').rstrip('/')
    dashboard_url = f"{frontend_base_url}/dashboard"
    start_date = application.internship_start_date.strftime('%d %B %Y') if application.internship_start_date else '-'
    end_date = application.internship_end_date.strftime('%d %B %Y') if application.internship_end_date else '-'
    old_status_label = dict(Application.STATUS_CHOICES).get(old_status, old_status)
    subject = f"{status_meta['title']}: {application.vacancy.title}"
    message = (
        f"Halo {student.first_name or student.username},\n\n"
        f"{status_meta['message']}\n\n"
        f"Lowongan: {application.vacancy.title}\n"
        f"Perusahaan: {application.vacancy.company_name}\n"
        f"Periode diajukan: {start_date} - {end_date}\n"
        f"Status sebelumnya: {old_status_label}\n"
        f"Status terbaru: {application.get_status_display()}\n\n"
        f"Silakan cek detailnya melalui Portal Co-op:\n{dashboard_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [student.email], fail_silently=False)
    except Exception:
        return False

    return True


def notify_student_application_status_change(application, old_status):
    if application.status not in APPLICATION_STATUS_MESSAGES:
        return

    status_meta = APPLICATION_STATUS_MESSAGES[application.status]
    create_student_notification(
        application.student,
        status_meta['title'],
        f"{status_meta['message']} Lowongan: {application.vacancy.title} di {application.vacancy.company_name}.",
        notification_type='application',
        target_tab='lowongan',
    )
    send_application_status_email(application, old_status)


def calculate_required_monthly_report_count(start_date, end_date):
    if not start_date or not end_date or end_date < start_date:
        return 0

    month_count = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
    if end_date.day >= start_date.day:
        month_count += 1

    return max(1, month_count)


def get_reportable_certificate_placements(placement):
    valid_history_statuses = ['resigned', 'completed', 'verified', 'finished']
    related_placements = []

    for item in Placement.objects.filter(student=placement.student):
        is_selected_placement = item.id == placement.id
        is_valid_history = (
            item.status not in ['pending', 'rejected']
            and (item.is_approved or item.status in valid_history_statuses)
        )

        if is_selected_placement or is_valid_history:
            related_placements.append(item)

    return sorted(related_placements, key=lambda item: (item.start_date, item.created_at, item.id))


def get_effective_placement_end_date(placement, related_placements):
    cutoff_dates = [
        item.previous_placement_end_date
        for item in related_placements
        if (
            item.id != placement.id
            and item.previous_placement_end_date
            and item.start_date > item.previous_placement_end_date
            and placement.start_date <= item.previous_placement_end_date <= placement.end_date
        )
    ]
    transfer_cutoff_date = min(cutoff_dates) if cutoff_dates else None

    if transfer_cutoff_date and transfer_cutoff_date < placement.end_date:
        return transfer_cutoff_date

    return placement.end_date


def get_certificate_completion_missing_items(placement):
    related_placements = get_reportable_certificate_placements(placement)
    related_placement_ids = [item.id for item in related_placements]
    required_monthly_reports = 0
    has_invalid_period = False

    for item in related_placements:
        effective_end_date = get_effective_placement_end_date(item, related_placements)
        required_count = calculate_required_monthly_report_count(item.start_date, effective_end_date)
        required_monthly_reports += required_count
        has_invalid_period = has_invalid_period or required_count == 0

    submitted_monthly_reports = MonthlyReport.objects.filter(
        placement_id__in=related_placement_ids,
    ).count()
    missing_items = []

    if has_invalid_period:
        missing_items.append("Periode magang belum lengkap atau tanggal mulai/selesai tidak valid.")
    elif required_monthly_reports == 0 or submitted_monthly_reports < required_monthly_reports:
        missing_items.append(
            f"Laporan bulanan belum lengkap ({submitted_monthly_reports}/{required_monthly_reports} laporan terkumpul sesuai total durasi magang)."
        )

    if not UtsReport.objects.filter(placement_id__in=related_placement_ids).exists():
        missing_items.append("Dokumen Laporan Tengah Semester (UTS) belum diunggah.")

    if not FinalReport.objects.filter(placement_id__in=related_placement_ids).exists():
        missing_items.append("Dokumen Laporan Akhir (UAS) belum diunggah.")

    if not SupervisorEvaluation.objects.filter(
        placement_id__in=related_placement_ids,
        eval_type='UTS',
        is_filled=True,
    ).exists():
        missing_items.append("Evaluasi Kemajuan (UTS) dari supervisor belum tersedia.")

    if not SupervisorEvaluation.objects.filter(
        placement_id__in=related_placement_ids,
        eval_type='UAS',
        is_filled=True,
    ).exists():
        missing_items.append("Evaluasi Akhir (UAS) dari supervisor belum tersedia.")

    return missing_items


def get_latest_completion_reminder_placements():
    placements_by_student = {}
    placement_priority = {
        'verified': 3,
        'completed': 2,
        'finished': 2,
        'resigned': 1,
    }

    placements = (
        Placement.objects.select_related('student')
        .filter(student__is_mahasiswa=True, student__is_active=True)
        .exclude(status__in=['pending', 'rejected'])
    )

    for placement in placements:
        current = placements_by_student.get(placement.student_id)
        placement_key = (
            3 if placement.is_approved else placement_priority.get(placement.status, 0),
            placement.created_at,
            placement.id,
        )

        if current is None or placement_key > current[0]:
            placements_by_student[placement.student_id] = (placement_key, placement)

    return [item[1] for item in placements_by_student.values()]


def send_completion_reminder_email(student, missing_items):
    dashboard_url = get_frontend_url('/dashboard')
    student_name = f"{student.first_name} {student.last_name}".strip() or student.email
    missing_text = '\n'.join(f"- {item}" for item in missing_items)
    subject = "PENGINGAT: Kelengkapan Syarat Kelulusan Co-op"
    message = (
        f"Halo {student_name},\n\n"
        "Sistem mencatat bahwa syarat kelulusan Co-op Anda masih belum lengkap:\n\n"
        f"{missing_text}\n\n"
        "Mohon lengkapi dokumen yang masih kurang melalui Portal Co-op. "
        "Untuk evaluasi supervisor yang belum tersedia, silakan hubungi Admin Unit Co-op jika diperlukan.\n\n"
        f"Buka portal melalui tautan berikut:\n{dashboard_url}\n\n"
        "Salam,\n"
        "Admin Unit Co-op"
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [student.email],
        fail_silently=False,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    uidb64 = (request.data.get('uid') or '').strip()
    token = (request.data.get('token') or '').strip()
    new_password = request.data.get('new_password') or request.data.get('password') or ''
    confirm_password = request.data.get('confirm_password') or request.data.get('password_confirmation') or ''

    if not uidb64 or not token:
        return Response(
            {"detail": "Link reset password tidak lengkap."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = get_password_reset_user(uidb64)
    if user is None or not default_token_generator.check_token(user, token):
        return Response(
            {"detail": "Link reset password tidak valid atau sudah kedaluwarsa."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not new_password:
        return Response(
            {"new_password": ["Password baru wajib diisi."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if confirm_password and new_password != confirm_password:
        return Response(
            {"confirm_password": ["Konfirmasi password baru belum cocok."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(new_password, user)
    except DjangoValidationError as e:
        return Response(
            {"new_password": list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save(update_fields=['password'])
    Token.objects.filter(user=user).delete()

    return Response(
        {"detail": "Password berhasil diperbarui. Silakan login dengan password baru."},
        status=status.HTTP_200_OK,
    )

# ==========================================
# FITUR 1: REGISTRASI & PROFIL
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    data = request.data
    files = request.FILES
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    microsoft_registration_token = (data.get('microsoft_registration_token') or '').strip()
    microsoft_payload = {}

    if not email:
        return Response({"error": "Email Outlook wajib diisi."}, status=400)

    if not password:
        return Response({"error": "Password akun wajib diisi."}, status=400)

    if microsoft_registration_token:
        try:
            microsoft_payload = signing.loads(
                microsoft_registration_token,
                salt=MICROSOFT_REGISTER_TOKEN_SALT,
                max_age=1800,
            )
        except signing.BadSignature:
            return Response(
                {"error": "Verifikasi Microsoft tidak valid. Silakan klik Daftar dengan Microsoft ulang."},
                status=400,
            )
        except signing.SignatureExpired:
            return Response(
                {"error": "Verifikasi Microsoft sudah kedaluwarsa. Silakan klik Daftar dengan Microsoft ulang."},
                status=400,
            )

        microsoft_email = (microsoft_payload.get('email') or '').strip().lower()
        if microsoft_email != email:
            return Response(
                {"error": "Email Outlook tidak sesuai dengan akun Microsoft yang diverifikasi."},
                status=400,
            )

    existing_user = (
        User.objects.filter(email__iexact=email).first()
        or User.objects.filter(username__iexact=email).first()
    )
    microsoft_id = str(microsoft_payload.get('microsoft_id') or '').strip()

    if microsoft_id and User.objects.filter(microsoft_id=microsoft_id).exclude(id=getattr(existing_user, 'id', None)).exists():
        return Response({"error": "Akun Microsoft ini sudah digunakan oleh akun portal lain."}, status=400)

    if existing_user and not (
        existing_user.is_mahasiswa
        and existing_user.registration_status == 'rejected'
    ):
        return Response({"error": "Email Outlook ini sudah terdaftar!"}, status=400)

    missing_documents = [
        label
        for field_name, label in REQUIRED_REGISTRATION_DOCUMENTS.items()
        if field_name not in files
    ]
    if missing_documents:
        return Response(
            {"error": f"Mohon unggah {' dan '.join(missing_documents)} dalam format PDF sebelum daftar."},
            status=400,
        )

    invalid_documents = [
        label
        for field_name, label in REQUIRED_REGISTRATION_DOCUMENTS.items()
        if not is_pdf_upload(files[field_name])
    ]
    if invalid_documents:
        return Response(
            {"error": f"{' dan '.join(invalid_documents)} wajib berupa file PDF."},
            status=400,
        )

    try:
        is_reregistration = existing_user is not None
        user = existing_user or User(username=email, email=email)
        user.username = email
        user.email = email
        user.password = make_password(password)
        user.first_name = data.get('first_name') or microsoft_payload.get('first_name', '')
        user.last_name = data.get('last_name') or microsoft_payload.get('last_name', '')
        user.nim = data.get('nim')
        user.program_studi = data.get('program_studi')
        user.angkatan = data.get('angkatan')
        user.gender = data.get('gender')
        user.phone_number = data.get('phone_number')
        user.is_mahasiswa = True
        user.is_active = False
        user.registration_status = 'pending'
        user.registration_rejection_reason = ''
        if microsoft_id:
            user.microsoft_id = microsoft_id
            user.microsoft_email = email

        user.bukti_konsul_file = files['bukti_konsul_file']
        user.sptjm_file = files['sptjm_file']
        user.save()
        Token.objects.filter(user=user).delete()
        return Response(
            {
                "message": (
                    "Pendaftaran ulang berhasil! Akun Anda kembali menunggu persetujuan admin."
                    if is_reregistration
                    else "Registrasi berhasil! Akun Anda sedang menunggu persetujuan admin."
                )
            },
            status=201
        )

    except Exception as e:
        return Response({"error": str(e)}, status=400)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all().order_by('-id')
        return User.objects.filter(id=self.request.user.id)

    def perform_update(self, serializer):
        current_user = self.get_object()
        should_send_approval_email = (
            self.request.user.is_staff
            and current_user.is_mahasiswa
            and current_user.email
            and not current_user.is_active
            and str(self.request.data.get('is_active')).lower() == 'true'
        )
        if should_send_approval_email:
            updated_user = serializer.save(
                registration_status='approved',
                registration_rejection_reason='',
            )
        else:
            updated_user = serializer.save()

        if should_send_approval_email and updated_user.is_active:
            create_student_notification(
                updated_user,
                "Akun Co-op kamu telah aktif",
                "Admin Unit Co-op telah menyetujui akunmu. Sekarang kamu sudah bisa login dan melanjutkan proses magang di portal.",
                notification_type='account',
                target_tab='profil',
            )
            try:
                send_student_approval_email(updated_user)
            except Exception as e:
                print(f"GAGAL MENGIRIM EMAIL APPROVAL: {e}")

    @action(detail=True, methods=['POST'], url_path='reject-registration')
    def reject_registration(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "Hanya admin yang dapat menolak pendaftaran akun."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = self.get_object()
        rejection_reason = str(request.data.get('rejection_reason', '')).strip()

        if not user.is_mahasiswa:
            return Response(
                {"detail": "Penolakan pendaftaran hanya berlaku untuk akun mahasiswa."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {"detail": "Akun mahasiswa yang sudah aktif tidak dapat ditolak dari antrean pendaftaran."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not rejection_reason:
            return Response(
                {"rejection_reason": ["Alasan penolakan wajib diisi."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.registration_status = 'rejected'
        user.registration_rejection_reason = rejection_reason
        user.is_active = False
        user.save(update_fields=['registration_status', 'registration_rejection_reason', 'is_active'])
        Token.objects.filter(user=user).delete()

        create_student_notification(
            user,
            "Pendaftaran akun Co-op perlu diperbaiki",
            (
                "Pendaftaran akunmu belum dapat disetujui admin.\n\n"
                f"Alasan: {rejection_reason}\n\n"
                "Silakan perbaiki data atau dokumen, lalu daftar ulang menggunakan email kampus yang sama."
            ),
            notification_type='account',
            target_tab='profil',
        )

        email_sent = True
        try:
            send_student_registration_rejection_email(user)
        except Exception as e:
            email_sent = False
            print(f"GAGAL MENGIRIM EMAIL PENOLAKAN AKUN: {e}")

        return Response(
            {
                "message": (
                    "Pendaftaran ditolak dan alasan sudah dikirim ke email mahasiswa."
                    if email_sent
                    else "Pendaftaran ditolak, tetapi email alasan belum berhasil dikirim."
                ),
                "email_sent": email_sent,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['POST'], url_path='send-password-reset')
    def send_password_reset(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "Hanya admin yang dapat mengirim link reset password."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = self.get_object()
        if not user.is_mahasiswa:
            return Response(
                {"detail": "Link reset password hanya dapat dikirim untuk akun mahasiswa."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.email:
            return Response(
                {"detail": "Email mahasiswa belum tersedia."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_url = build_password_reset_url(user)

        try:
            send_password_reset_link_email(user, reset_url)
        except Exception as e:
            print(f"GAGAL MENGIRIM EMAIL RESET PASSWORD: {e}")
            return Response(
                {"error": "Email reset password gagal dikirim. Cek kembali konfigurasi SMTP."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        create_student_notification(
            user,
            "Link reset password telah dikirim",
            "Admin Unit Co-op telah mengirim link reset password ke email kampusmu. Buka email tersebut untuk membuat password baru.",
            notification_type='account',
            action_url='https://outlook.office.com/mail/',
            action_label='Buka Email Kampus',
        )

        return Response(
            {"message": f"Link reset password telah dikirim ke {user.email}."},
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=['GET', 'PUT', 'PATCH'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# ==========================================
# FITUR 2: LOWONGAN & LAMARAN
# ==========================================
class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all()
    serializer_class = VacancySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        today = timezone.localdate()
        active_vacancies = Vacancy.objects.filter(is_active=True).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=today)
        )

        return active_vacancies.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        notify_job_seekers = str(request.data.get('notify_job_seekers', 'false')).lower() in ['true', '1', 'yes', 'on']
        request_data.pop('notify_job_seekers', None)
        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        vacancy = serializer.instance
        response_data = dict(serializer.data)

        if notify_job_seekers:
            target_students = get_vacancy_notification_targets()
            if target_students:
                create_bulk_student_notifications(
                    target_students,
                    "Lowongan magang baru tersedia",
                    f"{vacancy.company_name} membuka lowongan {vacancy.title}. Cek detailnya di tab Lowongan.",
                    notification_type='vacancy',
                    target_tab='lowongan',
                )

                try:
                    sent_count = send_vacancy_notification_email(vacancy, target_students)
                    response_data['notification_count'] = sent_count
                    response_data['notification_message'] = (
                        f"Lowongan dipublikasikan dan email Outlook dikirim ke {sent_count} mahasiswa job seeker."
                    )
                except Exception as e:
                    response_data['notification_count'] = 0
                    response_data['notification_message'] = (
                        "Lowongan dipublikasikan, tetapi email Outlook belum berhasil dikirim."
                    )
                    response_data['notification_error'] = str(e)
            else:
                response_data['notification_count'] = 0
                response_data['notification_message'] = (
                    "Lowongan dipublikasikan. Tidak ada mahasiswa job seeker aktif untuk dikirimi email."
                )
        else:
            response_data['notification_count'] = 0
            response_data['notification_message'] = "Lowongan baru berhasil dipublikasikan."

        headers = self.get_success_headers(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        admin_phone = (getattr(self.request.user, 'phone_number', '') or '').strip()
        serializer.save(
            is_active=True,
            supervisor_name=(serializer.validated_data.get('supervisor_name') or 'Admin Co-op Prasmul').strip(),
            supervisor_email=(serializer.validated_data.get('supervisor_email') or 'coop@prasetiyamulya.ac.id').strip(),
            supervisor_phone=(serializer.validated_data.get('supervisor_phone') or admin_phone or '+62 851-1751-2341').strip(),
        )

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Application.objects.filter(is_archived_by_admin=False).order_by('-applied_at')
        return Application.objects.filter(student=user).order_by('-applied_at')

    def perform_create(self, serializer):
        vacancy = serializer.validated_data['vacancy']
        if not self.request.user.is_staff and not self.request.user.cv_file:
            raise ValidationError("CV wajib diunggah di tab Profil sebelum melamar lowongan internal.")
        if Application.objects.filter(student=self.request.user, vacancy=vacancy).exists():
            raise ValidationError("Kamu sudah pernah mengirim lamaran untuk lowongan ini.")
        serializer.save(
            student=self.request.user,
            status='pending',
            withdrawal_reason='',
            withdrawn_at=None,
            is_archived_by_admin=False,
            archived_at=None,
        )

    def partial_update(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().partial_update(request, *args, **kwargs)

        application = self.get_object()
        new_status = request.data.get('status')
        withdrawal_reason = str(request.data.get('withdrawal_reason', '')).strip()

        if new_status != 'withdrawn':
            return Response(
                {"detail": "Mahasiswa hanya dapat menarik lamaran sendiri."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if application.status not in ['pending', 'reviewed']:
            return Response(
                {"detail": "Lamaran hanya dapat ditarik selama masih menunggu review atau sudah diteruskan ke perusahaan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not withdrawal_reason:
            return Response(
                {"detail": "Alasan menarik lamaran wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = 'withdrawn'
        application.withdrawal_reason = withdrawal_reason
        application.withdrawn_at = timezone.now()
        application.save(update_fields=['status', 'withdrawal_reason', 'withdrawn_at'])

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().update(request, *args, **kwargs)

        kwargs['partial'] = True
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        current_application = self.get_object()
        old_status = current_application.status
        updated_application = serializer.save()

        if old_status != updated_application.status:
            if updated_application.status == 'withdrawn' and not updated_application.withdrawn_at:
                updated_application.withdrawn_at = timezone.now()
                updated_application.save(update_fields=['withdrawn_at'])
            elif updated_application.status != 'withdrawn' and updated_application.withdrawn_at:
                updated_application.withdrawal_reason = ''
                updated_application.withdrawn_at = None
                updated_application.save(update_fields=['withdrawal_reason', 'withdrawn_at'])

        if self.request.user.is_staff and old_status != updated_application.status:
            notify_student_application_status_change(updated_application, old_status)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"detail": "Mahasiswa hanya dapat menarik lamaran, bukan menghapus data lamaran."},
                status=status.HTTP_403_FORBIDDEN,
            )

        application = self.get_object()
        application.is_archived_by_admin = True
        application.archived_at = timezone.now()
        application.save(update_fields=['is_archived_by_admin', 'archived_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==========================================
# FITUR 3: LAPOR MAGANG (PLACEMENT)
# ==========================================
class PlacementViewSet(viewsets.ModelViewSet):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Placement.objects.all().order_by('-created_at')
        return Placement.objects.filter(student=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='request-supervisor-change')
    def request_supervisor_change(self, request, pk=None):
        placement = self.get_object()

        if request.user.is_staff:
            return Response(
                {"detail": "Pengajuan perubahan kontak supervisor hanya dikirim oleh mahasiswa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if placement.status != 'verified' or not placement.is_approved:
            return Response(
                {"detail": "Kontak supervisor hanya dapat diperbarui pada tempat magang aktif yang sudah diverifikasi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        supervisor_name = str(request.data.get('supervisor_name', '')).strip()
        supervisor_email = str(request.data.get('supervisor_email', '')).strip()
        supervisor_phone = str(request.data.get('supervisor_phone', '')).strip()
        change_reason = str(request.data.get('reason', '')).strip()

        if not supervisor_name or not supervisor_email or not change_reason:
            return Response(
                {"detail": "Nama, email aktif supervisor, dan alasan perubahan wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(supervisor_email)
        except DjangoValidationError:
            return Response(
                {"supervisor_email": "Format email supervisor belum valid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            supervisor_name == placement.supervisor_name
            and supervisor_email.lower() == (placement.supervisor_email or '').lower()
            and supervisor_phone == (placement.supervisor_phone or '')
        ):
            return Response(
                {"detail": "Kontak supervisor baru masih sama dengan data yang tersimpan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        placement.pending_supervisor_name = supervisor_name
        placement.pending_supervisor_email = supervisor_email
        placement.pending_supervisor_phone = supervisor_phone
        placement.supervisor_change_reason = change_reason
        placement.supervisor_change_status = 'pending'
        placement.supervisor_change_rejection_reason = ''
        placement.supervisor_change_requested_at = timezone.now()
        placement.save(update_fields=[
            'pending_supervisor_name',
            'pending_supervisor_email',
            'pending_supervisor_phone',
            'supervisor_change_reason',
            'supervisor_change_status',
            'supervisor_change_rejection_reason',
            'supervisor_change_requested_at',
        ])

        return Response({
            "message": "Perubahan kontak supervisor sudah diajukan dan menunggu persetujuan admin.",
            "placement": self.get_serializer(placement).data,
        })

    @action(detail=True, methods=['post'], url_path='approve-supervisor-change')
    def approve_supervisor_change(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "Hanya admin yang dapat menyetujui perubahan kontak supervisor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        placement = self.get_object()
        if placement.supervisor_change_status != 'pending':
            return Response(
                {"detail": "Tidak ada pengajuan perubahan kontak supervisor yang menunggu persetujuan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        placement.supervisor_name = placement.pending_supervisor_name
        placement.supervisor_email = placement.pending_supervisor_email
        placement.supervisor_phone = placement.pending_supervisor_phone
        placement.pending_supervisor_name = ''
        placement.pending_supervisor_email = ''
        placement.pending_supervisor_phone = ''
        placement.supervisor_change_reason = ''
        placement.supervisor_change_status = 'none'
        placement.supervisor_change_rejection_reason = ''
        placement.supervisor_change_requested_at = None
        placement.save(update_fields=[
            'supervisor_name',
            'supervisor_email',
            'supervisor_phone',
            'pending_supervisor_name',
            'pending_supervisor_email',
            'pending_supervisor_phone',
            'supervisor_change_reason',
            'supervisor_change_status',
            'supervisor_change_rejection_reason',
            'supervisor_change_requested_at',
        ])

        resent_count = 0
        failed_count = 0
        for evaluation in SupervisorEvaluation.objects.filter(placement=placement, is_filled=False):
            try:
                send_supervisor_evaluation_request_email(
                    evaluation,
                    get_supervisor_evaluation_form_url(evaluation),
                )
                resent_count += 1
            except Exception as error:
                failed_count += 1
                print(f"GAGAL MENGIRIM ULANG EMAIL EVALUASI SUPERVISOR: {error}")

        create_student_notification(
            placement.student,
            "Perubahan kontak supervisor disetujui",
            (
                f"Kontak supervisor untuk magang kamu di {placement.company_name} sudah diperbarui oleh admin. "
                f"Email aktif supervisor sekarang: {placement.supervisor_email}."
            ),
            notification_type='general',
            target_tab='lapor',
        )

        return Response({
            "message": (
                "Kontak supervisor berhasil diperbarui. "
                f"{resent_count} link evaluasi yang masih menunggu sudah dikirim ulang."
            ),
            "resent_count": resent_count,
            "failed_count": failed_count,
            "placement": self.get_serializer(placement).data,
        })

    @action(detail=True, methods=['post'], url_path='reject-supervisor-change')
    def reject_supervisor_change(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {"detail": "Hanya admin yang dapat menolak perubahan kontak supervisor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        placement = self.get_object()
        if placement.supervisor_change_status != 'pending':
            return Response(
                {"detail": "Tidak ada pengajuan perubahan kontak supervisor yang menunggu persetujuan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rejection_reason = str(request.data.get('reason', '')).strip()
        if not rejection_reason:
            return Response(
                {"detail": "Alasan penolakan wajib diisi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        placement.supervisor_change_status = 'rejected'
        placement.supervisor_change_rejection_reason = rejection_reason
        placement.save(update_fields=[
            'supervisor_change_status',
            'supervisor_change_rejection_reason',
        ])

        create_student_notification(
            placement.student,
            "Perubahan kontak supervisor perlu diperbaiki",
            (
                f"Pengajuan perubahan kontak supervisor untuk magang kamu di {placement.company_name} belum disetujui. "
                f"Alasan: {rejection_reason} Silakan perbaiki data dan ajukan kembali."
            ),
            notification_type='general',
            target_tab='lapor',
        )

        return Response({
            "message": "Pengajuan perubahan kontak supervisor ditolak.",
            "placement": self.get_serializer(placement).data,
        })

    def perform_create(self, serializer):
        user = self.request.user
        target_student = user

        if user.is_staff and self.request.data.get('student'):
            try:
                target_student = User.objects.get(id=self.request.data.get('student'))
            except User.DoesNotExist:
                raise ValidationError("Mahasiswa untuk data magang ini tidak ditemukan.")

        active_internal_applications = Application.objects.filter(
            student=target_student,
            status__in=['pending', 'reviewed', 'accepted'],
            is_archived_by_admin=False,
        )

        if not user.is_staff and active_internal_applications.exists():
            raise ValidationError(
                "Anda masih memiliki lamaran internal yang sedang diproses. "
                "Tarik lamaran internal tersebut terlebih dahulu sebelum mengajukan tempat magang luar."
            )
        
        # 1. Cari data magang lama milik mahasiswa ini yang statusnya masih 'pending' atau 'verified'
        old_placements = Placement.objects.filter(
            student=target_student,
            status__in=['pending', 'verified']
        )
        active_old_placement = old_placements.filter(status='verified').order_by('-created_at').first()

        previous_placement_end_date = None
        if active_old_placement:
            raw_previous_end_date = str(self.request.data.get('previous_placement_end_date', '')).strip()
            if not raw_previous_end_date:
                raise ValidationError({
                    "error": "Tanggal terakhir bekerja di tempat magang lama wajib diisi saat mengajukan pindah tempat."
                })

            previous_placement_end_date = parse_date(raw_previous_end_date)
            if not previous_placement_end_date:
                raise ValidationError({"error": "Format tanggal terakhir bekerja tidak valid."})

            if previous_placement_end_date < active_old_placement.start_date:
                raise ValidationError({
                    "error": "Tanggal terakhir bekerja tidak boleh sebelum tanggal mulai tempat magang lama."
                })

            if previous_placement_end_date > active_old_placement.end_date:
                raise ValidationError({
                    "error": "Tanggal terakhir bekerja tidak boleh melewati tanggal selesai yang tercatat pada tempat magang lama."
                })

            new_start_date = serializer.validated_data.get('start_date')
            if new_start_date and new_start_date <= previous_placement_end_date:
                raise ValidationError({
                    "error": "Tanggal mulai tempat magang baru harus setelah tanggal terakhir bekerja di tempat magang lama."
                })

            new_end_date = serializer.validated_data.get('end_date')
            old_working_days = count_working_days(active_old_placement.start_date, previous_placement_end_date)
            new_working_days = count_working_days(new_start_date, new_end_date)
            total_working_days = old_working_days + new_working_days

            if total_working_days < MIN_INTERNSHIP_WORKING_DAYS:
                remaining_days = MIN_INTERNSHIP_WORKING_DAYS - old_working_days
                raise ValidationError({
                    "error": (
                        f"Akumulasi durasi magang minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja. "
                        f"Tempat lama tercatat {old_working_days} hari kerja dan tempat baru {new_working_days} hari kerja "
                        f"(total {total_working_days}). Tempat baru perlu minimal {max(remaining_days, 1)} hari kerja."
                    )
                })

            transfer_reason = str(
                serializer.validated_data.get('transfer_reason')
                or self.request.data.get('transfer_reason', '')
            ).strip()
            if not transfer_reason:
                raise ValidationError({"error": "Alasan pindah tempat magang wajib diisi."})
        
        is_staff_approved_create = user.is_staff and str(self.request.data.get('is_approved')).lower() == 'true'

        # Pengajuan pending lama boleh langsung diarsipkan saat mahasiswa submit ulang.
        # Placement aktif tetap hidup sampai pengajuan pindah disetujui admin.
        for old_placement in old_placements.filter(status='pending'):
            old_placement.status = 'resigned'
            old_placement.is_approved = False
            old_placement.save(update_fields=['status', 'is_approved'])

        # 3. Terakhir, simpan data pengajuan tempat magang yang BARU.
        new_placement = serializer.save(
            student=target_student,
            status='verified' if is_staff_approved_create else 'pending',
            is_approved=is_staff_approved_create,
        )

        if is_staff_approved_create:
            archive_replaced_placements(target_student, new_placement, previous_placement_end_date)

    def perform_update(self, serializer):
        current_placement = self.get_object()

        if not self.request.user.is_staff and current_placement.status == 'verified':
            raise ValidationError({
                "error": (
                    "Tempat magang aktif tidak dapat diedit langsung. "
                    "Gunakan pengajuan perubahan kontak supervisor jika data pembimbing berubah."
                )
            })

        # Ambil data mentah dari request React (mengabaikan blokiran Serializer)
        status_req = str(self.request.data.get('status', '')).lower()
        is_approved_req = self.request.data.get('is_approved')

        if status_req == 'rejected':
            if not self.request.user.is_staff:
                raise ValidationError({"error": "Hanya admin yang dapat menolak pengajuan tempat magang."})

            rejection_reason = str(self.request.data.get('rejection_reason', '')).strip()
            if not rejection_reason:
                raise ValidationError({"rejection_reason": "Alasan penolakan wajib diisi."})

            if current_placement.is_approved or current_placement.status == 'verified':
                raise ValidationError({
                    "error": "Tempat magang yang sudah terverifikasi tidak bisa ditolak dari proses review."
                })

            updated_placement = serializer.save(
                status='rejected',
                is_approved=False,
                rejection_reason=rejection_reason,
            )
            create_student_notification(
                updated_placement.student,
                "Pengajuan tempat magang ditolak",
                (
                    f"Pengajuan tempat magang kamu di {updated_placement.company_name} belum dapat disetujui admin. "
                    f"Alasan: {rejection_reason} "
                    "Silakan perbaiki data atau dokumen, lalu ajukan ulang jika sudah sesuai."
                ),
                notification_type='general',
                target_tab='lapor',
            )
            if updated_placement.student.email:
                try:
                    send_placement_rejection_email(updated_placement)
                except Exception as e:
                    print(f"GAGAL MENGIRIM EMAIL PENOLAKAN MAGANG: {e}")
            return
        
        # Cek apakah React benar-benar mengirim aksi approval
        if is_approved_req is not None:
            # Ubah jadi boolean
            is_approved_val = str(is_approved_req).lower() == 'true'
            
            if is_approved_val:
                previous_placement_end_date = (
                    serializer.validated_data.get('previous_placement_end_date')
                    or current_placement.previous_placement_end_date
                )
                active_old_placement = Placement.objects.filter(
                    student=current_placement.student,
                    status='verified',
                    is_approved=True,
                ).exclude(id=current_placement.id).order_by('-created_at').first()

                if active_old_placement:
                    if not previous_placement_end_date:
                        raise ValidationError({
                            "error": "Tanggal terakhir bekerja di tempat magang lama wajib tersedia sebelum menyetujui pengajuan pindah."
                        })

                    if previous_placement_end_date < active_old_placement.start_date:
                        raise ValidationError({
                            "error": "Tanggal terakhir bekerja tidak boleh sebelum tanggal mulai tempat magang lama."
                        })

                    if previous_placement_end_date > active_old_placement.end_date:
                        raise ValidationError({
                            "error": "Tanggal terakhir bekerja tidak boleh melewati tanggal selesai yang tercatat pada tempat magang lama."
                        })

                    new_start_date = serializer.validated_data.get('start_date') or current_placement.start_date
                    if new_start_date <= previous_placement_end_date:
                        raise ValidationError({
                            "error": "Tanggal mulai tempat magang baru harus setelah tanggal terakhir bekerja di tempat magang lama."
                        })

                    new_end_date = serializer.validated_data.get('end_date') or current_placement.end_date
                    old_working_days = count_working_days(active_old_placement.start_date, previous_placement_end_date)
                    new_working_days = count_working_days(new_start_date, new_end_date)
                    total_working_days = old_working_days + new_working_days

                    if total_working_days < MIN_INTERNSHIP_WORKING_DAYS:
                        remaining_days = MIN_INTERNSHIP_WORKING_DAYS - old_working_days
                        raise ValidationError({
                            "error": (
                                f"Akumulasi durasi magang minimal {MIN_INTERNSHIP_WORKING_DAYS} hari kerja. "
                                f"Tempat lama tercatat {old_working_days} hari kerja dan tempat baru {new_working_days} hari kerja "
                                f"(total {total_working_days}). Tempat baru perlu minimal {max(remaining_days, 1)} hari kerja."
                            )
                        })

                # [PERBAIKAN] Kita "paksa" simpan status dan is_approved secara bersamaan
                updated_placement = serializer.save(
                    status='verified',
                    is_approved=True,
                    rejection_reason='',
                )
                archive_replaced_placements(
                    updated_placement.student,
                    updated_placement,
                    previous_placement_end_date,
                )

                should_notify_approval = (
                    self.request.user.is_staff
                    and not current_placement.is_approved
                )

                if should_notify_approval:
                    create_student_notification(
                        updated_placement.student,
                        "Tempat magang kamu sudah diverifikasi",
                        f"Pengajuan tempat magang kamu di {updated_placement.company_name} sebagai {updated_placement.position} sudah diverifikasi admin. Kamu sekarang bisa lanjut ke proses laporan Co-op di portal.",
                        notification_type='general',
                        target_tab='lapor',
                    )

                should_send_approval_email = (
                    should_notify_approval
                    and updated_placement.student.email
                )

                if should_send_approval_email:
                    try:
                        send_placement_approval_email(updated_placement)
                    except Exception as e:
                        print(f"GAGAL MENGIRIM EMAIL APPROVAL MAGANG: {e}")
            else:
                serializer.save(is_approved=False)
        else:
            serializer.save()

# ==========================================
# FITUR 4: LAPORAN BULANAN
# ==========================================
class MonthlyReportViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return MonthlyReport.objects.all()
        return MonthlyReport.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

# ==========================================
# FITUR 5: LAPORAN AKHIR
# ==========================================
class FinalReportViewSet(viewsets.ModelViewSet):
    serializer_class = FinalReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        if self.request.user.is_staff:
            return FinalReport.objects.all()
        return FinalReport.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

# ==========================================
# FITUR 6: SERTIFIKAT
# ==========================================
class CertificateViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return CertificateReadSerializer
        return CertificateWriteSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Certificate.objects.all()
        return Certificate.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        certificate = serializer.save()
        placement = certificate.placement
        if placement.status != 'completed' or not placement.is_approved:
            placement.status = 'completed'
            placement.is_approved = True
            placement.save(update_fields=['status', 'is_approved'])

        create_student_notification(
            certificate.student,
            "Sertifikat Co-op telah rilis",
            f"Sertifikat kelulusan Co-op kamu untuk penempatan di {certificate.placement.company_name} sudah tersedia dengan grade {certificate.grade}.",
            notification_type='certificate',
            target_tab='sertifikat',
        )


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Notification.objects.none()
        return Notification.objects.filter(student=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'updated': updated})

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        deleted_count, _ = self.get_queryset().delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)
    
# ==========================================
# FITUR 7: EVALUASI SUPERVISOR
# ==========================================
class SupervisorEvaluationViewSet(viewsets.ModelViewSet):
    queryset = SupervisorEvaluation.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method in ['GET']:
            return SupervisorEvaluationReadSerializer
        return SupervisorEvaluationWriteSerializer

    def get_form_url(self, evaluation):
        return get_supervisor_evaluation_form_url(evaluation)

    def send_evaluation_request_email(self, evaluation, form_url, request_data):
        send_supervisor_evaluation_request_email(evaluation, form_url, request_data)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            evaluation = serializer.instance
            form_url = self.get_form_url(evaluation)
            self.send_evaluation_request_email(evaluation, form_url, request.data)

        data = SupervisorEvaluationReadSerializer(
            evaluation,
            context=self.get_serializer_context(),
        ).data
        data['form_url'] = form_url
        data['message'] = "Form evaluasi berhasil dibuat dan link sudah dikirim ke email supervisor."

        headers = self.get_success_headers(data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

# ==========================================
# FITUR 8: TEMPLATE DOKUMEN & LAINNYA
# ==========================================
class DocumentTemplateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        template, created = DocumentTemplate.objects.get_or_create(id=1)
        serializer = DocumentTemplateSerializer(template, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        template, created = DocumentTemplate.objects.get_or_create(id=1)
        if 'uts_template' in request.FILES:
            template.uts_template = request.FILES['uts_template']
        if 'uas_template' in request.FILES:
            template.uas_template = request.FILES['uas_template']
            
        template.save()
        return Response({"message": "Template berhasil disimpan!"}, status=status.HTTP_200_OK)
    
class WeeklyHuntReportViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyHuntReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return WeeklyHuntReport.objects.all().order_by('-submitted_at')
        return WeeklyHuntReport.objects.filter(student=self.request.user).order_by('-submitted_at')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class UtsReportViewSet(viewsets.ModelViewSet):
    serializer_class = UtsReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        if self.request.user.is_staff:
            return UtsReport.objects.all()
        return UtsReport.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

# ==========================================
# FITUR 9: CUSTOM ACTIONS (EMAIL & GANTI PASSWORD)
# ==========================================
@api_view(['POST'])
@permission_classes([permissions.IsAdminUser]) 
def send_weekly_reminders(request):
    student_id = request.data.get('student_id')
    custom_subject = request.data.get('subject') 
    custom_message = request.data.get('message') 
    
    if student_id:
        students_target = list(User.objects.filter(id=student_id, is_mahasiswa=True, is_active=True).distinct())
    else:
        students_target = list(
            User.objects.filter(is_mahasiswa=True, is_active=True)
            .exclude(placement__is_approved=True)
            .distinct()
        )
    
    emails = [student.email for student in students_target if student.email]
    if not emails:
        return Response({"message": "Tidak ada email target ditemukan."}, status=status.HTTP_200_OK)

    subject = custom_subject if custom_subject else "⚠️ PENGINGAT: Laporan Mingguan Pencarian Magang"
    message = custom_message if custom_message else "Harap isi Laporan Progress Mingguan di Portal."

    try:
        create_bulk_student_notifications(
            students_target,
            "Reminder dari Admin Co-op",
            message,
            notification_type='reminder',
            target_tab='lapor_mingguan',
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, emails, fail_silently=False)
        return Response({"message": "Email berhasil dikirim!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def send_report_reminders(request):
    student_id = request.data.get('student_id')
    report_type = request.data.get('report_type')
    custom_subject = request.data.get('subject')
    custom_message = request.data.get('message')

    approved_placements = Placement.objects.filter(is_approved=True)
    student_ids_with_placements = approved_placements.values_list('student_id', flat=True)
    target_student = None

    if report_type == 'UTS':
        submitted = UtsReport.objects.values_list('student_id', flat=True)
    else:
        submitted = FinalReport.objects.values_list('student_id', flat=True)

    submitted_student_ids = set(submitted)
        
    students_queryset = (
        User.objects.filter(id__in=student_ids_with_placements, is_mahasiswa=True, is_active=True)
        .exclude(id__in=submitted_student_ids)
        .distinct()
    )

    if student_id:
        target_student = User.objects.filter(id=student_id, is_mahasiswa=True).first()
        students_queryset = students_queryset.filter(id=student_id)

    students_target = list(students_queryset)
    emails = [s.email for s in students_target if s.email]
    
    if not emails:
        if target_student:
            student_name = (
                f"{target_student.first_name} {target_student.last_name}".strip()
                or target_student.email
                or target_student.username
            )

            if not approved_placements.filter(student_id=target_student.id).exists():
                return Response(
                    {"message": f"{student_name} belum memiliki data magang yang terverifikasi."},
                    status=status.HTTP_200_OK,
                )

            if target_student.id in submitted_student_ids:
                return Response(
                    {"message": f"{student_name} sudah mengumpulkan laporan {report_type}."},
                    status=status.HTTP_200_OK,
                )

            return Response(
                {"message": f"Email untuk {student_name} tidak ditemukan."},
                status=status.HTTP_200_OK,
            )

        return Response({"message": "Semua sudah mengumpulkan laporan!"}, status=status.HTTP_200_OK)

    subject = custom_subject if custom_subject else f"⚠️ PENGINGAT: Pengumpulan Laporan {report_type}"
    message = custom_message if custom_message else "Harap segera login ke Portal Co-op dan unggah dokumen Anda."

    try:
        create_bulk_student_notifications(
            students_target,
            f"Reminder Laporan {report_type}",
            message,
            notification_type='reminder',
            target_tab='laporan_uts' if report_type == 'UTS' else 'laporan_akhir',
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, emails, fail_silently=False)
        return Response({"message": "Email Reminder berhasil dikirim!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def send_completion_reminders(request):
    placement_id = request.data.get('placement_id')

    if placement_id:
        placement = Placement.objects.select_related('student').filter(id=placement_id).first()
        if not placement:
            return Response(
                {"detail": "Data penempatan magang tidak ditemukan."},
                status=status.HTTP_404_NOT_FOUND,
            )
        placements = [placement]
    else:
        placements = get_latest_completion_reminder_placements()

    sent_count = 0
    failed_count = 0

    for placement in placements:
        student = placement.student

        if Certificate.objects.filter(placement=placement).exists():
            continue

        missing_items = get_certificate_completion_missing_items(placement)
        if not missing_items:
            continue

        if not student.email:
            failed_count += 1
            continue

        missing_text = '\n'.join(f"- {item}" for item in missing_items)
        notification_message = (
            "Syarat kelulusan Co-op kamu masih belum lengkap:\n"
            f"{missing_text}\n\n"
            "Silakan lengkapi dokumen yang masih kurang melalui portal."
        )

        try:
            send_completion_reminder_email(student, missing_items)
            create_student_notification(
                student,
                "Reminder kelengkapan syarat kelulusan Co-op",
                notification_message,
                notification_type='reminder',
                target_tab='sertifikat',
            )
            sent_count += 1
        except Exception as e:
            failed_count += 1
            print(f"GAGAL MENGIRIM EMAIL REMINDER KELENGKAPAN: {e}")

    if placement_id and sent_count == 0 and failed_count == 0:
        return Response(
            {"message": "Syarat kelulusan mahasiswa ini sudah lengkap atau sertifikat sudah diterbitkan.", "sent_count": 0},
            status=status.HTTP_200_OK,
        )

    if placement_id and failed_count > 0 and sent_count == 0:
        return Response(
            {"error": "Reminder kelengkapan belum berhasil dikirim. Cek email mahasiswa dan konfigurasi SMTP."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "message": f"Reminder kelengkapan berhasil dikirim ke {sent_count} mahasiswa.",
            "sent_count": sent_count,
            "failed_count": failed_count,
        },
        status=status.HTTP_200_OK,
    )
    
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_industry_data(request):
    industries = Placement.objects.exclude(company_name__exact='').values(
        'company_name', 'supervisor_name', 'supervisor_email', 'supervisor_phone' 
    ).distinct()
    return Response(list(industries))

class ChangePasswordView(APIView):
    # Pastikan hanya user yang login yang bisa ganti password
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Cek apakah password lama yang dimasukkan COCOK dengan di database
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response(
                    {"old_password": ["Kata sandi lama yang Anda masukkan salah."]}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Jika cocok, ganti dengan password baru lalu simpan (hash otomatis)
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            
            return Response({"detail": "Password berhasil diperbarui."}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
