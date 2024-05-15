import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DBService } from "./db.service";
import { UserService } from "./user.service";

export interface IGottesdienst_Art {id: number, Zeit: string; MinisInsgesamt: number; OberminisAnzahl: number; Name: string; Print: string; DayOfWeek: number}
export interface IGottesdienst {id: number, Datum: Date; Info: string; Art: number; Plan_id: number; explizit: boolean, autogenerated: boolean, Zeit: string, notify: number}

@Injectable({
  providedIn: 'root'
})

export class GottesdiensteService {

  gd_Art_List_Inst: {[id: number]: IGottesdienst_Art} = [];
  gd_Art_List_Key_Inst: number[] = [];

  gd_Art_List: BehaviorSubject<{[id: number]: IGottesdienst_Art}> = new BehaviorSubject([]);
  gd_Art_List_Key: BehaviorSubject<number[]> = new BehaviorSubject([]);


  gd_List_Inst: {[id:number]: IGottesdienst} = [];
  gd_List_Key_Inst: number[] = [];

  gd_List: BehaviorSubject<{[id:number]: IGottesdienst}> = new BehaviorSubject([]);
  gd_List_Key: BehaviorSubject<number[]> = new BehaviorSubject([]);
  gd_List_Value: BehaviorSubject<IGottesdienst[]> = new BehaviorSubject([]);


  

  constructor(private db: DBService, private userService: UserService) {
    this.gd_List.subscribe(val => this.gd_List_Inst=val);
    this.gd_Art_List.subscribe(val => this.gd_Art_List_Inst = val);
    this.loadData();
  }

  private loadData() {
    // Lade IGottesdienstArt
    if (this.userService.has('api.view_messeart')) {
      this.db.GET('gottesdienste/art/all/').subscribe((res) => {
        const gds: IGottesdienst_Art[] = res as IGottesdienst_Art[];
        const gd_Art: {[id: number]: IGottesdienst_Art} = [];
        for (let i: number = 0; i < gds.length; i++) {
          gd_Art[gds[i].id] = gds[i];
        }
        console.log("GottesdienstArt", gd_Art);
        //GD_ART Daten geladen
        this.gd_Art_List.next(gd_Art);
        this.sendSpacialArtLists(gd_Art);
      });
    }
    // Lade IGottesdienst
    if (this.userService.has('api.view_messe')) {
      this.db.GET('gottesdienste/messe/all/').subscribe((res) => {
        const gds: IGottesdienst[] = res as IGottesdienst[];
        const gd_List:  {[id:number]: IGottesdienst} = [];
        for (let i: number = 0; i < gds.length; i++) {
          const d = gds[i].Datum.toString().split('-');
          gds[i].Datum = new Date(Number(d[0]), Number(d[1]) - 1, Number(d[2]));
          if (gds[i].Zeit.length >= 5)
            gds[i].Zeit = gds[i].Zeit.substring(0, 5);
          gd_List[gds[i].id] = gds[i];
        }
        console.log('Gottesdienste: ', gd_List);
        //GD_LIST Daten geladen
        this.gd_List.next(gd_List);
        this.sendSpecialGDLists(gd_List);
      });
    }
  }

  // GOTTESDIENTE AENDERN
  changeGD(val: IGottesdienst) {
    this.gd_List_Inst[val.id] = val;
    this.sendSpecialGDLists(this.gd_List_Inst);
  }

  deleteGD(id: number) {
    delete this.gd_List_Inst[id];
    this.sendSpecialGDLists(this.gd_List_Inst);
  }

  private sendSpecialGDLists(val: {[id:number]: IGottesdienst}) {
    this.gd_List_Key_Inst = Object.keys(val).map(Number);
    this.gd_List_Key.next(this.gd_List_Key_Inst);
    this.gd_List_Value.next(Object.values(val));
  }

  // ART AENDERN

  changeArt(val: IGottesdienst_Art) {
    this.gd_Art_List_Inst[val.id] = val;
    this.sendSpacialArtLists(this.gd_Art_List_Inst);
  }

  deleteArt(id: number) {
    delete this.gd_Art_List_Inst[id];
    this.sendSpacialArtLists(this.gd_Art_List_Inst);
  }

  private sendSpacialArtLists(val: {[id:number]: IGottesdienst_Art}) {
    this.gd_Art_List_Key_Inst = Object.keys(val).map(Number);
    this.gd_Art_List_Key.next(this.gd_Art_List_Key_Inst);
  }


  // HILFSFUNKTIOINEN

  getTextDay(date: Date) {
    if (date != null) {
      const i = date.getDay();
      switch(i) {
        case 1:
          return "Montag";
        case 2:
          return "Dienstag";
        case 3:
          return "Mittwoch";
        case 4:
          return "Donnerstag";
        case 5:
          return "Freitag";
        case 6:
          return "Samstag";
        case 0:
          return "Sonntag";
      }
    }
    return "Spaßtag";
  }

  //Notify
  MONTAG =     0b1000000;
  DIENSTAG =   0b0100000;
  MITTWOCH =   0b0010000;
  DONNERSTAG = 0b0001000;
  FREITAG =    0b0000100;
  SAMSTAG =    0b0000010;
  SONTAG =     0b0000001;

  listNotifyChanged: Set<number> = new Set<number>();

  changeNoftify(messe: number, mask: number, set: boolean) {
    console.log(set, messe);
    if (set)
      this.gd_List_Inst[messe].notify |= mask;
    else
      this.gd_List_Inst[messe].notify &= ~mask;
    this.listNotifyChanged.add(messe);
  }

  checkNofity(messe: number, mask: number) : boolean{
    return (this.gd_List_Inst[messe].notify & mask) > 0;
  }

  saveNotify() {
    const notifies = this.listNotifyChanged.keys();
    const data: {id: number; notify: number}[] = [];
    let val = notifies.next().value;
    while(val != undefined) {
      data.push({id: val, notify: this.gd_List_Inst[val].notify});
      val = notifies.next().value;
    }
    if (data.length > 0) {
      console.log(data);
      this.db.POST('plan/notify/', data).subscribe(res => {
          console.log(res);
          this.listNotifyChanged = new Set<number>();
      });
    }
  }
}