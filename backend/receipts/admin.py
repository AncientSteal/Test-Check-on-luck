from django.contrib import admin
from .models import Receipt

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "status", "purchase_date", "registration_date")
    list_filter = ("status", "purchase_date", "registration_date")
    search_fields = ("fn", "fd", "fp", "user_username")
    list_editable = ("status",)

    fieldsets = (
        ('Инфо о пользователе', {
            "fields": ("user",)
        }),
        ('Реквизиты чека', {
            "fields": ("fn", "fd", "fp", "purchase_date", "amount")
        }),
        ('Модерация', {
            "fields": ("status", "reject_reason")
        }),
    )

    def save_model(self, request, obj, form, change):
        if obj.status == Receipt.STATUS_REJECTED and not obj.reject_reason:
            from django.core.exceptions import ValidationError
            raise ValidationError("Укажите причину отказа!")
        super().save_model(request, obj, form, change)
