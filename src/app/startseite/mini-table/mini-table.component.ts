import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IMiniBasic, MiniService } from 'src/app/service/mini.service';

@Component({
  selector: 'app-mini-table',
  templateUrl: 'mini-table.component.html',
  styles: [
  ]
})
export class MiniTableComponent implements OnInit, OnDestroy {

  @Output() readonly selectionChanged: EventEmitter<IMiniBasic> = new EventEmitter();

  filterMiniList: IMiniBasic[] =  [];
  searchString: string;
  miniTyps = new FormControl();
  miniListSub: Subscription = null;

  constructor(public miniService: MiniService) { }

  ngOnDestroy(): void {
    this.miniListSub.unsubscribe();
  }

  ngOnInit() {
    this.miniListSub = this.miniService.MinisList.subscribe(list => this.filterMiniList = list);
  }

  onSearchChange() {
    if (this.searchString == null || this.searchString == undefined || this.searchString === '')
      this.filterMiniList = this.miniService.MinisListInst;
    else {
      this.searchString = this.searchString.toLowerCase();
      this.filterMiniList = this.miniService.MinisListInst.filter(m => (m.first_name + ' ' + m.last_name).toLowerCase().includes(this.searchString));
    }
    console.log(this.miniTyps.value);
    if (this.miniTyps.value != null && this.miniTyps.value != undefined && this.miniTyps.value.length != 0) {
      this.filterMiniList = this.filterMiniList.filter(mini => this.miniTyps.value.includes(mini.MiniTyp));
    }
  }

}
