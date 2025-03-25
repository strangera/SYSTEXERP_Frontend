import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22010CRUComponent } from './cpm22010-cru.component';

describe('CPM22010CRUComponent', () => {
  let component: CPM22010CRUComponent;
  let fixture: ComponentFixture<CPM22010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
