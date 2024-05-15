from django.shortcuts import render, redirect
from django.views import View
from api.models import Messe, Gruppe, Abfrage
from api.views import get_or_raise
from datetime import datetime
from django.core.exceptions import PermissionDenied
from MiniApp.settings import logger

# Create your views here.
class SetEinteilungView(View):

    def get(self, request, abfrageid, passwd):
        save = False
        if 'save' in request.GET:
            save = request.GET['save'] == 'true'
        abfrage = get_or_raise(Abfrage, abfrageid)
        if not abfrage.Key == passwd:
            logger.critical("Passwort für Abfrage falsch! " + str(abfrage.Mini))
            raise PermissionDenied()
        if abfrage.Plan.AbfrageEnde is None or abfrage.Plan.AbfrageEnde < datetime.now().date():
            logger.info(str(abfrage.Mini) + " hat versucht Abfrage zu ändern. Zeit abgelaufen!")
            return render(request, 'abfrage/late.html', context={'messen':Messe.objects.filter(Gruppen__Minis__in=[abfrage.Mini], Plan_id=abfrage.Plan)})
        messen = Messe.objects.filter(Plan_id=abfrage.Plan).order_by('Datum')
        logger.debug(str(abfrage.Mini) + " hat Abfrage abgerufen!")
        return render(request, 'abfrage/show.html', context={'messen': messen, 'abfrage':abfrage, 'save':save})

    def post(self, request, abfrageid, passwd):
        abfrage = get_or_raise(Abfrage, abfrageid)
        if not abfrage.Key == passwd:
            logger.critical("Passwort für POST Abfrage falsch! " + str(abfrage.Mini))
            raise PermissionDenied()
        if abfrage.Plan.AbfrageEnde == None or abfrage.Plan.AbfrageEnde < datetime.now().date():
            return redirect(request.path)
        #Alte Gruppen loeschen
        Gruppe.objects.filter(Messe__Plan_id=abfrage.Plan, Minis__in=[abfrage.Mini]).delete()
        #Neue erstellen
        for key in request.POST.keys():
            if not (key == 'csrfmiddlewaretoken' or key == 'Nachricht'):
                try:
                    messe = Messe.objects.get(pk=key)
                except Exception:
                    continue
                g = Gruppe.objects.create(Messe=messe)
                g.Minis.set([abfrage.Mini])
        abfrage.edit = True
        if 'Nachricht' in request.POST:
            abfrage.Nachricht = request.POST['Nachricht']
        abfrage.save()
        logger.info(str(abfrage.Mini) + " hat Abfrage bearbeitet!")
        return redirect(request.path + "?save=true")
        