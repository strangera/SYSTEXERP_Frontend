import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11060Component } from './ass11060.component';

describe('ASS11060Component', () => {
  let component: ASS11060Component;
  let fixture: ComponentFixture<ASS11060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
