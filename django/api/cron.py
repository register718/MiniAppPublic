from datetime import datetime, timedelta
from .models import Abfrage, Gruppe, Messe

## Wenn die Abfrage vorbei ist, alle Minis die sich nicht gemeldet behandeln
def checkAbfragen():
    gestern = datetime.now().date() - timedelta(days=1)
    abfragen = Abfrage.objects.filter(edit=False, Plan__AbfrageEnde=gestern)
    abfragen.update(Nachricht="Keine Rückmeldung")
    #abfragen.save()
    for ab in abfragen:
        messen = Messe.objects.filter(Plan_id=ab.Plan).exclude(Gruppen__Minis__in=[ab.Mini])
        for m in messen:
            gruppe = Gruppe.objects.create(Messe=m)
            gruppe.Minis.add(ab.Mini)
            gruppe.save()
