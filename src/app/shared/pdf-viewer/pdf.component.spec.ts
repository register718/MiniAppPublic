import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfComponent } from './pdf.component';

describe('PdfViewerComponent', () => {
  let component: PdfComponent;
  let fixture: ComponentFixture<PdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
