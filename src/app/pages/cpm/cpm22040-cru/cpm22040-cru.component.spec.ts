import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22040CRUComponent } from './cpm22040-cru.component';

describe('CPM22040CRUComponent', () => {
  let component: CPM22040CRUComponent;
  let fixture: ComponentFixture<CPM22040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
