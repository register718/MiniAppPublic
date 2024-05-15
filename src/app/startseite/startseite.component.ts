import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { IMiniBasic, MiniService } from '../service/mini.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-startseite',
  template: `
    <div class="conatiner-fluid p-4 full">
      <ng-container *ngIf="windowWidth >= 740; else mobile;">
        <div class="row full">
            <div [ngClass]="{'col-5':userService.has('api.view_mini'), 'col-12':!userService.has('api.view_mini')}" class="hFull overflowHScroll">
                <app-mini-table (selectionChanged)="selectedMini = $event"></app-mini-table>
            </div>
            <!--Componente fixieren, aber scrollbar auf zu kleinem Bildschirm-->
            <div class="col-7 end-0 hFull overflowHScroll" *ngIf="userService.has('api.view_mini')">
              <app-mini-aendern [selectedMini]="selectedMini" class="ps-2 fullB"></app-mini-aendern>
            </div>
        </div>
      </ng-container>
      <ng-template #mobile>
        <app-mini-table (selectionChanged)="selectionChanged($event);" *ngIf="!bearbeiteMini"></app-mini-table>
        <ng-container *ngIf="bearbeiteMini">
          <button mat-stroked-button (click)="bearbeiteMini=false;" class="m-3">Zurück</button>
          <app-mini-aendern [selectedMini]="selectedMini"></app-mini-aendern>
        </ng-container>
      </ng-template>
    </div>
  `,
  styleUrls: []
})
export class StartseiteComponent implements OnInit {

  bearbeiteMini = false;
  windowWidth: number = this.window.innerWidth;
  selectedMini: IMiniBasic;

  constructor(public miniService: MiniService, @Inject('Window') public window: Window, public userService: UserService) { }

  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
        this.windowWidth = this.window.innerWidth;
  }

  selectionChanged($event) {
    if (this.userService.has('api.view_mini')) {
      this.selectedMini = $event;
      this.bearbeiteMini = true;
    }
  }
}
