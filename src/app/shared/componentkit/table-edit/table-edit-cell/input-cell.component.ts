import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-input-cell',
  template: `
      <p-iconField iconPosition="right">
          <input pInputText class="min-w-max" [placeholder]="'請輸入' + cellInput.col.header"
                 [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                 [ngModelOptions]="{ standalone: true }"
                 [disabled]="(cellInput.col.disabled && cellInput.col.disabled(cellInput.rowData[cellInput.col.field], cellInput.index, cellInput.rowData)) || cellInput.disabled"
                 (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
                 [maxlength]="cellInput.col.maxLength || null"
                 [style]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                 [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
                 (blur)="handleBlur()"
                 [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }" />
        <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     styleClass="pi pi-exclamation-circle text-red-500"
                     [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     tooltipPosition="bottom" />
      </p-iconField>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    KeyFilterModule, // 這裡引入 KeyFilter
    IconFieldModule,
    InputIconModule,
    TooltipModule
    // 必須引入 TooltipModule 才能使用 pTooltip
    // 為了簡潔，這裡假設 pTooltip 已在 TableEditComponent 的 imports 中
  ]
})
export class InputCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  // 將原本在 TableEditComponent.ts 的 percentKeyFilter 搬過來
  public readonly percentKeyFilter = /^(100(\.0{1,2})?|(\d{1,2})(\.\d*)?)$/;

  handleBlur() {
    // 執行原來的 onBlur 邏輯
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
    // 觸發一次 value change (確保 blur 後的狀態更新與驗證)
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }
}
