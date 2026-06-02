from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0022_notification_action_url_and_label'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='microsoft_email',
            field=models.EmailField(blank=True, default='', max_length=254),
        ),
        migrations.AddField(
            model_name='user',
            name='microsoft_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
