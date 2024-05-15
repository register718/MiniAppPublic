import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {

  currentUrl: string = '';

  @Input() set URL(value: string) {
    this.currentUrl = value;
  }

  constructor() { }
  ngOnInit(): void {}
}
