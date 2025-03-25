import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11020Component } from './ass11020.component';

describe('ASS11020Component', () => {
  let component: ASS11020Component;
  let fixture: ComponentFixture<ASS11020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
