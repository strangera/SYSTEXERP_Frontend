import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBC00Component } from './sysbc00.component';

describe('SYSBC00Component', () => {
  let component: SYSBC00Component;
  let fixture: ComponentFixture<SYSBC00Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBC00Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBC00Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
