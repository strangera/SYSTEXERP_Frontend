import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-query-year-month',
    templateUrl: './query-year-month.component.html',
    styleUrls: ['./query-year-month.component.scss'],
    standalone: true,
    imports: [FormsModule, InputTextModule, ReactiveFormsModule, DropdownModule,NgIf]
})
export class QueryYearMonthComponent extends BasicKitComponent implements OnInit {
get isControlRequired(): boolean {
  return this.control?.hasValidator?.(Validators.required) ?? false;
}
  @Input() label = '交易年月';
  @Input() submitted = false;
  @Input() control!: FormControl;

  yearControl = new FormControl('');
  monthControl = new FormControl('');

  @Input() onlyOddMonths = false;

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

ngOnInit(): void {
  // ✅ 初始解析 YYYYMM → year + month
  const yyyymm = this.control.value;
  if (yyyymm?.length === 6) {
    this.yearControl.setValue(yyyymm.substring(0, 4));
    this.monthControl.setValue(yyyymm.substring(4, 6));
  }

  // ✅ 根據外部控制項狀態禁用欄位
  if (this.control.disabled) {
    this.yearControl.disable();
    this.monthControl.disable();
  }

  // ✅ 當年或月變動，自動組成 YYYYMM 並設回 control
  this.yearControl.valueChanges.subscribe(() => this.syncControlValue());
  this.monthControl.valueChanges.subscribe(() => this.syncControlValue());
}


  private syncControlValue(): void {
    const year = this.yearControl.value;
    const month = this.monthControl.value;
    const yyyymm = year && month ? `${year}${month}` : '';
    this.control.setValue(yyyymm);
  }
    onChange(): void {
    this.syncControlValue();
  }
}
