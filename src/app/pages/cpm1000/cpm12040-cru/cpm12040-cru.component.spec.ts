import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12040CRUComponent } from './cpm12040-cru.component';

describe('CPM12040CRUComponent', () => {
  let component: CPM12040CRUComponent;
  let fixture: ComponentFixture<CPM12040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
