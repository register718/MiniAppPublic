import { _isNumberValue } from '@angular/cdk/coercion';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subscription } from 'rxjs';
import { DBService } from '../../service/db.service';
import { GottesdiensteService, IGottesdienst_Art } from '../../service/gottesdienste.service';
import { UserService } from '../../service/user.service';

const PRINT_FORMAT_STANDART = "$date - $day $time $info";

@Component({
  selector: 'app-art-verwaltung',
  templateUrl: './art-verwaltung.component.html',
  styleUrls: ['./art-verwaltung.component.css']
})
export class ArtVerwaltungComponent implements OnInit, OnDestroy {

  art_changePermission: boolean = false;
  art_addPermission: boolean = false;

  gd_Art_List_Sub: Subscription = null;
  gd_Art_List_Key_Sub: Subscription = null;

  gd_Art_List: {[id:number]:IGottesdienst_Art} = [];
  gd_Art_List_Key: number[] = [];

  constructor(private _formBuilder: FormBuilder, private db: DBService, public gdService: GottesdiensteService, public userService: UserService,
    private _snackBar: MatSnackBar) { }
  

  ngOnDestroy(): void {
    this.gd_Art_List_Key_Sub.unsubscribe();
    this.gd_Art_List_Sub.unsubscribe();
  }

  ngOnInit(): void {
    this.art_form = this._formBuilder.group({
        MinisInsgesamt: ['', Validators.min(0)],
        Name: ['', Validators.required],
        OberminisAnzahl: ['', Validators.min(0)],
        Zeit: ['', Validators.required, timeValidator],
        id: [-1, Validators.min(-1)],
        DayOfWeek: ['-1', Validators.required],
        Print: [PRINT_FORMAT_STANDART, Validators.required]
    });
    //Gottesdienst
    this.art_addPermission = this.userService.has('api.add_messeart');
    this.art_changePermission = this.userService.has('api.change_messeart');
    
    this.gd_Art_List_Sub = this.gdService.gd_Art_List.subscribe({
      next: (val) => this.gd_Art_List = val,
      error: this.db.showLoadError
    });
    this.gd_Art_List_Key_Sub = this.gdService.gd_Art_List_Key.subscribe({
      next: (val) =>  this.gd_Art_List_Key = val,
      error: this.db.showLoadError
    });
  }
  gd_Art: IGottesdienst_Art = {MinisInsgesamt: 0, Name: "", OberminisAnzahl: 0, Print: PRINT_FORMAT_STANDART, Zeit: "--:--", id: -1, DayOfWeek: -1};
  //Gottesdienste

  art_form: FormGroup;

  //Gottesdienst Art

  gd_Art_speichern() {
    if (this.art_form.valid && this.art_form.value.MinisInsgesamt >= this.art_form.value.OberminisAnzahl) {
      if (this.art_form.value.id === -1) {
        this.db.POST('gottesdienste/art/neu/', this.art_form.value).subscribe((res) => {
          if (res != 'false') {
            if (_isNumberValue(res)) {
              const akt = this.art_form.value;
              akt.id = +res;
              this.gdService.changeArt(akt);
              this.art_form.controls['id'].setValue(akt.id);
              return;
            }
          }
          this._snackBar.open('Konnte nicht gespeichert werden', 'OK', {duration: 1000});
        });
      } else {
        this.db.POST('gottesdienste/art/update/' + this.art_form.value.id.toString() + '/', this.art_form.value).subscribe((res) => {
          if (res === this.art_form.value.id) {
            this.gdService.changeArt(this.art_form.value);
            this._snackBar.open("Gespeichert", 'OK', {duration: 1000});
          } else {
            this._snackBar.open("Konnte nicht gespeichert werden", 'OK', {duration: 1000});
          }
        });
      }
    } else {
      this._snackBar.open("Eingabedaten stimmen nicht", 'OK', {duration: 1000});
    }
  }

  jedeWocheChanged(checked: boolean) {
    if (!checked) {
      this.gd_Art.DayOfWeek = -1;
    }
  }

  //Funktioniert erst nach 2. mal klicken
  artSelectionChanged(id: number) {
     if (id == -1) {
        this.art_form.setValue({MinisInsgesamt: 0, Name: "", OberminisAnzahl: 0, Print: PRINT_FORMAT_STANDART, Zeit: "--:--", id: -1, DayOfWeek: -1});
        this.art_form.enable();
     } else {
       this.art_form.setValue(this.gd_Art_List[id]);
       if (this.art_changePermission)
          this.art_form.enable();
        else {
          this.art_form.disable();
          this.art_form.controls['id'].enable();
        }
     }
  }

  deleteMesseArt() {
    this.db.DELETE('gottesdienste/art/delete/' + this.art_form.value.id + '/').subscribe((result) => {
      if (result === true) {
        this.gdService.deleteArt(this.art_form.value.id);
        this.art_form.reset();
      }
    });
  }

}

function timeValidator(controle: AbstractControl) : Observable<any> {
  const txt = controle.value.split(':');
  if (txt.length === 2 || txt.length === 3) {
    if (_isNumberValue(txt[0]) && _isNumberValue(txt[1])) {
      const h = Number(txt[0]);
      const min = Number(txt[1]);
      if (0 <= h && h < 24 && 0 <= min && min < 60) {
        return of(null);
      }
    }
  }
  return of({'NotATime':true});
}
