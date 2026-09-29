from rest_framework import viewsets, permissions, pagination
from .models import Receipt
from .serializers import ReceiptSerializer

class ReceiptPagination(pagination.PageNumberPagination):
    """Пагинация по 10 элементов"""
    page_size = 10
    page_size_query_param = None

class ReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = ReceiptSerializer
    pagination_class = ReceiptPagination

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Возвращаем чеки только залогиненного пользователя"""
        return Receipt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Ставим текущего пользователя как автора чека"""
        serializer.save(user=self.request.user)

