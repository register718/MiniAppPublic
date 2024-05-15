import { Component } from '@angular/core';
import { UserService } from './service/user.service';
import { DBService } from './service/db.service';

@Component({
  selector: 'app-root',
  template: `
  <mat-toolbar style="overflow-x: scroll; z-index: 50;" class="sticky-top bgMenu">
  <button mat-mini-fab class="m-2" color="primary" (click)="drawer.toggle(); showSideBar=!showSideBar;"><mat-icon>menu</mat-icon></button>
    <a routerLink="" class="blankLink mt-3"><h2>Minis Betzigau</h2></a>
    <span style="flex: 1 1 auto;"></span>
    <span class="text-end">
      <form method="post" action="./logout">
        <input type="hidden" name="csrfmiddlewaretoken" [value]="db.getCSRF()" />
        <button mat-button type="submit"><mat-icon>logout</mat-icon><span class="ms-1">Logout</span></button>
      </form>
    </span>
  </mat-toolbar>
  <!--Hauptseite-->
  <div class="container-fulid fullToolbar">
    <div class="row p-0 full">
      <div class="col p-0 bgMenu full" style="max-width: 50px;">
        <mat-list class="p-0 full" style="overflow-y: scroll; overflow-x: hidden">
          <ng-container>
            <mat-list-item class="p-0 bg-secondary"></mat-list-item>
            <mat-list-item class="p-0 ms-3">
              <a style="color: black;" routerLink="/">
                <mat-icon class="overflow-visible">home</mat-icon>
              </a>
            </mat-list-item>
            <mat-list-item *ngIf="userService.has('api.add_mini')" class="p-0 ms-3">
              <a style="color: black;" routerLink="neuerMini">
                <mat-icon class="overflow-visible">person_add</mat-icon>
              </a>
            </mat-list-item>
            <mat-list-item *ngIf="userService.has('api.view_mini')" class="p-0 ms-3">
              <a style="color: black;" routerLink="miniListe">
                <mat-icon class="overflow-visible">file_download</mat-icon>
              </a>
            </mat-list-item>
          </ng-container>
          <ng-container *ngIf="userService.has('api.view_plan')">
            <mat-list-item class="p-0 bg-secondary"></mat-list-item>
            <mat-list-item class="p-0 ms-3">
              <a style="color: black;" routerLink="miniplan">
                <mat-icon class="overflow-visible">build</mat-icon>
              </a>
            </mat-list-item>
          </ng-container>
          <ng-container *ngIf="userService.has('api.view_messeart') || userService.has('api.view_messe')">
            <mat-list-item class="p-0 bg-secondary"></mat-list-item>
            <mat-list-item class="p-0 ms-3" *ngIf="userService.has('api.view_messeart')">
              <a style="color: black;" routerLink="gottesdienste/art">
                <mat-icon class="overflow-visible">description</mat-icon>
              </a>
            </mat-list-item>
            <mat-list-item class="p-0 ms-3" *ngIf="userService.has('api.view_messe')">
              <a style="color: black;" routerLink="gottesdienste/verwaltung">
                <mat-icon class="overflow-visible">church</mat-icon>
              </a>
            </mat-list-item>
          </ng-container>
          <ng-container *ngIf="userService.is_staff">
            <mat-list-item class="p-0 bg-secondary"></mat-list-item>
            <mat-list-item class="p-0 ms-3">
              <a style="color: black;" href="frontend/admin">
                <mat-icon class="overflow-visible">admin_panel_settings</mat-icon>
              </a>
            </mat-list-item>
            <mat-list-item class="p-0 ms-3">
              <a style="color: black;" routerLink="settings">
                <mat-icon class="overflow-visible">settings</mat-icon>
              </a>
            </mat-list-item>
          </ng-container>
          <mat-list-item style="height: 60px;"></mat-list-item>
        </mat-list>
      </div>
      <mat-drawer-container autosize class="fullSidebar col p-0">
        <mat-drawer #drawer mode="side" class="full" style="max-width: 200px;" (closed)="showSideBar=true;" (mouseleave)="drawer.toggle();">
          <mat-list class="hFull p-0 overflow-scroll" style="max-width: 200px;">
                <!--Minis-->
                <ng-container>
                  <mat-list-item class="bg-secondary">Minis</mat-list-item>
                  <mat-list-item>
                    <a routerLink=''>Übersicht</a>
                  </mat-list-item>
                  <mat-list-item *ngIf="userService.has('api.add_mini')">
                    <a routerLink="neuerMini" >Hinzufügen</a>
                  </mat-list-item>
                  <mat-list-item *ngIf="userService.has('api.view_mini')">
                    <a routerLink="miniListe">Mini Liste</a>
                  </mat-list-item>
                </ng-container>
                <!--Miniplan-->
                <ng-container *ngIf="userService.has('api.view_plan')">
                    <mat-list-item class="bg-secondary">Miniplan</mat-list-item>
                    <mat-list-item>
                      <a routerLink="miniplan">Liste</a>
                    </mat-list-item>
                </ng-container>
                <!--Gottesdienste-->
                <ng-container *ngIf="userService.has('api.view_messe') || userService.has('api.view_messeart')">
                    <mat-list-item class="bg-secondary">Gottesdienste</mat-list-item>
                    <mat-list-item *ngIf="userService.has('api.view_messeart')">
                      <a routerLink="gottesdienste/art">Art</a>
                    </mat-list-item>
                    <mat-list-item *ngIf="userService.has('api.view_messe')">
                      <a routerLink="gottesdienste/verwaltung">Messen</a>
                    </mat-list-item>
                </ng-container>
              <ng-container *ngIf="userService.is_staff">
                <mat-list-item class="bg-secondary">Einstellungen</mat-list-item>
                <mat-list-item><a href="frontend/admin">Django</a></mat-list-item>
                <mat-list-item><a routerLink="settings">Einstellungen</a></mat-list-item>
              </ng-container>
              <mat-list-item><a class="text-break" href="frontend/app/impressum/">Impressum/Datenschutzerklärung</a></mat-list-item>
              <mat-list-item style="height: 60px;"></mat-list-item>
          </mat-list>
        </mat-drawer>
        <router-outlet></router-outlet>
      </mat-drawer-container>
    </div>
  </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MiniApp';

  showSideBar: boolean = true;

  constructor(public userService: UserService, public db: DBService) {
    (window as any).pdfWorkerSrc = '/assets/pdf.worker.min.js';
  }
}