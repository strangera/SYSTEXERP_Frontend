import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox'; // 🎯 引入 CheckboxModule
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { EditColumn } from '../table-edit.model'; // 引入 EditColumn 以獲取 Checkbox 相關屬性
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-checkbox-cell',
  host: { 'table-edit-id': '複製時請自行取唯一名' },
  template: `
    <div class="flex justify-content-center align-items-center h-full w-full">
      <p-checkbox
        [(ngModel)]="cellInput.rowData[cellInput.col.field]"
        [ngModelOptions]="{ standalone: true }"
        [disabled]="isDisabled()"
        [label]="cellInput.col.label"

        [binary]="getBinary()"
        [trueValue]="cellInput.col.trueValue ?? true"
        [falseValue]="cellInput.col.falseValue ?? false"

        [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
        [ngClass]="{
          'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field]
        }"
        (onChange)="onCheckboxChange($event)"
        (keydown.enter)="handleEnter($event)"
      />

      <span *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
            class="pi pi-exclamation-circle text-red-500 ml-1 cursor-pointer"
            [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
            tooltipPosition="bottom">
      </span>
    </div>
  `,
  // 為了保持與其他輸入框元件風格一致，我們在父層使用 flex 佈局來居中 Checkbox
  styles: [`
    /* 確保單元格內容高度與其他輸入框一致 */
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%; /* 確保填滿父容器高度 */
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class CheckboxCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  // 將 col 斷言為 EditColumn 以便使用 Checkbox 屬性
  get col(): EditColumn {
    return this.cellInput.col;
  }

  /** 獲取 binary 屬性，預設為 true */
  getBinary(): boolean {
    // 預設 Checkbox 在單元格中就是二元模式
    return this.col.binary ?? true;
  }

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  onCheckboxChange(event: any): void {
    // Checkbox 的 onChange 事件會傳回一個 CheckboxChangeEvent
    // 但我們直接使用 ngModel 的最新值來觸發 onValueChange，更穩定
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field], // 傳遞 ngModel 已經更新的值
      this.cellInput.col,
      this.cellInput.index
    );
  }
  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    event.stopPropagation(); // 阻止事件冒泡
  }
}
