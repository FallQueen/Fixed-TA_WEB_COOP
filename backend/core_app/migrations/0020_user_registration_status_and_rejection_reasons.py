from django.db import migrations, models


def sync_existing_registration_statuses(apps, schema_editor):
    User = apps.get_model('core_app', 'User')
    User.objects.filter(is_active=True).update(registration_status='approved')
    User.objects.filter(is_active=False).update(registration_status='pending')


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0019_application_archived_at_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='placement',
            name='rejection_reason',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='user',
            name='registration_rejection_reason',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='user',
            name='registration_status',
            field=models.CharField(
                choices=[
                    ('pending', 'Menunggu Persetujuan'),
                    ('approved', 'Disetujui'),
                    ('rejected', 'Ditolak'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.RunPython(
            sync_existing_registration_statuses,
            migrations.RunPython.noop,
        ),
    ]
