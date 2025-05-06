import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12020Component } from './ass12020.component';

describe('ASS12020Component', () => {
  let component: ASS12020Component;
  let fixture: ComponentFixture<ASS12020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
