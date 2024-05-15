from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import json
from MiniApp.settings import IMPRESSUM

# Create your views here.
@login_required
def showApp(request):
  p = request.user.get_all_permissions()
  p = list(p)
  s = json.dumps({'data': p, 'is_staff': request.user.is_staff})
  return render(request, 'app/index.html', {'permission': s})

def impressum(request):
  return render(request, 'app/impressum.html', IMPRESSUM)
