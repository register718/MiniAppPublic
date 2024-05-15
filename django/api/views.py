from django.contrib.auth.decorators import login_required, permission_required
from .models import MesseArt, Messe
from django.core.exceptions import BadRequest

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import GottesdienstSerializer, GottesdienstArtSerializer
from MiniApp.settings import logger

#General
def logInstanceNotFound(msg: str):
  logger.info("Instance not found! " + msg)

def get_or_raise(Model, pk):
  try:
    x = Model.objects.get(pk=pk)
  except Exception:
    logInstanceNotFound(str(Model))
    raise BadRequest('Instance not found')
  return x

def get_or_none(Model, pk):
  try:
    x = Model.objects.get(pk=pk)
  except Exception:
    return None
  return x


#Messenverwaltung
@api_view(['GET'])
@login_required()
@permission_required('api.view_messe', raise_exception=True)
def GottesdiensteGetView(request):
  db = Messe.objects.all()
  serializer = GottesdienstSerializer(db, many=True)
  logger.debug("Lade Gottesdienste")
  return Response(serializer.data)

@api_view(['POST'])
@login_required()
@permission_required('api.add_messe', raise_exception=True)
def GottesdienstAddView(request):
  serializer = GottesdienstSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    g = serializer.create()
    return Response(g.id)
  return Response(None)

@api_view(['POST'])
@login_required()
@permission_required('api.change_messe', raise_exception=True)
def GottesdienstUpdateView(request, id):
  serializer = GottesdienstSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    try:
      inst = Messe.objects.get(pk=id)
    except Exception:
      raise BadRequest({'error':'Instance not found'})
    g = serializer.update(inst, serializer.validated_data)
    return Response(g.id)
  return Response(None)

@api_view(['DELETE'])
@login_required()
@permission_required(['api.delete_messe'], raise_exception=True)
def GottesdienstDeleteView(request, id):
  gd = get_or_raise(Messe, id)
  gd.delete()
  logger.info("Gottesdienst gelöscht! " + str(gd))
  return Response(True)
  

#Messen_Art
@api_view(['POST'])
@login_required()
@permission_required('api.add_messeart', raise_exception=True)
def GottesdienstArtCreateView(request):
  serializer = GottesdienstArtSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    a = serializer.create()
    return Response(a.id)
  return Response(None)

@api_view(['GET'])
@login_required()
@permission_required('api.view_messeart', raise_exception=True)
def GottesdienstArtGetView(request):
  db = MesseArt.objects.all()
  ser = GottesdienstArtSerializer(db, many=True)
  logger.debug("Lade GottesdienstArt")
  return Response(ser.data)

@api_view(['POST'])
@login_required()
@permission_required('api.change_messeart', raise_exception=True)
def GottesdienstArtUpdateView(request, id):
  serializer = GottesdienstArtSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    try:
      art = MesseArt.objects.get(pk=id)
    except Exception:
      raise BadRequest({'error':'Instance not found'})
    g = serializer.update(art, serializer.validated_data)
    return Response(g.id)
  return Response(None)

@api_view(['DELETE'])
@login_required()
@permission_required(['api.delete_messeart'], raise_exception=True)
def GottesdiensteArtDeleteView(request, id):
  art = get_or_raise(MesseArt, id)
  art.delete()
  logger.info("GottesdienstArt gelöscht! " + str(art))
  return Response(True)