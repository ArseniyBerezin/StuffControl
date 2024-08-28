from django.urls import path
from .views import vk_webhook

urlpatterns = [
    path('webhook/', vk_webhook, name='vk_webhook'),
]