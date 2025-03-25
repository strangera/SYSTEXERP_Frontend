import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14030Component } from './ass14030.component';

describe('ASS14030Component', () => {
  let component: ASS14030Component;
  let fixture: ComponentFixture<ASS14030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
