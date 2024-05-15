import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GdVerwaltungComponent } from './gottesdienste/gd-verwaltung/gd-verwaltung.component';
import { ArtVerwaltungComponent } from './gottesdienste/art-verwaltung/art-verwaltung.component';
import { MiniListenComponent } from './mini-listen/mini-listen.component';
import { MiniplanRawEditComponent } from './miniplan/miniplan-raw-edit/miniplan-raw-edit.component';
import { MiniplanComponent } from './miniplan/miniplan.component';
import { MiniplandragdropComponent } from './miniplan/miniplandragdrop/miniplandragdrop.component';
import { MiniplantoggleComponent } from './miniplan/miniplantoggle/miniplantoggle.component';
import { NeuerMiniComponent } from './neuer-mini/neuer-mini.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { StartseiteComponent } from './startseite/startseite.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {path:'', component: StartseiteComponent},
  {path: 'neuerMini', component: NeuerMiniComponent},
  {path: 'gottesdienste/verwaltung', component: GdVerwaltungComponent},
  {path:'gottesdienste/art', component: ArtVerwaltungComponent},
  {path: 'miniListe', component: MiniListenComponent},
  {path: 'miniplan', children: [
    {path: '', component: MiniplanComponent},
    {path: 'normal/:id', component: MiniplandragdropComponent},
    {path: 'sonder/:id', component: MiniplantoggleComponent},
    {path: 'raw/:id', component: MiniplanRawEditComponent}
  ]},
  {path: 'settings', component: SettingsComponent},
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
