import uuid
from django.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin,
)
from django.conf import settings
from datetime import timedelta
from django.utils import timezone



class UserManager(BaseUserManager):
    def create_user(self, email, auth_token, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(auth_token)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, auth_token, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, auth_token, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

    kdf_iterations = models.IntegerField(default=600000)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()
    
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    def is_locked(self) -> bool:
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def record_failed_login(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=15)
        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def reset_failed_logins(self):
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    refresh_token_jti = models.CharField(max_length=255, unique=True)
    device_hint = models.CharField(max_length=255, blank=True)  
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "user_sessions"
        ordering = ["-last_used_at"]

    def __str__(self):
        return f"{self.user.email} — {self.device_hint} ({self.ip_address})"
    
    
class UserPreferences(models.Model):

    class InactivityTimeout(models.IntegerChoices):
        FIVE_MIN     = 5,  "5 minutes"
        FIFTEEN_MIN  = 15, "15 minutes"
        THIRTY_MIN   = 30, "30 minutes"
        ONE_HOUR     = 60, "1 hour"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="preferences"
    )
    inactivity_timeout = models.IntegerField(
        choices=InactivityTimeout.choices,
        default=InactivityTimeout.FIFTEEN_MIN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_preferences"