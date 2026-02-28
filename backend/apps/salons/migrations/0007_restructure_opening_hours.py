from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("salons", "0006_remove_salon_services_image"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="openinghours",
            name="text",
        ),
        migrations.AddField(
            model_name="openinghours",
            name="day_of_week",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (0, "Poniedziałek"),
                    (1, "Wtorek"),
                    (2, "Środa"),
                    (3, "Czwartek"),
                    (4, "Piątek"),
                    (5, "Sobota"),
                    (6, "Niedziela"),
                ],
                default=0,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="openinghours",
            name="open_time",
            field=models.TimeField(default="09:00"),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="openinghours",
            name="close_time",
            field=models.TimeField(default="17:00"),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name="openinghours",
            options={
                "ordering": ["day_of_week"],
                "verbose_name_plural": "opening hours",
            },
        ),
    ]
