import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22010Component } from './ass22010.component';

describe('ASS22010Component', () => {
  let component: ASS22010Component;
  let fixture: ComponentFixture<ASS22010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
