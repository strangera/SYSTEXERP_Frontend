import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21020CRUComponent } from './cpm21020-cru.component';

describe('CPM21020CRUComponent', () => {
  let component: CPM21020CRUComponent;
  let fixture: ComponentFixture<CPM21020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
