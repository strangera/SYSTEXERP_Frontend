import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15060Component } from './ass15060.component';

describe('ASS15060Component', () => {
  let component: ASS15060Component;
  let fixture: ComponentFixture<ASS15060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
