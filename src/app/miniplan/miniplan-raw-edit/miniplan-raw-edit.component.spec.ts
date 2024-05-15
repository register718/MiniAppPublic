import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniplanRawEditComponent } from './miniplan-raw-edit.component';

describe('MiniplanRawEditComponent', () => {
  let component: MiniplanRawEditComponent;
  let fixture: ComponentFixture<MiniplanRawEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniplanRawEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniplanRawEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
