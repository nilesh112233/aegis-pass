import uuid
from django.db import models
from django.conf import settings


class VaultFolder(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="folders" 
    )
    
    encrypted_name = models.TextField()
    iv_name = models.TextField(max_length=32)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "vault_folders"
        
        
class VaultItem(models.Model):

    class ItemType(models.TextChoices):
        LOGIN = "login", "Login"
        SECURE_NOTE = "secure_note", "Secure Note"
        CARD = "card", "Card"
        IDENTITY = "identity", "Identity"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vault_items"
    )

    item_type = models.CharField(
        max_length=20, choices=ItemType.choices, default=ItemType.LOGIN
    )

    encrypted_meta = models.TextField()
    iv_meta = models.CharField(max_length=32)

    encrypted_data = models.TextField()
    iv_data = models.CharField(max_length=32)
    
    folder = models.ForeignKey(
        VaultFolder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items"
    )

    is_favourite = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vault_items"
        indexes = [
            models.Index(fields=["user", "is_deleted", "updated_at"]),
            models.Index(fields=["user", "is_favourite", "is_deleted"]),
        ]

    def __str__(self):
        return f"{self.item_type} - {self.user.email}"


class VaultItemHistory(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vault_item = models.ForeignKey(
        VaultItem, on_delete=models.CASCADE, related_name="history"
    )

    encrypted_meta = models.TextField()
    iv_meta = models.CharField(max_length=32)

    encrypted_data = models.TextField()
    iv_data = models.CharField(max_length=32)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vault_item_history"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vault_item", "created_at"]),
        ]

    def __str__(self):
        return f"History for {self.vault_item_id} at {self.created_at}"

