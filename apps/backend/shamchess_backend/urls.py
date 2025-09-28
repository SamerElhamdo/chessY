"""Project URL configuration."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.api.urls")),
    path("api/", include("games.api.urls")),
]
