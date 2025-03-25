import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13070Component } from './ass13070.component';

describe('ASS13070Component', () => {
  let component: ASS13070Component;
  let fixture: ComponentFixture<ASS13070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
