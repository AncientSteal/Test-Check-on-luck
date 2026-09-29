from rest_framework import serializers
from django.conf import settings
from datetime import datetime
import zoneinfo
from .models import Receipt

class ReceiptSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'user', 'registration_date',
            'fn', 'fd', 'fp',
            'purchase_date', 'amount',
            'status', 'status_display',
            'reject_reason'
        ]
        read_only_fields = ['id', 'status', 'registration_date', 'reject_reason']

        def validate_amount(self, value):
            """Проверка суммы чека"""
            if value < 1000:
                raise serializers.ValidationError("Сумма чека должна быть не менее 1000 руб.")
            return value

        def validate(self, data):
            """Проверка дат акции и уникальности"""
            purchase_date = data.get('purchase_date')
            fn = data.get('fn')
            fd = data.get('fd')
            fp = data.get('fp')

            try:
                start_date = datetime.strptime(settings.PROMO_START_DATE, '%Y-%m-%d').replace(tzinfo=zoneinfo.ZoneInfo('UTC'))
                end_date = datetime.strptime(settings.PROMO_END_DATE, '%Y-%m-%d').replace(tzinfo=zoneinfo.ZoneInfo('UTC'))
            except ValueError:
                raise serializers.ValidationError({"non_field_errors": "Ошибка конфигурации даты акции"})

            if purchase_date.tzinfo is None:
                purchase_date = purchase_date.replace(tzinfo=zoneinfo.ZoneInfo('UTC'))

            if not (start_date <= purchase_date <= end_date):
                raise serializers.ValidationError({
                    "purchase_date": "Дата покупки должна входить в период акции."
                })

            if Receipt.objects.filter(fn=fn, fd=fd, fp=fp).exists():
                raise serializers.ValidationError({
                    "non_field_errors": "Данный чек уже был зарегистрирован."
                })

            return data

