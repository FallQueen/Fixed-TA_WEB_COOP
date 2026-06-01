from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0018_placement_transfer_reason'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='is_archived_by_admin',
            field=models.BooleanField(default=False),
        ),
    ]
