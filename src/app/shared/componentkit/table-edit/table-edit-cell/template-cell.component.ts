// ... (保留所有原本的 import)
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewChild, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { TableUtilityService } from '../table-edit-utility.service'; // 🎯 引入服務
import { EditColumn } from '../table-edit.model';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-template-cell',
  template: `
    <div class="input-wrapper" [attr.data-suffix]="cellInput.col.suffix">
      <input pInputText readonly class="w-full min-w-max" [placeholder]="'請選擇' + (cellInput.col.header || '')"
             [value]="templateDisplayValue(cellInput.rowData, cellInput.col)"
             [disabled]="cellInput.disabled"
             (click)="overlayPanel.show($event)" />
      </div>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    OverlayPanelModule,
    TooltipModule
  ]
})
export class TemplateCellComponent {
  @Input({ required: true }) cellInput!: CellInput;
  @ViewChild('overlayPanel') overlayPanel!: OverlayPanel;
  protected readonly tableUtilityService = inject(TableUtilityService);

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
}
