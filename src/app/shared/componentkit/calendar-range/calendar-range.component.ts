import { NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { TimeRangeOption, timeRangeOptions, timeUnitOptions } from '../calendar-range-quick/calendar-range-quick.model';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-calendar-range',
  templateUrl: './calendar-range.component.html',
  styleUrl: './calendar-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgStyle, CalendarModule, FormsModule, ReactiveFormsModule, CalendarComponent, OverlayPanelModule, SelectButtonModule]
})
export class CalendarRangeComponent extends BasicKitComponent implements OnInit {
  @ViewChild('op') op: OverlayPanel | undefined;
  // 快速選擇相關資料
  timeUnitOptions = timeUnitOptions;
  timeUnit!: string;
  allTimeRangeOptions = timeRangeOptions;
  filteredTimeRangeOptions: TimeRangeOption[] = [];
  timeRange!: TimeRangeOption | null;
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
    if (this.formLabelService) {
      if (this.label) {
        // 模式 A: 單一標籤模式 (例如：建立日期(起迄))
        const fullLabel = this.label + this.descLabel;
        this.formLabelService.registerLabel(this.startControlName, fullLabel);
        this.formLabelService.registerLabel(this.endControlName, fullLabel);
      } else {
        // 模式 B: 雙標籤模式 (例如：起始日期 / 結束日期)
        if (this.startControlName && this.startLabel) {
          this.formLabelService.registerLabel(this.startControlName, this.startLabel);
        }
        if (this.endControlName && this.endLabel) {
          this.formLabelService.registerLabel(this.endControlName, this.endLabel);
        }
      }
    }
    this.initControl(this.startControl);
    this.initControl(this.endControl);
    this.checkRequiredValidator(this.startControl, 0);
    this.checkRequiredValidator(this.endControl, 1);
    this.initQuickSelectUnit();
    this.endControl.valueChanges.subscribe(() => {
      this.validateRange();
    });

    // 監聽起日變化也要觸發驗證（防止先選迄日，再選一個更晚的起日）
    this.startControl.valueChanges.subscribe(() => {
      this.validateRange();
    });
    this.endControl.valueChanges.subscribe(() => { void 0; });
  }

  validateRange() {
    const startVal = this.startControl.value;
    const endVal = this.endControl.value;

    const errors = this.startControl.errors || {};

    if (startVal instanceof Date && endVal instanceof Date) {
      // 建立只有年月日的 Date 物件（將時分秒毫秒全部歸零）
      const startDateOnly = new Date(startVal.getFullYear(), startVal.getMonth(), startVal.getDate());
      const endDateOnly = new Date(endVal.getFullYear(), endVal.getMonth(), endVal.getDate());

      // 只比較日期大小
      if (startDateOnly > endDateOnly) {
        this.startControl.setErrors({ ...errors, invalidDateRange: true });
      } else {
        if (errors['invalidDateRange']) {
          delete errors['invalidDateRange'];
        }
        const remainingErrors = Object.keys(errors).length > 0 ? errors : null;
        this.startControl.setErrors(remainingErrors);
      }
    } else {
      // 如果其中一邊沒有值，就移除區間錯誤
      if (errors['invalidDateRange']) {
        delete errors['invalidDateRange'];
      }
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
  /**
   * 根據目前的 calendarType 決定快速選擇預設顯示哪一個分頁 (日/月/年)
   */
  private initQuickSelectUnit() {
    switch (this.calendarType) {
      case 'dateMonthRange':
        this.timeUnit = 'month';
        break;
      case 'dateYearRange':
        this.timeUnit = 'year';
        break;
      case 'dateTimeRange':
      case 'dateRange':
      default:
        this.timeUnit = 'day'; // 預設從「天」開始
        break;
    }
    this.filterTimeRanges();
  }
  get availableUnitOptions() {
    if (this.calendarType === 'dateMonthRange') {
      return this.timeUnitOptions.filter(u => u.value === 'month' || u.value === 'quarter' || u.value === 'year');
    }
    if (this.calendarType === 'dateYearRange') {
      return this.timeUnitOptions.filter(u => u.value === 'year' || u.value === 'quarter');
    }
    return this.timeUnitOptions; // 預設顯示全部
  }
  // 監聽單位切換 (天/週/月/季/年)
  onTimeUnitChange(newTimeUnit: string) {
    this.timeUnit = newTimeUnit;
    this.filterTimeRanges();
    this.timeRange = null;
  }

  // 執行過濾
  filterTimeRanges() {
    if (this.timeUnit) {
      this.filteredTimeRangeOptions = this.allTimeRangeOptions.filter(option => option.unit === this.timeUnit);
    }
  }

  // 選擇具體範圍 (例如：去年、本月)
  onTimeRangeChange(event: SelectButtonChangeEvent) {
    if (event?.value?.startDate && event?.value?.endDate) {
      // 為了觸發 Angular 的變更偵測，先給 null 再給值
      this.startControl.setValue(null);
      this.endControl.setValue(null);

      setTimeout(() => {
        this.startControl.setValue(event.value.startDate);
        this.endControl.setValue(event.value.endDate);

        // 選擇完後自動補全時分秒 (如果你有需要)
        this.fixStartOfDay();
        this.fixEndOfDay();

        this.startDateChange.emit(event.value.startDate);
        this.endDateChange.emit(event.value.endDate);
      }, 0);

      this.op?.hide();
    }
  }
}
