import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-input-cell',
  host: { 'table-edit-id': 'FIN53010-CRU' },
  template: `
    <ng-container [ngSwitch]="cellInput.col.type">
      <p-iconField iconPosition="right">
        <ng-container *ngSwitchCase="'input'">
          <input type="text"
                 class="min-w-max p-inputtext p-component p-element"
                 [placeholder]="isDisabled() ? '' : (isReadonly() ? '雙擊選取' : (cellInput.col.placeholder ?? '請輸入' + cellInput.col.header))"
                 [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                 [ngModelOptions]="{ standalone: true }"
                 [disabled]="isDisabled()"
                 [readonly]="isReadonly()"
                 (ngModelChange)="cellInput.onValueChange(cellInput.rowData, $event, cellInput.col, cellInput.index)"
                 [maxlength]="cellInput.col.maxLength || null"
                 [style]="{'width': cellInput.col.width || '100%', 'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                 (focus)="handleFocus()"
                 (blur)="handleBlur()"
                 (dblclick)="handleDblClick()"
                 (keydown.enter)="handleEnter($event)"
                 (input)="onInput()"
                 [ngClass]="{
                   'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field],
                   'p-filled': isInputFilled(),
                   'p-variant-filled': cellInput.rowData._isAutoInsertCandidate
                 }" />
        </ng-container>

        <p-inputIcon *ngIf="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     styleClass="pi pi-exclamation-circle text-red-500"
                     [pTooltip]="cellInput.rowData._validationErrors?.[cellInput.col.field]"
                     tooltipPosition="bottom" />
      </p-iconField>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class InputCellComponent {
  @Input({ required: true }) cellInput!: CellInput;

  private readonly cdr = inject(ChangeDetectorRef);

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  isReadonly(): boolean {
    const col = this.cellInput.col;
    return !!(col.readonly && col.readonly(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData));
  }

  /** 對齊 PrimeNG pInputText 的 filled 狀態（有值時套用 p-filled） */
  isInputFilled(): boolean {
    const v = this.cellInput.rowData[this.cellInput.col.field];
    if (v == null || v === '') return false;
    if (typeof v === 'string') return v.length > 0;
    if (typeof v === 'number' || typeof v === 'boolean') return true;
    return String(v).length > 0;
  }

  onInput(): void {
    this.cdr.markForCheck();
  }

  handleFocus() {
    this.cellInput.col.onFocus?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }

  handleDblClick() {
    this.cellInput.col.onDblClick?.(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }

  handleBlur() {
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
  handleEnter(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.handleBlur();
  }
}
