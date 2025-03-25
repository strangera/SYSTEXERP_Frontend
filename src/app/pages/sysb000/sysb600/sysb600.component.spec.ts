import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB600Component } from './sysb600.component';

describe('SYSB600Component', () => {
  let component: SYSB600Component;
  let fixture: ComponentFixture<SYSB600Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB600Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB600Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
