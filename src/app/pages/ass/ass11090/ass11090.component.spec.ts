import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11090Component } from './ass11090.component';

describe('ASS11090Component', () => {
  let component: ASS11090Component;
  let fixture: ComponentFixture<ASS11090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
