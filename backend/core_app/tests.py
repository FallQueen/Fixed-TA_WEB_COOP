from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import FinalReport, Notification, Placement, User, UtsReport


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
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


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
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
