# ==========================================
# SEMUA IMPORT YANG DIBUTUHKAN
# ==========================================
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated 
from rest_framework.views import APIView 
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import mixins, viewsets, permissions, status 
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Import models
from .models import Certificate, DocumentTemplate, FinalReport, MonthlyReport, Notification, SupervisorEvaluation, User, UtsReport, Vacancy, Application, Placement, WeeklyHuntReport

# Import serializers dari file serializers.py sebelah
from .serializers import (
    CertificateReadSerializer, CertificateWriteSerializer, DocumentTemplateSerializer, 
    FinalReportSerializer, MonthlyReportSerializer, NotificationSerializer, SupervisorEvaluationReadSerializer, 
    SupervisorEvaluationWriteSerializer, UserProfileSerializer, VacancySerializer, 
    ApplicationSerializer, PlacementSerializer, WeeklyHuntReportSerializer, 
    UtsReportSerializer, ChangePasswordSerializer
)


def create_student_notification(student, title, message, notification_type='general', target_tab=''):
    if not student:
        return None

    return Notification.objects.create(
        student=student,
        title=title,
        message=message,
        notification_type=notification_type,
        target_tab=target_tab or '',
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

# ==========================================
# FITUR 1: REGISTRASI & PROFIL
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    data = request.data
    files = request.FILES

    if User.objects.filter(email=data.get('email')).exists():
        return Response({"error": "Email Outlook ini sudah terdaftar!"}, status=400)

    try:
        user = User.objects.create(
            username=data.get('email'), 
            email=data.get('email'),
            password=make_password(data.get('password')),
            first_name=data.get('first_name'),
            last_name=data.get('last_name', ''),
            nim=data.get('nim'),
            program_studi=data.get('program_studi'),
            angkatan=data.get('angkatan'),
            gender=data.get('gender'),
            phone_number=data.get('phone_number'),
            is_mahasiswa=True,
            is_active=False
        )

        if 'bukti_konsul_file' in files:
            user.bukti_konsul_file = files['bukti_konsul_file']
        if 'sptjm_file' in files:
            user.sptjm_file = files['sptjm_file']
        
        user.save()
        return Response(
            {"message": "Registrasi berhasil! Akun Anda sedang menunggu persetujuan admin."},
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
            return User.objects.all()
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
                print(f"❌ GAGAL MENGIRIM EMAIL APPROVAL: {e}")
    
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
        if self.request.user.is_staff:
            return Vacancy.objects.all().order_by('-created_at')
        return Vacancy.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(is_active=True)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Application.objects.all().order_by('-applied_at')
        return Application.objects.filter(student=user).order_by('-applied_at')

    def perform_create(self, serializer):
        vacancy = serializer.validated_data['vacancy']
        if Application.objects.filter(student=self.request.user, vacancy=vacancy).exists():
            raise ValidationError("Kamu sudah pernah mengirim lamaran untuk lowongan ini.")
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        current_application = self.get_object()
        updated_application = serializer.save()

        if (
            self.request.user.is_staff
            and current_application.status != updated_application.status
            and updated_application.status == 'accepted'
        ):
            create_student_notification(
                updated_application.student,
                "Lamaranmu diterima perusahaan",
                f"Selamat! Lamaran kamu untuk posisi {updated_application.vacancy.title} di {updated_application.vacancy.company_name} telah diterima perusahaan.",
                notification_type='application',
                target_tab='lowongan',
            )

# ==========================================
# FITUR 3: LAPOR MAGANG (PLACEMENT)
# ==========================================
class PlacementViewSet(viewsets.ModelViewSet):
    serializer_class = PlacementSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        if self.request.user.is_staff:
            return Placement.objects.all().order_by('-created_at')
        return Placement.objects.filter(student=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        
        # 1. Cari data magang lama milik mahasiswa ini yang statusnya masih 'pending' atau 'verified'
        old_placements = Placement.objects.filter(
            student=user,
            status__in=['pending', 'verified']
        )
        
        # 2. Jika ketemu, kita nonaktifkan (arsipkan) data lama tersebut jadi 'resigned'
        for old_placement in old_placements:
            old_placement.status = 'resigned'
            old_placement.is_approved = False
            old_placement.save()
            
        # 3. Terakhir, simpan data pengajuan tempat magang yang BARU.
        serializer.save(student=user, status='pending', is_approved=False)

    def perform_update(self, serializer):
        current_placement = self.get_object()

        # Ambil data mentah dari request React (mengabaikan blokiran Serializer)
        is_approved_req = self.request.data.get('is_approved')
        
        # Cek apakah React benar-benar mengirim aksi approval
        if is_approved_req is not None:
            # Ubah jadi boolean
            is_approved_val = str(is_approved_req).lower() == 'true'
            
            if is_approved_val:
                # [PERBAIKAN] Kita "paksa" simpan status dan is_approved secara bersamaan
                updated_placement = serializer.save(status='verified', is_approved=True)

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
                        print(f"❌ GAGAL MENGIRIM EMAIL APPROVAL MAGANG: {e}")
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

    def perform_create(self, serializer):
        evaluation = serializer.save()

        supervisor_email = evaluation.placement.supervisor_email
        supervisor_name = evaluation.placement.supervisor_name
        student_name = f"{evaluation.placement.student.first_name} {evaluation.placement.student.last_name}"
        eval_type = evaluation.eval_type 

        magic_link = f"http://localhost:5173/evaluasi/{evaluation.id}"
        subject = f"Mohon Evaluasi Kinerja Magang ({eval_type}) - {student_name}"
        message = f"Halo Bapak/Ibu {supervisor_name},\n\nMohon kesediaan Anda memberikan penilaian {eval_type} mahasiswa:\nNama: {student_name}\n\nSilakan klik link berikut:\n{magic_link}"
        
        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, [supervisor_email], fail_silently=False)
        except Exception as e:
            print(f"❌ GAGAL MENGIRIM EMAIL: {e}")
    
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
        send_mail(subject, message, settings.EMAIL_HOST_USER, emails, fail_silently=False)
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
        send_mail(subject, message, settings.EMAIL_HOST_USER, emails, fail_silently=False)
        return Response({"message": "Email Reminder berhasil dikirim!"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
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
