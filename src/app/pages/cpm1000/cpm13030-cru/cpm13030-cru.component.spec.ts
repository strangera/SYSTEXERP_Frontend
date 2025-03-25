import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13030CRUComponent } from './cpm13030-cru.component';

describe('CPM13030CRUComponent', () => {
  let component: CPM13030CRUComponent;
  let fixture: ComponentFixture<CPM13030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
