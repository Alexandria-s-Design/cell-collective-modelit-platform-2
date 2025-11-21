# ----------------------------------------- #
# CORE for BASE MODELS: Defines the
# default attributes for the models file.
# ----------------------------------------- #
from django.db import models
# import uuid

class CoreBaseModel(models.Model):
    # ID should be added manually to any new model if needed.
    # id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.UUIDField(default=None, null=True, blank=True)
    updated_by = models.UUIDField(default=None, null=True, blank=True)

    class Meta:
        abstract = True

    @classmethod
    def get_table_name(self, db_module, db_table: str):
        return f'{db_module}_{db_table.lower()}'
