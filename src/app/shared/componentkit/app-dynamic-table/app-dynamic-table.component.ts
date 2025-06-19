import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Column } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-app-dynamic-table',

  templateUrl: './app-dynamic-table.component.html',
  styleUrl: './app-dynamic-table.component.scss'
})
export class AppDynamicTableComponent {
  @Input() formArray!: FormArray<FormGroup>; // 使用 ! 表示此屬性一定會被賦值
  @Input() columns: Column[] = []; // 表格欄位設定
  @Input() dropdownOptions: { [key: string]: any[] } = {}; // 下拉選單選項
  @Input() submitted: boolean = false; // 表單是否已提交，用於驗證
  @Output() addRow = new EventEmitter<void>(); // 新增行事件
  @Output() removeRow = new EventEmitter<number>(); // 刪除行事件

  constructor(private fb: FormBuilder) { }

  getControl(index: number, field: string): any {
    return this.formArray.at(index).get(field); // 獲取指定行的欄位控制項
  }

  onAddRow() {
    this.addRow.emit(); // 觸發新增行
  }

  onRemoveRow(index: number) {
    this.removeRow.emit(index); // 觸發刪除行
  }
}
