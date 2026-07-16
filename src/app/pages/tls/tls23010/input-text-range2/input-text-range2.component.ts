import { NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule, KeyFilterPattern } from 'primeng/keyfilter';

import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { InputTextService } from '../../../../shared/components/input-text/input-text.service';

@Component({
  selector: 'app-input-text-range2',
  templateUrl: './input-text-range2.component.html',
  styleUrl: './input-text-range2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    // NgClass,
    NgStyle,
    FormsModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputTextModule,
    KeyFilterModule,
  ],
  hostDirectives: [FieldStateDirective],
})
export class InputTextRange2Component implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  // ===== 標籤/基本 =====
  @Input() label = '';
  @Input() showLabel = true;

  @Input() startLabel: string = '起';
  @Input() endLabel: string = '迄';

  @Input() controlName = '';
  @Input() startControlName = '';
  @Input() endControlName = '';

  @Input() startControl = new FormControl();
  @Input() endControl = new FormControl();
  @Input() submitted = false;

  // ===== 自訂屬性 =====
  @Input() errorForGroup = false;

  // ===== placeholder =====
  @Input() customPlaceholderStart?: string;
  @Input() customPlaceholderEnd?: string;

  // ===== readonly/disabled =====
  @Input() readonly = false;
  @Input() disabled = false;

  // ===== 文字對齊 =====
  @Input() textAlign: 'left' | 'center' | 'right' = 'left';

  // ===== keyFilter（PrimeNG） =====
  @Input() keyFilter: KeyFilterPattern | RegExp | undefined;

  // ✅ 父元件可限制字數（可共用也可分開）
@Input() rangeMaxLength: number | null = null;        // start/end 共用
@Input() rangeMaxLengthStart: number | null = null;   // start 單獨
@Input() rangeMaxLengthEnd: number | null = null;     // end 單獨

  // ✅ 是否 trim（預設 true）
  @Input() trim = true;

  // ✅ 是否只保留數字（預設 false；交易序號可設 true）
  @Input() digitsOnly = false;

  // ✅ weightedMax（加權長度；共用或分開）
  @Input() weightedMax: number | null = null;
  @Input() weightedMaxStart: number | null = null;
  @Input() weightedMaxEnd: number | null = null;

  // ✅ 自動補零（共用或分開）
  @Input() autoPadZero = false;
  @Input() autoPadZeroStart: boolean | null = null;
  @Input() autoPadZeroEnd: boolean | null = null;

  @Input() padLength = 16;
  @Input() padLengthStart: number | null = null;
  @Input() padLengthEnd: number | null = null;

  @Input() padOnBlur = true;
  @Input() padOnBlurStart: boolean | null = null;
  @Input() padOnBlurEnd: boolean | null = null;

  // ===== 事件 =====
  @Output() startChange = new EventEmitter<string>();
  @Output() endChange = new EventEmitter<string>();
  @Output() startBlur = new EventEmitter<string>();
  @Output() endBlur = new EventEmitter<string>();

  // ===== IME 狀態 =====
  private isComposingStart = false;
  private isComposingEnd = false;

  // 顯示用：是否到達最大長度
  atMaxLengthStart = false;
  atMaxLengthEnd = false;

  constructor(private inputTextService: InputTextService) {
  }

  ngOnInit(): void {
    this.fieldState.checkRequiredValidator(this.startControl, 0);
    this.fieldState.checkRequiredValidator(this.endControl, 1);

    if (this.disabled) {
      this.startControl.disable({ emitEvent: false });
      this.endControl.disable({ emitEvent: false });
    }
  }

  // ========= helpers =========
private resolveMaxLen(which: 'start' | 'end'): number | undefined {
  const n = which === 'start' ? this.rangeMaxLengthStart : this.rangeMaxLengthEnd;

  const use =
    (n != null && Number.isFinite(n as any) ? Number(n) : null) ??
    (this.rangeMaxLength != null && Number.isFinite(this.rangeMaxLength as any) ? Number(this.rangeMaxLength) : null);

  return use != null && use >= 0 ? use : undefined;
}

  private resolveWeightedMax(which: 'start' | 'end'): number | null {
    const w = which === 'start' ? this.weightedMaxStart : this.weightedMaxEnd;
    if (w != null && Number.isFinite(w as any)) return Number(w);
    if (this.weightedMax != null && Number.isFinite(this.weightedMax as any)) return Number(this.weightedMax);
    return null;
  }

  private resolveAutoPadZero(which: 'start' | 'end'): boolean {
    const v = which === 'start' ? this.autoPadZeroStart : this.autoPadZeroEnd;
    if (v === true) return true;
    if (v === false) return false;
    return !!this.autoPadZero;
  }

  private resolvePadLength(which: 'start' | 'end'): number {
    const v = which === 'start' ? this.padLengthStart : this.padLengthEnd;
    const use = v != null && Number.isFinite(v as any) ? Number(v) : Number(this.padLength);
    return use > 0 ? use : 0;
  }

  private resolvePadOnBlur(which: 'start' | 'end'): boolean {
    const v = which === 'start' ? this.padOnBlurStart : this.padOnBlurEnd;
    if (v === true) return true;
    if (v === false) return false;
    return !!this.padOnBlur;
  }

  private normalize(value: string, which: 'start' | 'end'): { value: string; atMax: boolean } {
    let s = value ?? '';

    if (this.trim) s = s.trim();
    if (this.digitsOnly) s = s.replace(/\D+/g, '');

    // autoPadZero：即時只允許數字 & 限制 padLength
    const autoPad = this.resolveAutoPadZero(which);
    const padLen = this.resolvePadLength(which);

    let atMax = false;

    if (autoPad) {
      s = s.replace(/\D/g, '');
      if (padLen > 0 && s.length > padLen) {
        s = s.slice(0, padLen);
        atMax = true;
      }
    }

    // weightedMax（加權長度）
    const w = this.resolveWeightedMax(which);
    if (w !== null) {
      const { trimmedValue, isMaxLength } = this.inputTextService.trimToWeighted(s, w);
      s = trimmedValue;
      atMax = atMax || isMaxLength;
      return { value: s, atMax };
    }

    // 一般 maxLength（start/end）
    const maxLen = this.resolveMaxLen(which);
    if (maxLen != null && s.length > maxLen) {
      s = s.slice(0, maxLen);
      atMax = true;
    }

    return { value: s, atMax };
  }

  private syncToControl(
    which: 'start' | 'end',
    control: FormControl,
    inputEl: HTMLInputElement,
    nextValue: string
  ) {
    if (control.value !== nextValue) {
      control.setValue(nextValue, { emitEvent: false });
      control.markAsDirty();
    }
    if (inputEl.value !== nextValue) {
      inputEl.value = nextValue;
    }
  }

  // ========= IME =========
  onCompositionStart(which: 'start' | 'end') {
    if (which === 'start') this.isComposingStart = true;
    else this.isComposingEnd = true;
  }

  onCompositionEnd(which: 'start' | 'end', event: Event) {
    if (which === 'start') this.isComposingStart = false;
    else this.isComposingEnd = false;

    this.onInput(which, event);
  }

  // ========= input：邊打邊刪 =========
  onInput(which: 'start' | 'end', event: Event) {
    if (this.readonly) return;

    const isComposing = which === 'start' ? this.isComposingStart : this.isComposingEnd;
    if (isComposing) return;

    const inputEl = event.target as HTMLInputElement;
    const raw = inputEl?.value ?? '';

    const { value, atMax } = this.normalize(raw, which);

    if (which === 'start') {
      this.atMaxLengthStart = atMax;
      this.syncToControl('start', this.startControl as FormControl, inputEl, value);
      this.startChange.emit(value);
    } else {
      this.atMaxLengthEnd = atMax;
      this.syncToControl('end', this.endControl as FormControl, inputEl, value);
      this.endChange.emit(value);
    }
  }

  // ========= blur：補零 + trim =========
  onBlur(which: 'start' | 'end', event: FocusEvent) {
    const inputEl = event.target as HTMLInputElement;
    let v = (inputEl?.value ?? '');

    if (this.trim) v = v.trim();

    const autoPad = this.resolveAutoPadZero(which);
    const padLen = this.resolvePadLength(which);
    const doPadOnBlur = this.resolvePadOnBlur(which);

    if (!this.readonly && autoPad && doPadOnBlur) {
      // 補零前先確保純數字
      v = v.replace(/\D/g, '');
      if (v && padLen > 0 && v.length < padLen) {
        v = v.padStart(padLen, '0');
      }
    }

    // blur 也做一次 normalize（確保最大長度/加權長度/數字等一致）
    const normalized = this.normalize(v, which).value;

    if (which === 'start') {
      this.syncToControl('start', this.startControl as FormControl, inputEl, normalized);
      this.startBlur.emit(normalized);
    } else {
      this.syncToControl('end', this.endControl as FormControl, inputEl, normalized);
      this.endBlur.emit(normalized);
    }
  }

  // ========= class =========
  getStartInputClasses(): string {
    const classes = ['w-full'];
    if ((this.submitted && this.startControl.errors) || (this.errorForGroup && this.startControl.parent?.errors)) {
      classes.push('ng-invalid', 'ng-dirty');
    }
    return classes.join(' ');
  }

  getEndInputClasses(): string {
    const classes = ['w-full'];
    if ((this.submitted && this.endControl.errors) || (this.errorForGroup && this.endControl.parent?.errors)) {
      classes.push('ng-invalid', 'ng-dirty');
    }
    return classes.join(' ');
  }

  // 給 template 設 maxlength 用（若 weightedMax 存在就不要設，避免跟加權長度衝突）
  getMaxAttr(which: 'start' | 'end'): number | null {
    const w = this.resolveWeightedMax(which);
    if (w !== null) return null;

    const autoPad = this.resolveAutoPadZero(which);
    if (autoPad) return this.resolvePadLength(which);

    const maxLen = this.resolveMaxLen(which);
    return maxLen ?? null;
  }

  getInputMode(which: 'start' | 'end'): string | null {
    const autoPad = this.resolveAutoPadZero(which);
    return autoPad ? 'numeric' : null;
  }

  getPattern(which: 'start' | 'end'): string | null {
    const autoPad = this.resolveAutoPadZero(which);
    return autoPad ? '[0-9]*' : null;
  }
}
