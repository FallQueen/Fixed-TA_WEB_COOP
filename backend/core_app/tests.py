import re
import shutil
import tempfile
from datetime import timedelta
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlparse

from django.core import mail, signing
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Application, FinalReport, MonthlyReport, Notification, Placement, SupervisorEvaluation, User, UtsReport, Vacancy


TEST_MEDIA_ROOT = tempfile.mkdtemp()


def tearDownModule():
    shutil.rmtree(TEST_MEDIA_ROOT, ignore_errors=True)


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class RegistrationDocumentRequirementTests(APITestCase):
    def get_payload(self, email='register-doc@example.com'):
        return {
            'first_name': 'Dito',
            'last_name': 'Pratama',
            'email': email,
            'password': 'password123',
            'nim': '23502210999',
            'program_studi': 'S1 Digital Business Technology',
            'angkatan': '2022',
            'gender': 'L',
            'phone_number': '081234567890',
        }

    def test_register_requires_bukti_konsul_and_sptjm_documents(self):
        response = self.client.post('/api/register/', self.get_payload(), format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Bukti Konsul dan SPTJM', response.data['error'])
        self.assertFalse(User.objects.filter(email='register-doc@example.com').exists())

    def test_register_rejects_non_pdf_registration_document(self):
        payload = self.get_payload(email='register-invalid-doc@example.com')
        payload['bukti_konsul_file'] = SimpleUploadedFile(
            'bukti-konsul.txt',
            b'test file',
            content_type='text/plain',
        )
        payload['sptjm_file'] = SimpleUploadedFile(
            'sptjm.pdf',
            b'%PDF-1.4 sptjm',
            content_type='application/pdf',
        )

        response = self.client.post('/api/register/', payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Bukti Konsul wajib berupa file PDF', response.data['error'])
        self.assertFalse(User.objects.filter(email='register-invalid-doc@example.com').exists())

    def test_register_accepts_required_pdf_documents(self):
        payload = self.get_payload(email='register-valid-doc@example.com')
        payload['bukti_konsul_file'] = SimpleUploadedFile(
            'bukti-konsul.pdf',
            b'%PDF-1.4 bukti konsul',
            content_type='application/pdf',
        )
        payload['sptjm_file'] = SimpleUploadedFile(
            'sptjm.pdf',
            b'%PDF-1.4 sptjm',
            content_type='application/pdf',
        )

        response = self.client.post('/api/register/', payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='register-valid-doc@example.com')
        self.assertFalse(user.is_active)
        self.assertEqual(user.registration_status, 'pending')
        self.assertTrue(user.bukti_konsul_file.name.endswith('.pdf'))
        self.assertTrue(user.sptjm_file.name.endswith('.pdf'))


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class RegistrationRejectionAndRetryTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-registration',
            email='admin-registration@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.student = User.objects.create_user(
            username='retry-registration@example.com',
            email='retry-registration@example.com',
            password='oldpassword123',
            first_name='Rina',
            nim='23502210888',
            program_studi='S1 Digital Business Technology',
            is_mahasiswa=True,
            is_active=False,
            registration_status='pending',
        )
        self.student.bukti_konsul_file = SimpleUploadedFile(
            'old-bukti-konsul.pdf',
            b'%PDF-1.4 old bukti konsul',
            content_type='application/pdf',
        )
        self.student.sptjm_file = SimpleUploadedFile(
            'old-sptjm.pdf',
            b'%PDF-1.4 old sptjm',
            content_type='application/pdf',
        )
        self.student.save()
        self.client.force_authenticate(user=self.admin)

    def build_retry_payload(self):
        return {
            'first_name': 'Rina',
            'last_name': 'Pratama',
            'email': self.student.email,
            'password': 'newpassword123',
            'nim': '23502210888',
            'program_studi': 'S1 Digital Business Technology',
            'angkatan': '2022',
            'gender': 'P',
            'phone_number': '081234567890',
            'bukti_konsul_file': SimpleUploadedFile(
                'new-bukti-konsul.pdf',
                b'%PDF-1.4 new bukti konsul',
                content_type='application/pdf',
            ),
            'sptjm_file': SimpleUploadedFile(
                'new-sptjm.pdf',
                b'%PDF-1.4 new sptjm',
                content_type='application/pdf',
            ),
        }

    def test_rejected_registration_can_retry_with_same_email(self):
        rejection_reason = 'Dokumen SPTJM tidak terbaca. Silakan unggah ulang.'
        response = self.client.post(
            f'/api/users/{self.student.id}/reject-registration/',
            {'rejection_reason': rejection_reason},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.registration_status, 'rejected')
        self.assertEqual(self.student.registration_rejection_reason, rejection_reason)
        self.assertFalse(self.student.is_active)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(rejection_reason, mail.outbox[0].body)
        self.assertEqual(Notification.objects.filter(student=self.student).count(), 1)

        self.client.force_authenticate(user=None)
        retry_response = self.client.post('/api/register/', self.build_retry_payload(), format='multipart')

        self.assertEqual(retry_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email=self.student.email).count(), 1)

        self.student.refresh_from_db()
        self.assertEqual(self.student.registration_status, 'pending')
        self.assertEqual(self.student.registration_rejection_reason, '')
        self.assertFalse(self.student.is_active)
        self.assertTrue(self.student.check_password('newpassword123'))
        self.assertIn('new-bukti-konsul', self.student.bukti_konsul_file.name)
        self.assertIn('new-sptjm', self.student.sptjm_file.name)

    def test_registration_rejection_requires_reason(self):
        response = self.client.post(
            f'/api/users/{self.student.id}/reject-registration/',
            {'rejection_reason': ''},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.student.refresh_from_db()
        self.assertEqual(self.student.registration_status, 'pending')

    def test_admin_approval_changes_registration_status_to_approved(self):
        response = self.client.patch(
            f'/api/users/{self.student.id}/',
            {'is_active': True},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_active)
        self.assertEqual(self.student.registration_status, 'approved')


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class PlacementDurationRequirementTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='duration-student@example.com',
            email='duration-student@example.com',
            password='password123',
            first_name='Tara',
            is_mahasiswa=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.student)

    def build_payload(self, end_date):
        return {
            'company_name': 'PT Durasi',
            'company_address': 'Jl. Durasi No. 1',
            'business_sector': 'Teknologi',
            'position': 'Software Intern',
            'start_date': '2026-04-01',
            'end_date': end_date,
            'supervisor_name': 'Supervisor Durasi',
            'supervisor_email': 'duration-supervisor@example.com',
            'supervisor_phone': '08123456789',
            'acceptance_letter': SimpleUploadedFile(
                'acceptance-letter.pdf',
                b'%PDF-1.4 acceptance',
                content_type='application/pdf',
            ),
        }

    def test_student_cannot_submit_placement_under_90_working_days(self):
        response = self.client.post(
            '/api/placements/',
            self.build_payload('2026-06-01'),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Durasi magang minimal 90 hari kerja', str(response.data['error']))
        self.assertFalse(Placement.objects.filter(student=self.student).exists())

    def test_student_can_submit_placement_with_at_least_90_working_days(self):
        response = self.client.post(
            '/api/placements/',
            self.build_payload('2026-08-04'),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        placement = Placement.objects.get(student=self.student)
        self.assertEqual(str(placement.start_date), '2026-04-01')
        self.assertEqual(str(placement.end_date), '2026-08-04')


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class PlacementTransferDateValidationTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='transfer-student@example.com',
            email='transfer-student@example.com',
            password='password123',
            first_name='Raka',
            is_mahasiswa=True,
            is_active=True,
        )
        self.old_placement = Placement.objects.create(
            student=self.student,
            company_name='PT Lama',
            company_address='Jl. Lama No. 1',
            business_sector='Teknologi',
            position='Frontend Intern',
            start_date='2026-04-01',
            end_date='2026-08-04',
            supervisor_name='Supervisor Lama',
            supervisor_email='old-supervisor@example.com',
            supervisor_phone='08123456789',
            acceptance_letter=SimpleUploadedFile(
                'old-acceptance-letter.pdf',
                b'%PDF-1.4 old acceptance',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )
        self.admin = User.objects.create_user(
            username='transfer-admin@example.com',
            email='transfer-admin@example.com',
            password='password123',
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.student)

    def build_transfer_payload(self, start_date='2026-07-01', previous_end_date='2026-06-30', end_date='2026-08-04'):
        return {
            'company_name': 'PT Baru',
            'company_address': 'Jl. Baru No. 2',
            'business_sector': 'Konsultan',
            'position': 'Backend Intern',
            'start_date': start_date,
            'end_date': end_date,
            'previous_placement_end_date': previous_end_date,
            'transfer_reason': 'Program magang di tempat lama berhenti dan saya diterima di tempat baru.',
            'supervisor_name': 'Supervisor Baru',
            'supervisor_email': 'new-supervisor@example.com',
            'supervisor_phone': '08987654321',
            'acceptance_letter': SimpleUploadedFile(
                'new-acceptance-letter.pdf',
                b'%PDF-1.4 new acceptance',
                content_type='application/pdf',
            ),
        }

    def test_student_cannot_transfer_to_overlapping_start_date(self):
        response = self.client.post(
            '/api/placements/',
            self.build_transfer_payload(start_date='2026-06-15', previous_end_date='2026-06-30'),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('harus setelah tanggal terakhir bekerja', str(response.data))

        self.old_placement.refresh_from_db()
        self.assertEqual(self.old_placement.status, 'verified')
        self.assertTrue(self.old_placement.is_approved)

    def test_student_cannot_transfer_if_accumulated_duration_is_under_90_working_days(self):
        response = self.client.post(
            '/api/placements/',
            self.build_transfer_payload(end_date='2026-07-31'),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Akumulasi durasi magang minimal 90 hari kerja', str(response.data))

        self.old_placement.refresh_from_db()
        self.assertEqual(self.old_placement.status, 'verified')
        self.assertTrue(self.old_placement.is_approved)

    def test_student_transfer_keeps_old_placement_active_until_admin_approval(self):
        response = self.client.post(
            '/api/placements/',
            self.build_transfer_payload(),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.old_placement.refresh_from_db()
        self.assertEqual(self.old_placement.status, 'verified')
        self.assertTrue(self.old_placement.is_approved)
        self.assertEqual(str(self.old_placement.end_date), '2026-08-04')

        new_placement = Placement.objects.get(student=self.student, company_name='PT Baru')
        self.assertEqual(new_placement.status, 'pending')
        self.assertFalse(new_placement.is_approved)
        self.assertEqual(str(new_placement.previous_placement_end_date), '2026-06-30')
        self.assertEqual(
            new_placement.transfer_reason,
            'Program magang di tempat lama berhenti dan saya diterima di tempat baru.'
        )

    def test_admin_approval_closes_old_placement_on_actual_last_day(self):
        response = self.client.post(
            '/api/placements/',
            self.build_transfer_payload(),
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        new_placement = Placement.objects.get(student=self.student, company_name='PT Baru')

        self.client.force_authenticate(user=self.admin)
        approval_response = self.client.patch(
            f'/api/placements/{new_placement.id}/',
            {'is_approved': True},
            format='json',
        )

        self.assertEqual(approval_response.status_code, status.HTTP_200_OK)

        self.old_placement.refresh_from_db()
        new_placement.refresh_from_db()

        self.assertEqual(self.old_placement.status, 'resigned')
        self.assertFalse(self.old_placement.is_approved)
        self.assertEqual(str(self.old_placement.end_date), '2026-06-30')
        self.assertEqual(new_placement.status, 'verified')
        self.assertTrue(new_placement.is_approved)


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class InternalApplicationDocumentRequirementTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='applicant@example.com',
            email='applicant@example.com',
            password='password123',
            first_name='Nina',
            is_mahasiswa=True,
            is_active=True,
        )
        self.vacancy = Vacancy.objects.create(
            title='Frontend Intern',
            company_name='PT Internal',
            description='Membantu pengembangan frontend.',
            requirements='CV wajib.',
            is_active=True,
        )
        self.internship_start_date = timezone.localdate()
        self.internship_end_date = self.internship_start_date + timedelta(days=130)
        self.client.force_authenticate(user=self.student)

    def test_student_cannot_apply_internal_vacancy_without_cv(self):
        response = self.client.post(
            '/api/applications/',
            {
                'vacancy': self.vacancy.id,
                'cover_letter': 'Saya berminat.',
                'internship_start_date': self.internship_start_date,
                'internship_end_date': self.internship_end_date,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('CV wajib diunggah', str(response.data))
        self.assertFalse(Application.objects.filter(student=self.student, vacancy=self.vacancy).exists())

    def test_student_can_apply_internal_vacancy_with_cv(self):
        self.student.cv_file = SimpleUploadedFile(
            'cv.pdf',
            b'%PDF-1.4 cv',
            content_type='application/pdf',
        )
        self.student.save(update_fields=['cv_file'])

        response = self.client.post(
            '/api/applications/',
            {
                'vacancy': self.vacancy.id,
                'cover_letter': 'Saya berminat.',
                'internship_start_date': self.internship_start_date,
                'internship_end_date': self.internship_end_date,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Application.objects.filter(student=self.student, vacancy=self.vacancy).exists())


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class ExternalPlacementRequiresWithdrawnInternalApplicationTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='switcher@example.com',
            email='switcher@example.com',
            password='password123',
            first_name='Riko',
            is_mahasiswa=True,
            is_active=True,
        )
        self.vacancy = Vacancy.objects.create(
            title='Data Analyst Intern',
            company_name='PT Mitra Internal',
            description='Analisis data.',
            requirements='CV wajib.',
            is_active=True,
        )
        self.application = Application.objects.create(
            student=self.student,
            vacancy=self.vacancy,
            cover_letter='Saya tertarik.',
            status='reviewed',
        )
        self.client.force_authenticate(user=self.student)

    def build_placement_payload(self, withdrawal_reason=''):
        return {
            'company_name': 'PT Luar Bursa',
            'company_address': 'Jl. Luar No. 1',
            'business_sector': 'Teknologi',
            'position': 'Product Intern',
            'start_date': '2026-04-01',
            'end_date': '2026-08-04',
            'supervisor_name': 'Supervisor Luar',
            'supervisor_email': 'supervisor-luar@example.com',
            'supervisor_phone': '08123456789',
            'withdrawal_reason': withdrawal_reason,
            'acceptance_letter': SimpleUploadedFile(
                'outside-offer.pdf',
                b'%PDF-1.4 outside offer',
                content_type='application/pdf',
            ),
        }

    def test_student_must_withdraw_internal_application_before_external_placement(self):
        response = self.client.post(
            '/api/placements/',
            self.build_placement_payload(),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Tarik lamaran internal', str(response.data))

        self.application.refresh_from_db()
        self.assertEqual(self.application.status, 'reviewed')
        self.assertFalse(Placement.objects.filter(student=self.student).exists())

    def test_external_placement_allowed_after_internal_application_is_withdrawn(self):
        self.application.status = 'withdrawn'
        self.application.withdrawal_reason = 'Saya sudah diterima di perusahaan luar bursa.'
        self.application.save(update_fields=['status', 'withdrawal_reason'])

        response = self.client.post(
            '/api/placements/',
            self.build_placement_payload(),
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.application.refresh_from_db()
        self.assertEqual(self.application.status, 'withdrawn')
        self.assertEqual(self.application.withdrawal_reason, 'Saya sudah diterima di perusahaan luar bursa.')

        placement = Placement.objects.get(student=self.student)
        self.assertEqual(placement.company_name, 'PT Luar Bursa')
        self.assertFalse(placement.is_approved)
        self.assertEqual(placement.status, 'pending')


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class MonthlyReportPerPlacementRequirementTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='monthly-student@example.com',
            email='monthly-student@example.com',
            password='password123',
            first_name='Maya',
            is_mahasiswa=True,
            is_active=True,
        )
        self.first_placement = self.create_placement('PT Pertama', 'Frontend Intern')
        self.second_placement = self.create_placement('PT Kedua', 'Backend Intern')
        self.client.force_authenticate(user=self.student)

    def create_placement(self, company_name, position):
        return Placement.objects.create(
            student=self.student,
            company_name=company_name,
            company_address='Jl. Contoh No. 1',
            business_sector='Teknologi',
            position=position,
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor',
            supervisor_email='supervisor@example.com',
            supervisor_phone='08123456789',
            acceptance_letter=SimpleUploadedFile(
                f'{company_name}.pdf',
                b'%PDF-1.4 placement',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )

    def build_report_payload(self, placement, report_month, include_full_fields=False):
        payload = {
            'placement': placement.id,
            'report_month': report_month,
            'job_description': 'Mengerjakan fitur aplikasi.',
        }

        if include_full_fields:
            payload.update({
                'company_profile': 'Perusahaan teknologi.',
                'work_environment': 'Lingkungan kerja kolaboratif.',
                'useful_courses': 'Web development dan database.',
                'new_skills': 'Code review dan komunikasi lintas tim.',
            })

        return payload

    def test_first_month_full_questions_reset_for_each_new_placement(self):
        first_reduced_response = self.client.post(
            '/api/monthly-reports/',
            self.build_report_payload(self.first_placement, 'Bulan 1', include_full_fields=False),
            format='json',
        )
        self.assertEqual(first_reduced_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Laporan pertama untuk tempat magang ini', str(first_reduced_response.data['error']))

        first_full_response = self.client.post(
            '/api/monthly-reports/',
            self.build_report_payload(self.first_placement, 'Bulan 1', include_full_fields=True),
            format='json',
        )
        self.assertEqual(first_full_response.status_code, status.HTTP_201_CREATED)

        second_reduced_response = self.client.post(
            '/api/monthly-reports/',
            self.build_report_payload(self.first_placement, 'Bulan 2', include_full_fields=False),
            format='json',
        )
        self.assertEqual(second_reduced_response.status_code, status.HTTP_201_CREATED)

        new_placement_reduced_response = self.client.post(
            '/api/monthly-reports/',
            self.build_report_payload(self.second_placement, 'Bulan 1', include_full_fields=False),
            format='json',
        )
        self.assertEqual(new_placement_reduced_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Laporan pertama untuk tempat magang ini', str(new_placement_reduced_response.data['error']))

        new_placement_full_response = self.client.post(
            '/api/monthly-reports/',
            self.build_report_payload(self.second_placement, 'Bulan 1', include_full_fields=True),
            format='json',
        )
        self.assertEqual(new_placement_full_response.status_code, status.HTTP_201_CREATED)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class PlacementApprovalNotificationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.student = User.objects.create_user(
            username='student@example.com',
            email='student@example.com',
            password='password123',
            first_name='Budi',
            is_mahasiswa=True,
        )
        self.placement = Placement.objects.create(
            student=self.student,
            company_name='PT Maju Jaya',
            company_address='Jl. Sudirman No. 1',
            business_sector='Teknologi',
            position='Backend Intern',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Sinta',
            supervisor_email='supervisor@example.com',
            supervisor_phone='08123456789',
            acceptance_letter=SimpleUploadedFile(
                'surat.pdf',
                b'%PDF-1.4 test file',
                content_type='application/pdf',
            ),
            status='pending',
            is_approved=False,
        )

    def test_admin_approval_creates_notification_for_student(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f'/api/placements/{self.placement.id}/',
            {'is_approved': 'true'},
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.placement.refresh_from_db()
        self.assertTrue(self.placement.is_approved)
        self.assertEqual(self.placement.status, 'verified')

        notification = Notification.objects.get(student=self.student)
        self.assertEqual(notification.title, 'Tempat magang kamu sudah diverifikasi')
        self.assertEqual(notification.notification_type, 'general')
        self.assertEqual(notification.target_tab, 'lapor')
        self.assertIn('PT Maju Jaya', notification.message)
        self.assertEqual(len(mail.outbox), 1)

    def test_reapproving_verified_placement_does_not_create_duplicate_notification(self):
        self.placement.status = 'verified'
        self.placement.is_approved = True
        self.placement.save(update_fields=['status', 'is_approved'])

        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f'/api/placements/{self.placement.id}/',
            {'is_approved': 'true'},
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(student=self.student).count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_admin_can_reject_pending_placement(self):
        self.client.force_authenticate(user=self.admin)
        rejection_reason = 'LoA belum mencantumkan periode magang yang sesuai.'

        response = self.client.patch(
            f'/api/placements/{self.placement.id}/',
            {
                'status': 'rejected',
                'is_approved': 'false',
                'rejection_reason': rejection_reason,
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.placement.refresh_from_db()
        self.assertFalse(self.placement.is_approved)
        self.assertEqual(self.placement.status, 'rejected')
        self.assertEqual(self.placement.rejection_reason, rejection_reason)

        notification = Notification.objects.get(student=self.student)
        self.assertEqual(notification.title, 'Pengajuan tempat magang ditolak')
        self.assertEqual(notification.target_tab, 'lapor')
        self.assertIn(rejection_reason, notification.message)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(rejection_reason, mail.outbox[0].body)

    def test_admin_must_include_reason_when_rejecting_pending_placement(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f'/api/placements/{self.placement.id}/',
            {'status': 'rejected', 'is_approved': 'false'},
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class UserPasswordResetNotificationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-reset',
            email='admin-reset@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.student = User.objects.create_user(
            username='reset-student@example.com',
            email='reset-student@example.com',
            password='oldpassword123',
            first_name='Rina',
            is_mahasiswa=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_admin_password_reset_sends_link_and_student_sets_new_password(self):
        response = self.client.post(f'/api/users/{self.student.id}/send-password-reset/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertTrue(self.student.check_password('oldpassword123'))

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.student.email])
        self.assertIn('Link Reset Password Akun Co-op', mail.outbox[0].subject)
        self.assertIn('http://frontend.test/reset-password/', mail.outbox[0].body)

        notification = Notification.objects.get(student=self.student)
        self.assertEqual(notification.title, 'Link reset password telah dikirim')
        self.assertEqual(notification.notification_type, 'account')
        self.assertEqual(notification.target_tab, '')
        self.assertEqual(notification.action_url, 'https://outlook.office.com/mail/')
        self.assertEqual(notification.action_label, 'Buka Email Kampus')

        match = re.search(r'http://frontend\.test/reset-password/([^/\s]+)/([^/\s]+)', mail.outbox[0].body)
        self.assertIsNotNone(match)
        uidb64, token = match.groups()
        new_password = 'NewPassword123!'

        self.client.force_authenticate(user=None)
        reset_response = self.client.post(
            '/api/auth/password-reset/confirm/',
            {
                'uid': uidb64,
                'token': token,
                'new_password': new_password,
                'confirm_password': new_password,
            },
            format='json',
        )

        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertFalse(self.student.check_password('oldpassword123'))
        self.assertTrue(self.student.check_password(new_password))

        reused_response = self.client.post(
            '/api/auth/password-reset/confirm/',
            {
                'uid': uidb64,
                'token': token,
                'new_password': 'AnotherPassword123!',
                'confirm_password': 'AnotherPassword123!',
            },
            format='json',
        )

        self.assertEqual(reused_response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class SupervisorEvaluationFormCreationTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='eval-student@example.com',
            email='eval-student@example.com',
            password='password123',
            first_name='Rani',
            last_name='Wijaya',
            nim='23502210099',
            program_studi='Software Engineering',
            is_mahasiswa=True,
            is_active=True,
        )
        self.placement = Placement.objects.create(
            student=self.student,
            company_name='PT Evaluasi',
            company_address='Jl. Form No. 1',
            business_sector='Teknologi',
            position='Frontend Intern',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Form',
            supervisor_email='supervisor-form@example.com',
            supervisor_phone='08123456780',
            acceptance_letter=SimpleUploadedFile(
                'surat-evaluasi.pdf',
                b'%PDF-1.4 eval file',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )

    def test_create_evaluation_returns_form_url_and_sends_email(self):
        response = self.client.post(
            '/api/evaluations/',
            {
                'placement': self.placement.id,
                'eval_type': 'UTS',
                'is_filled': False,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        evaluation = SupervisorEvaluation.objects.get()
        self.assertEqual(evaluation.placement, self.placement)
        self.assertEqual(evaluation.eval_type, 'UTS')
        self.assertFalse(evaluation.is_filled)
        self.assertEqual(response.data['form_url'], f'http://frontend.test/evaluasi/{evaluation.id}')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.placement.supervisor_email])
        self.assertIn(response.data['form_url'], mail.outbox[0].body)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class SupervisorContactChangeTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-supervisor-change',
            email='admin-supervisor-change@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.student = User.objects.create_user(
            username='student-supervisor-change@example.com',
            email='student-supervisor-change@example.com',
            password='password123',
            first_name='Rani',
            last_name='Wijaya',
            nim='23502210111',
            program_studi='Software Engineering',
            is_mahasiswa=True,
            is_active=True,
        )
        self.placement = Placement.objects.create(
            student=self.student,
            company_name='PT Supervisor Lama',
            company_address='Jl. Kontak No. 1',
            business_sector='Teknologi',
            position='Product Intern',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Lama',
            supervisor_email='supervisor-lama@example.com',
            supervisor_phone='081111111111',
            acceptance_letter=SimpleUploadedFile(
                'surat-supervisor-change.pdf',
                b'%PDF-1.4 supervisor change',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )
        self.evaluation = SupervisorEvaluation.objects.create(
            placement=self.placement,
            eval_type='UTS',
            is_filled=False,
        )
        mail.outbox.clear()

    def request_change(self):
        self.client.force_authenticate(user=self.student)
        return self.client.post(
            f'/api/placements/{self.placement.id}/request-supervisor-change/',
            {
                'supervisor_name': 'Supervisor Baru',
                'supervisor_email': 'supervisor-baru@example.com',
                'supervisor_phone': '082222222222',
                'reason': 'Supervisor sebelumnya pindah divisi.',
            },
            format='json',
        )

    def test_student_request_waits_for_admin_and_approval_resends_existing_form(self):
        response = self.request_change()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.placement.refresh_from_db()
        self.assertEqual(self.placement.supervisor_email, 'supervisor-lama@example.com')
        self.assertEqual(self.placement.pending_supervisor_email, 'supervisor-baru@example.com')
        self.assertEqual(self.placement.supervisor_change_status, 'pending')

        self.client.force_authenticate(user=self.admin)
        approval_response = self.client.post(
            f'/api/placements/{self.placement.id}/approve-supervisor-change/',
            {},
            format='json',
        )

        self.assertEqual(approval_response.status_code, status.HTTP_200_OK)
        self.placement.refresh_from_db()
        self.assertEqual(self.placement.supervisor_name, 'Supervisor Baru')
        self.assertEqual(self.placement.supervisor_email, 'supervisor-baru@example.com')
        self.assertEqual(self.placement.supervisor_change_status, 'none')
        self.assertEqual(approval_response.data['resent_count'], 1)
        self.assertEqual(mail.outbox[0].to, ['supervisor-baru@example.com'])
        self.assertIn(f'http://frontend.test/evaluasi/{self.evaluation.id}', mail.outbox[0].body)
        self.assertTrue(
            Notification.objects.filter(
                student=self.student,
                title='Perubahan kontak supervisor disetujui',
            ).exists()
        )

    def test_admin_rejection_keeps_active_contact_and_notifies_student(self):
        self.request_change()
        self.client.force_authenticate(user=self.admin)
        rejection_response = self.client.post(
            f'/api/placements/{self.placement.id}/reject-supervisor-change/',
            {'reason': 'Gunakan email kantor supervisor yang aktif.'},
            format='json',
        )

        self.assertEqual(rejection_response.status_code, status.HTTP_200_OK)
        self.placement.refresh_from_db()
        self.assertEqual(self.placement.supervisor_email, 'supervisor-lama@example.com')
        self.assertEqual(self.placement.supervisor_change_status, 'rejected')
        self.assertIn('Gunakan email kantor', self.placement.supervisor_change_rejection_reason)
        notification = Notification.objects.get(
            student=self.student,
            title='Perubahan kontak supervisor perlu diperbaiki',
        )
        self.assertIn('Gunakan email kantor', notification.message)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class VacancyNotificationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-vacancy',
            email='admin-vacancy@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.job_seeker = User.objects.create_user(
            username='job-seeker@example.com',
            email='job-seeker@example.com',
            password='password123',
            first_name='Joko',
            is_mahasiswa=True,
            is_active=True,
        )
        self.interning_student = User.objects.create_user(
            username='interning@example.com',
            email='interning@example.com',
            password='password123',
            first_name='Maya',
            is_mahasiswa=True,
            is_active=True,
        )
        Placement.objects.create(
            student=self.interning_student,
            company_name='PT Sudah Magang',
            company_address='Jl. Sudah No. 1',
            business_sector='Teknologi',
            position='Data Intern',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Aktif',
            supervisor_email='supervisor-aktif@example.com',
            supervisor_phone='08123456781',
            acceptance_letter=SimpleUploadedFile(
                'surat-aktif.pdf',
                b'%PDF-1.4 active placement',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_vacancy_notifies_active_job_seekers_only(self):
        response = self.client.post(
            '/api/vacancies/',
            {
                'title': 'Business Analyst Intern',
                'company_name': 'PT Lowongan Baru',
                'description': 'Membantu analisis kebutuhan bisnis.',
                'requirements': 'Mahasiswa aktif dan tertarik analisis data.',
                'expires_at': '2026-12-31',
                'external_apply_link': '',
                'notify_job_seekers': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['notification_count'], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].bcc, [self.job_seeker.email])
        self.assertIn('Business Analyst Intern', mail.outbox[0].body)
        self.assertEqual(Notification.objects.filter(student=self.job_seeker).count(), 1)
        self.assertEqual(Notification.objects.filter(student=self.interning_student).count(), 0)

    def test_create_vacancy_without_expiry_date_stays_active(self):
        response = self.client.post(
            '/api/vacancies/',
            {
                'title': 'Open Ended Intern',
                'company_name': 'PT Tanpa Deadline',
                'description': 'Lowongan tanpa batas akhir.',
                'requirements': 'Mahasiswa aktif.',
                'notify_job_seekers': False,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['expires_at'])

        list_response = self.client.get('/api/vacancies/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id'] for item in list_response.data}
        self.assertIn(response.data['id'], returned_ids)

    def test_expired_vacancy_is_not_returned_without_being_deleted(self):
        expired_vacancy = Vacancy.objects.create(
            title='Expired Intern',
            company_name='PT Lama',
            description='Lowongan lama',
            requirements='Syarat lama',
            expires_at=timezone.localdate() - timedelta(days=1),
            is_active=True,
        )
        active_vacancy = Vacancy.objects.create(
            title='Active Intern',
            company_name='PT Baru',
            description='Lowongan aktif',
            requirements='Syarat aktif',
            expires_at=timezone.localdate(),
            is_active=True,
        )

        response = self.client.get('/api/vacancies/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item['id'] for item in response.data}
        self.assertNotIn(expired_vacancy.id, returned_ids)
        self.assertIn(active_vacancy.id, returned_ids)
        self.assertTrue(Vacancy.objects.filter(id=expired_vacancy.id).exists())

    def test_create_vacancy_rejects_past_expiry_date(self):
        response = self.client.post(
            '/api/vacancies/',
            {
                'title': 'Past Date Intern',
                'company_name': 'PT Salah Tanggal',
                'description': 'Lowongan dengan tanggal lampau.',
                'requirements': 'Mahasiswa aktif.',
                'expires_at': str(timezone.localdate() - timedelta(days=1)),
                'notify_job_seekers': False,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expires_at', response.data)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class ReminderTargetingTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-reminder',
            email='admin-reminder@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.student_one = User.objects.create_user(
            username='mahasiswa1@example.com',
            email='mahasiswa1@example.com',
            password='password123',
            first_name='Andi',
            is_mahasiswa=True,
            is_active=True,
        )
        self.student_two = User.objects.create_user(
            username='mahasiswa2@example.com',
            email='mahasiswa2@example.com',
            password='password123',
            first_name='Sari',
            is_mahasiswa=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_send_weekly_reminder_with_student_id_only_notifies_target_student(self):
        response = self.client.post(
            '/api/send-reminders/',
            {
                'student_id': self.student_one.id,
                'subject': 'Reminder mingguan',
                'message': 'Isi laporan mingguan sekarang.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(student=self.student_one).count(), 1)
        self.assertEqual(Notification.objects.filter(student=self.student_two).count(), 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.student_one.email])

    def test_send_report_reminder_with_student_id_only_notifies_target_student(self):
        acceptance_letter = SimpleUploadedFile(
            'surat.pdf',
            b'%PDF-1.4 report reminder',
            content_type='application/pdf',
        )
        Placement.objects.create(
            student=self.student_one,
            company_name='PT Alpha',
            company_address='Alamat Alpha',
            business_sector='Teknologi',
            position='Intern Alpha',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Alpha',
            supervisor_email='alpha@example.com',
            supervisor_phone='0811111111',
            acceptance_letter=acceptance_letter,
            status='verified',
            is_approved=True,
        )
        Placement.objects.create(
            student=self.student_two,
            company_name='PT Beta',
            company_address='Alamat Beta',
            business_sector='Teknologi',
            position='Intern Beta',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Beta',
            supervisor_email='beta@example.com',
            supervisor_phone='0822222222',
            acceptance_letter=SimpleUploadedFile(
                'surat-beta.pdf',
                b'%PDF-1.4 report reminder beta',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )

        response = self.client.post(
            '/api/send-report-reminders/',
            {
                'student_id': self.student_one.id,
                'report_type': 'UTS',
                'subject': 'Reminder UTS',
                'message': 'Segera upload laporan UTS.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(student=self.student_one).count(), 1)
        self.assertEqual(Notification.objects.filter(student=self.student_two).count(), 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.student_one.email])

    def test_send_report_reminder_for_submitted_student_returns_student_name(self):
        placement = Placement.objects.create(
            student=self.student_one,
            company_name='PT Alpha',
            company_address='Alamat Alpha',
            business_sector='Teknologi',
            position='Intern Alpha',
            start_date='2026-04-01',
            end_date='2026-10-01',
            supervisor_name='Supervisor Alpha',
            supervisor_email='alpha@example.com',
            supervisor_phone='0811111111',
            acceptance_letter=SimpleUploadedFile(
                'surat-submitted.pdf',
                b'%PDF-1.4 submitted',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )
        UtsReport.objects.create(
            student=self.student_one,
            placement=placement,
            report_file=SimpleUploadedFile(
                'laporan-uts.pdf',
                b'%PDF-1.4 uts report',
                content_type='application/pdf',
            ),
            description='Sudah submit',
        )

        response = self.client.post(
            '/api/send-report-reminders/',
            {
                'student_id': self.student_one.id,
                'report_type': 'UTS',
                'subject': 'Reminder UTS',
                'message': 'Segera upload laporan UTS.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Andi sudah mengumpulkan laporan UTS.')
        self.assertEqual(Notification.objects.filter(student=self.student_one).count(), 0)
        self.assertEqual(len(mail.outbox), 0)


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_BASE_URL='http://frontend.test',
    MEDIA_ROOT=TEST_MEDIA_ROOT,
)
class CompletionReminderTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin-completion',
            email='admin-completion@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True,
            is_mahasiswa=False,
        )
        self.incomplete_student = User.objects.create_user(
            username='incomplete@example.com',
            email='incomplete@example.com',
            password='password123',
            first_name='Rina',
            is_mahasiswa=True,
            is_active=True,
        )
        self.complete_student = User.objects.create_user(
            username='complete@example.com',
            email='complete@example.com',
            password='password123',
            first_name='Dimas',
            is_mahasiswa=True,
            is_active=True,
        )
        self.incomplete_placement = self.create_placement(self.incomplete_student, 'PT Belum Lengkap')
        self.complete_placement = self.create_placement(self.complete_student, 'PT Sudah Lengkap')
        self.create_monthly_report(self.incomplete_student, self.incomplete_placement, 'Bulan 1')

        for month_number in range(1, 4):
            self.create_monthly_report(
                self.complete_student,
                self.complete_placement,
                f'Bulan {month_number}',
            )

        UtsReport.objects.create(
            student=self.complete_student,
            placement=self.complete_placement,
            report_file=SimpleUploadedFile(
                'complete-uts.pdf',
                b'%PDF-1.4 complete uts',
                content_type='application/pdf',
            ),
        )
        FinalReport.objects.create(
            student=self.complete_student,
            placement=self.complete_placement,
            report_file=SimpleUploadedFile(
                'complete-uas.pdf',
                b'%PDF-1.4 complete uas',
                content_type='application/pdf',
            ),
        )
        SupervisorEvaluation.objects.create(
            placement=self.complete_placement,
            eval_type='UTS',
            is_filled=True,
            score=85,
        )
        SupervisorEvaluation.objects.create(
            placement=self.complete_placement,
            eval_type='UAS',
            is_filled=True,
            score=90,
        )
        self.client.force_authenticate(user=self.admin)

    def create_placement(self, student, company_name):
        return Placement.objects.create(
            student=student,
            company_name=company_name,
            company_address='Jl. Kelengkapan No. 1',
            business_sector='Teknologi',
            position='Intern',
            start_date='2026-04-01',
            end_date='2026-06-30',
            supervisor_name='Supervisor',
            supervisor_email='supervisor@example.com',
            supervisor_phone='08123456789',
            acceptance_letter=SimpleUploadedFile(
                f'{student.id}-acceptance.pdf',
                b'%PDF-1.4 acceptance',
                content_type='application/pdf',
            ),
            status='verified',
            is_approved=True,
        )

    def create_monthly_report(self, student, placement, report_month):
        return MonthlyReport.objects.create(
            student=student,
            placement=placement,
            report_month=report_month,
            company_profile='Profil perusahaan',
            job_description='Mengerjakan fitur',
            work_environment='Kolaboratif',
            useful_courses='Web development',
            new_skills='Komunikasi',
        )

    def test_mass_completion_reminder_only_notifies_incomplete_students(self):
        response = self.client.post('/api/send-completion-reminders/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sent_count'], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.incomplete_student.email])
        self.assertIn('Laporan bulanan belum lengkap (1/3', mail.outbox[0].body)
        self.assertIn('Dokumen Laporan Tengah Semester (UTS) belum diunggah', mail.outbox[0].body)
        self.assertIn('Dokumen Laporan Akhir (UAS) belum diunggah', mail.outbox[0].body)
        self.assertIn('Evaluasi Kemajuan (UTS) dari supervisor belum tersedia', mail.outbox[0].body)
        self.assertIn('Evaluasi Akhir (UAS) dari supervisor belum tersedia', mail.outbox[0].body)
        self.assertEqual(Notification.objects.filter(student=self.incomplete_student).count(), 1)
        self.assertEqual(Notification.objects.filter(student=self.complete_student).count(), 0)

    def test_single_completion_reminder_skips_student_with_complete_requirements(self):
        response = self.client.post(
            '/api/send-completion-reminders/',
            {'placement_id': self.complete_placement.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sent_count'], 0)
        self.assertEqual(len(mail.outbox), 0)


class NotificationDeletionTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='notif-student@example.com',
            email='notif-student@example.com',
            password='password123',
            first_name='Dina',
            is_mahasiswa=True,
            is_active=True,
        )
        self.other_student = User.objects.create_user(
            username='notif-other@example.com',
            email='notif-other@example.com',
            password='password123',
            first_name='Raka',
            is_mahasiswa=True,
            is_active=True,
        )
        self.notification = Notification.objects.create(
            student=self.student,
            title='Notif saya',
            message='Pesan saya',
            notification_type='general',
            target_tab='profil',
        )
        Notification.objects.create(
            student=self.student,
            title='Notif saya kedua',
            message='Pesan saya kedua',
            notification_type='reminder',
            target_tab='notifikasi',
        )
        self.other_notification = Notification.objects.create(
            student=self.other_student,
            title='Notif orang lain',
            message='Pesan orang lain',
            notification_type='general',
            target_tab='profil',
        )
        self.client.force_authenticate(user=self.student)

    def test_student_can_delete_own_notification(self):
        response = self.client.delete(f'/api/notifications/{self.notification.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Notification.objects.filter(id=self.notification.id).exists())
        self.assertTrue(Notification.objects.filter(id=self.other_notification.id).exists())

    def test_student_can_delete_all_own_notifications_only(self):
        response = self.client.delete('/api/notifications/delete_all/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['deleted'], 2)
        self.assertEqual(Notification.objects.filter(student=self.student).count(), 0)
        self.assertEqual(Notification.objects.filter(student=self.other_student).count(), 1)


@override_settings(
    FRONTEND_BASE_URL='http://frontend.test',
    MICROSOFT_SSO_CLIENT_ID='client-id',
    MICROSOFT_SSO_TENANT_ID='tenant-id',
    MICROSOFT_SSO_CLIENT_SECRET='client-secret',
    MICROSOFT_SSO_REDIRECT_URI='http://backend.test/api/auth/microsoft/callback/',
    MICROSOFT_SSO_SCOPES=['openid', 'profile', 'email', 'User.Read'],
)
class MicrosoftAdminLinkTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='coop-admin',
            email='admin@example.com',
            password='password123',
            is_staff=True,
            is_mahasiswa=False,
        )
        self.student = User.objects.create_user(
            username='student@example.com',
            email='student@example.com',
            password='password123',
            is_mahasiswa=True,
        )

    def build_callback_state(self, flow='login', user_id=None):
        payload = {'nonce': 'test-nonce', 'flow': flow}
        if user_id:
            payload['user_id'] = user_id
        return signing.dumps(payload, salt='coop.microsoft-sso.state')

    def mock_microsoft_requests(self, microsoft_id='microsoft-coop-id', email='coop@prasetiyamulya.ac.id'):
        token_response = Mock()
        token_response.raise_for_status.return_value = None
        token_response.json.return_value = {'access_token': 'test-access-token'}

        profile_response = Mock()
        profile_response.raise_for_status.return_value = None
        profile_response.json.return_value = {
            'id': microsoft_id,
            'mail': email,
            'displayName': 'Unit Co-op',
        }

        return (
            patch('core_app.views.requests.post', return_value=token_response),
            patch('core_app.views.requests.get', return_value=profile_response),
        )

    def test_only_admin_can_start_microsoft_link(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post('/api/auth/microsoft/admin-link/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_start_microsoft_link(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post('/api/auth/microsoft/admin-link/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        authorization_url = response.data['authorization_url']
        query = parse_qs(urlparse(authorization_url).query)
        state_payload = signing.loads(query['state'][0], salt='coop.microsoft-sso.state')
        self.assertEqual(state_payload['flow'], 'admin_link')
        self.assertEqual(state_payload['user_id'], self.admin.id)

    def test_admin_link_callback_saves_verified_microsoft_identity(self):
        state = self.build_callback_state(flow='admin_link', user_id=self.admin.id)
        post_patch, get_patch = self.mock_microsoft_requests()

        with post_patch, get_patch:
            response = self.client.get('/api/auth/microsoft/callback/', {'code': 'test-code', 'state': state})

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('/admin-dashboard?tab=pengaturan&microsoft_linked=1', response.url)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.microsoft_id, 'microsoft-coop-id')
        self.assertEqual(self.admin.microsoft_email, 'coop@prasetiyamulya.ac.id')

    def test_unlinked_admin_cannot_login_with_email_match_only(self):
        self.admin.username = 'coop@prasetiyamulya.ac.id'
        self.admin.email = 'coop@prasetiyamulya.ac.id'
        self.admin.save(update_fields=['username', 'email'])
        state = self.build_callback_state()
        post_patch, get_patch = self.mock_microsoft_requests()

        with post_patch, get_patch:
            response = self.client.get('/api/auth/microsoft/callback/', {'code': 'test-code', 'state': state})

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('microsoft_error=', response.url)
        self.assertFalse(User.objects.get(id=self.admin.id).microsoft_id)

    def test_linked_admin_can_login_with_microsoft(self):
        self.admin.microsoft_id = 'microsoft-coop-id'
        self.admin.microsoft_email = 'coop@prasetiyamulya.ac.id'
        self.admin.save(update_fields=['microsoft_id', 'microsoft_email'])
        state = self.build_callback_state()
        post_patch, get_patch = self.mock_microsoft_requests()

        with post_patch, get_patch:
            response = self.client.get('/api/auth/microsoft/callback/', {'code': 'test-code', 'state': state})

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertIn('/auth/microsoft/callback?token=', response.url)

    def test_admin_can_unlink_microsoft_identity(self):
        self.admin.microsoft_id = 'microsoft-coop-id'
        self.admin.microsoft_email = 'coop@prasetiyamulya.ac.id'
        self.admin.save(update_fields=['microsoft_id', 'microsoft_email'])
        self.client.force_authenticate(user=self.admin)

        response = self.client.post('/api/auth/microsoft/admin-unlink/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertIsNone(self.admin.microsoft_id)
        self.assertEqual(self.admin.microsoft_email, '')
