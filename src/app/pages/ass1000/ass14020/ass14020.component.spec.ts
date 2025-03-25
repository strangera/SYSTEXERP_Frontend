import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14020Component } from './ass14020.component';

describe('ASS14020Component', () => {
  let component: ASS14020Component;
  let fixture: ComponentFixture<ASS14020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
