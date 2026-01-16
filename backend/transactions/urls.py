from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, FineViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'fines', FineViewSet, basename='fine')

urlpatterns = [
    path('', include(router.urls)),
]