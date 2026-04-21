import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ASS17060Component } from './ass17060.component';

describe('ASS17060Component', () => {
  let component: ASS17060Component;
  let fixture: ComponentFixture<ASS17060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17060Component, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS17060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
