import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17060Component } from './ass17060.component';

describe('ASS17060Component', () => {
  let component: ASS17060Component;
  let fixture: ComponentFixture<ASS17060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
