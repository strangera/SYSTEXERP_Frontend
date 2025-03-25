import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17050Component } from './ass17050.component';

describe('ASS17050Component', () => {
  let component: ASS17050Component;
  let fixture: ComponentFixture<ASS17050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
