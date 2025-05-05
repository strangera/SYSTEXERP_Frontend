import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBP00Component } from './sysbp00.component';

describe('SYSBP00Component', () => {
  let component: SYSBP00Component;
  let fixture: ComponentFixture<SYSBP00Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBP00Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBP00Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
