import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniplanNachrichtenAnzeigeComponent } from './miniplan-nachrichten-anzeige.component';

describe('MiniplanNachrichtenAnzeigeComponent', () => {
  let component: MiniplanNachrichtenAnzeigeComponent;
  let fixture: ComponentFixture<MiniplanNachrichtenAnzeigeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniplanNachrichtenAnzeigeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniplanNachrichtenAnzeigeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
