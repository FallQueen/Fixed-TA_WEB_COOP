from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0016_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='withdrawal_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='withdrawn_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Menunggu Review'),
                    ('reviewed', 'Telah Diteruskan ke HRD'),
                    ('accepted', 'Diterima Perusahaan'),
                    ('rejected', 'Ditolak Perusahaan'),
                    ('withdrawn', 'Ditarik Mahasiswa'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
