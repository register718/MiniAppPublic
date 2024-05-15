
class QueueElement<T> {
    item: T;
    next: QueueElement<T>;
}

class Queue<T> {

    head: QueueElement<T>;
    end: QueueElement<T>;

    constructor() {
        this.head = null; this.end = null;
    }

    public push(item: T) {
        const neu = new QueueElement<T>();
        neu.item = item;
        neu.next = null;
        if (this.head == null) {
            this.head = neu;
            this.end = neu;
        } else {
            this.end.next = neu;
            this.end = neu;
        }
    }

    public pop() : T {
        if (this.head == null) {
            return null;
        } else {
            const el = this.head;
            this.head = this.head.next;
            return el.item;
        }
    }

}

export class BuffSubscribtion {

    public unsubscribe() {

    }
}

export class BuffObservable<T> {

    queue: Queue<T>;

    subscriber: Function[];

    constructor() {
        this.queue = new Queue<T>();
        this.subscriber = [];
    }

    public subscribe(f: Function) : BuffSubscribtion {
        this.subscriber.push(f);
        if (this.subscriber.length === 1) {
            let t: T;
            while ((t = this.queue.pop()) !== null) {
                f(t);
            }
        }
        return new BuffSubscribtion();
    }
    
    public next(item: T) : void {
        if (this.subscriber.length === 0) {
            this.queue.push(item);
        } else {
            this.execute(item);
        }
    }

    private execute(item: T) {
        for (let i = 0; i < this.subscriber.length; i++) {
            this.subscriber[i](item);
        }
    }

}