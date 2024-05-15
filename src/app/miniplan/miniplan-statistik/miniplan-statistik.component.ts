import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { DBService } from 'src/app/service/db.service';
import { IMiniBasic, MiniService } from 'src/app/service/mini.service';
import { IPlanBase } from 'src/app/service/miniplan.service';

@Component({
  selector: 'app-miniplan-statistik',
  templateUrl: './miniplan-statistik.component.html',
  styles: [
  ]
})
export class MiniplanStatistikComponent implements OnInit, OnDestroy {

  @Input() Miniplan: IPlanBase = null;

  MiniList: {[id:number]: {AnzahlTotal:number, AnzahlPlan:number}} = {};
  sortedData: IMiniBasic[] = []
  MiniListSub: Subscription = null;

  constructor(private db: DBService, public miniService: MiniService) { }

  ngOnDestroy(): void {
    this.MiniListSub.unsubscribe();
  }

  ngOnInit(): void {
    this.MiniListSub = this.miniService.MinisList.subscribe((list) => this.sortedData = list.slice());
  }

  sortData(sort: Sort) {
    const data = this.miniService.MinisListInst.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'vorname':
          return compare(a.first_name, b.first_name, isAsc);
        case 'nachname':
          return compare(a.last_name, b.last_name, isAsc);
        case 'anzahl':
          return compare(this.MiniList[a.id] == undefined ? 0 : this.MiniList[a.id].AnzahlPlan, this.MiniList[b.id] == undefined ? 0 : this.MiniList[b.id].AnzahlPlan, isAsc);
        case 'insgesamt':
          return compare(this.MiniList[a.id] == undefined ? 0 : this.MiniList[a.id].AnzahlTotal, this.MiniList[b.id] == undefined ? 0 : this.MiniList[b.id].AnzahlTotal, isAsc);
        default:
          return 0;
      }
    });
  }

  reload() {
    const link = this.Miniplan == null ? 'plan/statistik/real/' : 'plan/statistik/' + this.Miniplan.id.toString() + '/';
    this.db.GET(link).subscribe((res:any) => {
      this.MiniList = {};
      for (let i = 0; i < res.length; i++) {
        this.MiniList[res[i]['id']] = {AnzahlTotal: res[i]['AnzahlTotal'], AnzahlPlan: res[i]['AnzahlPlan']}
      }
      console.log(this.MiniList);
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
