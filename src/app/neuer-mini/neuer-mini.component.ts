import { _isNumberValue } from '@angular/cdk/coercion';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DBService } from '../service/db.service';
import { IMiniExact, MiniService } from '../service/mini.service';
import { MyDate } from '../shared/Date.class';

@Component({
  selector: 'app-neuer-mini',
  templateUrl: './neuer-mini.component.html',
  styles: [
  ]
})
export class NeuerMiniComponent implements OnInit {

  mini: IMiniExact = {id: -1, Adresse: null, AnzahlEingeteilt:0, Geburtsdatum: null, Geschwister: null, MiniTyp: null, PateMini: null, Telefon: null, date_joined: new Date(), email: null, first_name: null, last_name: null, AbfrageAktiv: []};
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  geschwister: number[] = [];

  constructor(private _formBuilder: FormBuilder, public miniServie: MiniService, private db: DBService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      geburststdatum: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      adresse: ['', Validators.required],
      email: ['', Validators.email],
      telefon: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      miniTyp: ['', Validators.required]
    });
  }

  speicherMini() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
      const mini: IMiniExact = {
        id: -1,
        first_name: this.firstFormGroup.get('first_name').value,
        last_name: this.firstFormGroup.get('last_name').value,
        Geburtsdatum: new MyDate(this.firstFormGroup.get('geburststdatum').value),
        Adresse: this.secondFormGroup.get('adresse').value,
        email: this.secondFormGroup.get('email').value,
        Telefon: this.secondFormGroup.get('telefon').value,
        AnzahlEingeteilt: 0,
        Geschwister: this.geschwister.length > 0 ? this.miniServie.MinisDic[this.geschwister[0]].Geschwister : this.miniServie.getNewGeschwisterID(),
        date_joined: new MyDate(new Date()),
        MiniTyp: this.thirdFormGroup.get('miniTyp').value,
        PateMini: null,
        AbfrageAktiv: []
      };
      console.log(this.geschwister);
      this.db.POST('mini/neu/', mini).subscribe((result) => {
        if (_isNumberValue(result)) {
          const id = Number(result);
          mini.id = id;
          this.miniServie.addMiniExact(mini);
          this.miniServie.addMiniBasic({
            id: id,
            Geschwister: mini.Geschwister,
            MiniTyp: mini.MiniTyp,
            first_name: mini.first_name,
            last_name: mini.last_name
          });
          this.firstFormGroup.reset()
          this.secondFormGroup.reset();
          this.thirdFormGroup.reset();
          this.geschwister = [];
          this._snackBar.open('Gespeichert', 'OK', {duration: 1000});
        } else {
          alert("Fehler beim hinzufügen");
        }
      })
    } else {
      alert('Eingaben stimmen nicht');
    }
  }

}

export function telefonValidator(): ValidatorFn {
  return (controle: AbstractControl) : ValidationErrors | null => {
    let forbidden: boolean = false;
    let s: string[] = controle.value.split('/');
    if (s.length == 2) {
      forbidden = _isNumberValue(s[0].replace(' ', '')) && _isNumberValue(s[1].replace(' ', ''));
    } else {
      forbidden = _isNumberValue(s[0].replace(' ', ''));
    }
    return forbidden ? {telefon: {value: controle.value}} : null;
  }
}
