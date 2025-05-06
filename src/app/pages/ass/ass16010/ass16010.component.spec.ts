import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16010Component } from './ass16010.component';

describe('ASS16010Component', () => {
  let component: ASS16010Component;
  let fixture: ComponentFixture<ASS16010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
