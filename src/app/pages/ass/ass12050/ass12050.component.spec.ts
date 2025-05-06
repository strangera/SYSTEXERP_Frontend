import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12050Component } from './ass12050.component';

describe('ASS12050Component', () => {
  let component: ASS12050Component;
  let fixture: ComponentFixture<ASS12050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
