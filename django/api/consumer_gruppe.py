from .serializers import GruppeSerializer, NachrichtSerializer
from .consumer_specific import SpecificConsumer, checkKeys, allowExecute
from channels.db import database_sync_to_async
from .models import Abfrage, Plan, Messe, Gruppe
from django.db.models import F, Q
from .einteilen import messeEinteilen
import datetime

#### CHECK STATE GRUPPEN ###

def get_Gruppe_error(obj):
        q = Gruppe.objects.filter(Messe=obj.Messe, Minis__in=obj.Minis.all()).distinct()
        return q.count() > 1
    
def get_Gruppe_warning(obj):
    diff = datetime.timedelta(days=8)
    q = Gruppe.objects.filter(Minis__in=obj.Minis.all(), Messe__Datum__gt=obj.Messe.Datum - diff, Messe__Datum__lt=obj.Messe.Datum + diff).distinct()
    return q.count() > 1

#OBJ ist Gruppen Objekt
def get_Gruppe_state(obj):
    if get_Gruppe_error(obj):
        return "error"
    elif get_Gruppe_warning(obj):
        return "warning"
    return "ok"

### CONSUMER GRUPPE ###

class GruppeConsumer(SpecificConsumer):

    planID: int = -1

    @checkKeys([('id', int)], onerror=None, onerrormsg="Konnte Gottesdienste nicht laden")
    async def subscribe(self, data) -> str:
        q = lambda id: Plan.objects.filter(pk=id).exists()
        if await database_sync_to_async(q)(data['id']):
            self.planID = data['id']
            return str(data['id'])
        return None
    
    async def onSubscribtionSuccess(self, data):
        q_messe = lambda: [m.id for m in Messe.objects.filter(Plan_id=self.planID)]
        messen = await database_sync_to_async(q_messe)()
        #await self.sendMessageToMe({'type':'plan.addMesse', 'set':messen})
        q = lambda id: GruppeSerializer(Gruppe.objects.filter(Messe=id), many=True).data
        for m in messen:
            gruppen = await database_sync_to_async(q)(m)
            await self.sendMessageToMe({'type':'addGruppe', 'm': m, 'g':gruppen})
        # ENDE

    async def unsubscribe(self, data):
        return super().unsubscribe(data)
    
    @allowExecute
    async def getNotify(self, data):
        def loadNotifies():
            serializer = NachrichtSerializer(Abfrage.objects.filter(Plan__id=self.planID).exclude(Q(Nachricht="") | Q(Nachricht=None)), many=True)
            return serializer.data
        notifies = await database_sync_to_async(loadNotifies)()
        for n in notifies:
            await self.sendMessageToMe({'type':'addNotify', 'notify':n})
    

    def __setEingeteilt__(self, data):
        g = Gruppe.objects.filter(pk=data['gruppe'])
        if not g.exists():
            return None
        g.update(Eingeteilt = data['val'])
        return {'m':g.first().Messe.id, 'g':GruppeSerializer(g, many=True).data}

    @allowExecute
    @checkKeys([('gruppe', int), ('val', bool)], onerrormsg='Konnte letzte Planänderung nicht speichern')
    async def setEingeteilt(self, data):
        messe = await database_sync_to_async(self.__setEingeteilt__)(data)
        if not messe == None:
            await self.sendMessageToGroup({'type':'addGruppe', 'm': messe['m'], 'g':messe['g']})

    def __removeGruppe__(self, data):
        g = Gruppe.objects.filter(id__in=data['id'])
        if g.exists():
            messen = list(Messe.objects.filter(Gruppen__in=g).values(messe=F('id'), gruppe=F('Gruppen__id')))
            l = [{'m':x['messe'], 'g':x['gruppe']} for x in messen]
            g.delete()
            return l
        return None

    @allowExecute
    @checkKeys([('id', list)], onerrormsg='Konnte letzte Planänderung nicht speichern')
    async def removeGruppe(self, data):
        res = await database_sync_to_async(self.__removeGruppe__)(data)
        if not res == None:
            await self.sendMessageToGroup({
                        'type':'removeGruppe',
                        'set':res
                    })
        else:
            await self.sendPopupToMe("Konnte nicht gelöscht werden")
            
    def __addGruppe__(self, data) -> Gruppe:
        try:
            g = Gruppe.objects.create(Eingeteilt=data['Eingeteilt'], Messe=Messe.objects.get(pk=data['Messe']))
        except Exception as ex:
            print("ERROR", ex)
            return None
        for m in data['Minis']:
            g.Minis.add(m)
        return {'m':g.Messe.id, 'g':GruppeSerializer([g], many=True).data}

    @allowExecute
    @checkKeys([('Messe', int), ('Eingeteilt', bool), ('Minis', list)], onerrormsg='Konnte letzte Planänderung nicht speichern')
    async def addGruppe(self, data):
        g = await database_sync_to_async(self.__addGruppe__)(data)
        if not g == None:
            await self.sendMessageToGroup({
                        'type':'addGruppe',
                            'm': g['m'],
                            'g':g['g']
                    })
    
    def __changeMesse__(self , data):
        g = Gruppe.objects.filter(pk=data['gruppe'])
        if g.exists():
            gruppe = g.first()
            messeAlt = gruppe.Messe
            try:
                gruppe.Messe = Messe.objects.get(pk=data['messe'])
            except Exception as ex:
                return None
            gruppe.save()
            return {'type':'changeMesse', 'messeAlt': messeAlt.id, 'messeNeu':gruppe.Messe.id, 'gruppe':gruppe.id, 'state':get_Gruppe_state(gruppe)}
        return None

    @allowExecute
    @checkKeys([('messe', int), ('gruppe', int)], onerrormsg='Konnte Änderung leider nicht speichern')
    async def changeMesse(self, data):
        res = await database_sync_to_async(self.__changeMesse__)(data)
        if not res == None:
            await self.sendMessageToGroup(res)
    
    def __einteilenMesse__(self, mid: int):
        try:
            m = Messe.objects.get(pk=mid)
        except:
            return None
        messeEinteilen(m)
        return GruppeSerializer(m.Gruppen, many=True).data

    @allowExecute
    @checkKeys([('id', int)], onerrormsg='Falsche Parameter!')
    async def neuEinteilen(self, data):
        if not data['id'] == self.planID:
            await self.sendPopupToMe('Konnte nicht neu einteilen, wegen Dateninkonsitenz')
        else:
            #await self.sendMessageToGroup({
            #    'type':'plan.resetAll'
            #})
            def q():
                 Gruppe.objects.filter(Messe__Plan_id=self.planID, Messe__explizit=False,).delete()
                 return list(Messe.objects.filter(Plan_id=self.planID).order_by('Datum').values('id', 'explizit'))
            def getGruppe(id: int):
                return GruppeSerializer(Messe.objects.get(pk=id).Gruppen, many=True).data
            messen = await database_sync_to_async(q)()
            await self.sendMessageToGroup({
                'type':'resetAll'
            })
            for m in messen:
                if not m['explizit']:
                    gruppen = await database_sync_to_async(self.__einteilenMesse__)(m['id'])
                else:
                    gruppen = await database_sync_to_async(getGruppe)(m['id'])
                if gruppen == None:
                    await self.sendPopupToMe('Einteilen einer Messe fehlgeschlagen!')
                else:
                    await self.sendMessageToGroup({
                        'type':'addGruppe',
                        'm': m['id'],
                        'g':gruppen
                    })
