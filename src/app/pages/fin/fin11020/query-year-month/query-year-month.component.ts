import { NgClass, NgIf } from '@angular/common'; // 使用 NgClass 替代原始的 class.ng-invalid 綁定
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
  // 假設 BasicKitComponent 提供了 ChangeDetectorRef (cdr)

  get isControlRequired(): boolean {
    return this.control?.hasValidator?.(Validators.required) ?? false;
  }
  @Input() override controlName = '';
  @Input() override label = '交易年月';
  @Input() submitted = false;
  // 主控項預期接收和輸出 'YYYYMM' 字串
  @Input() control!: FormControl;
  // 偶數月模式
  @Input() evenMonth = false;

  // 子控項，yearControl 最好設定為 Date 物件以符合 p-calendar 的行為
  yearControl = new FormControl<Date | string | null>(null);
  monthControl = new FormControl<string | null>(null);

  months = [
    { label: '01月~02月', value: '01' },
    { label: '03月~04月', value: '03' },
    { label: '05月~06月', value: '05' },
    { label: '07月~08月', value: '07' },
    { label: '09月~10月', value: '10' },
    { label: '11月~12月', value: '11' },
  ];

  // 必須注入 ChangeDetectorRef，以確保 onPush 模式下能正常運作
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initControl(this.control);
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

    // 初始值設定 (從主控項 YYYYMM -> 子控項 Date/String)
    this.updateChildControls(this.control.value);

    if (this.control.disabled) {
      this.yearControl.disable();
      this.monthControl.disable();
    }

    // 訂閱變化，同步回主控項
    // 這裡不需要 emitEvent: false，因為它們是子控項的 valueChanges
    this.yearControl.valueChanges.subscribe(() => this.syncControlValue());
    this.monthControl.valueChanges.subscribe(() => this.syncControlValue());

    // 訂閱主控項變化，更新子控項
    // 這個訂閱必須保留，用於處理外部重置 (e.g., this.dataForm.reset())
    this.control.valueChanges.subscribe(value => {
      this.updateChildControls(value);
      this.cdr.markForCheck(); // 觸發變更檢測
    });
  }

  // 由於我們在 ngOnInit 已經處理了初始值，並且主要依賴 valueChanges，ngOnChanges 可保持現狀或簡化。
  ngOnChanges(changes: SimpleChanges): void {
    // 這裡的邏輯主要用於當 @Input() control 本身物件發生變化時，但通常在 Reactive Forms 中不會發生。
    // 如果您需要在執行期間根據不同的 control.value 來更新子控項，這個邏輯應該與 ngOnInit 內的 updateChildControls 合併。
    // 由於 ngOnInit 已經處理了，這裡可以移除或保持現狀，以防萬一。
    if (changes['control'] && this.control.value) {
      this.updateChildControls(this.control.value);
    }
  }

  /**
   * 將年控項 (Date 物件) 和月控項 (MM 字串) 重新組合為 YYYYMM 字串，並更新主控項。
   * 【**關鍵修正**】: 使用 { emitEvent: false } 避免值變更回饋迴路
   */
  private syncControlValue(): void {
    const yearValue = this.yearControl.value; // p-calendar 輸出通常為 Date 物件
    const month = this.monthControl.value; // MM 字串

    let yearString: string | null = null;

    // 1. 從 yearControl 的值中提取 YYYY 字串
    if (yearValue instanceof Date && !isNaN(yearValue.getTime())) {
      yearString = yearValue.getFullYear().toString();
    } else if (typeof yearValue === 'string' && yearValue.length === 4) {
      yearString = yearValue;
    }

    // 2. 組合 YYYYMM
    // 只有當年 (YYYY) 和月 (MM) 都有值時，才設定 YYYYMM
    const yyyymm: string | null = (yearString && month) ? `${yearString}${month}` : null;

    // 3. 更新主控項的值
    // *** 關鍵修正：使用 { emitEvent: false } 避免觸發主控項的 valueChanges 訂閱，防止回饋迴路清除已輸入的值 ***
    this.control.setValue(yyyymm, { emitEvent: false });
    this.control.markAsDirty();
  }

  // 觸發同步的公開方法
  onChange(): void {
    this.syncControlValue();
    // 修正：當使用者操作子控項時，手動標記主控項為 touched
    this.control.markAsTouched();
    this.cdr.markForCheck();
  }

  /**
   * 根據主控項的 YYYYMM 值更新子控項 (用於外部設定或重置)
   */
  private updateChildControls(yyyymm: string | null): void {
    // 檢查是否為有效的 YYYYMM 字串
    if (typeof yyyymm === 'string' && yyyymm.length === 6) {
      const yearString = yyyymm.substring(0, 4);
      const monthString = yyyymm.substring(4, 6);
      const initialDate = new Date(parseInt(yearString), 0, 1);

      if (!isNaN(initialDate.getTime())) {
        this.yearControl.setValue(initialDate, { emitEvent: false });
      } else {
        // 如果年分無效，也應該清空
        this.yearControl.setValue(null, { emitEvent: false });
      }

      if (this.months.some(m => m.value === monthString)) {
        this.monthControl.setValue(monthString, { emitEvent: false });
      } else {
        // 如果月份無效，清空
        this.monthControl.setValue(null, { emitEvent: false });
      }
    } else {
      // 如果主控項是 null/undefined/空字串 (例如來自 dataForm.reset())，則清空子控項
      this.yearControl.setValue(null, { emitEvent: false });
      this.monthControl.setValue(null, { emitEvent: false });
    }
  }
}
