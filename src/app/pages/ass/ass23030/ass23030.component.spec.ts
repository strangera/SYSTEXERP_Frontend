import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS23030Component } from './ass23030.component';

describe('ASS23030Component', () => {
  let component: ASS23030Component;
  let fixture: ComponentFixture<ASS23030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS23030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS23030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
