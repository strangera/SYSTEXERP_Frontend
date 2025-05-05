import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13010CRUComponent } from './cpm13010-cru.component';

describe('CPM13010CRUComponent', () => {
  let component: CPM13010CRUComponent;
  let fixture: ComponentFixture<CPM13010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
