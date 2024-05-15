import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniListenComponent } from './mini-listen.component';

describe('MiniListenComponent', () => {
  let component: MiniListenComponent;
  let fixture: ComponentFixture<MiniListenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniListenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniListenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
