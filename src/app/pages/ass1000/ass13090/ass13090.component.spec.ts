import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13090Component } from './ass13090.component';

describe('ASS13090Component', () => {
  let component: ASS13090Component;
  let fixture: ComponentFixture<ASS13090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
