from django.db import migrations
from django.contrib.auth.models import Group, Permission
# from django.contrib.contenttypes.models import ContentType
from v1.oauth.models import V1OauthClients

from ...service_manager import OAUTH_PERMISSIONS_METHODS

def seed_oauth_initial(apps, schema_editor):
 
    # ADMINS
    # admins_group = Group.objects.get(name='ADMINS')
    # all_permissions = Permission.objects.all()
    # admins_group.permissions.set(all_permissions)
    # admins_group.save()
    
    # CREATE CLIENTS
    new_oauth_clients = V1OauthClients.objects.bulk_create([
        V1OauthClients(
            name="CC",
            redirect_uri="callback",
            grant_types="authorization_code",
            scope={"read": True, "write": False}
				),
        V1OauthClients(
            name="K12",
            redirect_uri="callback",
            grant_types="authorization_code",
            scope={"read": True, "write": False}
				)
    ])
		# TODO: EDITORS
    # editors_group, created = Group.objects.get(name='EDITORS')
    # reports_content_type = ContentType.objects.get_for_model(MyModel)
    # editors_permissions = Permission.objects.filter(
    #     content_type=reports_content_type,
    #     codename__in=['view_mymodel', 'add_mymodel', 'change_mymodel']
    # )
    # editors_group.permissions.add(*editors_permissions)
    # editors_group.save()

class Migration(migrations.Migration):

    dependencies = [
        ('oauth', '0001_initial'),
        ('xauth', '0001_seed_groups'),
    ]

    operations = [
        migrations.RunPython(seed_oauth_initial),
    ]