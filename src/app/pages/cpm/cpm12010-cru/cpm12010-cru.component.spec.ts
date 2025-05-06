import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12010CRUComponent } from './cpm12010-cru.component';

describe('CPM12010CRUComponent', () => {
  let component: CPM12010CRUComponent;
  let fixture: ComponentFixture<CPM12010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
