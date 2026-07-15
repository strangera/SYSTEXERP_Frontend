import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  computed,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// PrimeNG & Shared Components
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-year-month',
  standalone: true,
  imports: [
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    NgClass,
    ControlMessagesComponent,
  ],
  template: `
    <div class="field year-month-field">
      <label [for]="inputId()">
        {{ label }} <!-- 注意：這裡不加括號，因為是普通屬性 -->
        @if (isControlRequired) {
          <span class="text-red-500">*</span>
        }
      </label>

      <div class="year-month-group">
        <!-- 年份 -->
        <p-calendar
          [formControl]="yearControl"
          view="year"
          dateFormat="yy"
          [minDate]="minDate()"
          [inputId]="inputId()"
          [ngClass]="{ 'ng-invalid ng-dirty': submitted() && control().errors }"
          placeholder="請輸入年份"
          (onSelect)="onChange()"
          (onInput)="onChange()"
          [disabled]="readonly() || control().disabled"
          [readonlyInput]="readonly()"
        />

        <!-- 月份 -->
        <p-dropdown
          class="w-full"
          [formControl]="monthControl"
          [options]="months()"
          placeholder="請選擇月份"
          optionLabel="label"
          optionValue="value"
          [ngClass]="{ 'ng-invalid ng-dirty': submitted() && control().errors }"
          (onChange)="onChange()"
          [disabled]="readonly() || control().disabled"
        />
      </div>

      @if (!readonly()) {
        <app-control-messages
          [onerror]="submitted() || (control().touched && control().invalid)"
          [control]="control()"
        />
      }
    </div>
  `,
  styles: `
    :host ::ng-deep {
      .year-month-group {
        display: flex;
        gap: 4px;
      }
      .year-month-field {
        margin-bottom: 0 !important;
      }
      label {
        margin-bottom: 0px;
        display: inline-block;
        font-weight: 500;
      }
      input, .p-dropdown {
        height: 2.5rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearMonthComponent extends BasicKitComponent implements OnInit, OnChanges {
  // --- 修復繼承錯誤的區域 ---
  // 因為父類別定義為 string，所以子類別必須也是 string，不能改用 input() Signal
  @Input() override controlName = '';
  @Input() override label = '交易年月';

  // --- 其他屬性則使用 Angular 18 的 Signal ---
  readonly submitted = input<boolean>(false);
  readonly control = input.required<FormControl>();
  readonly evenMonth = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly minDate = input<Date | undefined>();
  readonly inputId = input<string>('yearMonth');

  // --- Outputs ---
  readonly valueChanges = output<any>();

  yearControl = new FormControl<Date | string | null>(null);
  monthControl = new FormControl<string | null>(null);

  private isUpdatingFromParent = false;
  private isUpdatingFromChild = false;

  readonly months = computed(() => {
    const isEven = this.evenMonth();
    return [
      { label: '01月~02月', value: isEven ? '02' : '01' },
      { label: '03月~04月', value: isEven ? '04' : '03' },
      { label: '05月~06月', value: isEven ? '06' : '05' },
      { label: '07月~08月', value: isEven ? '08' : '07' },
      { label: '09月~10月', value: isEven ? '10' : '09' },
      { label: '11月~12月', value: isEven ? '12' : '11' },
    ];
  });

  get isControlRequired(): boolean {
    return this.control()?.hasValidator?.(Validators.required) ?? false;
  }

  ngOnInit(): void {
    // 呼叫父類別方法，傳入 Signal 內的實際 FormControl
    this.initControl(this.control());

    // 初始化子控件值
    this.updateChildControlsFromParent(this.control().value);

    // 處理初始狀態
    this.checkDisabledState();

    // 監聽子控件變化 (Sync to Parent)
    this.yearControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isUpdatingFromParent) this.syncToParentControl();
      });

    this.monthControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isUpdatingFromParent) this.syncToParentControl();
      });

    // 監聽主控件變化 (Sync from Parent)
    this.control().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!this.isUpdatingFromChild) this.updateChildControlsFromParent(value);
        this.checkDisabledState();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // BasicKitComponent 的 cdr 是注入的，可以直接使用
    this.cdr.markForCheck();
    if (changes['control']) {
      this.updateChildControlsFromParent(this.control().value);
    }
  }

  private checkDisabledState(): void {
    const shouldDisable = this.control().disabled || this.readonly();
    if (shouldDisable && this.yearControl.enabled) {
      this.yearControl.disable({ emitEvent: false });
      this.monthControl.disable({ emitEvent: false });
    } else if (!shouldDisable && this.yearControl.disabled) {
      this.yearControl.enable({ emitEvent: false });
      this.monthControl.enable({ emitEvent: false });
    }
  }

  private updateChildControlsFromParent(value: any): void {
    this.isUpdatingFromParent = true;

    if (!value) {
      this.yearControl.setValue(null, { emitEvent: false });
      this.monthControl.setValue(null, { emitEvent: false });
    } else if (typeof value === 'string' && value.length === 6) {
      const yearString = value.substring(0, 4);
      const monthString = value.substring(4, 6);

      const date = new Date(parseInt(yearString), 0, 1);
      if (!isNaN(date.getTime())) {
        this.yearControl.setValue(date, { emitEvent: false });
      }

      if (this.months().some(m => m.value === monthString)) {
        this.monthControl.setValue(monthString, { emitEvent: false });
      }
    }

    this.isUpdatingFromParent = false;
    this.cdr.markForCheck();
  }

  private syncToParentControl(): void {
    this.isUpdatingFromChild = true;

    const yearValue = this.yearControl.value;
    const month = this.monthControl.value;
    let yearString: string | null = null;

    if (yearValue instanceof Date && !isNaN(yearValue.getTime())) {
      yearString = yearValue.getFullYear().toString();
    } else if (typeof yearValue === 'string' && yearValue.length === 4) {
      yearString = yearValue;
    }

    const yyyymm = (yearString && month) ? `${yearString}${month}` : '';
    this.control().setValue(yyyymm);

    this.isUpdatingFromChild = false;
  }

  onChange(): void {
    if (!this.isUpdatingFromParent) {
      this.syncToParentControl();
    }
    this.valueChanges.emit(this.control().value);
  }
}
