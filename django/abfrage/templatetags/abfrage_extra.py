from django import template
from api.models import Gruppe

register = template.Library()


@register.filter
def eingeteilt(abfrage, messe):
    if abfrage.edit:
        return Gruppe.objects.filter(Messe=messe, Minis__in=[abfrage.Mini]).exists()
    return True