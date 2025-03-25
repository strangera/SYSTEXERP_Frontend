import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21040CRUComponent } from './cpm21040-cru.component';

describe('CPM21040CRUComponent', () => {
  let component: CPM21040CRUComponent;
  let fixture: ComponentFixture<CPM21040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
