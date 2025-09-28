from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "ShamChess Profile",
            {
                "fields": (
                    "rating",
                    "wins",
                    "losses",
                    "draws",
                    "avatar",
                    "bio",
                )
            },
        ),
    )
    list_display = (
        "username",
        "email",
        "rating",
        "wins",
        "losses",
        "draws",
        "is_staff",
    )
    search_fields = ("username", "email")
