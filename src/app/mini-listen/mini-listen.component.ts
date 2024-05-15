import { Component, Inject, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-mini-listen',
  templateUrl: './mini-listen.component.html',
  styleUrls: ['./mini-listen.component.css']
})
export class MiniListenComponent implements OnInit {

  url: string = '';
  filter: FormControl = new FormControl();

  manHidden: boolean = false;

  sort: number = 0;
  anzahlEmty: number = 5;
  title: string = 'Miniliste';

  idx: boolean = true;
  name: boolean = true;
  typ: boolean = false;
  adresse: boolean = false;
  email: boolean = false;
  gb: boolean = false;
  telefon: boolean = false;
  start: boolean = false;


  constructor(@Inject('Window') public window: Window) { }

  ngOnInit(): void {

    this.filter.setValue([0, 1, 2]);
    if (this.window.innerWidth >= 999)
      this.reloadPDF();
  }

  reloadPDF() {
    if (this.window.innerWidth < 999) {
      this.manHidden = true;
    }
    this.url = `api/mini/liste/?idx=${this.idx}&filter=${this.filter.value}&sort=${this.sort}&anz=${this.anzahlEmty}&name=${this.name}&typ=${this.typ}&adresse=${this.adresse}&gb=${this.gb}&telefon=${this.telefon}&start=${this.start}&email=${this.email}`;
  }
}
