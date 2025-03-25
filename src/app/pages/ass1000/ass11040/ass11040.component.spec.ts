import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11040Component } from './ass11040.component';

describe('ASS11040Component', () => {
  let component: ASS11040Component;
  let fixture: ComponentFixture<ASS11040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
