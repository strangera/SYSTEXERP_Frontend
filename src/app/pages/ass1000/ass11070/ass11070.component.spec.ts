import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11070Component } from './ass11070.component';

describe('ASS11070Component', () => {
  let component: ASS11070Component;
  let fixture: ComponentFixture<ASS11070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
