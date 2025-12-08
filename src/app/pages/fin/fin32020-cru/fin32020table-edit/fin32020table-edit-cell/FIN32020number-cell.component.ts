import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { FIN32020CellInput } from './FIN32020table-edit-cell.model';

@Component({
  selector: 'app-number-cell',
  template: `
    <p-iconField iconPosition="right">
      <p-inputNumber class="min-w-max w-full" mode="decimal"
                     [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                     [ngModelOptions]="{ standalone: true }"
                     [placeholder]="
                     isDisabled() ? '' :cellInput.col.placeholder ? cellInput.col.placeholder : '請輸入' + cellInput.col.header
                     "
                     [min]="cellInput.col.min" [max]="cellInput.col.max"
                     [disabled]="isDisabled()"
                     (onInput)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index)"
                     [minlength]="cellInput.col.minLength || null"
                     [maxlength]="cellInput.col.maxLength || null"
                     [minFractionDigits]="cellInput.col.minFractionDigits"
                     [maxFractionDigits]="cellInput.col.maxFractionDigits"
                     (onFocus)="cellInput.col.onFocus?.(cellInput.rowData, cellInput.rowData[cellInput.col.field], cellInput.col, cellInput.index)"
                     (onBlur)="handleBlur()"
                     [style]="{'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                     [inputStyle]="{'width': cellInput.col.width}"
                     [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
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
    InputNumberModule, // 隔離 InputNumberModule
    IconFieldModule,
    InputIconModule,
    TooltipModule // 需確保這個模組被引入
  ]
})
export class FIN32020NumberCellComponent {
  @Input({ required: true }) cellInput!: FIN32020CellInput;

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleBlur() {
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
    // 執行一次 onValueChange 以觸發最終驗證
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }
}
