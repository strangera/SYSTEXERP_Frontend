import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS15010CRUComponent } from './ass15010-cru.component';

describe('ASS15010CRUComponent', () => {
  let component: ASS15010CRUComponent;
  let fixture: ComponentFixture<ASS15010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS15010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
