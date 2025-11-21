from django.db import migrations
from django.contrib.auth.models import Group

def seed_groups(apps, schema_editor):
    groups = [
        {"name": "ADMINS"},
        {"name": "EDITORS"},
        {"name": "VIEWERS"},
        {"name": "STUDENTS"},
        {"name": "TEACHERS"},
        {"name": "RESEARCHERS"},
        {"name": "GUESTS"}
		]
    for group_data in groups:
        Group.objects.get_or_create(name=group_data['name'])

class Migration(migrations.Migration):

    dependencies = [
        
    ]

    operations = [
        migrations.RunPython(seed_groups),
    ]