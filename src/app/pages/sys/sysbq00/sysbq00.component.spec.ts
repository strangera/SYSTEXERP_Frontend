import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBQ00Component } from './sysbq00.component';

describe('SYSBQ00Component', () => {
  let component: SYSBQ00Component;
  let fixture: ComponentFixture<SYSBQ00Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBQ00Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBQ00Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
