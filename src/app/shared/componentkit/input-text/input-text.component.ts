// src/app/components/input-text/input-text.component.ts

import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule, KeyFilterPattern } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { ButtonComponent } from '../button/button.component';
import { InputTextService } from './input-text.service';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    InputTextModule,
    KeyFilterModule,
    ReactiveFormsModule,
    TooltipModule,
    ButtonComponent,
    ControlMessagesComponent,
  ],
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  @Input() readonly = false; // 新增：唯讀模式
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() showCopyButton = false;
  @Input() customPlaceholder?: string;

  @Input() alwaysShowPlaceholder?: boolean = false; //總是顯示placeholder  [customPlaceholder]="'選擇'" [alwaysShowPlaceholder]="true"
  @Input() errorForGroup = false;
  @Input() showStar = false;
  @Input() showButton = false;
  @Input() buttonLabel = '';
  @Input() buttonLoading = false;
  @Input() copyControl = new FormControl();
  @Input() showErrorMessage = true;
  @Input() disabled = false;
  @Input() weightedMax: number | null = null;

  @Input() keyFilter: KeyFilterPattern | RegExp | undefined; // 輸入過濾規則

  @Input() autoPadZero = false; // 新增：是否自動補零
  @Input() padLength = 16; // 新增：補零後的總長度
  @Input() padOnBlur = true; // 新增：是否在失焦時補零（而非即時補零）
  @Input() textAlign: 'left' | 'center' | 'right' = 'left'; // 新增：文字對齊方式

  @Output() clickButton = new EventEmitter<unknown>();
  @Output() inputChange = new EventEmitter<Event>();
  @Output() blurEvent = new EventEmitter<string>();

  value = '*****************************************';
  private isComposing = false;
  atMaxLength = false;

  constructor(private inputTextService: InputTextService) {
    super();
  }

  ngOnInit(): void {
    this.initControl(this.control);
    if (this.disabled) {
      this.control.disable();
    }
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(e: Event): void {
    this.isComposing = false;
    this.onInput(e);
  }

  onInput(event: Event): void {
    if (this.readonly || this.isComposing) return;

    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    const previousValue = this.control.value;

    this.atMaxLength = false;

    // 如果啟用自動補零，只允許數字輸入
    if (this.autoPadZero) {
      // 移除非數字字符
      value = value.replace(/\D/g, '');
      // 限制最大長度
      if (value.length > this.padLength) {
        value = value.slice(0, this.padLength);
        this.atMaxLength = true;
      }
    }

    // 處理加權長度或一般長度
    if (this.weightedMax !== null) {
      const { trimmedValue, isMaxLength } = this.inputTextService.trimToWeighted(value, this.weightedMax);
      value = trimmedValue;
      this.atMaxLength = isMaxLength;
    } else if (this.maxLength && value.length > this.maxLength) {
      value = value.slice(0, this.maxLength);
      this.atMaxLength = true;
    }

    if (previousValue !== value) {
      this.control.setValue(value, { emitEvent: false });
      inputElement.value = value;
    }

    if (this.copyControl) {
      this.copyControl.setValue(this.control.value, { emitEvent: false });
    }

    this.inputChange.emit(event);
  }

  onClick(): void {
    this.clickButton.emit();
  }

  // 新增：處理失焦事件
  onBlur(event: FocusEvent): void {
    if (this.readonly) {
      this.blurEvent.emit((event.target as HTMLInputElement).value);
      return;
    }
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim();

    // 只有在啟用自動補零時才執行補零邏輯
    if (this.autoPadZero && this.padOnBlur) {
      // 如果有值且小於指定長度，則補零
      if (value && value.length < this.padLength) {
        value = value.padStart(this.padLength, '0');
        this.control.setValue(value);
        inputElement.value = value;
      }
    }

    this.blurEvent.emit(value);
  }

  // 新增：處理即時補零（如果不想在失焦時補零）
  private padZeroIfNeeded(value: string): string {
    if (!this.autoPadZero || this.padOnBlur) return value;

    // 如果值不為空且長度小於指定長度，補零
    if (value && value.length > 0 && value.length < this.padLength) {
      return value.padStart(this.padLength, '0');
    }
    return value;
  }

  // 新增：取得 input 的 CSS 類別
  get inputClasses(): string {
    const classes = ['w-full'];

    if (this.readonly) {
      classes.push('readonly-field');
    }

    if ((this.submitted && this.control.errors) || (this.errorForGroup && this.control.parent?.errors)) {
      classes.push('ng-invalid', 'ng-dirty');
    }

    return classes.join(' ');
  }
}
