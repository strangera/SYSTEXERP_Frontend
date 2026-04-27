// ... (保留所有原本的 import)
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { TableUtilityService } from '../services/table-edit-utility.service'; // 🎯 引入服務
import { EditColumn } from '../table-edit.model';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-template-cell',
  host: { 'table-edit-id': 'FIN53010-CRU' },
  template: `
<div class="input-wrapper" [attr.data-suffix]="cellInput.col.suffix">
      <input
        pInputText
        readonly
        class="w-full min-w-max cursor-pointer"
        [placeholder]="isDisabled() ? '' : '請選擇' + (cellInput.col.header || '')"
        [value]="templateDisplayValue(cellInput.rowData, cellInput.col)"
        [disabled]="isDisabled()"
        (click)="displayDialog = true"
      />
    </div>

    <p-dialog
      [(visible)]="displayDialog"
      [header]="'選擇' + (cellInput.col.header || '')"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '50vw' }"
      [breakpoints]="{ '960px': '75vw', '641px': '95vw' }"
      appendTo="body">

      <ng-container *ngIf="displayDialog">
        <ng-container *ngTemplateOutlet="cellInput.col.templateRef!; context: {
          $implicit: cellInput.rowData,
          col: cellInput.col,
          overlayPanel: dialogRef
        }"></ng-container>
      </ng-container>
    </p-dialog>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    OverlayPanelModule,
    TooltipModule,
    DialogModule
  ]
})
export class TemplateCellComponent {
  @Input({ required: true }) cellInput!: CellInput;
  displayDialog = false; // 控制彈窗顯示
  protected readonly tableUtilityService = inject(TableUtilityService);
  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }
  /**
   * 處理 Template input 顯示的值
   * @param rowData 當前行資料
   * @param col 欄位配置
   * @returns 顯示用的字串
   */
  public templateDisplayValue(rowData: any, col: EditColumn): string {
    // 邏輯直接從 TableEditComponent 搬過來
    const displayField = col.templateDisplayField;
    return displayField ? rowData[displayField] : rowData[col.field] || '';
  }

  // 模擬原本 overlayPanel 的介面，讓外部 template 不需要改 code 就能呼叫 .hide()
  dialogRef = {
    hide: () => this.displayDialog = false
  };
}
