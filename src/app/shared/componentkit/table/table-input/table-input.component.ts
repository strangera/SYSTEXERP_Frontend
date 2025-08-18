// table-input.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableUtilityService } from '../table-utility.service';
import { Column } from '../table.model';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-table-input',
  standalone: true,
  imports: [
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    CommonModule,
    PrimeTemplate,
    ImageModule
  ],
  templateUrl: './table-input.component.html',
  styles: [
    `
    .input-wrapper {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    .input-wrapper[data-suffix]:not([data-suffix=""]):after {
      content: attr(data-suffix);
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #6b7280;
      font-size: 0.875rem;
      z-index: 10;
    }
    :host ::ng-deep .input-wrapper input.p-inputtext[data-suffix]:not([data-suffix=""]) {
      padding-right: 40px;
    }
    `
  ]
})
export class TableInputComponent {
  // 接收父元件傳來的資料與欄位設定
  @Input() col!: Column;
  @Input() rowData: any;
  @Input() rowIndex!: number;
  @Input() alwaysEdit = false;
  @Input() disabled = false;

  // 輸出事件，通知父元件資料已變動或失去焦點
  @Output() fieldChange = new EventEmitter<{ field: string, value: any, rowIndex?: number; }>();
  @Output() fieldBlur = new EventEmitter<{ field: string, value: any; }>();
  @Output() filterChange = new EventEmitter<AutoCompleteCompleteEvent>();

  constructor(private tableUtilityService: TableUtilityService) { }

  // 處理 ngModelChange 事件，並發送給父元件
  onValueChange(value: any) {
    this.fieldChange.emit({ field: this.col.field, value: value, rowIndex: this.rowIndex });
  }

  // 處理 onBlur 事件，並發送給父元件
  onBlur() {
    this.fieldBlur.emit({ field: this.col.field, value: this.rowData[this.col.field] });
  }

  // 處理 AutoComplete 的過濾事件，並發送給父元件
  onFilterComplete(event: AutoCompleteCompleteEvent) {
    this.filterChange.emit(event);
  }

  // 處理 Dropdown/AutoComplete 的選項來源
  getOptions() {
    return typeof this.col.options === 'function' ? (this.col.options(this.rowData) || undefined) : this.col.options || undefined;
  }
}
