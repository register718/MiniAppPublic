from threading import Lock
from typing import Set


class ModuleLock:
    __lockTotal__: Lock = None
    __ids__: Set[int] = None
    __locksIDs__: dict[Lock] = None

    def __init__(self) -> None:
        self.__lockTotal__ = Lock()
        self.__ids__ = set()
        self.__locksIDs__ = {}

    def lock(self, id: int):
        self.__lockTotal__.acquire(blocking=True)
        if not id in self.__ids__:
            self.__ids__.add(id)
            if not id in self.__locksIDs__:
                self.__locksIDs__[id] = Lock()
        self.__lockTotal__.release()
        self.__locksIDs__[id].acquire()

    def release(self, id: int) -> bool:
        self.__lockTotal__.acquire()
        if not id in self.__ids__:
            self.__lockTotal__.release()
            return False
        self.__ids__.remove(id)
        self.__locksIDs__[id].release()
        self.__lockTotal__.release()
        return True
