import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, Validators } from '@angular/forms';
import { QueryYearMonthComponent } from '@shared/componentkit/query-year-month/query-year-month.component';

@Component({
  selector: 'app-example-calendar',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    CalendarRangeQuickComponent,
    CalendarRangeComponent,
    CalendarComponent,
    QueryYearMonthComponent
  ],
  templateUrl: './example-calendar.component.html',
})
export class ExampleCalendarComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    timeOne: [null, Validators.required],
    timeRange1: [null, Validators.required],
    timeRange2: [null, Validators.required],
    dateOne: [null, Validators.required],
    dateRange1: [null, Validators.required],
    dateRange2: [null, Validators.required],
    dateTimeOne: [null, Validators.required],
    dateTimeRange1: [null, Validators.required],
    dateTimeRange2: [null, Validators.required],
    dateMonthOne: [null, Validators.required],
    dateMonthRange1: [null, Validators.required],
    dateMonthRange2: [null, Validators.required],
    dateYearOne: [null, Validators.required],
    dateYearRange1: [null, Validators.required],
    dateYearRange2: [null, Validators.required],
    dateRangeQuick1: [null, Validators.required],
    dateRangeQuick2: [null, Validators.required],
    dateYearMonth: [null, Validators.required],
  });
  constructor() {
    super();
  }
  ngOnInit(): void {

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
