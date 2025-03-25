import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16020Component } from './ass16020.component';

describe('ASS16020Component', () => {
  let component: ASS16020Component;
  let fixture: ComponentFixture<ASS16020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
