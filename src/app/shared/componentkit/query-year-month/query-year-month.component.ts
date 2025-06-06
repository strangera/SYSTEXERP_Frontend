import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-query-year-month',
  templateUrl: './query-year-month.component.html',
  styleUrls: ['./query-year-month.component.scss']
})
export class QueryYearMonthComponent {
  @Input() label = '交易年月';
  @Input() submitted = false;

  @Input() yearControl!: FormControl;
  @Input() monthControl!: FormControl;
  @Input() onlyOddMonths: boolean = false;

  @Output() valueChange = new EventEmitter<{ year: string; month: string }>();

  allMonths = [
    { label: '01 月', value: '01' },
    { label: '02 月', value: '02' },
    { label: '03 月', value: '03' },
    { label: '04 月', value: '04' },
    { label: '05 月', value: '05' },
    { label: '06 月', value: '06' },
    { label: '07 月', value: '07' },
    { label: '08 月', value: '08' },
    { label: '09 月', value: '09' },
    { label: '10 月', value: '10' },
    { label: '11 月', value: '11' },
    { label: '12 月', value: '12' }
  ];

  get months() {
    return this.onlyOddMonths
      ? this.allMonths.filter((m) => parseInt(m.value, 10) % 2 === 1)
      : this.allMonths;
  }

  onChange() {
    this.valueChange.emit({
      year: this.yearControl.value,
      month: this.monthControl.value
    });
  }
}
