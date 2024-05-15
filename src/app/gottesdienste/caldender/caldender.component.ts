import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BuffObservable, BuffSubscribtion } from 'src/app/shared/BufObservable.class';

export enum KalenderAction  {
  add = 0,
  delete = 1,
  deleteAll = 2
}

interface IKalenderEintragIntern { Text: string; disable: boolean; date: number; day: number; idTermin: number;};
export interface IKalenderEintrag {Text: string, date: Date; id: number; emit: any};
export interface IKalenderChange {eintrag: IKalenderEintrag; action}

@Component({
  selector: 'app-caldender',
  template: `
    <mat-card class="p-2">
      <p>
      <mat-form-field class="ms-2">
        <mat-label>Jahr</mat-label>
        <input matInput type="number" #JahrIn minlength="4" maxlength="4" [value]="Jahr" (change)="reloadCalenderInit2(JahrIn.value, MonIn.value);">
      </mat-form-field>
      <mat-form-field class="ms-2">
        <mat-label>Monat</mat-label>
        <input matInput type="number" #MonIn max="12" min="1" [value]="_monat" (change)="reloadCalenderInit2(JahrIn.value, MonIn.value);">
      </mat-form-field>
    </p>
      <mat-grid-list cols="7" rowHeight="1:1">
        <ng-container *ngFor="let eintrag of eintraege; index as i;">
          <mat-grid-tile *ngIf="eintrag == null; else kachelTag;" class="border border-dark border border-1 rounded">
              Lade...
          </mat-grid-tile>
          <ng-template #kachelTag>
            <mat-grid-tile (click)="!eintrag.val[0].disable && onDayClicked(i);"
                           [disabled]="eintrag.val[0].disable"
                           [ngClass]="{'text-muted':eintrag.val[0].disable, 'border-primary':selected===eintrag.val[0].date}"
                           class="border border-dark border border-1 rounded bg-light">
              <mat-slider showTickMarks discrete min="1" [max]="eintrag.val.length"
                          [ngClass]="{'headLine':true, 'd-none':eintrag.val.length === 1}">
              <input matSliderThumb [(ngModel)]="eintrag.step">
              </mat-slider>
              <p class="text-center text-break">{{eintrag.val[eintrag.step - 1].Text}}</p>
              <span class="baseLine text-start">
                  {{getTextDay(eintrag.val[0].day)}}
              </span>
              <span class="dateIcon baseLine" [ngClass]="{'text-white bg-primary rounded-circle pt-1':selected===i}">
                  {{eintrag.val[0].date}}
              </span>
            </mat-grid-tile>
          </ng-template>
        </ng-container>
      </mat-grid-list>
    </mat-card>
  `,
  styleUrls: ['calender.component.css']
})
export class CaldenderComponent implements OnInit, OnDestroy {

  get _monat(): number {
    return this.Monat + 1;
  }

  Monat: number = 0;
  Jahr: number = 0;
  aktMonatStartIdx: number = 0;
  selected: number = 1;
  Erster: Date = new Date();
  
  @Input() changeEintrag: BuffObservable<IKalenderChange>;
  changeEintragSub: BuffSubscribtion = null;
  @Input() setDate: BehaviorSubject<Date>;
  setDateSub: Subscription = null;
  @Output() dateChanged: EventEmitter<any> = new EventEmitter<any>();

  eintraege: {step: number, val: IKalenderEintragIntern[]}[] = new Array<{step: number, val: IKalenderEintragIntern[]}>(35);
  terminliste: {[id:number]:IKalenderEintrag} = [];

  ngOnDestroy(): void {
    this.changeEintragSub.unsubscribe();
    this.setDateSub.unsubscribe();
  }

  emit: boolean = true;

  ngOnInit(): void {  
    const today = new Date();
    this.reloadCalenderInit(today.getFullYear(), today.getMonth());
    //Change Eintrag
    this.changeEintragSub = this.changeEintrag.subscribe((val: IKalenderChange) => {
      //ADD
      if (val.action === KalenderAction.add) {
        this.terminliste[val.eintrag.id] = val.eintrag;
        if (val.eintrag.date.getMonth() === this.Monat && val.eintrag.date.getFullYear() === this.Jahr) {
          this.addEintragEinzel(val.eintrag);
          if (val.eintrag.date.getDate() + this.aktMonatStartIdx - 1 === this.selected)
            this.onDayClicked(this.selected);
        }
      }
      //DELETE
      else if (val.action === KalenderAction.delete) {
        const termin = this.terminliste[val.eintrag.id];
        if (termin.date.getFullYear() === this.Jahr && termin.date.getMonth() === this.Monat) {
          const idx = this.aktMonatStartIdx + termin.date.getDate() - 1;
          if (this.eintraege[idx].val.length > 1) {
            for (let i = 0; i < this.eintraege[idx].val.length; i++) {
              if (termin.id === this.eintraege[idx].val[i].idTermin) {
                this.eintraege[idx].val.splice(i, 1);
              }
            } 
          }else {
            this.eintraege[idx].val[0].Text = "";
            this.eintraege[idx].val[0].idTermin = -1;
          }
          delete this.terminliste[val.eintrag.id];
        }
      }
      //DELETE ALL 
      else if (val.action === KalenderAction.deleteAll) {
        this.terminliste = [];
        this.reloadCalenderInit(this.Jahr, this.Monat);
      }
    });
    // Kalender auf richtiges Datum setzen
    this.setDateSub = this.setDate.subscribe((val: Date) => {
      if (val == null)
        return;
      this.emit = false;
      if (val.getFullYear() !== this.Jahr || val.getMonth() !== this.Monat) {
        this.reloadCalenderInit(val.getFullYear(), val.getMonth());
        this.addEintraege();
      }
      console.log("Date Set", val);
      this.selected = this.aktMonatStartIdx + val.getDate() - 1;
    });
  }

  reloadCalenderInit2(year: string, month: string) {
    this.reloadCalenderInit(Number(year), Number(month) - 1);
    this.addEintraege();
    this.onDayClicked(this.selected);
  }

  addEintraege() {
    const terminliste = Object.values(this.terminliste);
    for (let i = 0; i < terminliste.length; i++) {
      const year = terminliste[i].date.getFullYear();
      const month = terminliste[i].date.getMonth();
      if (year === this.Jahr && month === this.Monat) {
        this.addEintragEinzel(terminliste[i]);
      }
    }
  }

  reloadCalenderInit(year: number, month: number) {
    this.Monat = month;
    this.Jahr = year;
    const erster = new Date(year, month, 1);
    const letzterMonat = ((month + 12 - 1) % 12);
    const tageLetzterMonat = this.tageInMonat(letzterMonat, month > letzterMonat ? year : year - 1);
    //Berechung laenge Eintraege
    const ersterTag = erster.getDay();
    const daysOfMonth = this.tageInMonat(month, year);
    const uebrig =  (7 - ((ersterTag + daysOfMonth) % 7)) % 7;
    this.eintraege = new Array<{step: number, val: IKalenderEintragIntern[]}>(ersterTag + daysOfMonth + uebrig);
    //Setze Selected min auf 1
    this.selected = Math.max(this.selected, ersterTag);
    //Tage von vorherigem Monat
    for (let i: number = 0; i < ersterTag; i++) {
      this.eintraege[i] = {step: 1, val: [{Text: "", disable: true, date: tageLetzterMonat - i, idTermin: -1, day: i}]};
    }
    //Tage diesen Monats
    this.aktMonatStartIdx = ersterTag;
    for (let i = 0; i < daysOfMonth; i++) {
      this.eintraege[i + ersterTag] = {step: 1, val: [{date: i + 1, Text: "", disable: false, idTermin: -1, day: (ersterTag + i) % 7}]};
    }
    // Tage des nächsten Monats
    for (let i = 0; i < uebrig; i++) {
        this.eintraege[daysOfMonth + ersterTag + i] = {step: 1, val: [{date: i + 1, Text: "", disable: true, idTermin: -1, day: (ersterTag + daysOfMonth + i) % 7}]};
    }
    this.onDayClicked(this.selected);
  }

  onDayClicked(idx: number) {
    if (!this.emit) {
      this.emit = true;
      return;
    }
    if (this.eintraege[idx].val[0].idTermin === -1) {
      this.dateChanged.emit(new Date(this.Jahr, this.Monat, this.eintraege[idx].val[0].date));
      console.log("Emitted", new Date(this.Jahr, this.Monat, this.eintraege[idx].val[0].date));
    } else {
      console.log("Emitted", this.terminliste[this.eintraege[idx].val[this.eintraege[idx].step - 1].idTermin].emit);
      this.dateChanged.emit(this.terminliste[this.eintraege[idx].val[this.eintraege[idx].step - 1].idTermin].emit);
    }
    this.selected = idx;
  }

  tageInMonat(month: number, year: number) : number {
    if (month < 7) {
      if (month === 1) {  // Februar, wegen Schaltjahr
        if (year % 400 == 0)
          return 29;
        if (year % 100 == 0)
          return 28;
        if (year % 4 == 0)
          return 29;
        return 28;
      }
      return month % 2 == 0 ? 31 : 30;
    } else {
      return month % 2 == 0 ? 30 : 31;
    }
  }

  addEintragEinzel(val: IKalenderEintrag) {
    const obj = {
      date: val.date.getDate(),
      disable: false,
      Text: val.Text,
      idTermin: val.id,
      day: val.date.getDay()
    };
    const idx = val.date.getDate() + this.aktMonatStartIdx - 1;
    if (this.eintraege[idx].val[0].idTermin === -1) {
      this.eintraege[idx].val[0] = obj;
    } else {
      this.eintraege[idx].val.push(obj);
    }
  }

  //Kopiert
  getTextDay(i: number) {
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
    return "Spaßtag";
  }
}
