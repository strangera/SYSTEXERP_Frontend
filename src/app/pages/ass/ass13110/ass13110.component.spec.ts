import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13110Component } from './ass13110.component';

describe('ASS13110Component', () => {
  let component: ASS13110Component;
  let fixture: ComponentFixture<ASS13110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
