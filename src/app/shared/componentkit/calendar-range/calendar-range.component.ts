import { NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-calendar-range',
  templateUrl: './calendar-range.component.html',
  styleUrl: './calendar-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgStyle, CalendarModule, FormsModule, ReactiveFormsModule, CalendarComponent]
})
export class CalendarRangeComponent extends BasicKitComponent implements OnInit {
  // 基本設置
  @Input() override label = ''; // 標籤
  @Input() startLabel = ''; // 起始日期標籤
  @Input() endLabel = ''; // 結束日期標籤
  @Input() descLabel = '(起迄)'; // 標籤說明
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl; // 起始日期
  @Input() endControl = new FormControl; // 結束日期
  @Input() submitted = false; // 檢查欄位是否標準
  // 選擇的元件類型
  @Input() calendarType: 'timeRange' | 'dateRange' | 'dateTimeRange' | 'dateMonthRange' | 'dateYearRange' = 'dateRange';
  @Input() startMinDate: Date | undefined | null = null;
  @Input() startMaxDate: Date | undefined | null = null;
  @Input() endMinDate: Date | undefined | null = null;
  @Input() endMaxDate: Date | undefined | null = null;
  @Input() disabled = false;  // ← 新增
  // 自訂義
  calendarOneType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' = 'dateOne';  // 觸發事件
  @Output() startDateChange = new EventEmitter<any>();

  // 元件類型對應
  private readonly calendarConfig = {
    timeRange: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', placeholder: '請選擇時間', calendarOneType: 'timeOne' },
    dateRange: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期', calendarOneType: 'dateOne' },
    dateTimeRange: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期時間', calendarOneType: 'dateTimeOne' },
    dateMonthRange: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', placeholder: '請選擇月份', calendarOneType: 'dateMonthOne' },
    dateYearRange: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', placeholder: '請選擇年份', calendarOneType: 'dateYearOne' },
  };
  ngOnInit() {
    const config = this.calendarConfig[this.calendarType];
    this.placeholder = config.placeholder;
    this.placeholder2 = config.placeholder;
    this.calendarOneType = config.calendarOneType as 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';
    this.checkRequiredValidator(this.startControl, 0);
    this.checkRequiredValidator(this.endControl, 1);
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidDateRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }
  get isStartDisabled() {
    return this.disabled || this.startControl?.disabled;
  }
  get isEndDisabled() {
    return this.disabled || this.endControl?.disabled;
  }

}
