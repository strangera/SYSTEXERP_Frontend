import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS22020Component } from './ass22020.component';

describe('ASS22020Component', () => {
  let component: ASS22020Component;
  let fixture: ComponentFixture<ASS22020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS22020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS22020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
