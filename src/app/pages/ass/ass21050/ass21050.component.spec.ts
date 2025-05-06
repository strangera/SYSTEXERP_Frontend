import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21050Component } from './ass21050.component';

describe('ASS21050Component', () => {
  let component: ASS21050Component;
  let fixture: ComponentFixture<ASS21050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
