import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23040CRUComponent } from './cpm23040-cru.component';

describe('CPM23040CRUComponent', () => {
  let component: CPM23040CRUComponent;
  let fixture: ComponentFixture<CPM23040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
