import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import  {MatTabsModule} from '@angular/material/tabs'
import {MatMenuModule} from '@angular/material/menu';
import { StartseiteComponent } from './startseite/startseite.component';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import { MiniAendernComponent } from './startseite/mini-aendern/mini-aendern.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ShowMinisModule } from './shared/show-minis.pipe';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import { MiniplandragdropComponent } from './miniplan/miniplandragdrop/miniplandragdrop.component';
import { MiniplantoggleComponent } from './miniplan/miniplantoggle/miniplantoggle.component';
import { DialogviewSelectPlan, MiniplanComponent } from './miniplan/miniplan.component';
import { ShowDateModule } from './shared/show-date.pipe';
import { SortMessenModule } from './shared/sort-messen.pipe';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MiniplanControleComponent } from './miniplan/miniplan-controle/miniplan-controle.component';
import { MiniplanStatistikComponent } from './miniplan/miniplan-statistik/miniplan-statistik.component';
import { NeuerMiniComponent } from './neuer-mini/neuer-mini.component';
import {MatStepperModule} from '@angular/material/stepper';
import { CustomDateAdapter } from './shared/dateAdapter';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MiniAuswahlComponent } from './shared/mini-auswahl/mini-auswahl.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { MiniplanRawEditComponent } from './miniplan/miniplan-raw-edit/miniplan-raw-edit.component';
import { TextEditorComponent } from './shared/text-editor/text-editor.component';
import { MiniListenComponent } from './mini-listen/mini-listen.component';
import { PdfComponent } from './shared/pdf-viewer/pdf.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MiniTableComponent } from './startseite/mini-table/mini-table.component';
import { SettingsComponent } from './settings/settings.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {MatSidenavModule} from '@angular/material/sidenav';
import { GdVerwaltungComponent } from './gottesdienste/gd-verwaltung/gd-verwaltung.component';
import { ArtVerwaltungComponent } from './gottesdienste/art-verwaltung/art-verwaltung.component';
import { MatDividerModule } from '@angular/material/divider';
import { MiniplanNachrichtenAnzeigeComponent } from './miniplan/miniplan-nachrichten-anzeige/miniplan-nachrichten-anzeige.component';
import { CaldenderComponent } from './gottesdienste/caldender/caldender.component';
import {MatGridListModule} from '@angular/material/grid-list'; 
import {MatSliderModule} from '@angular/material/slider';
import {MatTreeModule} from '@angular/material/tree'; 
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    AppComponent,
    StartseiteComponent,
    MiniTableComponent,
    MiniAendernComponent,
    MiniplandragdropComponent,
    MiniplantoggleComponent,
    MiniplanComponent,
    DialogviewSelectPlan,
    MiniplanControleComponent,
    MiniplanStatistikComponent,
    NeuerMiniComponent,
    MiniAuswahlComponent,
    PageNotFoundComponent,
    MiniplanRawEditComponent,
    TextEditorComponent,
    MiniListenComponent,
    PdfComponent,
    SettingsComponent,
    GdVerwaltungComponent,
    ArtVerwaltungComponent,
    MiniplanNachrichtenAnzeigeComponent,
    CaldenderComponent
  ],
  imports: [
    BrowserModule, MatToolbarModule, MatListModule, HttpClientModule, MatSnackBarModule,
    AppRoutingModule, MatButtonModule, MatInputModule, ShowMinisModule, DragDropModule,
    BrowserAnimationsModule, MatMenuModule, CommonModule, MatSelectModule, MatSlideToggleModule,
    FormsModule, MatDatepickerModule, MatCheckboxModule, MatNativeDateModule, ReactiveFormsModule,
    MatTabsModule, MatCardModule, MatDialogModule, ShowDateModule, SortMessenModule, MatTableModule,
    MatSortModule, MatButtonToggleModule, MatStepperModule, MatChipsModule, MatIconModule, ClipboardModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatProgressSpinnerModule, PdfViewerModule,
    MatSidenavModule, MatDividerModule, MatGridListModule, MatSliderModule, MatTreeModule, MatProgressBarModule
  ],
  providers: [
    { provide: 'Window', useValue: window },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
