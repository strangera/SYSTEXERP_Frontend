import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarRangeQuickComponent } from './calendar-range-quick.component';

describe('CalendarRangeQuickComponent', () => {
  let component: CalendarRangeQuickComponent;
  let fixture: ComponentFixture<CalendarRangeQuickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarRangeQuickComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarRangeQuickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
