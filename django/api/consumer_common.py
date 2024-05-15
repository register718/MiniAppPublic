from typing import Dict
from channels.generic.websocket import AsyncWebsocketConsumer
import json

from .consumer_plan import PlanConsumer
from .consumer_gruppe import GruppeConsumer
from .consumer_specific import SpecificConsumer
from django.contrib.auth.models import User

DB_CONSUMERS = {
    'gruppe': GruppeConsumer,
    'plan':PlanConsumer
}

class __group_dict__():

    def __init__(self, group_name: str, item: SpecificConsumer) -> None:
        self.group_name = group_name
        self.item = item


class CommonConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # dic [key] : {group: channel_groups, item: object}
        self.groups: Dict[str, SpecificConsumer] = {}
        self.user: User = self.scope["user"]
        if self.user.is_authenticated:
            await self.accept()
        else:
            await self.close()

        #await 


    async def disconnect(self, code):
        for key in self.groups:
            await self.channel_layer.group_discard(self.groups[key].item.groupName, self.channel_name)
    
    
    async def subscribe(self, data):
        if data['type'] in DB_CONSUMERS and not data['type'] in self.groups:
            item: SpecificConsumer = DB_CONSUMERS[data['type']]()
            item.channel = self
            item.typeString = 'common_message'
            item.myKeyName = data['type']
            t = await item.subscribe(data) # t ist Suffix fuer Den Gruppen Namen (type_t)
            if not t == None:
                group_name: str = data['type'] + '_' + t
                if not group_name == None:
                    self.groups[data['type']] = __group_dict__(group_name, item)
                    await self.channel_layer.group_add(group_name, self.channel_name)
                    item.groupName = group_name
                    await item.onSubscribtionSuccess(data)

    async def unsubscribe(self, data):
        if data['type'] in self.groups:
            self.channel_layer.group_discard(self.groups[data['type']].item.groupName, self.channel_name)
            del self.groups[data['type']]

    async def receive(self, text_data=None):
        print('recv', text_data)
        data = None
        try:
            data = json.loads(text_data)
        except Exception:
            return
        
        if not 'action' in data or not 'type' in data and type(data['action']) == str and type(data['type']) == str:
            return
        action = data['action']; type = data['type']
        if action == 'subscribe':
            await self.subscribe(data)
            return
        
        if action == 'unsubscribe':
            await self.unsubscribe(data)
            return
        
        ### Exec specific function
        if not type in self.groups:
            print("Group not registert", action, self.groups)
            return
        obj: SpecificConsumer = self.groups[type]
        import inspect
        methods = dir(obj.item)
        if action in methods:
            if inspect.ismethod(getattr(obj.item, action)):
                 ## Ist action ist Methode in OBJ
                 # Ueberpruefe, ob ausfuehren erlaubt
                ax = getattr(obj.item, action)
                if getattr(ax, '__i_am_allowed_to_execute__', False):
                    print("Call method", action)
                    await ax(data)
                else:
                    print("Try Call unmarked method", action)
            else:
                print("Try to call attribute", action)
        else:
            print("Try to call not existing method", action)
        ## Sonst nichts machen

    async def common_message(self, event):
        try:
            await self.send(json.dumps(event['message']))
        except Exception as ex:
            print(ex)