import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17020Component } from './ass17020.component';

describe('ASS17020Component', () => {
  let component: ASS17020Component;
  let fixture: ComponentFixture<ASS17020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
