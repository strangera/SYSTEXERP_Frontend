import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11030CRUComponent } from './cpm11030-cru.component';

describe('CPM11030CRUComponent', () => {
  let component: CPM11030CRUComponent;
  let fixture: ComponentFixture<CPM11030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
