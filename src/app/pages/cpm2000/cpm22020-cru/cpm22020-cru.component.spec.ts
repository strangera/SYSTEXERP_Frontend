import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22020CRUComponent } from './cpm22020-cru.component';

describe('CPM22020CRUComponent', () => {
  let component: CPM22020CRUComponent;
  let fixture: ComponentFixture<CPM22020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
