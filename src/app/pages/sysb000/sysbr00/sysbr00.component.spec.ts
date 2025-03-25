import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBR00Component } from './sysbr00.component';

describe('SYSBR00Component', () => {
  let component: SYSBR00Component;
  let fixture: ComponentFixture<SYSBR00Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBR00Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBR00Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
