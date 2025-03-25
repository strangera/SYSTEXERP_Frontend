import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21010CRUComponent } from './cpm21010-cru.component';

describe('CPM21010CRUComponent', () => {
  let component: CPM21010CRUComponent;
  let fixture: ComponentFixture<CPM21010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
