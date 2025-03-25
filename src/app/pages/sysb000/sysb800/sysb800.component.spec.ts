import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB800Component } from './sysb800.component';

describe('SYSB800Component', () => {
  let component: SYSB800Component;
  let fixture: ComponentFixture<SYSB800Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB800Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB800Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
