import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13020CRUComponent } from './cpm13020-cru.component';

describe('CPM13020CRUComponent', () => {
  let component: CPM13020CRUComponent;
  let fixture: ComponentFixture<CPM13020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
