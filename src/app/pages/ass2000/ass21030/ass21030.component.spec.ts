import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS21030Component } from './ass21030.component';

describe('ASS21030Component', () => {
  let component: ASS21030Component;
  let fixture: ComponentFixture<ASS21030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS21030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS21030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
