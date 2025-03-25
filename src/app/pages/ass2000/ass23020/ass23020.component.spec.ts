import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS23020Component } from './ass23020.component';

describe('ASS23020Component', () => {
  let component: ASS23020Component;
  let fixture: ComponentFixture<ASS23020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS23020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS23020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
