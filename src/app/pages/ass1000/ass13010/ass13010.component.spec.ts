import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13010Component } from './ass13010.component';

describe('ASS13010Component', () => {
  let component: ASS13010Component;
  let fixture: ComponentFixture<ASS13010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
