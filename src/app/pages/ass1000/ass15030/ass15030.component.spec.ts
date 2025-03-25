import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15030Component } from './ass15030.component';

describe('ASS15030Component', () => {
  let component: ASS15030Component;
  let fixture: ComponentFixture<ASS15030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
