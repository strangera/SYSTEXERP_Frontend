import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16090Component } from './ass16090.component';

describe('ASS16090Component', () => {
  let component: ASS16090Component;
  let fixture: ComponentFixture<ASS16090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
