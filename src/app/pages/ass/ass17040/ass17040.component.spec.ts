import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17040Component } from './ass17040.component';

describe('ASS17040Component', () => {
  let component: ASS17040Component;
  let fixture: ComponentFixture<ASS17040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
