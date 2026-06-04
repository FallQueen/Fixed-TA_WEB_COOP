from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core_app', '0024_vacancy_supervisor_contact'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='internship_start_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='internship_end_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
