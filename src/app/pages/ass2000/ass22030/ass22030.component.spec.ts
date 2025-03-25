import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22030Component } from './ass22030.component';

describe('ASS22030Component', () => {
  let component: ASS22030Component;
  let fixture: ComponentFixture<ASS22030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
