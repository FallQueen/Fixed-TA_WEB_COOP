from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0017_application_withdrawal'),
    ]

    operations = [
        migrations.AddField(
            model_name='placement',
            name='previous_placement_end_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='placement',
            name='transfer_reason',
            field=models.TextField(blank=True, default=''),
        ),
    ]
