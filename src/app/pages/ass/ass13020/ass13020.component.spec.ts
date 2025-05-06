import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13020Component } from './ass13020.component';

describe('ASS13020Component', () => {
  let component: ASS13020Component;
  let fixture: ComponentFixture<ASS13020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
