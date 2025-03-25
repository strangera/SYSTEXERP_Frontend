import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13100Component } from './ass13100.component';

describe('ASS13100Component', () => {
  let component: ASS13100Component;
  let fixture: ComponentFixture<ASS13100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
