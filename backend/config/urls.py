"""
URL configuration for ShaffofTIR backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('rest_framework_simplejwt.urls')),
    path('api/v1/', include('shaffoftir_api.urls')),
    path('api/schema/', include('drf_spectacular.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
