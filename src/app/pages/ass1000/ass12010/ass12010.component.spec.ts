import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12010Component } from './ass12010.component';

describe('ASS12010Component', () => {
  let component: ASS12010Component;
  let fixture: ComponentFixture<ASS12010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
