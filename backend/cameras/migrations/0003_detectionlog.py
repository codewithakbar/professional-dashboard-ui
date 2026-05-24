from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cameras', '0002_camera_ai_detection_enabled'),
    ]

    operations = [
        migrations.CreateModel(
            name='DetectionLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('person_count', models.PositiveIntegerField(default=0)),
                ('recorded_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('camera', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detection_logs', to='cameras.camera')),
            ],
            options={
                'ordering': ['-recorded_at'],
            },
        ),
    ]
