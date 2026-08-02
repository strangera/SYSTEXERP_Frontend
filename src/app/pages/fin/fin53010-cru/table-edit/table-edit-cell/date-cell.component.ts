import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CellInput } from './table-edit-cell.model';

@Component({
  selector: 'app-date-cell',
  host: { 'table-edit-id': 'FIN53010-CRU' },
  template: `
    <p-iconField iconPosition="right">
      <p-calendar class="min-w-max" [(ngModel)]="cellInput.rowData[cellInput.col.field]"
                  [ngModelOptions]="{ standalone: true }" [placeholder]="isDisabled() ? '' : '請輸入' + cellInput.col.header"
                  [timeOnly]="cellInput.col.timeOnly || false" [showTime]="cellInput.col.showTime || false"
                  [hourFormat]="cellInput.col.hourFormat || '24'" [showSeconds]="cellInput.col.showSeconds"
                  [view]="cellInput.col.view || 'date'" [dateFormat]="cellInput.col.dateFormat || 'yy/mm/dd'"
                  iconDisplay="input" [minDate]="cellInput.col.minDate" [maxDate]="cellInput.col.maxDate" [appendTo]="'body'"
                  [showIcon]="!isDisabled()"
                  [disabled]="isDisabled()"
                  (onInput)="cellInput.onValueChange(cellInput.rowData, $event.value, cellInput.col, cellInput.index)"
                  (onSelect)="handleSelect()"
                  (onFocus)="cellInput.col.onFocus?.(cellInput.rowData, cellInput.rowData[cellInput.col.field], cellInput.col, cellInput.index)"
                  (onBlur)="handleBlur()"(keydown.enter)="handleEnter($event)"
                  [style]="{'text-align': cellInput.col.textAlign,'min-width':'-webkit-fill-available'}"
                  [inputStyle]="{'width': cellInput.col.width, 'text-align': cellInput.col.textAlign || 'left'}"
                  [variant]="cellInput.rowData._isAutoInsertCandidate ? 'filled' : 'outlined'"
                  [ngClass]="{'ng-invalid ng-dirty': cellInput.rowData._validationErrors?.[cellInput.col.field] }">
        <ng-template pTemplate="inputicon">
          <i *ngIf="cellInput.col.timeOnly || false" class="pi pi-clock pointer-events-none"></i>
          <i *ngIf="!cellInput.col.timeOnly || false" class="pi pi-calendar pointer-events-none"></i>
        </ng-template>
      </p-calendar>
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
    CalendarModule, // 隔離 CalendarModule
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ]
})
export class DateCellComponent implements AfterViewInit {
  @Input({ required: true }) cellInput!: CellInput;
  @ViewChild(Calendar) private readonly calendar?: Calendar;

  ngAfterViewInit(): void {
    // p-calendar 動態建立（ngComponentOutlet）時，[dateFormat] 綁定可能晚於 PrimeNG 初次格式化輸入框，
    // 使 view='month' 的欄位改用全域預設 'yy/mm/dd' 而多帶「日」（例：申報年月 2026/08 顯示成 2026/08/01）。
    // view 就緒後 dateFormat 已確定套用，重跑一次格式化即可讓月份欄位正確顯示成 yy/mm。
    this.calendar?.updateInputfield();
  }

  isDisabled(): boolean {
    const col = this.cellInput.col;
    return (col.disabled && col.disabled(this.cellInput.rowData[col.field], this.cellInput.index, this.cellInput.rowData)) || this.cellInput.disabled;
  }

  handleSelect() {
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      this.cellInput.rowData[this.cellInput.col.field],
      this.cellInput.col,
      this.cellInput.index
    );
  }

  handleBlur() {
    const val = this.cellInput.rowData[this.cellInput.col.field];
    this.cellInput.col.onBlur?.(
      this.cellInput.rowData,
      val,
      this.cellInput.col,
      this.cellInput.index
    );
    this.cellInput.onValueChange(
      this.cellInput.rowData,
      val,
      this.cellInput.col,
      this.cellInput.index
    );
  }
  handleEnter(event: Event) {
    event.preventDefault(); // 阻止表單提交
    event.stopPropagation(); // 阻止事件冒泡
    this.handleBlur();
  }
}
