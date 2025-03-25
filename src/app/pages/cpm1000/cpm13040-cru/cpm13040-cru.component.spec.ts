import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13040CRUComponent } from './cpm13040-cru.component';

describe('CPM13040CRUComponent', () => {
  let component: CPM13040CRUComponent;
  let fixture: ComponentFixture<CPM13040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
