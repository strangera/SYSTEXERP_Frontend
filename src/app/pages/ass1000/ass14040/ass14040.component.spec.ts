import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14040Component } from './ass14040.component';

describe('ASS14040Component', () => {
  let component: ASS14040Component;
  let fixture: ComponentFixture<ASS14040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
