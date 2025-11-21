import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-year-month',
  templateUrl: './query-year-month.component.html',
  styleUrls: ['./query-year-month.component.scss'],
  standalone: true,
  imports: [CalendarModule, FormsModule, ReactiveFormsModule, DropdownModule, InputTextModule, NgIf, NgClass, ControlMessagesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearMonthComponent extends BasicKitComponent implements OnInit, OnChanges {
  get isControlRequired(): boolean {
    return this.control?.hasValidator?.(Validators.required) ?? false;
  }
  @Input() override controlName = '';
  @Input() override label = '交易年月';
  @Input() submitted = false;
  @Input() control!: FormControl;
  @Input() evenMonth = false;

  yearControl = new FormControl<Date | string | null>(null);
  monthControl = new FormControl<string | null>(null);

  // 防止循環觸發的標志位
  private isUpdatingFromParent = false;
  private isUpdatingFromChild = false;

  months = [
    { label: '01月~02月', value: '01' },
    { label: '03月~04月', value: '03' },
    { label: '05月~06月', value: '05' },
    { label: '07月~08月', value: '07' },
    { label: '09月~10月', value: '09' },
    { label: '11月~12月', value: '11' },
  ];

  ngOnInit(): void {
    this.initControl(this.control);

    // 設置偶數月模式
    if (this.evenMonth) {
      this.months = [
        { label: '01月~02月', value: '02' },
        { label: '03月~04月', value: '04' },
        { label: '05月~06月', value: '06' },
        { label: '07月~08月', value: '08' },
        { label: '09月~10月', value: '10' },
        { label: '11月~12月', value: '12' },
      ];
    }

    // 初始化子控件值
    this.updateChildControlsFromParent(this.control.value);

    // 處理主控件的 disabled 狀態
    if (this.control.disabled) {
      this.yearControl.disable();
      this.monthControl.disable();
    }

    // 監聽子控件變化，同步到主控件
    this.yearControl.valueChanges.subscribe(() => {
      if (!this.isUpdatingFromParent) {
        this.syncToParentControl();
      }
    });

    this.monthControl.valueChanges.subscribe(() => {
      if (!this.isUpdatingFromParent) {
        this.syncToParentControl();
      }
    });

    // 監聽主控件變化（外部更新，如 form.reset()）
    this.control.valueChanges.subscribe((value) => {
      if (!this.isUpdatingFromChild) {
        this.updateChildControlsFromParent(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cdr.markForCheck();
    if (changes['control']) {
      this.updateChildControlsFromParent(this.control.value);
    }
  }

  /**
   * 從主控件更新子控件（處理外部變更）
   */
  private updateChildControlsFromParent(value: any): void {
    this.isUpdatingFromParent = true;

    // 處理空值
    if (!value || value === '' || value === null) {
      this.yearControl.setValue(null);
      this.monthControl.setValue(null);
      this.isUpdatingFromParent = false;
      this.cdr.markForCheck();
      return;
    }

    // 處理 YYYYMM 格式
    if (typeof value === 'string' && value.length === 6) {
      const yearString = value.substring(0, 4);
      const monthString = value.substring(4, 6);

      const date = new Date(parseInt(yearString), 0, 1);
      if (!isNaN(date.getTime())) {
        this.yearControl.setValue(date);
      }

      if (this.months.some(m => m.value === monthString)) {
        this.monthControl.setValue(monthString);
      }

      this.cdr.markForCheck();
    }

    this.isUpdatingFromParent = false;
  }

  /**
   * 從子控件同步到主控件（處理用戶輸入）
   */
  private syncToParentControl(): void {
    this.isUpdatingFromChild = true;

    const yearValue = this.yearControl.value;
    const month = this.monthControl.value;

    let yearString: string | null = null;

    // 提取年份字串
    if (yearValue instanceof Date && !isNaN(yearValue.getTime())) {
      yearString = yearValue.getFullYear().toString();
    } else if (typeof yearValue === 'string' && yearValue.length === 4) {
      yearString = yearValue;
    }

    // 組合 YYYYMM
    const yyyymm = (yearString && month) ? `${yearString}${month}` : '';

    // 更新主控件
    this.control.setValue(yyyymm);

    this.isUpdatingFromChild = false;
  }

  // 觸發同步的公開方法
  onChange(): void {
    if (!this.isUpdatingFromParent) {
      this.syncToParentControl();
    }
  }
}
