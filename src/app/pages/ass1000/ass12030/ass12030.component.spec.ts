import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS12030Component } from './ass12030.component';

describe('ASS12030Component', () => {
  let component: ASS12030Component;
  let fixture: ComponentFixture<ASS12030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS12030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS12030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
