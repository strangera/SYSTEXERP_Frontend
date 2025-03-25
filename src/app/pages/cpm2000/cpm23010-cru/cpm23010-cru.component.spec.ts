import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23010CRUComponent } from './cpm23010-cru.component';

describe('CPM23010CRUComponent', () => {
  let component: CPM23010CRUComponent;
  let fixture: ComponentFixture<CPM23010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
