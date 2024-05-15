#Django
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, permission_required
from django.core.exceptions import BadRequest
from django.db.models import F, Q, Count, Value
#Rest Framework
from rest_framework.response import Response
from rest_framework.decorators import api_view
#Eigene
from MiniApp.settings import DEBUG, MY_HOST, SEND_MAILS, logger
from .serializers import NachrichtSerializer, PlanSerializer
from .models import Abfrage, MesseArt, Mini, Plan, Messe
from .telegram_bot import bot as TELE_BOT
from .views import get_or_none, get_or_raise
from .einteilen import __GeneriereGruppe__

#Statistik

@api_view(['GET'])
@login_required
@permission_required(['api.view_gruppe', 'api.view_plan'], raise_exception=True)
def createStatistik(request, id):
  plan: Plan = get_or_raise(Plan, id)

  minis = Mini.objects.filter(MiniTyp__lte=2).annotate(
    AnzahlTotal=Count('Gruppen', filter=Q(Gruppen__Eingeteilt=True)) + F('OffsetEinteilung')
    ).annotate(AnzahlPlan=Count('Gruppen', filter=Q(Gruppen__Eingeteilt=True, Gruppen__Messe__Plan_id=plan))
    ).values('id', 'AnzahlPlan', 'AnzahlTotal')
  return Response(minis)

@api_view(['GET'])
@login_required()
@permission_required('is_staff')
def createRealStatistik(request):
  minis = Mini.objects.filter(MiniTyp__lte=3).annotate(
    AnzahlTotal=Count('Gruppen', filter=Q(Gruppen__Eingeteilt=True))
  ).annotate(AnzahlPlan=Value(0)).values('id', 'AnzahlPlan', 'AnzahlTotal')
  return Response(minis)

@api_view(['POST'])
@login_required()
@permission_required('is_staff')
def resetAnzahlEingeteilt(request):
  minis = Mini.objects.filter(MiniTyp__lte=2).annotate(Anzahl=Count('Gruppen', filter=Q(Gruppen__Eingeteilt=True)))
  for m in minis:
    m.OffsetEinteilung = -1 * m.Anzahl
    m.save()
  #res = Mini.objects.filter(MiniTyp__lte=3).update(OffsetEinteilung=(-1) * Gruppe.objects.filter(Minis__in=F('id'), Eingeteilt=True).count())
  return Response(True)


### ALT ###

@login_required
@permission_required('api.delete_plan', raise_exception=True)
def archivierePlan(request, id):
  plan = get_or_raise(Plan, id)
  plan.Archiviert = True
  plan.save()
  return HttpResponse('true')

@login_required
@permission_required('api.delete_messeart', raise_exception=True)
def deleteMesseArt(request):
  if request.method == 'GET' and 'id' in request.GET:
    try:
      id = int(request.GET['id'])
      messe = MesseArt.objects.get(pk=id)
    except:
      return HttpResponse('Argument ERROR')
    messe.delete()
    return HttpResponse('true')
  else:
    return HttpResponse('ERROR')

### Notifies
@api_view(['POST'])
@login_required()
@permission_required('api.change_plan', raise_exception=True)
def NotifyChangeView(request):
  for m in request.data:
    if 'id' in m and 'notify' in m:
      if not type(m['notify']) == int:
        continue
      messe: Messe = get_or_none(Messe, m['id'])
      if m == None:
        continue
      messe.notify = m['notify']
      messe.save()
  return Response(True)

