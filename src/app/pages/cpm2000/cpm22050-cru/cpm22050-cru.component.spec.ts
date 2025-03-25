import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22050CRUComponent } from './cpm22050-cru.component';

describe('CPM22050CRUComponent', () => {
  let component: CPM22050CRUComponent;
  let fixture: ComponentFixture<CPM22050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
