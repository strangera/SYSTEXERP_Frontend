import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryYearMonthComponent } from './query-year-month.component';

describe('QueryYearMonthComponent', () => {
  let component: QueryYearMonthComponent;
  let fixture: ComponentFixture<QueryYearMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryYearMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryYearMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
