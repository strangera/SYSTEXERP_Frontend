import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15080Component } from './ass15080.component';

describe('ASS15080Component', () => {
  let component: ASS15080Component;
  let fixture: ComponentFixture<ASS15080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
