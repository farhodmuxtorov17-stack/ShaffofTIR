"""
User model with role-based access control.

Uses a custom manager and email-based authentication.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from enum import Enum


class UserRole(str, Enum):
    """System user roles.

    Only two roles exist in the mini version:
    - INSTRUCTOR: operational shooting management
    - TECHSPEC: infrastructure and equipment
    """
    INSTRUCTOR = "INSTRUCTOR"
    TECHSPEC = "TECHSPEC"

    @classmethod
    def choices(cls):
        return [(role.value, role.value) for role in cls]


class SystemUserManager(BaseUserManager):
    """Custom user manager using email as the primary identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("Email address is required"))
        email = self.normalize_email(email)
        username = extra_fields.pop("username", None) or email
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.INSTRUCTOR.value)
        return self.create_user(email, password, **extra_fields)


class SystemUser(AbstractUser):
    # Authentication
    email = models.EmailField(unique=True, db_index=True)

    # Role
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices(),
        default=UserRole.INSTRUCTOR.value,
        db_index=True,
    )

    # Profile
    full_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    rank = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)

    # Preferences
    locale = models.CharField(max_length=10, default="ru")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = SystemUserManager()

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="shaffoftir_users",
        related_query_name="shaffoftir_user",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="shaffoftir_users",
        related_query_name="shaffoftir_user",
        blank=True,
    )

    class Meta:
        db_table = "system_users"
        ordering = ["-date_joined"]
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self) -> str:
        return f"{self.full_name or self.username} ({self.role})"

    @property
    def display_name(self) -> str:
        return self.full_name or self.username
