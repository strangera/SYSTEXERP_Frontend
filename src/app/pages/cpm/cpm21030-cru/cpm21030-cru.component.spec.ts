import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21030CRUComponent } from './cpm21030-cru.component';

describe('CPM21030CRUComponent', () => {
  let component: CPM21030CRUComponent;
  let fixture: ComponentFixture<CPM21030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
