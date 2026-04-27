import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

const FORMAT_RULES: Record<string, { lengths: number[], chars: string[] }> = {
  'yy/mm/dd': { lengths: [4, 7], chars: ['/', '/'] }, // YYYY/MM/DD
  'yy/mm': { lengths: [4], chars: ['/'] },           // YYYY/MM
};

@Component({
  selector: 'app-date-cell',
  host: { 'table-edit-id': '複製時請自行取唯一名' },
  template: `
  <p-iconField iconPosition="right">
    <p-calendar
      class="flex w-full"
      styleClass="w-full"
      [(ngModel)]="cellInput.rowData[cellInput.col.field]"
      [ngModelOptions]="{ standalone: true }"
      [placeholder]="isDisabled() ? '' : '請輸入' + cellInput.col.header"
      [timeOnly]="cellInput.col.timeOnly || false"
      [showTime]="cellInput.col.showTime || false"
      [hourFormat]="cellInput.col.hourFormat || '24'"
      [showSeconds]="cellInput.col.showSeconds"
      [view]="cellInput.col.view || 'date'"
      [dateFormat]="cellInput.col.dateFormat || 'yy/mm/dd'"
      iconDisplay="input"
      [minDate]="cellInput.col.minDate"
      [maxDate]="cellInput.col.maxDate"
      [appendTo]="'body'"
      [showIcon]="!isDisabled()"
      [disabled]="isDisabled()"
      (onSelect)="handleSelect()"
      (onFocus)="cellInput.col.onFocus?.(cellInput.rowData, cellInput.rowData[cellInput.col.field], cellInput.col, cellInput.index)"
      (onBlur)="handleBlur($event)"
      (onInput)="onInput($event)"
      (keydown.enter)="handleEnter($event)"
      [style]="{
        'width': cellInput.col.width,
        'text-align': cellInput.col.textAlign
      }"
      [inputStyle]="{
        'width': '100%',
        'text-align': cellInput.col.textAlign || 'left'
      }"
      [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
      [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }">

      <ng-template pTemplate="inputicon">
        <i *ngIf="cellInput.col.timeOnly || false" class="pi pi-clock pointer-events-none"></i>
        <i *ngIf="!cellInput.col.timeOnly || false" class="pi pi-calendar pointer-events-none"></i>
      </ng-template>
    </p-calendar>
  </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule, // 隔離 CalendarModule
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class DateCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }
  // 1. 處理輸入時自動補斜線
  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const dateFormat = this.cellInput.col.dateFormat || 'yy/mm/dd';
    const config = FORMAT_RULES[dateFormat];

    if (!config || event.inputType === 'deleteContentBackward') {
      return;
    }

    // 處理貼上或一次輸入多個字元
    if (event.inputType === 'insertFromPaste' || (event.data && event.data.length > 1)) {
      input.value = this.formatFullString(value, dateFormat);
      return;
    }

    // 自動補位邏輯
    const index = config.lengths.indexOf(value.length);
    if (index !== -1) {
      const charToAppend = config.chars[index];
      if (value.charAt(value.length - 1) !== charToAppend) {
        if (!/[！-～　]/.test(value)) { // 排除全形
          input.value = value + charToAppend;
        }
      }
    }
  }
  handleBlur(event?: any) {
    const input = event?.target as HTMLInputElement;
    if (input && input.value) {
      const dateFormat = this.cellInput.col.dateFormat || 'yy/mm/dd';
      const completedValue = this.fillIncompleteDate(input.value, dateFormat);

      if (completedValue !== input.value) {
        const dateValue = new Date(completedValue);
        if (!isNaN(dateValue.getTime())) {
          this.cellInput.rowData[this.cellInput.col.field] = dateValue;
          input.value = completedValue;
        }
      }
    }

    // 呼叫原本的 handleBlur 邏輯
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }

  // --- 輔助私有方法 (從提供範例移植) ---

  private formatFullString(value: string, format: string): string {
    const nums = value.replace(/\D/g, '');
    if (format === 'yy/mm/dd' && nums.length >= 8) {
      return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)}`;
    }
    if (format === 'yy/mm' && nums.length >= 6) {
      return `${nums.substring(0, 4)}/${nums.substring(4, 6)}`;
    }
    return value;
  }

  private fillIncompleteDate(value: string, format: string): string {
    const nums = value.replace(/\D/g, '');
    if (format === 'yy/mm/dd') {
      if (nums.length === 4) return `${nums}/01/01`;
      if (nums.length === 6) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/01`;
    }
    if (format === 'yy/mm') {
      if (nums.length === 4) return `${nums}/01`;
    }
    return value;
  }

  // 使用滑鼠在行事曆中選日期時，立即視為一次完成輸入
  handleSelect() {
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }
  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    // event.stopPropagation(); // !!!客戶需求禁止加上這段
    this.handleBlur();
  }
}
