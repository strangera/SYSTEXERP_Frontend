import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS13030Component } from './ass13030.component';

describe('ASS13030Component', () => {
  let component: ASS13030Component;
  let fixture: ComponentFixture<ASS13030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS13030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS13030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
