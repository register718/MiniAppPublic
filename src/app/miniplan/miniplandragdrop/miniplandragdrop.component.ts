import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DBService } from 'src/app/service/db.service';
import { GottesdiensteService, IGottesdienst } from 'src/app/service/gottesdienste.service';
import { MiniService } from 'src/app/service/mini.service';
import { IMiniGruppe, IPlanBase, MiniplanService, MiniplanTyp } from 'src/app/service/miniplan.service';
import { UserService } from 'src/app/service/user.service';
import { MyDate } from 'src/app/shared/Date.class';
import { filter } from 'rxjs/operators'; 
import { Demultiplexer } from 'src/app/shared/demultiplexer.class';

@Component({
  selector: 'app-miniplandragdrop',
  templateUrl: './miniplandragdrop.component.html',
  styleUrls: ['./miniplandragdrop.component.css']
})
export class MiniplandragdropComponent implements OnInit, OnDestroy {

  public chips_minis: number[] = [];

  gruppeAuffuellen() {
    this.chips_minis = this.miniService.MinisListInst.filter(val => {
      if (val.MiniTyp < 3) { 
        for (let i: number = 0; i < this.chips_minis.length; i++) {
          if (this.miniService.MinisDic[this.chips_minis[i]].Geschwister === val.Geschwister)
            return true;
        }
      }
      return false;
    }).map(val => val.id);
  }

  erstelle_Gruppe() {
    if (this.Messen.length === 0)
      return;
    this.db.socket.next({
      type: 'gruppe',
      action: 'addGruppe',
      Eingeteilt: true,
      Messe: this.Messen[0],
      Minis: this.chips_minis
    });
    this.chips_minis = [];
  }

  // Chips Ende

  //Alt
  public MiniplanBase: IPlanBase = {Name: '', id: -1, PlanArt: 0, EndDatum: new MyDate(), StartDatum: new MyDate(), DefaultMesseArt: null, AnzahlMessen: 0};
  MiniplanSub: Subscription = null;

  //Neu
  public Messe_Gruppen: {[id:number]:IMiniGruppe[]} = {};
  public Messen: number[] = [];
  public Gruppen: IMiniGruppe[][] = [];

  constructor(public miniService: MiniService, private activatedRoute: ActivatedRoute,
     public miniplanService: MiniplanService, private router: Router, public db: DBService, public userService: UserService,
     public gdService: GottesdiensteService, private _snackBar: MatSnackBar) {}

  ngOnDestroy(): void {
    this.MiniplanSub.unsubscribe();
    this.demultiplexer.stop();
    this.gd_List_Sub.unsubscribe();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      const id = Number(params.id);
      if (id !== -1 && id != null) {
          this.MiniplanSub = this.miniplanService.PlanList.pipe(filter(val => Object.keys(val).length !== 0)).subscribe(plaene => {
            if (plaene[id] === this.MiniplanBase)
              return;
            const p = plaene[id];
            if (p == null) {
              this.router.navigate(['/miniplan']);
            } else {
              if (p.PlanArt === MiniplanTyp.toggle) {
                this.router.navigate(['/miniplan', 'sonder', p.id]);
              } else {
                this.MiniplanBase = p;
                this.createSocket();
              }
            }
          });
        }
    });
  }

  private demultiplexer: Demultiplexer = null;
  private gd_List_Inst: {[id: number]: IGottesdienst} = null;
  private gd_List_Sub: Subscription = null;
  createSocket() {
    const myKeyName = "gruppe";
    this.gd_List_Sub = this.gdService.gd_List.subscribe((res) => {
      // Hole Gd Instance
      if (Object.keys(res).length === 0) return;
      const startSocket = this.gd_List_Inst == null;
      this.gd_List_Inst = res;
      if (startSocket) {
        const s = this.db.socket.multiplex(
          () => ({'type':myKeyName, 'action':'subscribe', id: this.MiniplanBase.id}),
          () => ({'type':myKeyName, 'action':'unsubscribe', id: this.MiniplanBase.id}),
          message => message['type'] != undefined && message['type'].startsWith(myKeyName)
        );
        this.demultiplexer = new Demultiplexer(s, myKeyName);
        this.demultiplexer.subscribe("addGruppe", (a) => this.actionAddGruppe(a), ["m", "g"]);
        this.demultiplexer.subscribe("changeMesse", (a) => this.actionMoveGruppe(a), ["messeAlt", "messeNeu", "gruppe", "state"]);
        this.demultiplexer.subscribe("removeGruppe", (a) => this.actionRemoveGruppe(a), ["set"]);
        this.demultiplexer.subscribe("resetAll", (a) => this.actionResetAll(), []);
        this.demultiplexer.start();
      }
    });
  }

  actionResetAll() {
    this.Messe_Gruppen = {};
    this.Messen = [];
    this.Gruppen = [];
  }

  removeWarningAndError(idxMesse: number, gruppe: IMiniGruppe) {
    // Check for Error
    const fCheckMesse = (mid, gruppe: IMiniGruppe, searchState: string) => {
      const gruppenMesse = this.Messe_Gruppen[mid];
      const errorGruppen: IMiniGruppe[] = [];
      for (let i: number = 0; i < gruppenMesse.length; i++) {
        if (gruppenMesse[i].state !== searchState) continue; 
        const c = gruppenMesse[i].Minis.filter(m => gruppe.Minis.includes(m));
        if (c.length > 0) errorGruppen.push(gruppenMesse[i]);
      }
      return errorGruppen;
    };
    if (gruppe.state === 'error') {
      const errorGruppen: IMiniGruppe[] = fCheckMesse(this.Messen[idxMesse], gruppe, 'error');
      // Edit Error Check
      for (let i: number = 0; i < errorGruppen.length; i++){
        errorGruppen[i].state = 'ok';
        this.searchForWarningAndError(idxMesse, errorGruppen[i], true, true);
      }
    }
    /*console.log("Dates");
    for (let i = 0; i < this.Messen.length; i++) {
      console.log(this.gd_List_Inst[this.Messen[i]], this.gd_List_Inst[this.Messen[i]].Datum.getDate(), this.gd_List_Inst[this.Messen[i]].Datum.getMonth());
    }*/
    // Check for warning
    if (gruppe.state !== 'ok') {
      //console.log(this.gd_List_Inst[this.Messen[idxMesse]]);
      // Check Problem Gruppen
      const fCheck = (idxMesse, gruppe) => {
        const earlyStop: Date = new Date(this.gd_List_Inst[this.Messen[idxMesse]].Datum.toISOString());
        const lateStop: Date = new Date(this.gd_List_Inst[this.Messen[idxMesse]].Datum.toISOString());
        //console.log("Messe", idxMesse, this.Messen[idxMesse], this.gd_List_Inst[this.Messen[idxMesse]],earlyStop, this.gd_List_Inst[this.Messen[idxMesse]].Datum);
        earlyStop.setDate(earlyStop.getDate() - 100);
        //console.log("Messe Early", earlyStop);
        lateStop.setDate(lateStop.getDate() + 8);
        //console.log("Messe Late", lateStop);
         // Check fruehere Messen
        let errorGruppen: {g: IMiniGruppe; mIdx: number}[] = [];
        let idIter = idxMesse - 1;
        //console.log(idIter, this.gd_List_Inst[this.Messen[idIter]]?.Datum, earlyStop);
        while(idIter >= 0 && this.gd_List_Inst[this.Messen[idIter]].Datum > earlyStop) {
          //console.log("enterd");
          const messe = this.gd_List_Inst[this.Messen[idIter]];
          const e: {g: IMiniGruppe; mIdx: number}[] = fCheckMesse(messe.id, gruppe, 'warning').map((m) => {return {g: m, mIdx: idIter}});
          errorGruppen = [...errorGruppen, ...e];
          idIter--;
        }
        // Check spaetere Messen
        idIter = idxMesse + 1;
        while(idIter < this.Messen.length && this.gd_List_Inst[this.Messen[idIter]].Datum < lateStop) {
          const messe = this.gd_List_Inst[this.Messen[idIter]];
          const e = fCheckMesse(messe.id, gruppe, 'warning').map((m) => {return {g: m, mIdx: idIter}});
          errorGruppen = [...errorGruppen, ...e];
          idIter++;
        }
        return errorGruppen;
      }
      //Weiter
      const warningGruppen = fCheck(idxMesse, gruppe);
      for (let i: number = 0; i < warningGruppen.length; i++) {
        if (fCheck(warningGruppen[i].mIdx, warningGruppen[i].g).length == 0) {
          warningGruppen[i].g.state = 'ok';
        }
      }
    }
  }

  actionRemoveGruppe(data) {
    //console.log("Remove", data["set"]);
    const list: any[] = data['set'];
    for (let i = 0; i < list.length; i++) {
      //console.log("MI", this.Messe_IDX);
      //const idxMesse: number = this.Messe_IDX[list[i]['m']]
      const mid = list[i]['m'];
      if (this.Messe_Gruppen[mid] == undefined) continue;
      const gruppen = this.Messe_Gruppen[mid];
      const idxGruppe = gruppen.findIndex((val: IMiniGruppe) => {
        return val.id === list[i]['g'];
      });
      if (idxGruppe === -1) continue;
     // console.log("Gruppe found", idxGruppe);
      const g = gruppen.splice(idxGruppe, 1)[0];
      this.removeWarningAndError(this.Messen.findIndex((m) => {return m === mid; }), g);
    }
  }

  private cmpDates(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  // param Gruppe darf noch nicht hinzugefügt worden sein
  private searchForWarningAndError(idxMesse: number, gruppe: IMiniGruppe, isAdded: boolean=false, forceCheck: boolean=false) {
    const idMesse = this.Messen[idxMesse];
    const fCheckMesse = (mid: number, state: string, border) => {
      const errorGruppen: IMiniGruppe[] = [];
      for (let i: number = 0; i < this.Messe_Gruppen[mid].length; i++) {
        const cmpGruppe = this.Messe_Gruppen[mid][i];
        if (cmpGruppe.state === 'error') continue;
        const warning = cmpGruppe.Minis.filter((g: number) => gruppe.Minis.includes(g));
        if (warning.length > 0) {
          errorGruppen.push(cmpGruppe);
        }
      }
      if (errorGruppen.length > border) {
        if (isAdded) errorGruppen.push(gruppe);
        for (let i: number = 0; i < errorGruppen.length; i++) errorGruppen[i].state = state;
      }
    };
    // Check error
    if (gruppe.state === 'error' || forceCheck) {
      fCheckMesse(idMesse, 'error', isAdded ? 1 : 0);
    }
    if (gruppe.state === 'warning' || forceCheck) {
      // Check for warning
      let idIter = idxMesse - 1;
      const earlyStop: Date = new Date(this.gd_List_Inst[this.Messen[idxMesse]].Datum.toISOString());
      const lateStop: Date = new Date(this.gd_List_Inst[this.Messen[idxMesse]].Datum.toISOString());
      earlyStop.setDate(earlyStop.getDate() - 8);
      lateStop.setDate(lateStop.getDate() + 8);
      // Check fruehere Messen
      while(idIter >= 0 && this.gd_List_Inst[this.Messen[idIter]].Datum > earlyStop) {
        const messe = this.gd_List_Inst[this.Messen[idIter]];
        fCheckMesse(messe.id, 'warning', 0);
        idIter--;
      }
      // Check spaetere Messen
      idIter = idxMesse + 1;
      while(idIter < this.Messen.length && this.gd_List_Inst[this.Messen[idIter]].Datum < lateStop) {
        const messe = this.gd_List_Inst[this.Messen[idIter]];
        fCheckMesse(messe.id, 'warning', 0);
        idIter++;
      }
    }
  }

  actionAddGruppe(data) {
    const mid = data['m'];
    let idxMesse: number;
    if (this.Messe_Gruppen[mid] == undefined) {
      const mAktuell = this.gd_List_Inst[mid];
      for (idxMesse = 0; idxMesse < this.Messen.length; idxMesse++) {
        const testMesse = this.gd_List_Inst[this.Messen[idxMesse]];
        if (testMesse.Datum > mAktuell.Datum || (mAktuell.autogenerated && this.cmpDates(testMesse.Datum, mAktuell.Datum))) {
          break;
        }
      }
      this.Messen.splice(idxMesse, 0, mid);
      const miniList = [];
      this.Gruppen.splice(idxMesse, 0, miniList);
      this.Messe_Gruppen[mid] = miniList;
    }
    const gruppenList: IMiniGruppe[] = this.Messe_Gruppen[mid];
    // Fuege Gruppen hinzu
    const gruppen: IMiniGruppe[] = data['g'];
    for (let i = 0; i < gruppen.length; i++) {
        // Suche nach Gruppen mit Fehler und warnung, falls notwendig
        if (gruppen[i].state !== 'ok') {
          if (idxMesse == undefined) {idxMesse = this.Messen.findIndex(m => m === mid);}
          this.searchForWarningAndError(idxMesse, gruppen[i]);
        }
        gruppenList.push(gruppen[i]);
    }
  }

  actionMoveGruppe(data) {
    /*transferArrayItem(event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex);*/
      //const messeIDXAlt = this.Messe_IDX[data['messeAlt']];
      //const messeIDXNeu = this.Messe_IDX[data['messeNeu']];
      if (this.Messe_Gruppen[data['messeAlt']] == undefined || this.Messe_Gruppen[data['messeNeu']] == undefined) {
        console.log("Messe konnte nicht gefunden werden", data['messeAlt'], "oder", data['messeNeu']);
        return;
      }
      const gAltIdx = this.Messe_Gruppen[data['messeAlt']].findIndex((val: IMiniGruppe, idx: number, obj: IMiniGruppe[]) => {
        const check: unknown = val.id === data['gruppe'];
        return check;
      });
      //transferArrayItem(this.Messe_Gruppen[data['messeAlt']], this.Messe_Gruppen[data['messeNeu']], gAltIdx, 0);
      const gruppe = this.Messe_Gruppen[data['messeAlt']].splice(gAltIdx, 1)[0];
      //console.log(gruppe, gAltIdx);
      const messeAltIdx: number = this.Messen.findIndex(m => data['messeAlt'] === m);
      this.removeWarningAndError(messeAltIdx, gruppe);
      gruppe.state = data['state'];
      //console.log(gruppe);
      const messeNeuIdx: number = this.Messen.findIndex((m) => {return data['messeNeu'] === m;})
      this.searchForWarningAndError(messeNeuIdx, gruppe);
      this.Messe_Gruppen[data['messeNeu']].push(gruppe);
  }

  // Drag Drop Gruppen verschieben
  drop(event: CdkDragDrop<any>, messeID: number) {
    if (this.userService.has('api.change_gruppe')) {
      if (event.previousContainer.data.length === 0) {
        return;
      }
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        this.miniplanService.ws_changeMesse(messeID, event.previousContainer.data[event.previousIndex].id);
      }
    } else {
      this._snackBar.open('Kein Berechtigung', 'OK', {duration: 1000});
    }
  }

  //Gottesdienste bearbeiten
  bearbeite_gd_id: number = -1;
  showEditGd = false;

  oeffneDialog(id: number) {
    this.bearbeite_gd_id = id;
    this.showEditGd = true;
  }

  loescheMesseVonPlan(idMesse: number, idx_Messe: number) {
    // TODO
  }

  neuEinteilen() {
    this.db.socket.next({
      'type': 'gruppe',
      'action': 'neuEinteilen',
      'id': this.MiniplanBase.id
    });
  }
}
