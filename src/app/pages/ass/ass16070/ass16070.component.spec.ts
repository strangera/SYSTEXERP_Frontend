import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16070Component } from './ass16070.component';

describe('ASS16070Component', () => {
  let component: ASS16070Component;
  let fixture: ComponentFixture<ASS16070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
