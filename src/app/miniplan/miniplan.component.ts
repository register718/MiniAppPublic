import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DBService } from '../service/db.service';
import { GottesdiensteService } from '../service/gottesdienste.service';
import { IPlanBase, MiniplanService, MiniplanTyp } from '../service/miniplan.service';
import { UserService } from '../service/user.service';
import { MyDate } from '../shared/Date.class';
import { Subscription } from 'rxjs';

//Dialog
@Component({
  selector: 'dialog-select-planname',
  templateUrl: 'dialogview.component.html',
})
export class DialogviewSelectPlan {

  StartDatum: Date;
  EndDatum: Date;

  constructor(public dialogRef: MatDialogRef<DialogviewSelectPlan>, public gdService: GottesdiensteService, public db: DBService,
     private planService: MiniplanService, private _snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: IPlanBase) {}

  onOKClick(): void {
    if (this.StartDatum < this.EndDatum) {
      this.data.StartDatum = new MyDate(this.StartDatum);
      this.data.EndDatum = new MyDate(this.EndDatum);
      this.db.socket.next({
        'type':'plan',
        'action':'createPlan',
        'plan':this.data
      });
      this.dialogRef.close();
    } else {
      this._snackBar.open("Der Plan endet vor dem Beginn", 'OK', {duration: 4000});
    }
  }

  onAbbrClick(): void {
    this.dialogRef.close();
  }

  wWeiseChanged(checked: boolean) {
    if (!checked) {
      this.data.DefaultMesseArt = null;
    }
  }

}


@Component({
  selector: 'app-miniplan',
  templateUrl: './miniplan.component.html',
  styleUrls: ['./miniplan.component.css']
})
export class MiniplanComponent implements OnInit, OnDestroy {

  planNeu: IPlanBase = {PlanArt: 0, id: -1, Name: '', StartDatum: null, EndDatum: null,  DefaultMesseArt: null, AnzahlMessen: 0};
  sortedPlanKeyList: number[] = [];
  keyListSub: Subscription = null;
  constructor(private router: Router, public planService: MiniplanService, public dialog: MatDialog,
     public userService: UserService) { }

  ngOnDestroy(): void {
    this.keyListSub.unsubscribe();
  }

  ngOnInit(): void {
    this.keyListSub = this.planService.PlanListKey.subscribe((a) => {this.sortedPlanKeyList = a.sort(this.planSort); console.log(this.sortedPlanKeyList);});
  }

  createPlan(art: MiniplanTyp) {
    this.planNeu.PlanArt = art;
    this.dialog.open(DialogviewSelectPlan, {width: '290px', data: this.planNeu});
  }

  getPlanLink(key: number) {
    if (this.userService.has('api.view_messe')|| this.userService.has('api.change_plan')) {
      return [this.planService.ArtToLink(this.planService.PlanListInst[key].PlanArt), this.planService.PlanListInst[key].id];
    }
    return undefined
  }

  planSort(a: number, b: number) {
     const planA = this?.planService?.PlanListInst[a];
     const planB = this?.planService?.PlanListInst[b];
     if (planA == undefined || planB == undefined)
        return 0;
     if (planA.StartDatum > planB.StartDatum)
      return -1;
    return 1;
  }
}
