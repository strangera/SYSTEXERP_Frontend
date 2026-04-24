import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17030Component } from './ass17030.component';

describe('ASS17030Component', () => {
  let component: ASS17030Component;
  let fixture: ComponentFixture<ASS17030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17030Component],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS17030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
