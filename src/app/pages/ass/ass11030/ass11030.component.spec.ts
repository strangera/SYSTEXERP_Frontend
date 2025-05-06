import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11030Component } from './ass11030.component';

describe('ASS11030Component', () => {
  let component: ASS11030Component;
  let fixture: ComponentFixture<ASS11030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
