import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB300Component } from './sysb300.component';

describe('SYSB300Component', () => {
  let component: SYSB300Component;
  let fixture: ComponentFixture<SYSB300Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB300Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB300Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
