from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0021_placement_supervisor_change_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='action_label',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='notification',
            name='action_url',
            field=models.URLField(blank=True, default=''),
        ),
    ]
