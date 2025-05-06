import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12040Component } from './ass12040.component';

describe('ASS12040Component', () => {
  let component: ASS12040Component;
  let fixture: ComponentFixture<ASS12040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
