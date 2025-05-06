import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21050CRUComponent } from './cpm21050-cru.component';

describe('CPM21050CRUComponent', () => {
  let component: CPM21050CRUComponent;
  let fixture: ComponentFixture<CPM21050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
