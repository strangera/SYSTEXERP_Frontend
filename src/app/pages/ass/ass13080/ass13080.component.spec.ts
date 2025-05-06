import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13080Component } from './ass13080.component';

describe('ASS13080Component', () => {
  let component: ASS13080Component;
  let fixture: ComponentFixture<ASS13080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
