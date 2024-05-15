import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DBService } from '../service/db.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styles: [
  ]
})
export class SettingsComponent implements OnInit {

  minis: number[] = [];
  secretKey = new FormControl();

  constructor(private db: DBService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  resetAnzahl() {
    this.db.POST('plan/statistik/reset/', null).subscribe(res => {
      if (res === true) {
        this._snackBar.open("Zurückgesetzt", 'OK', {duration: 1000});
      } else {
        this._snackBar.open("Fehler beim Zurücksetzen", 'OK', {duration: 1000});
      }
    });
  }

  setChatMinis() {
    this.db.POST('telegram/register/', {mini: this.minis, secretKey: this.secretKey.value}).subscribe((res) => {
      let msg: string;
      if (res === true) {
          msg = "Gespeichert";
      } else {
        msg = "Fehler beim Speichern";
      }
      this._snackBar.open(msg, 'OK', {duration: 1000});
    });
  }

}
