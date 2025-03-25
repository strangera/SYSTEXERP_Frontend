import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16050Component } from './ass16050.component';

describe('ASS16050Component', () => {
  let component: ASS16050Component;
  let fixture: ComponentFixture<ASS16050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
