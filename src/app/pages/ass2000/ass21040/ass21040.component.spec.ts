import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21040Component } from './ass21040.component';

describe('ASS21040Component', () => {
  let component: ASS21040Component;
  let fixture: ComponentFixture<ASS21040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
