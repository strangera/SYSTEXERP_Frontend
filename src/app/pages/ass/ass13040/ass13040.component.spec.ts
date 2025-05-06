import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13040Component } from './ass13040.component';

describe('ASS13040Component', () => {
  let component: ASS13040Component;
  let fixture: ComponentFixture<ASS13040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
