import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16060Component } from './ass16060.component';

describe('ASS16060Component', () => {
  let component: ASS16060Component;
  let fixture: ComponentFixture<ASS16060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
