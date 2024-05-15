
from typing import Any
from channels.layers import get_channel_layer

def allowExecute(func):
    func.__i_am_allowed_to_execute__ = True
    return func

class SpecificConsumer:

    channel: Any | None
    groupName: str
    typeString: str
    myKeyName: str

    async def subscribe(self, data) -> str:
        pass

    async def onSubscribtionSuccess(self, data):
        self.channels = get_channel_layer()

    async def unsubscribe(self, data):
        pass

    async def sendMessageToGroup(self, message: Any):
        message['type'] = self.myKeyName + "." + message['type']
        await self.channel.channel_layer.group_send(
                self.groupName,
                {
                    'type': self.typeString,
                    'message': message
                }
            )
    
    async def sendMessageToMe(self, message: Any):
        message['type'] = self.myKeyName + "." + message['type']
        await self.channel.channel_layer.send(
                self.channel.channel_name,
                {
                    'type': self.typeString,
                    'message': message
                }
            )
    
    async def sendPopupToMe(self, message: str, action: str='OK'):
        await self.channel.channel_layer.send(
            self.channel.channel_name,
            {
                'type':self.typeString,
                'message': {'type':'message', 'action': action, 'msg': message}
            }
        )

def checkKeyClass(c):
    for name, method in c.__dict__.iteritems():
        if hasattr(method, "__check_keys_attr__"):
            method.__me__ = c
    return c


def checkKeys(keys: list, onerror:any=lambda: None, onerrormsg:str=None, onerroraction='OK') -> bool:
    def decorator(func):
        async def wrapper(self, data):
            for k in keys:
                a,b = k
                if not a in data or not type(data[a]) == b:
                    print("Type check:", a)
                    if not (onerrormsg == None):
                        await self.channel.channel_layer.send(
                            self.channel.channel_name,
                            {
                                'type': 'common_message',
                                'message': {
                                    'type':'message',
                                    'msg': onerrormsg,
                                    'action': onerroraction
                                }
                            }
                        )
                    return onerror
            return await func(self, data)
        return wrapper
    return decorator
