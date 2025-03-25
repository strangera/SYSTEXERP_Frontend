import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11010CRUComponent } from './cpm11010-cru.component';

describe('CPM11010CRUComponent', () => {
  let component: CPM11010CRUComponent;
  let fixture: ComponentFixture<CPM11010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
