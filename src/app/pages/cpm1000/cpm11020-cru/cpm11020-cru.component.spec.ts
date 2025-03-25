import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11020CRUComponent } from './cpm11020-cru.component';

describe('CPM11020CRUComponent', () => {
  let component: CPM11020CRUComponent;
  let fixture: ComponentFixture<CPM11020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
