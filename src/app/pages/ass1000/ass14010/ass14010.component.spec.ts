import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS14010Component } from './ass14010.component';

describe('ASS14010Component', () => {
  let component: ASS14010Component;
  let fixture: ComponentFixture<ASS14010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS14010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS14010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
