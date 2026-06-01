from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Kirim email test untuk memverifikasi konfigurasi SMTP backend.'

    def add_arguments(self, parser):
        parser.add_argument('recipient', help='Alamat email tujuan test SMTP.')
        parser.add_argument(
            '--subject',
            default='Tes SMTP Aplikasi COOP',
            help='Subjek email test.',
        )
        parser.add_argument(
            '--message',
            default='Email test SMTP dari aplikasi COOP berhasil dikirim.',
            help='Isi email test.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Tampilkan ringkasan konfigurasi tanpa mengirim email.',
        )

    def handle(self, *args, **options):
        recipient = options['recipient'].strip()
        if not recipient:
            raise CommandError('Recipient tidak boleh kosong.')

        summary = {
            'EMAIL_BACKEND': settings.EMAIL_BACKEND,
            'EMAIL_HOST': settings.EMAIL_HOST,
            'EMAIL_PORT': settings.EMAIL_PORT,
            'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
            'EMAIL_HOST_USER_SET': bool(settings.EMAIL_HOST_USER),
            'EMAIL_HOST_PASSWORD_SET': bool(settings.EMAIL_HOST_PASSWORD),
            'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
        }

        for key, value in summary.items():
            self.stdout.write(f'{key}={value}')

        if options['dry_run']:
            self.stdout.write(self.style.WARNING('Dry run selesai. Email tidak dikirim.'))
            return

        try:
            sent_count = send_mail(
                options['subject'],
                options['message'],
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=False,
            )
        except Exception as exc:
            raise CommandError(f'Gagal mengirim email test SMTP: {exc}') from exc

        if sent_count != 1:
            raise CommandError('Django tidak melaporkan email test sebagai terkirim.')

        self.stdout.write(self.style.SUCCESS(f'Email test SMTP berhasil dikirim ke {recipient}.'))
