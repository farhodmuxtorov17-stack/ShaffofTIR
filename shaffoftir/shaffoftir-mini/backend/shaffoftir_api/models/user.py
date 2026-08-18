from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

ROLE_CHOICES = [
    ('SUPER_ADMIN', 'Супер Администратор'),
    ('INSTRUCTOR', 'Инструктор'),
    ('MANAGER', 'Рахбар / Менеджер'),
    ('EMPLOYEE', 'Сотрудник'),
    ('TECHSPEC', 'Технический Специалист'),
]

class SystemUserManager(BaseUserManager):
    def create_user(self, email, username=None, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username or email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SUPER_ADMIN')
        return self.create_user(email, username, password, **extra_fields)

class SystemUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    full_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    rank = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    locale = models.CharField(max_length=10, default='ru')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = SystemUserManager()
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='shaffoftir_users',
        related_query_name='shaffoftir_user',
        blank=True,
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='shaffoftir_users',
        related_query_name='shaffoftir_user',
        blank=True,
        help_text='Specific permissions for this user.',
    )

    class Meta:
        db_table = 'system_users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name or self.username} ({self.role})"
