import { _isNumberValue } from '@angular/cdk/coercion';
import { LocationStrategy, PathLocationStrategy, Location, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DBService } from 'src/app/service/db.service';
import { IMiniBasic, IMiniExact, MiniService } from 'src/app/service/mini.service';
import { MiniplanService } from 'src/app/service/miniplan.service';
import { UserService } from 'src/app/service/user.service';
import { MyDate } from 'src/app/shared/Date.class';

@Component({
  selector: 'app-mini-aendern',
  templateUrl: './mini-aendern.component.html',
  styleUrls: ['./mini-aendern.component.css']
})
export class MiniAendernComponent implements OnInit {

  geschwister: number[] = [];
  // tslint:disable-next-line: variable-name
  _selectedMini: IMiniBasic = {id: -1, MiniTyp: -1, first_name: '', last_name: '', Geschwister: -1};
  @Input() set selectedMini(value: IMiniBasic) {
    // tslint:disable-next-line: triple-equals
    if (value == undefined) {
      return;
    }
    this._selectedMini = value;
    this.geschwister = this.miniService.MinisListInst.filter(m => m.Geschwister == value.Geschwister).map(n => n.id);
    this.loadMiniExact();
  }

  public miniFull: IMiniExact = {id: -1, first_name: '', last_name: '', email: '', Adresse: '', Geburtsdatum: new Date(), date_joined: new Date(), MiniTyp: -1, Geschwister: -1, Telefon: '', PateMini: null, AnzahlEingeteilt: 0, AbfrageAktiv: [] };

  constructor(public miniService: MiniService, private db: DBService, public userService: UserService, private _snackBar: MatSnackBar,
              public planService: MiniplanService, @Inject(DOCUMENT) public document) { }

  ngOnInit(): void {
  }

  saveMini() {
    console.log(this.miniFull);
    this._selectedMini.first_name = this.miniFull.first_name;
    this._selectedMini.last_name = this.miniFull.last_name;
    this._selectedMini.MiniTyp = this.miniFull.MiniTyp;
    if (this.geschwister.length === 0) {
      this._selectedMini.Geschwister = this.miniService.getNewGeschwisterID();
    } else {
      this._selectedMini.Geschwister = this.miniService.MinisDic[this.geschwister[0]].Geschwister;
      this.miniFull.Geschwister = this.miniService.MinisDic[this.geschwister[0]].Geschwister
    }
    this.miniFull.Geburtsdatum = new MyDate(this.miniFull.Geburtsdatum);
    console.log(this.miniFull);
    // tslint:disable-next-line: deprecation
    console.log(this.miniFull);
    this.db.POST('mini/update/' + this._selectedMini.id.toString() + '/', this.miniFull).subscribe((res) => {
      if (_isNumberValue(res)) {
        this._snackBar.open('Gespeichert', 'OK', {duration: 1000});
      } else {
        alert("Änderung konnte nicht gespeichert werden: " + res['detail']);
      }
    });
  }

  loadMiniExact() {
    this.miniService.loadExact(this._selectedMini.id).subscribe((res) => {
      this.miniFull = res;
    });
  }

  miniLoeschen()  {
    this.miniFull.MiniTyp = 5;
    this.saveMini();
    this.miniService.loescheMini(this.miniFull.id);
    this.miniFull = {id: -1, first_name: '', last_name: '', email: '', Adresse: '', Geburtsdatum: new Date(), date_joined: new Date(), MiniTyp: -1, Geschwister: -1, Telefon: '', PateMini: null, AnzahlEingeteilt: 0, AbfrageAktiv: [] };
    this._selectedMini = {id: -1, MiniTyp: -1, first_name: '', last_name: '', Geschwister: -1};
  }

}
