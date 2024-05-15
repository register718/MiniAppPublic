import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaldenderComponent } from './caldender.component';

describe('CaldenderComponent', () => {
  let component: CaldenderComponent;
  let fixture: ComponentFixture<CaldenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaldenderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaldenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
