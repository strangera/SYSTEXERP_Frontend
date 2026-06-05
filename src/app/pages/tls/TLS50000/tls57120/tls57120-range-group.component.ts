import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tls57120-range-group',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CalendarRangeComponent,
    InputNumberComponent
  ],
  templateUrl: './tls57120-range-group.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    label {
      line-height: 1.2;
      user-select: none;
      display: inline-flex;
      align-items: center;
    }
    .label-container {
      position: relative;
      z-index: 10;
    }
    .component-container {
      padding-left: 28px;
      position: relative;
      z-index: 1;
    }
    .hide-internal-label ::ng-deep app-calendar-range > div:first-child,
    .hide-internal-label ::ng-deep app-calendar-range > ng-template,
    .hide-internal-label ::ng-deep app-input-number > label {
      display: none !important;
    }
    .disabled-opacity {
      opacity: 0.45;
      pointer-events: none;
      transition: opacity 0.2s ease-in-out;
    }
  `]
})
export class Tls57120RangeGroupComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() submitted = false;

  rangeMode: 'D' | 'P' = 'D';
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.form.get('PeriodDays')?.value != null && !this.form.get('DateFrom')?.value) {
      this.rangeMode = 'P';
    } else {
      this.rangeMode = 'D';
    }
    // 首次初始化時，不強行覆蓋已有值，只做狀態切換
    this.toggleFields(this.rangeMode, false);
  }

  onModeChange(mode: 'D' | 'P'): void {
    this.rangeMode = mode;
    // 使用者手動切換時，傳入 true 觸發自動預帶日期邏輯
    this.toggleFields(mode, true);
  }

  /**
   * 切換欄位狀態與驗證條件
   * @param mode 選中的模式 'D' 或 'P'
   * @param isUserAction 是否為使用者點擊觸發（若是，則自動帶出當月起訖）
   */
  private toggleFields(mode: 'D' | 'P', isUserAction = false): void {
    const dateFromCtrl = this.form.get('DateFrom');
    const dateToCtrl = this.form.get('DateTo');
    const periodDaysCtrl = this.form.get('PeriodDays');

    if (mode === 'D') {
      // 1. 啟用日期範圍並加入必填驗證
      dateFromCtrl?.enable({ emitEvent: false });
      dateToCtrl?.enable({ emitEvent: false });
      dateFromCtrl?.addValidators(Validators.required);
      dateToCtrl?.addValidators(Validators.required);

      // 🌟 當使用者切換到「日期範圍」時，自動帶上當月 1 號到月底
      if (isUserAction) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        dateFromCtrl?.setValue(firstDay, { emitEvent: false });
        dateToCtrl?.setValue(lastDay, { emitEvent: false });
      }

      // 2. 禁用期間天數，清空數值並移除驗證
      periodDaysCtrl?.setValue(null, { emitEvent: false });
      periodDaysCtrl?.removeValidators(Validators.required);
      periodDaysCtrl?.disable({ emitEvent: false });
    } else {
      // 1. 啟用期間天數並加入必填驗證
      periodDaysCtrl?.enable({ emitEvent: false });
      periodDaysCtrl?.addValidators(Validators.required);

      // 2. 禁用日期範圍，清空數值並移除驗證
      dateFromCtrl?.setValue(null, { emitEvent: false });
      dateToCtrl?.setValue(null, { emitEvent: false });
      dateFromCtrl?.removeValidators(Validators.required);
      dateToCtrl?.removeValidators(Validators.required);
      dateFromCtrl?.disable({ emitEvent: false });
      dateToCtrl?.disable({ emitEvent: false });
    }

    // 重新評估這三個控制項的最新驗證狀態
    dateFromCtrl?.updateValueAndValidity({ emitEvent: false });
    dateToCtrl?.updateValueAndValidity({ emitEvent: false });
    periodDaysCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  get dateFromControl(): FormControl {
    return this.form.get('DateFrom') as FormControl;
  }

  get dateToControl(): FormControl {
    return this.form.get('DateTo') as FormControl;
  }

  get periodDaysControl(): FormControl {
    return this.form.get('PeriodDays') as FormControl;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
