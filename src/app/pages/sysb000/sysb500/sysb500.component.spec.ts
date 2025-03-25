import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB500Component } from './sysb500.component';

describe('SYSB500Component', () => {
  let component: SYSB500Component;
  let fixture: ComponentFixture<SYSB500Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB500Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB500Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
