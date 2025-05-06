import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13060Component } from './ass13060.component';

describe('ASS13060Component', () => {
  let component: ASS13060Component;
  let fixture: ComponentFixture<ASS13060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
