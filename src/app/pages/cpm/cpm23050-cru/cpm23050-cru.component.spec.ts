import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23050CRUComponent } from './cpm23050-cru.component';

describe('CPM23050CRUComponent', () => {
  let component: CPM23050CRUComponent;
  let fixture: ComponentFixture<CPM23050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
