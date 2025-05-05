import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17100Component } from './ass17100.component';

describe('ASS17100Component', () => {
  let component: ASS17100Component;
  let fixture: ComponentFixture<ASS17100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
