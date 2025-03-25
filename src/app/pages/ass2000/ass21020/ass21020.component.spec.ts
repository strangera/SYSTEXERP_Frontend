import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21020Component } from './ass21020.component';

describe('ASS21020Component', () => {
  let component: ASS21020Component;
  let fixture: ComponentFixture<ASS21020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
