from django.urls import re_path, path
from .views import impressum, showApp

urlpatterns = [
  path('impressum/', impressum, name="impressum"),
  re_path(r'^.*', showApp, name="app")
]
