from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0020_user_registration_status_and_rejection_reasons'),
    ]

    operations = [
        migrations.AddField(
            model_name='placement',
            name='pending_supervisor_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
        migrations.AddField(
            model_name='placement',
            name='pending_supervisor_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='placement',
            name='pending_supervisor_phone',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='placement',
            name='supervisor_change_reason',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='placement',
            name='supervisor_change_rejection_reason',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='placement',
            name='supervisor_change_requested_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='placement',
            name='supervisor_change_status',
            field=models.CharField(
                choices=[
                    ('none', 'Tidak Ada Pengajuan'),
                    ('pending', 'Menunggu Persetujuan'),
                    ('rejected', 'Ditolak Admin'),
                ],
                default='none',
                max_length=20,
            ),
        ),
    ]
