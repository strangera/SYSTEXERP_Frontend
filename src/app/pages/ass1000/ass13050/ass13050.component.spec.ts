import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13050Component } from './ass13050.component';

describe('ASS13050Component', () => {
  let component: ASS13050Component;
  let fixture: ComponentFixture<ASS13050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
