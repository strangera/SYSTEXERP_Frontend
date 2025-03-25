import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB920Component } from './sysb920.component';

describe('SYSB920Component', () => {
  let component: SYSB920Component;
  let fixture: ComponentFixture<SYSB920Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB920Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB920Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
