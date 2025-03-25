import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS23010Component } from './ass23010.component';

describe('ASS23010Component', () => {
  let component: ASS23010Component;
  let fixture: ComponentFixture<ASS23010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS23010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS23010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
