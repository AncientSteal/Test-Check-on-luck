from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Receipt(models.Model):
    STATUS_CHECKING = 'checking'
    STATUS_ACCEPTED = 'accepted'
    STATUS_REJECTED = 'rejected'

    STATUS_CHOICES = [
        (STATUS_CHECKING, 'На проверке'),
        (STATUS_ACCEPTED, 'Принят'),
        (STATUS_REJECTED, 'Отклонен'),
    ]

    # связи и данные пользователя
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receipts', verbose_name='Пользователь')
    registration_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации в системе')

    # данные чека
    fn = models.CharField(max_length=16, verbose_name='ФН (фискальный накопитель)')
    fd = models.CharField(max_length=10, verbose_name='ФД (фискальный документ)')
    fp = models.CharField(max_length=10, verbose_name='ФП (фискальный призрак)')

    purchase_date = models.DateTimeField(verbose_name='Дата и время покупки')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сумма чека')

    # модерация
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_CHECKING, verbose_name='Статус')
    reject_reason = models.TextField(blank=True, null=True, verbose_name='Причина отказа')

    class Meta:
        verbose_name = 'Чек'
        verbose_name_plural = 'Чеки'
        ordering = ['-registration_date']

        constraints = [
            models.UniqueConstraint(
                fields=['fn', 'fd', 'fp'],
                name='unique_fn_fd_fp_receipt'
            )
        ]

    def __str__(self):
        return f"Чек №{self.id} ({self.amount}) - {self.get_status_display()}"
