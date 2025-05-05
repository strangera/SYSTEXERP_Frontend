import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17110Component } from './ass17110.component';

describe('ASS17110Component', () => {
  let component: ASS17110Component;
  let fixture: ComponentFixture<ASS17110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
