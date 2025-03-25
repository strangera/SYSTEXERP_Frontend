import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17080Component } from './ass17080.component';

describe('ASS17080Component', () => {
  let component: ASS17080Component;
  let fixture: ComponentFixture<ASS17080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
