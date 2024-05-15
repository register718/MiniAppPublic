import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MiniService } from 'src/app/service/mini.service';

@Component({
  selector: 'app-mini-auswahl',
  template: `
    <p><mat-form-field  appearance="fill" style="width: 100%;">
          <mat-label>{{matLabelSetting}}</mat-label>
          <mat-chip-grid #chipList aria-label="Minis aussuchen" style="width: 100%;">
            <mat-chip-row *ngFor="let mini of minis" (removed)="chips_remove(mini)">
              {{mini|showMinis}}
              <button matChipRemove>
                <mat-icon aria-hidden="false">close</mat-icon>
              </button>
            </mat-chip-row>
            <input
              style="width: 100%;"
              placeholder="Neuer Mini..."
              #chipsMinisInput
              [formControl]="chips_Ctrl"
              [matChipInputFor]="chipList"
              [matAutocomplete]="auto"
              [matChipInputSeparatorKeyCodes]="chips_Seperator">
          </mat-chip-grid>
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="chips_selected($event)">
            <mat-option *ngFor="let mini of chips_filterdMinis|async" [value]="mini">
              <span [ngClass]="{'opacity-50':miniService.MinisDic[mini].MiniTyp == 3}">{{mini|showMinis}}</span>
            </mat-option>
          </mat-autocomplete>
        </mat-form-field></p>
  `,
  styles: [
  ]
})
export class MiniAuswahlComponent implements OnInit {

  @Input() minis: number[];
  @Input() matLabelSetting: string = "Minis";
  @Output() minisChange = new EventEmitter<number[]>();

  public chips_Seperator: number[] = [ENTER, COMMA, SPACE];
  public chips_Ctrl = new FormControl();
  public chips_filterdMinis: Observable<number[]>;
  @ViewChild('chipsMinisInput') chipsInput: ElementRef<HTMLInputElement>;
  @Input() strict: boolean = false;

  constructor(public miniService: MiniService) {
    //Minifilter
    this.chips_filterdMinis = this.chips_Ctrl.valueChanges.pipe(
    map((filter: string | null) => (filter ? this._filterMinis(filter) : this.miniService.MinisListInst.map(m => m.id).slice())),);
  }


  chips_remove(mini: number) {
    if (this.strict) {
      //strict mode
      this.removeStrict(mini);
    } else {
      // standart
      const index = this.minis.indexOf(mini);
      if (index >= 0) {
        this.minis.splice(index, 1);
      }
    }
    this.minisChange.emit(this.minis);
  }

  chips_selected(event: MatAutocompleteSelectedEvent) {

    if (this.strict) {
      this.setStrict(event.option.value);
    } else {
      this.minis.push(event.option.value);
    }

    this.chipsInput.nativeElement.value = '';
    this.chips_Ctrl.setValue(null);
    this.minisChange.emit(this.minis);
  }

  private _filterMinis(value: string): number[] {
    if (value == null || value == undefined || typeof(value) === 'number') {
      return this.miniService.MinisListInst.map(m => m.id);
    }
    const filterValue = value.toLowerCase();

    const result =  this.miniService.MinisListInst.filter((mini) => {
      return (mini.first_name.toLowerCase() + mini.last_name.toLowerCase()).includes(filterValue);
    });
    return result.map((mini) => mini.id);
  }

  setStrict(mini: number) {
      const gschwID = this.miniService.MinisDic[mini].Geschwister;
      this.minis = this.miniService.MinisListInst.filter((m) => m.Geschwister == gschwID).map(n => n.id);
  }

  removeStrict(mini: number) {
    this.minis = [];
  }

  ngOnInit(): void {
  }

}
