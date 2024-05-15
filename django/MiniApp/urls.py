"""MiniApp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.shortcuts import redirect
from django.http import HttpResponse
from django.urls import include, path
from .settings import logger
# Views
from abfrage.urls import urlpatterns as abfrage_urls
from api.urls import urlpatterns as api_urls
from app.urls import urlpatterns as app_urls
from django.contrib.auth import views as auth_views

FRONTEND = 'frontend/'

def wildcardRedirect(request):
  logger.info("Wildcard " + request.path)
  return redirect('/app/')

urlpatterns = [
    path('abfrage/', include(abfrage_urls)),
    path('api/', include(api_urls)),
    path(FRONTEND + 'admin/', admin.site.urls),
    path(FRONTEND + 'app/', include(app_urls)),
    path('rest/', include('rest_framework.urls', namespace='rest_framework')),
    path(FRONTEND + 'login/', auth_views.LoginView.as_view(template_name='./login.html'), name='login'),
    path(FRONTEND + 'logout/', auth_views.LogoutView.as_view(template_name='./logout.html'), name="logout"),
    path('robots.txt', lambda request: HttpResponse('User-agent: *\nDisallow: /'))
]
