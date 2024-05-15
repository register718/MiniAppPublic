from django.urls import path
  
from .consumer_common import CommonConsumer
  
websocket_urlpatterns = [
    path('ws/', CommonConsumer.as_asgi()),
]