import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB400Component } from './sysb400.component';

describe('SYSB400Component', () => {
  let component: SYSB400Component;
  let fixture: ComponentFixture<SYSB400Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB400Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB400Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
