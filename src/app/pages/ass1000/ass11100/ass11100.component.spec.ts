import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11100Component } from './ass11100.component';

describe('ASS11100Component', () => {
  let component: ASS11100Component;
  let fixture: ComponentFixture<ASS11100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
