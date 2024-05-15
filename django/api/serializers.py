import datetime
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Abfrage, Gruppe, Mini, Messe, Plan, MesseArt, TelegramChat
import random
from django.contrib.auth.models import User
from django.core.exceptions import BadRequest
from django.db.models import Q, F, Min, Max
from MiniApp.settings import logger

class CustomModelSerializer(serializers.ModelSerializer):

    def is_valid(self, *args, raise_exception=False):
        if super().is_valid(*args, raise_exception=False):
            return True
        else:
            logger.debug("Seralization error!", str(args))
            if raise_exception:
                raise ValidationError()

    def create(self, validated_data):
        erg = super().create(validated_data)
        logger.info("Neues Objekt!" + str(validated_data))
        return erg

    def update(self, instance, validated_data):
        x = super().update(instance, validated_data)
        logger.info("Objekt geändert!" + str(validated_data))
        return x


class ForeignKeyField(serializers.Field):

    model = None

    def __init__(self, *, read_only=False, write_only=False, required=None, default=..., initial=..., source=None, label=None, help_text=None, style=None, error_messages=None, validators=None, allow_null=False, model_field=...):
        super().__init__(read_only=read_only, write_only=write_only, required=required, default=default, initial=initial, source=source, label=label, help_text=help_text, style=style, error_messages=error_messages, validators=validators, allow_null=allow_null)
        if model_field == None:
            raise TypeError
        self.model = model_field

    def to_representation(self, value):
        if self.allow_null and value == None:
            return None
        return value.id

    def to_internal_value(self, data):
        if self.allow_null and data == None:
            return None
        try:
            pKey = int(data)
        except Exception:
            raise serializers.ValidationError
        mSet = self.model.objects.filter(pk=pKey)
        if mSet.exists():
            return mSet.first()
        raise serializers.ValidationError

class MiniBasicSerializer(CustomModelSerializer):

    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = Mini
        fields = [
            'id',
            'first_name',
            'last_name',
            'Geschwister',
            'MiniTyp'
        ]

class MiniDetailSerializer(CustomModelSerializer):

    first_name = serializers.CharField(source='user.first_name', read_only=False)
    last_name = serializers.CharField(source='user.last_name', read_only=False)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=False)
    email = serializers.CharField(source='user.email', read_only=False)
    PateMini = ForeignKeyField(allow_null=True, required=False, model_field=Mini)
    AnzahlEingeteilt = serializers.SerializerMethodField(read_only=False)
    AbfrageAktiv = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Mini
        fields = [
            'id',
            'first_name',
            'last_name',
            'Adresse',
            'Geburtsdatum',
            'Geschwister',
            'Telefon',
            'AnzahlEingeteilt',
            'MiniTyp',
            'date_joined',
            'email',
            'PateMini',
            'AbfrageAktiv'
        ]
    
    def get_AbfrageAktiv(self, mini):
        liste = Abfrage.objects.filter(Mini=mini, Plan__AbfrageEnde__gte=datetime.datetime.now().date()).values('id', 'Plan', 'Key')
        return list(liste)

    
    def get_AnzahlEingeteilt(self, mini):
        return Gruppe.objects.filter(Eingeteilt=True, Minis__in=[mini]).count() + mini.OffsetEinteilung

    def create(self):
        data = self.validated_data
        data = dict(self.validated_data)['user']
        username = str(random.randint(0, 1000000))
        pw = User.objects.make_random_password()
        user = User.objects.create_user(username, email=data['email'], password=pw, is_active=False, is_staff=False, first_name=data['first_name'], last_name=data['last_name'])
        data = dict(self.validated_data)
        mini: Mini = user.mini
        mini.Adresse=data['Adresse']
        mini.Geburtsdatum=data['Geburtsdatum']
        mini.Telefon=data['Telefon']
        mini.Geschwister=data['Geschwister']
        mini.MiniTyp=data['MiniTyp']
        mini.save()
        return mini
            
    def update(self, id: int):
        data = dict(self.validated_data)
        print(id)
        try:
            mini = Mini.objects.get(pk=id)
        except:
            return None
        mini.user.email = data['user']['email']
        mini.user.first_name = data['user']['first_name']
        mini.user.last_name = data['user']['last_name']
        mini.user.date_joined = data['user']['date_joined']
        mini.user.save()
        mini.Adresse = data['Adresse']
        mini.Geburtsdatum = data['Geburtsdatum']
        mini.Geschwister = data['Geschwister']
        mini.Telefon = data['Telefon']
        mini.PateMini = data['PateMini']
        mini.MiniTyp = data['MiniTyp']
        #Berchne Offset
        anzahl = 0
        try:
            anzahl = int(self.initial_data['AnzahlEingeteilt'])
            mini.OffsetEinteilung = anzahl  - Gruppe.objects.filter(Eingeteilt=True, Minis__in=[mini]).count()
        except:
            pass
        mini.save()
        logger.info("Mini geändert! " + str(mini))
        return mini.id

class GottesdienstSerializer(CustomModelSerializer):

    def get_Zeit(self, obj):
        return obj['Art'].Zeit

    Art = ForeignKeyField(model_field=MesseArt)
    Plan_id = ForeignKeyField(model_field=Plan, allow_null=True)


    class Meta:
        model = Messe
        fields = [
            'id',
            'Art',
            'Datum',
            'Info',
            'explizit',
            'autogenerated',
            'Zeit',
            'Plan_id',
            'notify'
        ]
        #list_serializer_class = GottesdienstListSerializer

    def create(self):
        if 'id' in self.data:
            self.data.pop('id')
        m = Messe.objects.create(**dict(self.validated_data))
        plan = Plan.objects.filter(StartDatum__lte=m.Datum, EndDatum__gte=m.Datum)
        if plan.exists():
            m.Plan_id = plan.first()
            m.save()
        logger.info("Messe erstellt! " + str(m))
        return m

class GottesdienstEinteilungSerializer(CustomModelSerializer):

    class Meta:
        model = Messe
        fields = [
            'id',
            'Gruppen'
        ]

    
class GottesdienstArtSerializer(CustomModelSerializer):
    
    class Meta:
        model = MesseArt
        fields = '__all__'
    
    def create(self):
        return super().create(self.validated_data)

class PlanSerializer(CustomModelSerializer):

    AnzahlMessen = serializers.IntegerField(source='get_AnzahlMessen', read_only=True)

    class Meta:
        model = Plan
        fields = '__all__'

    def is_valid(self, *, raise_exception=False, new=False):
        if not super().is_valid(raise_exception=raise_exception):
            return False
        ### Nur falls ein neuer Plan erstellt wird
        if new:
            ### Falls Daten passen, checke, ob schon Plan in Zeitraum existiert
            data = dict(self.validated_data)
            if Plan.objects.filter(Q(StartDatum__range=[data['StartDatum'], data['EndDatum']]) | Q(EndDatum__range=[data['StartDatum'], data['EndDatum']])).exists():
                if raise_exception:
                    #return ArgumentException
                    raise ValidationError("Datum: ['In diesem Zeitraun existiert bereits ein Plan']")
                return False
        return True
    
    def create(self):
        plan = super().create(self.validated_data)
        data = dict(self.validated_data)
        if not plan.DefaultMesseArt == None and plan.PlanArt == 0:
            #Erstelle Dummymessen
            run = plan.StartDatum
            while run < plan.EndDatum:
                messe = Messe.objects.create(Datum=run, Art=plan.DefaultMesseArt, Plan_id=plan, autogenerated=True)
                messe.save()
                run += datetime.timedelta(days=7)
        messen = Messe.objects.all().filter(Datum__range=[data['StartDatum'], data['EndDatum']], Plan_id=None)
        messen.update(Plan_id=plan)
        return plan

    def update(self, instance, validated_data):
        plan = super().update(instance, validated_data)
        unref = Messe.objects.filter(Plan_id=plan).exclude(Datum__range=[plan.StartDatum, plan.EndDatum])
        unref.filter(autogenerated=True).delete()
        unref.update(Plan_id=None)
        setRef = Messe.objects.filter(Datum__range=[plan.StartDatum, plan.EndDatum], Plan_id=None)
        setRef.update(Plan_id=plan)
        #erstelle autogenerated messen
        if not plan.DefaultMesseArt == None and plan.PlanArt == 0:
            #Vom Min bis Planstart
            start = Messe.objects.filter(Plan_id=plan).aggregate(Min('Datum'))
            run = start['Datum__min'] - datetime.timedelta(days=7)
            while run >= plan.StartDatum:
                Messe.objects.create(Datum=run, Art=plan.DefaultMesseArt, Plan_id=plan, autogenerated=True)
                run -= datetime.timedelta(days=7)
            #Von Max bis Planende
            ende = Messe.objects.filter(Plan_id=plan).aggregate(Max('Datum'))
            run = ende['Datum__max'] + datetime.timedelta(days=7)
            while run < plan.EndDatum:
                Messe.objects.create(Datum=run, Art=plan.DefaultMesseArt, Plan_id=plan, autogenerated=True)
                run += datetime.timedelta(days=7)
        return plan

class GruppeListSerializer(serializers.ListSerializer):

    def update(self, plan: Plan):
        Gruppe.objects.filter(Messe__Plan_id=plan).delete()

        for gruppeRaw in self.validated_data:
            gruppeDic = dict(gruppeRaw)
            if gruppeDic['Messe'].Plan_id == plan:
                g = Gruppe.objects.create(Eingeteilt=gruppeDic['Eingeteilt'], Messe=gruppeDic['Messe'])
                g.Minis.set(gruppeDic['Minis'])
        # Alles gespeichert

class GruppeSerializer(CustomModelSerializer):

    #neu = serializers.BooleanField(default=False)
    #error = serializers.SerializerMethodField()
    #warning = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()

    class Meta:
        model = Gruppe
        fields = '__all__'
        list_serializer_class = GruppeListSerializer
    
    def get_state(self, obj):
        from .consumer_gruppe import get_Gruppe_state
        return get_Gruppe_state(obj)

class TelegramChatSerializer(CustomModelSerializer):

    mini = serializers.ListField(child=ForeignKeyField(model_field=Mini))
    secretKey = serializers.IntegerField(min_value=1)

    class Meta:
        model = TelegramChat
        fields = [
            'secretKey',
            'mini'
        ]

    def save(self):
        data = dict(self.validated_data)
        instList = TelegramChat.objects.filter(secretKey=data['secretKey'])
        if instList.exists():
            inst = instList.first()
            inst.secretKey = 0
            inst.verified = True
            inst.save()
            for m in data['mini']:
                m.telegram = inst
                m.save()
            return inst
        return None

class NachrichtSerializer(CustomModelSerializer):

    #mini = ForeignKeyField(model_field=Mini)

    class Meta:
        model = Abfrage
        fields = [
            'Mini',
            'Nachricht'
        ]
