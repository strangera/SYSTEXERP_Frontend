import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS11010CRUComponent } from './ass11010-cru.component';

describe('ASS11010CRUComponent', () => {
  let component: ASS11010CRUComponent;
  let fixture: ComponentFixture<ASS11010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS11010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS11010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
