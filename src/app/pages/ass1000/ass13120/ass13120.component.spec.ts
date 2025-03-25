import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13120Component } from './ass13120.component';

describe('ASS13120Component', () => {
  let component: ASS13120Component;
  let fixture: ComponentFixture<ASS13120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
