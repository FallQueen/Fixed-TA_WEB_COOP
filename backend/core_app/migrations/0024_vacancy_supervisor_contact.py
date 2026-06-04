from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0023_user_microsoft_identity'),
    ]

    operations = [
        migrations.AddField(
            model_name='vacancy',
            name='supervisor_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='supervisor_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
        migrations.AddField(
            model_name='vacancy',
            name='supervisor_phone',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
