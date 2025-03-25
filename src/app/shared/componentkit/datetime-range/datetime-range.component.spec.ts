import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeRangeComponent } from './datetime-range.component';

describe('DatetimeRangeComponent', () => {
  let component: DatetimeRangeComponent;
  let fixture: ComponentFixture<DatetimeRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatetimeRangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatetimeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
