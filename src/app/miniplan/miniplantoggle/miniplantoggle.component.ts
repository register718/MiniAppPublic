import { _isNumberValue } from '@angular/cdk/coercion';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { GottesdiensteService } from 'src/app/service/gottesdienste.service';
import { IMiniBasic, MiniService } from 'src/app/service/mini.service';
import { IMiniGruppe, IPlanBase, MiniplanService, MiniplanTyp } from 'src/app/service/miniplan.service';
import { UserService } from 'src/app/service/user.service';
import { DBService } from 'src/app/service/db.service';
import { Demultiplexer } from 'src/app/shared/demultiplexer.class';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-miniplantoggle',
  templateUrl: './miniplantoggle.component.html',
  styleUrls: ['./miniplantoggle.component.css']
})
export class MiniplantoggleComponent implements OnInit,OnDestroy {

  MiniplanBase: IPlanBase = {id: -1, EndDatum: null, Name: '', PlanArt: 0, StartDatum: null, DefaultMesseArt: null, AnzahlMessen: 0};
  miniplanSub: Subscription = null;
  renderNachrichten: boolean = false;

  //Alt
  //MessenAlt: number[] = [];
  Messe_Minis: {[id:number]:{[id:number]:IMiniGruppe}} = {};
  sortedMinis: IMiniBasic[] = [];
  minisListSub: Subscription = null;

  //Neu
  Messen: number[] = [];
  //Gruppen: {[id:number]:IMiniGruppe} = [];
  //Errors: number[] = [];


  constructor(private activatedRoute: ActivatedRoute, private router: Router, public miniplanService: MiniplanService,
    public miniService: MiniService, public gdService: GottesdiensteService, public userService: UserService, private db: DBService, private _snackBar: MatSnackBar) { }

  ngOnDestroy(): void {
    this.miniplanSub.unsubscribe();
    this.demultiplexer.stop();
  }

  ngOnInit(): void {
    this.minisListSub = this.miniService.MinisList.subscribe(list => this.sortedMinis = list.slice());
    this.activatedRoute.params.subscribe((params) => {
      if (params.id !== -1 && params.id != null) {
        this.miniplanSub = this.miniplanService.PlanList.pipe(filter(val => Object.keys(val).length !== 0)).subscribe(plaene => {
          if (plaene[params.id] === this.MiniplanBase)
            return;
          const p = plaene[params.id];
          if (p == null) {
            this.router.navigate(['/miniplan']);
          } else {
            if (p.PlanArt === MiniplanTyp.dragdrop) {
              this.router.navigate(['/miniplan', 'normal', p.id]);
            } else {
              this.MiniplanBase = p;
              this.createSocket();
              this.renderNachrichten = true;
          }
        }
        });
      }
    });
  }

  // Sockets Observables
  demultiplexer: Demultiplexer = null;

  createSocket() {
    const myKeyName = 'gruppe';
     const s = this.db.socket.multiplex(
      () => ({'type': myKeyName, 'action': 'subscribe', id: this.MiniplanBase.id}),
      () => ({'type': myKeyName, 'action': 'unsubscribe', id: this.MiniplanBase.id}),
      message => message['type'] != undefined && message['type'].startsWith(myKeyName)
    );
    this.demultiplexer = new Demultiplexer(s, "gruppe");
    //this.demultiplexer.subscribe('plan.addMesse', (a) => this.actionAddMesse(a), ['set']);
    this.demultiplexer.subscribe('removeGruppe', (a) => this.actionRemoveGruppe(a), ['set']);
    this.demultiplexer.subscribe('addGruppe', (a) => this.actionAddGruppe(a), ['m', 'g']);
    this.demultiplexer.start();
  }

  // WEB SOCKET ACTIONS
  actionRemoveGruppe(data) {
      const list: {g:number, m: number}[] = data['set'];
      for (let i = 0; i < list.length; i++) {
          try{
              delete this.Messe_Minis[list[i].m][list[i].g];
          } catch (ex) {console.log("ERROR beim löschen von Gruppe", list[i].g)}
      }
  }

  actionAddGruppe(data) {
    //console.log("AddGruppe Action", data);
    const mid = data['m']; const gruppen = data['g'];
    if (!this.Messen.includes(mid)) {
      this.Messen.push(mid);
    }
    if (this.Messe_Minis[mid] == undefined)
      this.Messe_Minis[mid] = {};
    const messe = this.Messe_Minis[mid];
    for (let i = 0; i < gruppen.length; i++) {
      messe[gruppen[i].id] = gruppen[i];
    }
  }

  /*actionAddMesse(data) {
      this.Messen = this.Messen.concat(data['set']);
  }*/

  // Weitere Hilfsmethoden
  getGruppenVonMesse(id: number) {
    if (this.Messe_Minis[id] == undefined)
      return [];
    return Object.keys(this.Messe_Minis[id]).map(Number);
  }

  trackByToggleIDs(idx: number, item: number) {
      return item;
  }

  generateTooltip(miniID: number) : IMiniBasic[] {
    const geschw = this.miniService.MinisDic[miniID]?.Geschwister;
    const geschwister = this.miniService.MinisListInst.filter(m => m.Geschwister == geschw && m.MiniTyp <= 2 && m.id !== miniID);
    if (geschwister.length == 0) {
      return undefined;
    } else {
      return geschwister;
    }
  }

  checkMinisMesseChanged(miniID: number, gd: number, value: boolean) {
    if (value === true) {
      this.miniplanService.ws_addGruppe([miniID], gd, false);
    } else {
      const id = Object.keys(this.Messe_Minis[gd]).map(Number).filter(m => this.Messe_Minis[gd][m].Minis[0] == miniID);
      console.log("Gruppe ID", id);
      this.miniplanService.ws_removeGruppe(id);
    }
  }

  getMiniKann(gdIndex: number, mini: number) {
    if (this.Messe_Minis[this.Messen[gdIndex]] == undefined)
      return false;
    const keys = Object.keys(this.Messe_Minis[this.Messen[gdIndex]]).map(Number);
    for (let i = 0; i < keys.length; i++) {
        if (this.Messe_Minis[this.Messen[gdIndex]][keys[i]].Minis[0] === mini)
            return true;
    }
    return false;
  }

  checkAll(idmini: number, value: boolean) {
      // TODO
  }

  checkInvert(mini: number) {
      // TODO
  }

  backupSort: Sort = null;
  sortData(sort: Sort, search: string) {
      if (sort == null) {
        sort = this.backupSort;
      } else {
        this.backupSort = sort;
      }
      let data: IMiniBasic[];
      if (search == undefined || search == null || search === "")
        data = this.miniService.MinisListInst.slice();
      else
        data = this.miniService.MinisListInst.slice().filter(m => m.first_name.startsWith(search) || m.last_name.startsWith(search));

      // Falls noch nie umsortiert wurde
      if (sort == null) {
        this.sortedMinis = data;
        return;
      }

      if (!sort.active || sort.direction === '') {
        this.sortedMinis = data;
        return;
      }
      if (sort.active === 'normal') {
        this.sortedMinis = sort.direction === 'asc' ? data : data.reverse();
      }
      this.sortedMinis = data.sort((a: IMiniBasic, b: IMiniBasic): number => {
        const isAsc = sort.direction === 'asc';
        if (sort.active === 'Name') {
          let res: number = a.last_name.localeCompare(b.last_name);
          if (res === 0)
            res = a.first_name.localeCompare(b.first_name);
          return res * (isAsc ? 1 : -1);
        } else if (_isNumberValue(sort.active)) {
          const idMesse = Number(sort.active);
          const gruppenIDs = Object.keys(this.Messe_Minis[idMesse]).map(Number);
          let aPasst = gruppenIDs.filter(g => this.Messe_Minis[idMesse][g].Minis[0] === a.id).length > 0;
          let bPasst = gruppenIDs.filter(g => this.Messe_Minis[idMesse][g].Minis[0] === b.id).length > 0;
          if (!isAsc) {
            aPasst=!aPasst;
            bPasst=!bPasst;
          }
          if (aPasst == bPasst)
            return 0;
          else if (aPasst)
            return -1;
          return 1;
        }
        return 0;
      });
  }
}
