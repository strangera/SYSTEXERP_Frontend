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
  @Output() endDateChange = new EventEmitter<any>();

  @Input() helpMsg?: string;
  @Input() showErrorMessage = true;

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

    this.endControl.valueChanges.subscribe(() => {
      this.validateRange();
    });

    // 監聽起日變化也要觸發驗證（防止先選迄日，再選一個更晚的起日）
    this.startControl.valueChanges.subscribe(() => {
      this.validateRange();
    });
  }

  validateRange() {
    const startVal = this.startControl.value;
    const endVal = this.endControl.value;

    // 取得目前 startControl 所有的錯誤
    const errors = this.startControl.errors || {};

    if (startVal && endVal && startVal > endVal) {
      // 增加日期區間錯誤，但不影響原本已存在的錯誤 (如全形錯誤)
      this.startControl.setErrors({ ...errors, invalidDateRange: true });
    } else {
      // 移除日期區間錯誤
      if (errors['invalidDateRange']) {
        delete errors['invalidDateRange'];
      }
      // 如果移除後沒有其他錯誤了，就給 null，否則保留剩餘錯誤
      const remainingErrors = Object.keys(errors).length > 0 ? errors : null;
      this.startControl.setErrors(remainingErrors);
    }
  }
  get isStartDisabled() {
    return this.disabled || this.startControl?.disabled;
  }
  get isEndDisabled() {
    return this.disabled || this.endControl?.disabled;
  }
  /**
   * 補全迄日的時分秒
   */
  fixEndOfDay() {
    // 如果類型包含 Time，則尊重使用者選擇的時間，不強制補 23:59
    if (this.calendarType === 'dateTimeRange' || this.calendarType === 'timeRange') {
      return;
    }

    const val = this.endControl.value;
    if (val instanceof Date) {
      const endOfDay = new Date(val);
      endOfDay.setHours(23, 59, 59, 999);

      if (val.getTime() !== endOfDay.getTime()) {
        this.endControl.setValue(endOfDay, { emitEvent: false });
        this.cdr.markForCheck();
      }
    }
  }

  /**
   * 補全起日的時分秒
   */
  fixStartOfDay() {
    // 如果類型包含 Time，則不強制補 00:00
    if (this.calendarType === 'dateTimeRange' || this.calendarType === 'timeRange') {
      return;
    }

    const val = this.startControl.value;
    if (val instanceof Date) {
      const startOfDay = new Date(val);
      startOfDay.setHours(0, 0, 0, 0);

      if (val.getTime() !== startOfDay.getTime()) {
        this.startControl.setValue(startOfDay, { emitEvent: false });
        this.cdr.markForCheck();
      }
    }
  }
}
