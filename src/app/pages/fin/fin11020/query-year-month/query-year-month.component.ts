import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common'; // 使用 NgClass 替代原始的 class.ng-invalid 綁定
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';

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
  // 設置主控項的 Input
  @Input() override label = '交易年月';
  @Input() submitted = false;
  // 主控項預期接收和輸出 'YYYYMM' 字串
  @Input() control!: FormControl;

  // 子控項，yearControl 最好設定為 Date 物件以符合 p-calendar 的行為
  yearControl = new FormControl<Date | string | null>(null);
  monthControl = new FormControl<string | null>(null);

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
    const yyyymm = this.control.value;
    if (typeof yyyymm === 'string' && yyyymm.length === 6) {
      const yearString = yyyymm.substring(0, 4);
      const monthString = yyyymm.substring(4, 6);
      const initialDate = new Date(parseInt(yearString), 0, 1);
      if (!isNaN(initialDate.getTime())) {
        this.yearControl.setValue(initialDate);
      }
      if (this.months.some(m => m.value === monthString)) {
        this.monthControl.setValue(monthString);
      }
    }
    if (this.control.disabled) {
      this.yearControl.disable();
      this.monthControl.disable();
    }
    // 訂閱變化，同步回主控項
    this.yearControl.valueChanges.subscribe(() => this.syncControlValue());
    this.monthControl.valueChanges.subscribe(() => this.syncControlValue());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control']) {
      console.log('主控項值變化:', this.control.value);

      const yyyymm = this.control.value;
      if (typeof yyyymm === 'string' && yyyymm.length === 6) {
        const yearString = yyyymm.substring(0, 4);
        const monthString = yyyymm.substring(4, 6);
        const initialDate = new Date(parseInt(yearString), 0, 1);
        if (!isNaN(initialDate.getTime())) {
          this.yearControl.setValue(initialDate);
        }
        if (this.months.some(m => m.value === monthString)) {
          this.monthControl.setValue(monthString);
        }
      }
    }
  }

  /**
   * 將年控項 (Date 物件) 和月控項 (MM 字串) 重新組合為 YYYYMM 字串，並更新主控項。
   */
  private syncControlValue(): void {
    const yearValue = this.yearControl.value; // p-calendar 輸出通常為 Date 物件
    const month = this.monthControl.value; // MM 字串

    let yearString: string | null = null;

    // 1. 從 yearControl 的值中提取 YYYY 字串
    if (yearValue instanceof Date && !isNaN(yearValue.getTime())) {
      // 如果是有效的 Date 物件 (來自 p-calendar)
      yearString = yearValue.getFullYear().toString();
    } else if (typeof yearValue === 'string' && yearValue.length === 4) {
      // 如果是有效的 YYYY 字串 (例如，可能的手動輸入或非 Date 類型初始值)
      yearString = yearValue;
    }

    // 2. 組合 YYYYMM
    // 只有當年 (YYYY) 和月 (MM) 都有值時，才設定 YYYYMM
    const yyyymm = (yearString && month) ? `${yearString}${month}` : '';

    // 3. 更新主控項的值
    this.control.setValue(yyyymm);
  }

  // 觸發同步的公開方法
  onChange(): void {
    this.syncControlValue();
  }
}
