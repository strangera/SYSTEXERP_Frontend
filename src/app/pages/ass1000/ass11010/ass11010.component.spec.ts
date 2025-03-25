import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11010Component } from './ass11010.component';

describe('ASS11010Component', () => {
  let component: ASS11010Component;
  let fixture: ComponentFixture<ASS11010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
