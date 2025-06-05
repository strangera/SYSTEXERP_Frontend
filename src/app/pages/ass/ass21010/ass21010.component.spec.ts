import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21010Component } from './ass21010.component';

describe('ASS21010Component', () => {
  let component: ASS21010Component;
  let fixture: ComponentFixture<ASS21010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
