from django.db import migrations

class Migration(migrations.Migration):
  dependencies = [
		('oauth', '0002_seed_oauth_initial')
	]
  
  operations =[
		migrations.RunSQL(
			""" 
			DROP TABLE IF EXISTS v1_oauth_group_permissions;
			DROP TABLE IF EXISTS v1_oauth_permissions;
			"""
    )
	]