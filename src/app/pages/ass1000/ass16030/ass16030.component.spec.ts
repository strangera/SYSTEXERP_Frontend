import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16030Component } from './ass16030.component';

describe('ASS16030Component', () => {
  let component: ASS16030Component;
  let fixture: ComponentFixture<ASS16030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
