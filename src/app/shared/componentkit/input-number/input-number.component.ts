import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule, KeyFilterPattern } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    InputGroupAddonModule,
    InputGroupModule,
    InputNumberModule,
    KeyFilterModule,
    ReactiveFormsModule,
    TooltipModule,
    ControlMessagesComponent,
  ],
})
export class InputNumberComponent extends BasicKitComponent implements OnInit {
  // 必填
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() readonly = false; // 新增：唯讀模式

  // Primeng 相關屬性
  @Input() min: number | null = 0; // 最小值
  @Input() max: number | null = 999999999999; // 最大值 (預設 12 位數整數)
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式 || 貨幣模式
  @Input() suffix: string | undefined | null = null;
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  @Input() keyFilter: KeyFilterPattern | RegExp | undefined; // 輸入過濾規則
  @Input() disabled = false;
  @Input() allowUnlimited = false; // 若 true，放寬 maxlength/max 限制
  // 自訂屬性
  @Input() customPlaceholder: string | undefined; // 自訂提示
  @Input() showErrorMessage = true;
  // 觸發事件
  @Output() changeEvent = new EventEmitter<InputNumberInputEvent>();
  @Output() blurEvent = new EventEmitter<Event>();

  ngOnInit(): void {
    this.initControl(this.control);
    if (this.disabled) {
      this.control.disable();
    }
  }
  onInputChange(event: InputNumberInputEvent) {
    this.changeEvent.emit(event);
  }
  onBlur(event: Event) {
    this.blurEvent.emit(event);
  }

  // 新增：取得 input number 的 CSS 類別
  get inputNumberClasses(): string {
    const classes = [];

    if ((this.submitted && this.control.errors)) {
      classes.push('ng-dirty', 'ng-invalid');
    }

    if (this.readonly) {
      classes.push('readonly-field');
    }

    return classes.join(' ');
  }
}
