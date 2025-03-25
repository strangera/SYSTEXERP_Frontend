import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB900Component } from './sysb900.component';

describe('SYSB900Component', () => {
  let component: SYSB900Component;
  let fixture: ComponentFixture<SYSB900Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB900Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB900Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
