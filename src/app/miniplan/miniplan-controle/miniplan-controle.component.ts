import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DBService } from 'src/app/service/db.service';
import { GottesdiensteService } from 'src/app/service/gottesdienste.service';
import { IPlanBase, MiniplanService } from 'src/app/service/miniplan.service';
import { UserService } from 'src/app/service/user.service';
import { MyDate } from 'src/app/shared/Date.class';

export enum EditStatus {
  untouched = 0,
  plan = 1,
  setting = 2
}

@Component({
  selector: 'app-miniplan-controle',
  templateUrl: './miniplan-controle.component.html',
  styles: [
  ]
})
export class MiniplanControleComponent implements OnInit {

  //@Output() readonly Speichern = new EventEmitter();
  @Output() readonly einteilen = new EventEmitter();
  @Input() planBase: IPlanBase;
  disabled: boolean= false;
  changedBase: boolean = false;

  constructor(private db: DBService, private _snackBar: MatSnackBar, private miniplanService: MiniplanService, private router: Router,
    public userService: UserService, public gdService: GottesdiensteService, @Inject(DOCUMENT) public document) { }

  ngOnInit(): void {
    this.disabled = !this.userService.has('api.change_plan');
  }

  speicherPlan() {
    if (this.changedBase) {
        this.planBase.StartDatum = new MyDate(this.planBase.StartDatum);
        this.planBase.EndDatum = new MyDate(this.planBase.EndDatum);
        this.miniplanService.changePlan(this.planBase);
    } else {
      this._snackBar.open('Es wurden keine Änderungen festgestellt!', 'OK', {duration: 1000});
    }
    this.gdService.saveNotify();
  }

  archivieren() {
    this.db.GET('plan/archive/' + this.planBase.id.toString() + '/').subscribe((result) => {
      if (result) {
        delete this.miniplanService.PlanListInst[this.planBase.id];
          this.router.navigate(['miniplan'])
      }
    });
  } 

  abfrage() {
    this.db.socket.next({
      'type':'plan',
      'action':'starteAbfrage',
      'id':this.planBase.id
    })
  }

}