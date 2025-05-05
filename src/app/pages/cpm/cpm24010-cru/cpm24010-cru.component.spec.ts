import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM24010CRUComponent } from './cpm24010-cru.component';

describe('CPM24010CRUComponent', () => {
  let component: CPM24010CRUComponent;
  let fixture: ComponentFixture<CPM24010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM24010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM24010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
