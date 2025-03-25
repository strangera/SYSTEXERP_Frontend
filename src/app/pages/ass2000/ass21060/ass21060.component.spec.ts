import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21060Component } from './ass21060.component';

describe('ASS21060Component', () => {
  let component: ASS21060Component;
  let fixture: ComponentFixture<ASS21060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
