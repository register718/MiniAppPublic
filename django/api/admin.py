from django.contrib import admin
from .models import Gruppe, Messe, MesseArt, Mini, Plan, TelegramChat, Abfrage
# Register your models here.
admin.site.register(Mini)
admin.site.register(Gruppe)
admin.site.register(Plan)
admin.site.register(Messe)
admin.site.register(MesseArt)
admin.site.register(TelegramChat)
admin.site.register(Abfrage)