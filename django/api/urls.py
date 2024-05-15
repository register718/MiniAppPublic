from django.urls import path

from .telegram_bot import telegramRegister
from .minis_views import generateMiniListe, miniCreateView, miniDetailView, miniUpdateView, miniBasicView
from .plan_view import NotifyChangeView, archivierePlan, createRealStatistik, createStatistik, resetAnzahlEingeteilt
from .views import GottesdienstAddView, GottesdienstArtGetView, GottesdienstArtUpdateView, GottesdienstDeleteView, GottesdienstUpdateView, GottesdiensteArtDeleteView, GottesdiensteGetView, GottesdienstArtCreateView
from .planExport_view import download_plan

urlpatterns = [
    path('mini/basic/', miniBasicView),
    path('mini/<int:id>/', miniDetailView),
    path('mini/update/<int:id>/', miniUpdateView),
    path('mini/neu/', miniCreateView),
    path('mini/liste/', generateMiniListe),
    path('gottesdienste/art/neu/', GottesdienstArtCreateView),
    path('gottesdienste/art/all/', GottesdienstArtGetView),
    path('gottesdienste/art/update/<int:id>/', GottesdienstArtUpdateView),
    path('gottesdienste/art/delete/<int:id>/', GottesdiensteArtDeleteView),
    path('gottesdienste/messe/neu/', GottesdienstAddView),
    path('gottesdienste/messe/all/', GottesdiensteGetView),
    path('gottesdienste/messe/update/<int:id>/', GottesdienstUpdateView),
    path('gottesdienste/messe/delete/<int:id>/', GottesdienstDeleteView),
    #path('plan/all/', PlanGetView),
    #path('plan/create/', PlanCreateView),
    #path('plan/update/', PlanUpdateView),
    path('plan/download/<int:id>.pdf', download_plan),
    path('plan/statistik/<int:id>/', createStatistik),
    path('plan/statistik/real/', createRealStatistik),
    path('plan/statistik/reset/', resetAnzahlEingeteilt),
    path('plan/archive/<int:id>/', archivierePlan),
    path('plan/notify/', NotifyChangeView),
    #path('plan/abfrage/', StarteAbfrageView),
    #path('plan/abfrage/nachrichten/<int:planid>/', NachrichtGetView),
    path('telegram/register/', telegramRegister),
]
