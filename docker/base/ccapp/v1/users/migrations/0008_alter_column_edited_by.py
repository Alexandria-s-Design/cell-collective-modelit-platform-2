from django.db import migrations, connection

def rename_column(apps, schema_editor):
    table_list = [
        "v1_oauth_access_tokens",
        "v1_oauth_clients",
        "v1_oauth_permissions",
        "v1_oauth_group_permissions",
        "v1_oauth_authorization",
        "v1_user",
        "v1_profile",
        "v1_user_group_request",
    ]
    
    with connection.cursor() as cursor:
        for table in table_list:
            cursor.execute(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='{table}' AND column_name='edited_by';
            """)
            column_exists = cursor.fetchone()
            
            if column_exists:
                cursor.execute(f"""
                    ALTER TABLE {table} RENAME COLUMN edited_by TO updated_by;
                """)

class Migration(migrations.Migration):
    dependencies = [
         ('users', '0007_v1usergrouprequest'),
    ]

    operations = [
        migrations.RunPython(rename_column),
    ]