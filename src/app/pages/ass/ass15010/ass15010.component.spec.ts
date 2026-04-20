import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ASS15010Component } from './ass15010.component';

describe('ASS15010Component', () => {
  let component: ASS15010Component;
  let fixture: ComponentFixture<ASS15010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15010Component],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS15010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
