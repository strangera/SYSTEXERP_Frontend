import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15050Component } from './ass15050.component';

describe('ASS15050Component', () => {
  let component: ASS15050Component;
  let fixture: ComponentFixture<ASS15050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
