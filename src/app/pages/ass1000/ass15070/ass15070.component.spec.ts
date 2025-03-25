import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15070Component } from './ass15070.component';

describe('ASS15070Component', () => {
  let component: ASS15070Component;
  let fixture: ComponentFixture<ASS15070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
