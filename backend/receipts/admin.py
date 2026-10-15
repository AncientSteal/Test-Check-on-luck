from django.contrib import admin
from .models import Receipt
from django import forms
from django.core.exceptions import ValidationError

class ReceiptAdminForm(forms.ModelForm):
    class Meta:
        model = Receipt
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        status = cleaned_data.get('status')
        reject_reason = cleaned_data.get('reject_reason')

        if status in ['rejected'] and not reject_reason:
            raise ValidationError({
                'reject_reason': "При переводе чека в статус ошибки необходимо обязательно указать причину отказа!"
            })

        return cleaned_data

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    form = ReceiptAdminForm

    list_display = ("id", "user", "amount", "status", "purchase_date", "registration_date", "reject_reason")
    list_filter = ("status", "purchase_date", "registration_date")
    search_fields = ("fn", "fd", "fp", "user__username")

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
        super().save_model(request, obj, form, change)
