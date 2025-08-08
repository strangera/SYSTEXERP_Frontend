import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonComponent } from '../button/button.component';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TooltipModule,
    ButtonComponent,
    ControlMessagesComponent,
  ]
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;

  @Input() showCopyButton = false;
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false;
  @Input() showStar = false;
  value = '*****************************************';
  @Input() showButton = false;
  @Input() buttonLabel = '';
  @Input() buttonLoading = false;
  @Input() copyControl = new FormControl();
  @Input() showErrorMessage = true;
  @Input() disabled = false;

  @Output() clickButton = new EventEmitter<unknown>();
  @Output() inputChange = new EventEmitter<Event>();

  /** 只留這個入口：
   *  - 有值 => 走 varchar（中=2、英=1）
   *  - 無值 => 用 control 的 Validators.maxLength，走 nvarchar（每字1）
   */
  @Input() weightedMax: number | null = null;

  private isComposing = false;
  atMaxLength = false; // ✅ 新增：是否已達最大長度

  ngOnInit(): void {
    this.initControl(this.control);
    if (this.disabled) this.control.disable();
  }

  // ===== 工具：加權長度與裁切（varchar 規則）=====
  private weightedLen(s: string): number {
    let n = 0;
    for (const ch of s ?? '') n += /[^\x00-\x7F]/.test(ch) ? 2 : 1;
    return n;
  }
  private trimToWeighted(s: string, max: number): string {
    let n = 0, out = '';
    for (const ch of s ?? '') {
      const w = /[^\x00-\x7F]/.test(ch) ? 2 : 1;
      if (n + w > max) break;
      n += w; out += ch;
    }
    return out;
  }

  // ===== IME (中文組字) =====
  onCompositionStart(): void { this.isComposing = true; }
  onCompositionEnd(e: Event): void { this.isComposing = false; this.onInputChange(e); }

// ===== 即時截斷 + 上限提示 =====
onInputChange(event: Event): void {
  if (this.isComposing) return;

  const el = event.target as HTMLInputElement | null;
  let value = el?.value ?? this.control.value ?? '';

  // 先預設沒到上限
  this.atMaxLength = false;

  if (this.weightedMax != null) {
    // varchar 規則：中=2、英=1
    const len = this.weightedLen(value);
    if (len > this.weightedMax) {
      value = this.trimToWeighted(value, this.weightedMax);
    }
    this.atMaxLength = len >= this.weightedMax;   // ✅ 到上限就顯示提示
  } else if (this.maxLength != null) {
    // nvarchar 規則：每字 1
    if (value.length > this.maxLength) {
      value = value.slice(0, this.maxLength);
    }
    this.atMaxLength = value.length >= this.maxLength; // ✅ 到上限就顯示提示
  }

  if (el && el.value !== value) el.value = value;
  if (this.control.value !== value) {
    this.control.setValue(value, { emitEvent: false });
  }

  if (this.copyControl) {
    this.copyControl.setValue(this.control.value, { emitEvent: false });
  }
  this.inputChange.emit(event);
}

  onClick(): void {
    this.clickButton.emit();
  }
}
