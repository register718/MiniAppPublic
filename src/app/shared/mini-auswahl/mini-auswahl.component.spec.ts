import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniAuswahlComponent } from './mini-auswahl.component';

describe('MiniAuswahlComponent', () => {
  let component: MiniAuswahlComponent;
  let fixture: ComponentFixture<MiniAuswahlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniAuswahlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniAuswahlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
