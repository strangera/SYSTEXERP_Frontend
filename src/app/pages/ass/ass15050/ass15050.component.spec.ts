import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ASS15050Component } from './ass15050.component';

describe('ASS15050Component', () => {
  let component: ASS15050Component;
  let fixture: ComponentFixture<ASS15050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15050Component],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS15050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
