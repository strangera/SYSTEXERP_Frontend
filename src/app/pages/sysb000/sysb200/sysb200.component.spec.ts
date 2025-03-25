import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB200Component } from './sysb200.component';

describe('SYSB200Component', () => {
  let component: SYSB200Component;
  let fixture: ComponentFixture<SYSB200Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB200Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB200Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
