import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ASS17090Component } from './ass17090.component';

describe('ASS17090Component', () => {
  let component: ASS17090Component;
  let fixture: ComponentFixture<ASS17090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17090Component],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS17090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
