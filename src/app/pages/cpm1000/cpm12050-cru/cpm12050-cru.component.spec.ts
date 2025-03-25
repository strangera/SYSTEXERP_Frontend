import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12050CRUComponent } from './cpm12050-cru.component';

describe('CPM12050CRUComponent', () => {
  let component: CPM12050CRUComponent;
  let fixture: ComponentFixture<CPM12050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
