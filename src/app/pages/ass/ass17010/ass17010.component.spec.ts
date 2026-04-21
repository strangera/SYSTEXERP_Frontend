import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ASS17010Component } from './ass17010.component';

describe('ASS17010Component', () => {
  let component: ASS17010Component;
  let fixture: ComponentFixture<ASS17010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17010Component, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS17010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
