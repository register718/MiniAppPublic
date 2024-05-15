import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {

  @Input() code: string;
  @Output() codeChange = new EventEmitter<string>();
  editorOptions = {theme: 'vs-light'};

  constructor() {}

  ngOnInit(): void {
  }
}
