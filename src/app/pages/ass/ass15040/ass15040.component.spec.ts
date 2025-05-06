import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15040Component } from './ass15040.component';

describe('ASS15040Component', () => {
  let component: ASS15040Component;
  let fixture: ComponentFixture<ASS15040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
