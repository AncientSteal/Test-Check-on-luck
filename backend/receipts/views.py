from rest_framework import viewsets, permissions, pagination
from .models import Receipt
from .serializers import ReceiptSerializer
from django.shortcuts import redirect
from django.views import View

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

class MainRedirectView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            # пользователь вошел — отправляем на фронтенд
            return redirect('http://localhost:5173/')
        # пользователь не вошел — отправляем на стандартную страницу входа Django
        return redirect('rest_framework:login')