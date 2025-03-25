import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB100Component } from './sysb100.component';

describe('SYSB100Component', () => {
  let component: SYSB100Component;
  let fixture: ComponentFixture<SYSB100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
