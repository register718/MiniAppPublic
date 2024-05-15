import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, Subscription, filter } from "rxjs";
import { DBService } from "../service/db.service";

export class Demultiplexer {

    private type_action: {[id:string] : {f: Function, keys: string[]}} = {};
    private ob: Observable<any>;
    private ob_sub: Subscription;
    private static countSubscription: number = 0;
    private static messageSub: Subscription = null;
    private static db: DBService = null;
    private static snackBar: MatSnackBar = null;
    private myKeyName: string = null;

    constructor(o: Observable<any>, myKeyName: string) {
        this.type_action = {};
        this.ob = o;
        this.myKeyName = myKeyName;
    }

    public static setDB(db: DBService, snack: MatSnackBar) : void {
        Demultiplexer.db = db;
        Demultiplexer.snackBar = snack;
    }

    private checkKeys(data: any, keys: string[]): boolean {
        for (let i = 0; i < keys.length; i++) {
            if (data[keys[i]] == undefined)
                return false;
        }
        return true;
    }

    public start() {
        if (Demultiplexer.countSubscription == 0) {
            if (Demultiplexer.db == null || Demultiplexer.snackBar == null)
                return;
            Demultiplexer.messageSub = Demultiplexer.db.socket.pipe(
                filter(f => f['type'] != undefined && f['type'] === 'message')
            ).subscribe(m => {
                console.log(m);
                if (this.checkKeys(m, ['msg', 'action'])) {
                    Demultiplexer.snackBar.open(m['msg'], m['action'], {duration: 3000});
                }
            });
        }
        Demultiplexer.countSubscription++;
        this.ob_sub = this.ob.subscribe((val) => {
            if (val['type'] == undefined) {
                return;
            } else if (this.type_action[val['type']] != undefined) {
                if (this.checkKeys(val, this.type_action[val['type']].keys))
                    this.type_action[val['type']].f(val);
            }
        });
    }

    public stop() {
        this.ob_sub.unsubscribe();
        Demultiplexer.countSubscription--;
        if (Demultiplexer.countSubscription == 0) {
            Demultiplexer.messageSub.unsubscribe();
        }
    }

    public subscribe(type: string, action: Function, keys: string[]) {
        this.type_action[this.myKeyName + "." + type] = {f: action, keys: keys};
    }

    public unsubscribe(type: string) {
        try {
            delete this.type_action[type];
        } catch (ex) {}
    }

}