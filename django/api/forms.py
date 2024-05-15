from django.forms import ModelForm
from django.contrib.auth.models import User
from .models import Gruppe, MesseArt, Mini, Messe, Plan

class UserUpdateForm(ModelForm):

  class Meta:
    model = User
    fields = ['email', 'last_name', 'first_name']

class MesseForm(ModelForm):

    class Meta:
        model = Messe
        fields = '__all__'

class MesseArtForm(ModelForm):

  class Meta:
    model = MesseArt
    fields = '__all__'

class PlanForm(ModelForm):

  class Meta:
    model = Plan
    fields = '__all__'

class GruppeForm(ModelForm):

  class Meta:
    model = Gruppe
    fields = '__all__'
