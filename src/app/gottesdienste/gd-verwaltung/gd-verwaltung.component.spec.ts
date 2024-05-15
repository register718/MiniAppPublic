import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GdVerwaltungComponent } from './gd-verwaltung.component';

describe('GdVerwaltungComponent', () => {
  let component: GdVerwaltungComponent;
  let fixture: ComponentFixture<GdVerwaltungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GdVerwaltungComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GdVerwaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
