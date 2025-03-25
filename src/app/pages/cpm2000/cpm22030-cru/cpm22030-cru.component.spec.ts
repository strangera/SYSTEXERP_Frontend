import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22030CRUComponent } from './cpm22030-cru.component';

describe('CPM22030CRUComponent', () => {
  let component: CPM22030CRUComponent;
  let fixture: ComponentFixture<CPM22030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
