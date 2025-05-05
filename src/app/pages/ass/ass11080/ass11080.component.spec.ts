import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11080Component } from './ass11080.component';

describe('ASS11080Component', () => {
  let component: ASS11080Component;
  let fixture: ComponentFixture<ASS11080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
