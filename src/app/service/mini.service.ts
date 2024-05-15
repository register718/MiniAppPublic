import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DBService } from "./db.service";


export interface IMiniBasic {id: number; first_name: string; last_name: string; MiniTyp: number; Geschwister: number; }
export interface IMiniExact {id:number; first_name: string; last_name: string; email: string; Adresse: string; Geburtsdatum: Date;
   MiniTyp: number; date_joined: Date; Geschwister: number; Telefon: string; PateMini: number; AnzahlEingeteilt: number; 
   AbfrageAktiv: {id: number; Key: string; Plan: number; }[]}

@Injectable({
    providedIn:'root'
})

export class MiniService {

    public MinisListInst: IMiniBasic[] = [];
    public MinisDic: {[id:number]:IMiniBasic} = [];
    MinisList: BehaviorSubject<IMiniBasic[]> = new BehaviorSubject([]);

    private MinisExact: {[id: number]: IMiniExact} = [];

    constructor (private db: DBService) {
      this.MinisList.subscribe(val => this.MinisListInst = val);
      this.loadList();
    }

    public addMiniExact(mini: IMiniExact) : void {
      this.MinisExact[mini.id] = mini;
    }

    public addMiniBasic(mini: IMiniBasic) {
      this.MinisListInst.push(mini);
      this.MinisDic[mini.id] = mini;
    }

    loescheMini(id:number) {
      for (let i: number = 0; i < this.MinisListInst.length; i++) {
        if (this.MinisListInst[i].id === id) {
          this.MinisListInst = this.MinisListInst.splice(i, 1);
          break;
        }
      }
      delete this.MinisDic[id];
      delete this.MinisExact[id];
    }

    loadList() {
      this.db.GET('mini/basic/').subscribe((list: IMiniBasic[]) => {
        for (let i: number = 0; i < list.length; i++) {
          this.MinisDic[list[i].id] = list[i];
        }
        this.MinisList.next(list);
      });
      console.log(this.MinisDic);
    }

    loadExact(ID: number): Observable<IMiniExact> {
      return new Observable<IMiniExact>((observer) => {
          if (this.MinisExact[ID] == null) {
            this.db.GET('mini/' + ID.toString() + '/').subscribe((result: IMiniExact) => {
              this.MinisExact[ID] = result
              //this.MinisExact[ID] = new Date(result['date_joined'])
              observer.next(result);
            });
          } else {
            observer.next(this.MinisExact[ID]);
          }
      });
    }

    getNewGeschwisterID() {
      let g = 0;
      do {
        g = Math.floor(Math.random() * 100000);
      } while (this.geschwVergeben(g));
      return g;
    }

    private geschwVergeben(n: number): boolean{
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.MinisListInst.length; i++){
        if (this.MinisListInst[i].Geschwister === n) {
          return true;
        }
      }
      return false;
    }
}
