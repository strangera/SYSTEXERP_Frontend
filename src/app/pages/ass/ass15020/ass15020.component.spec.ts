import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15020Component } from './ass15020.component';

describe('ASS15020Component', () => {
  let component: ASS15020Component;
  let fixture: ComponentFixture<ASS15020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
