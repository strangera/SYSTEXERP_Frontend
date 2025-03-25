import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12020CRUComponent } from './cpm12020-cru.component';

describe('CPM12020CRUComponent', () => {
  let component: CPM12020CRUComponent;
  let fixture: ComponentFixture<CPM12020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
