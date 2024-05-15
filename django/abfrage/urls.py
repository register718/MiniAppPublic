
from django.urls import path
from .views import SetEinteilungView

urlpatterns = [
    path('main/<int:abfrageid>/<str:passwd>/', SetEinteilungView.as_view())
]