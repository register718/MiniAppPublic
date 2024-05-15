# Generated by Django 4.1.7 on 2023-05-14 14:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mini',
            name='AnzahlEingeteilt',
        ),
        migrations.AddField(
            model_name='mini',
            name='OffsetEinteilung',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='mini',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='mini', to=settings.AUTH_USER_MODEL),
        ),
    ]
