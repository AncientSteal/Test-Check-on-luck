from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions, pagination, mixins, status
from .models import Receipt
from .serializers import ReceiptSerializer, UserSerializer
from django.shortcuts import redirect
from django.views import View


class CurrentUserView(APIView):
    # Доступ только для авторизованных пользователей
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # request.user автоматически подтягивается из сессии браузера
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReceiptPagination(pagination.PageNumberPagination):
    """Пагинация по 10 элементов"""
    page_size = 10
    page_size_query_param = None


class ReceiptViewSet(mixins.ListModelMixin,
                     mixins.CreateModelMixin,
                     viewsets.GenericViewSet):
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
