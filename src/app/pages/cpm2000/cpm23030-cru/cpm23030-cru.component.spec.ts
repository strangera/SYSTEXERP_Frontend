import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23030CRUComponent } from './cpm23030-cru.component';

describe('CPM23030CRUComponent', () => {
  let component: CPM23030CRUComponent;
  let fixture: ComponentFixture<CPM23030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
