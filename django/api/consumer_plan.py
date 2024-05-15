import datetime
import smtplib
from socket import gaierror
from .serializers import PlanSerializer
from .models import Abfrage, Mini, Plan
from .consumer_specific import SpecificConsumer, allowExecute, checkKeys
from channels.db import database_sync_to_async
from MiniApp.settings import DEBUG, MY_HOST, SEND_MAILS, logger
from .secret import absender as EMAIL_ABSENDER, smtp_mailpw
from email.message import EmailMessage
import string
import random
from rest_framework import serializers
from django.db.models import F


class PlanConsumer(SpecificConsumer):
    
    async def subscribe(self, data) -> str:
        return ""  # Jeder wird ueber jeden Plan informiert

    async def onSubscribtionSuccess(self, data):
        await self.getPlanSet({'from':0, 'to':10})

    @allowExecute
    @checkKeys([('from', int), ('to', int)]) # In der Reihnfolge der Startdaten
    async def getPlanSet(self, data):
        if data['from'] >= data['to'] or data['from'] < 0 or data['to'] < 1:
            return
        def q():
            plaene = Plan.objects.filter(Archiviert=False).order_by('-StartDatum')
            maxPlane = plaene.count()
            to = min(maxPlane, data['to'])
            return PlanSerializer(plaene[data['from']:to], many=True).data
        d =  await database_sync_to_async(q)()
        await self.sendMessageToMe({
            'type':'getPlanSet',
            'data':d
        })
    
    @allowExecute
    @checkKeys([('id',int)])
    async def getPlan(self, data):
        q = lambda: PlanSerializer(Plan.objects.filter(id=data['id']), many=True).data  # noqa: E731
        d = await database_sync_to_async(q)()
        if len(d) > 0:
            await self.sendMessageToMe({
                'type':'getPlanSet',
                'data':d
            })
    
    def __changePlan__(self, data, serializer: PlanSerializer):
        if serializer.is_valid(raise_exception=True):
            try:
                inst = Plan.objects.get(pk=data['data']['id'])
            except Exception:
                self.sendPopupToMe("Der Plan konnte nicht geändert werden")
            return PlanSerializer(serializer.update(instance=inst, validated_data=serializer.validated_data)).data
        return None

    @allowExecute
    @checkKeys([('plan', dict)])
    async def changePlan(self, data):
        serializer = PlanSerializer(data=data['plan'])
        plan =  await database_sync_to_async(self.__changePlan__)(data, serializer)
        if not plan == None:
            await self.sendMessageToGroup({
                'type':'getPlanSet',
                'data': [plan]
            })
        else:
            await self.sendMessageToMe('Plan konnte nicht geändert werden')
    
    @allowExecute
    @checkKeys([('plan', dict)])
    async def createPlan(self, data):
        serializer = PlanSerializer(data=data['plan'])
        def q():
            if serializer.is_valid(raise_exception=True, new=True):
                p = serializer.create()
                return PlanSerializer(p).data
            return None
        try:
            res = await database_sync_to_async(q)()
        except Exception as e:
            await self.sendPopupToMe(str(e))
            return
        if res == None:
            self.sendPopupToMe("Plan konnte nicht erstellt werden")
        else:
            await self.sendMessageToGroup({
                'type':'getPlanSet',
                'data':[res]
            })
    
    ### ABFRAGE ###
    async def sendeEinzelneNachricht(self,
                                first_name: str,
                                last_name: str,
                                email: str,
                                planName: str,
                                abfrageEnde: datetime.date,
                                abfrageID: int,
                                abfrageKey: str,
                                server: smtplib.SMTP_SSL
                            ):
        to = email
        to = "cbs00695@nezid.com"
        subject = "Miniplan " + planName
        sender = EMAIL_ABSENDER
        ##Sende Email
        #date = datetime.datetime.now().strftime("%a, %-d %b %Y %H:%M:%S")
        ende = abfrageEnde.strftime("%d.%m.%Y") #abfrage.Plan.AbfrageEnde
        body = f"Hallo {first_name} {last_name},\nDie Abfrage für den neuen Miniplan startet:\n"
        body += f"Unter folgendem Link kannst du alle Gottesdienste auswählen, an denen du Zeit hast: https://{MY_HOST}/abfrage/main/{abfrageID}/{abfrageKey}/ \n"
        body += f"Die Abfrage geht bis {ende}\nLiebe Grüße\nDeine Oberminis"
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = to
        msg['Date'] = datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0100")
        msg.set_content(body)
        try:
            if SEND_MAILS:
                server.sendmail('mail.manitu.de', to, msg.as_bytes())
        except Exception:
            # tell the script to report if your message was sent or which errors need to be fixed
            await self.sendPopupToMe(f"Konnte Email an {first_name} {last_name} nicht absenden")
            return False
        return True

    @allowExecute
    @checkKeys([('id', int)])
    async def starteAbfrage(self, data):
        # 1 Es passt, 0 Schon Abgefragt, -1 Fehler # (status, planName, AbfrageEnde)
        def checkPlan() -> tuple[int, str, datetime.date]:
            p = Plan.objects.filter(id=data['id'])
            if p.exists():
                plan = p.first()
                jetzt = datetime.datetime.now()
                if plan.AbfrageEnde == None or DEBUG:
                    #return Response("Dieser Plan wurde schon abgefragt!")
                    plan.AbfrageEnde = jetzt + datetime.timedelta(days=8)
                    plan.save()
                    return (1, plan.Name, plan.AbfrageEnde)
                return (0, plan.Name, plan.AbfrageEnde)
            return (-1, None, None)
        status, planName, abfrageEnde = await database_sync_to_async(checkPlan)()
        if status == -1:
            await self.sendPopupToMe("Konnte Emails nicht senden")
        elif status == 0:
            await self.sendPopupToMe("Plan wurde schon abgefragt")
        else:
            await self.sendPopupToMe("Starte versenden von Emails")
            class __AbfrageSerializer__(serializers.ModelSerializer):
                first_name = serializers.CharField(source='Mini.user.first_name', read_only=True)
                last_name = serializers.CharField(source='Mini.user.last_name', read_only=True)
                abfrageEnde = serializers.DateField(source='Plan.AbfrageEnde', read_only=True)
                email = serializers.CharField(source='Mini.user.email', read_only=True)
                class Meta:
                    model=Abfrage
                    fields = [
                        'id', 'first_name', 'last_name', 'abfrageEnde', 'Key', 'email'
                    ]
            def generateAbfragen():
                minis = Mini.objects.filter(MiniTyp__lte=2) #.exclude(Abfrage__Plan__id=data['id'])
                abfragen = []
                plan = Plan.objects.get(pk=data['id'])
                for m in minis:
                    passwd = ''.join(random.choice(string.ascii_uppercase) for i in range(100))
                    abfragen.append(Abfrage(Plan=plan, Mini=m, Key=passwd))
                res = Abfrage.objects.bulk_create(abfragen)
                return __AbfrageSerializer__(res, many=True).data
            res = await database_sync_to_async(generateAbfragen)()
            ## Erstelle Abfragen
            ### Verbinde zu SMTP Server
            try:
                server = smtplib.SMTP_SSL('mail.manitu.de', 465)
                server.login(EMAIL_ABSENDER, smtp_mailpw)
                #logger.info("SMTP Login erfolgreich!")
            except (gaierror, ConnectionRefusedError):
                # tell the script to report if your message was sent or which errors need to be fixed
                await self.sendPopupToMe('Failed to connect to the server. Connection refused')
                logger.warning("Failed to connect to the server. Connection refused")
            except smtplib.SMTPServerDisconnected:
                await self.sendPopupToMe('Failed to connect to the server')
                logger.warning('Failed to connect to the server. Wrong user/password?')
            except smtplib.SMTPException as e:
                await self.sendPopupToMe('SMTP error occurred')
                logger.warning('SMTP error occurred: ' + str(e))
            else:
                print("Zu SMTP Server verbunden")
                ## Hier weiterer Code
                for idx in range(0, len(res)):
                    await self.sendeEinzelneNachricht(
                        res[idx]['first_name'],
                        res[idx]['last_name'],
                        res[idx]['email'],
                        planName,
                        abfrageEnde,
                        res[idx]['id'],
                        res[idx]['Key'],
                        server
                    )
                    print("Nachricht raus")
                await self.sendPopupToMe("Es wurden alle Emails versendet!")
