import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13050CRUComponent } from './cpm13050-cru.component';

describe('CPM13050CRUComponent', () => {
  let component: CPM13050CRUComponent;
  let fixture: ComponentFixture<CPM13050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
