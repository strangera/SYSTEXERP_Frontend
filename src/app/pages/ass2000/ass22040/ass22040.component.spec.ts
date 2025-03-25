import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22040Component } from './ass22040.component';

describe('ASS22040Component', () => {
  let component: ASS22040Component;
  let fixture: ComponentFixture<ASS22040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
