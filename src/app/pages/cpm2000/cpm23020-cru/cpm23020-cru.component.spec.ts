import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23020CRUComponent } from './cpm23020-cru.component';

describe('CPM23020CRUComponent', () => {
  let component: CPM23020CRUComponent;
  let fixture: ComponentFixture<CPM23020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
