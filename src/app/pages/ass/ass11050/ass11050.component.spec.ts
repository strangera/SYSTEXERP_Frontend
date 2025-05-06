import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11050Component } from './ass11050.component';

describe('ASS11050Component', () => {
  let component: ASS11050Component;
  let fixture: ComponentFixture<ASS11050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
