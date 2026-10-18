from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReceiptViewSet, CurrentUserView

router = DefaultRouter()
router.register(r'receipts', ReceiptViewSet, basename='receipt')

urlpatterns = [
    path('', include(router.urls)),
    path('user/me/', CurrentUserView.as_view(), name='current-user'),
]
