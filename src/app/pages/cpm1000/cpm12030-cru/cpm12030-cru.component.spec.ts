import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12030CRUComponent } from './cpm12030-cru.component';

describe('CPM12030CRUComponent', () => {
  let component: CPM12030CRUComponent;
  let fixture: ComponentFixture<CPM12030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
