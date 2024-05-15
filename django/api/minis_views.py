from io import BytesIO
from django.contrib.auth.decorators import login_required, permission_required
from django.http import FileResponse
from .models import Mini, Abfrage
from .views import get_or_raise
#rest_framework
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import MiniBasicSerializer, MiniDetailSerializer
from reportlab.platypus import Paragraph, Spacer, SimpleDocTemplate, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from .planExport_view import vorlage, getTitle
from reportlab.lib.units import cm
from django.core.exceptions import BadRequest
from MiniApp.settings import logger
import datetime

@api_view(['GET'])
@login_required()
def miniBasicView(request):
  db = Mini.objects.filter(MiniTyp__lte=3)
  data = MiniBasicSerializer(db, many=True).data
  logger.debug("Lade MiniListe")
  return Response(data)

@api_view(['GET'])
@login_required()
@permission_required('api.view_mini', raise_exception=True)
def miniDetailView(request, id):
  db = get_or_raise(Mini, pk=id)
  logger.debug("Lade MiniDetail! " + str(db))
  data = MiniDetailSerializer(db, many=False).data
  return Response(data)

@api_view(['POST'])
@login_required()
@permission_required('api.add_mini', raise_exception=True)
def miniCreateView(request):
  serializer = MiniDetailSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    user = serializer.create()
    return Response(user.id)
  return Response(None)

@api_view(['POST'])
@login_required()
@permission_required('api.change_mini', raise_exception=True)
def miniUpdateView(request, id):
  serializer = MiniDetailSerializer(data=request.data)
  if serializer.is_valid(raise_exception=True):
    data = serializer.update(id)
    return Response(data)
  return Response({"detail": "Nicht gefunden."})

#Miniliste erstellen

#helper
def parseGetListe(input, request, key, readable):
  if key in request.GET:
    input[key] = request.GET[key] == 'true'
  else:
    input[key] = False
  return input

def generateHeader(input, args, key, readable):
  if args[key]:
    stylesHead = ParagraphStyle(
      name='Normal',
      fontName='Times-Bold',
      fontSize=11
    )
    p = Paragraph(text=readable, style=stylesHead)
    input.append(p)
  return input

def generateMiniLine(input, args, key, readable):
  dic,mini = args
  if dic[key]:
    input.append(mini[key])
  return input

def iterateKeys(input, args, function):
  input = function(input, args, 'idx', 'Nr.')
  input = function(input, args, 'name', 'Name')
  input = function(input, args,'typ', 'Minityp')
  input = function(input, args,'adresse', 'Adresse')
  input = function(input, args,'gb', 'Geburtstag')
  input = function(input, args,'email', 'Email')
  input = function(input, args, 'telefon', 'Telefon')
  return function(input, args,'start', 'Dienststart')

def addEmtyLines(num: int, list):
  for i in range(0, num):
    list.append("                         ") #Ein bisschen Pfusch um die Zellen groesser zu machen
  return list

@login_required
@permission_required('api.view_mini', raise_exception=True)
def generateMiniListe(request):
  linesAdd = 0
  if not request.method == 'GET':
    raise BadRequest
  #Zusatzliche Spalten
  if 'anz' in request.GET:
    try:
        linesAdd = int(request.GET['anz'])
    except Exception:
      pass
  #Erstelle Mini Query
  minis = Mini.objects.filter(MiniTyp__lte=3)
  if 'filter' in request.GET:
    einzeln = request.GET['filter'].split(',')
    for i in range(0, 4):
      if not str(i) in einzeln:
        minis = minis.exclude(MiniTyp=i)
  if 'sort' in request.GET:
    key = request.GET['sort']
    if key == '0':
      minis = minis.order_by('user__last_name', 'user__first_name')
    elif key == '1':
      minis = minis.order_by('MiniTyp', 'user__last_name', 'user__first_name')
    elif key == '2':
      minis = minis.order_by('Geburtsdatum', 'user__last_name', 'user__first_name')
    elif key == '3':
      minis = minis.order_by('user__date_joined', 'Geburtsdatum', 'user__last_name')
  # Alle Keys auf vorhandensein pruefen
  keys = iterateKeys({}, request, parseGetListe) 
  # Erstelle erste Spalte
  header = iterateKeys([], keys, generateHeader)
  addEmtyLines(linesAdd, header)
  data = [header]

  counter = 1
  for mini in minis:
    miniDic = {
     'idx':counter,
     'name': mini.user.first_name + " " + mini.user.last_name,
     'typ': 'Obermini' if mini.MiniTyp == 0 else ('Mini' if mini.MiniTyp == 1 else ('Minimini' if mini.MiniTyp == 2 else ('Passiv' if mini.MiniTyp == 3 else 'Unbekannt'))),
      'adresse': mini.Adresse,
      'gb': mini.Geburtsdatum.strftime("%d.%m.%Y"),
      'email': mini.user.email,
      'telefon': mini.Telefon,
      'start': mini.user.date_joined.strftime("%d.%m.%Y")
    }
    list = iterateKeys([], (keys, miniDic), generateMiniLine)
    data.append(list)
    counter += 1

  w, h = A4
  Story = [getTitle("Minis Betzigau"), Spacer(w, 2*cm)]
  tbStyle = TableStyle([
    ('GRID',(0,0),(-1,-1),0.5,colors.black)
  ])
  tb = Table(data, style=tbStyle)

  Story.append(tb)
  
  buffer = BytesIO()
  doc = SimpleDocTemplate(buffer, pagesize=A4, title="Miniliste")
  doc.build(Story, onFirstPage=vorlage, onLaterPages=vorlage)
  logger.info("Plan erstellet")
  buffer.seek(0)
  return FileResponse(buffer, as_attachment=True, filename="Minilist.pdf")
