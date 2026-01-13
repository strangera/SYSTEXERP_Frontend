import { NgClass, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { TimeRangeOption, timeRangeOptions, timeUnitOptions } from './calendar-range-quick.model';

@Component({
  selector: 'app-calendar-range-quick',
  templateUrl: './calendar-range-quick.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    Button,
    OverlayPanelModule,
    SelectButtonModule,
    FormsModule,
    CalendarModule,
    ReactiveFormsModule,
    NgClass,
    NgStyle,
    PrimeTemplate,
    ControlMessagesComponent,
  ],
})
export class CalendarRangeQuickComponent extends BasicKitComponent implements OnInit {
  // 表單基本設置
  @Input() override label = ''; // 標籤
  @Input() startLabel = ''; // 起始日期標籤
  @Input() endLabel = ''; // 結束日期標籤
  @Input() startControl = new FormControl; // 起始日期
  @Input() endControl = new FormControl; // 結束日期
  @Input() submitted = false; // 檢查欄位是否標準
  // PrimeNG 設置
  @Input() timeOnly = false;
  @Input() showTime = false;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'date';
  // 快速選擇相關
  @ViewChild('op') op: OverlayPanel | undefined;
  timeUnitOptions = timeUnitOptions;  //大分類
  timeUnit!: string;
  allTimeRangeOptions = timeRangeOptions; // 保存原始的 timeRangeOptions
  filteredTimeRangeOptions: TimeRangeOption[] = []; // 用於顯示的過濾後選項
  timeRange!: TimeRangeOption | null;
  constructor() {
    super();
  }
  ngOnInit() {
    if (this.startControl.enabled && this.endControl.enabled) {
      this.placeholder = '請選擇日期'
      this.placeholder2 = '請選擇日期'
      this.updateControlState(this.startControl, this.endControl);
    }
    if (this.startControl.value && typeof this.startControl.value === 'string') {
      this.startControl.setValue(new Date(this.startControl.value));
    }
    if (this.endControl.value && typeof this.endControl.value === 'string') {
      this.endControl.setValue(new Date(this.endControl.value));
    }
    // 初始化時，如果 timeUnit 有預設值，則進行一次過濾
    if (this.timeUnit) {
      this.filterTimeRanges();
    }
    this.endControl.valueChanges.subscribe((val) => {
      if (val instanceof Date) {
        const endOfDay = new Date(val);
        endOfDay.setHours(23, 59, 59, 999);
        if (val.getTime() !== endOfDay.getTime()) {
          this.endControl.setValue(endOfDay, { emitEvent: false });
        }
      }
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
  // 監聽 timeUnit 的變化
  onTimeUnitChange(newTimeUnit: string) {
    this.timeUnit = newTimeUnit;
    this.filterTimeRanges();
    // 可選：在 timeUnit 改變時重置 timeRange 的選擇
    this.timeRange = null;
  }

  // 監聽 timeRange 的變化
  onTimeRangeChange(event: SelectButtonChangeEvent) {
    if (event && event.value?.startDate && event.value?.endDate) {
      this.startControl.setValue(null);
      this.endControl.setValue(null);
      setTimeout(() => {
        this.startControl.setValue(event.value.startDate);
        this.endControl.setValue(event.value.endDate);
      }, 0);
      this.op?.hide(); // 需要在模板中獲取 op 的引用
    }
  }

  // 過濾 timeRangeOptions 的方法
  filterTimeRanges() {
    if (this.timeUnit) {
      this.filteredTimeRangeOptions = this.allTimeRangeOptions.filter(option => option.unit === this.timeUnit);
    } else {
      this.filteredTimeRangeOptions = []; // 顯示空陣列
    }
  }
  onInput(event: any) {
    // !!! 一開始說的需求，現在又說不要
    if (event.target.value.length === 4 && event.data && event.target.value.indexOf('/') === -1) {
      event.target.value = event.target.value + '/';
    }
    if (event.target.value.length === 7 && event.data && event.target.value.lastIndexOf('/') === event.target.value.indexOf('/')) {
      event.target.value = event.target.value + '/';
    }
  }
}
