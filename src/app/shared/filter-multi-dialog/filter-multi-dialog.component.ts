import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-filter-multi-dialog',
  templateUrl: './filter-multi-dialog.component.html',
  styleUrls: ['./filter-multi-dialog.component.scss'],
})
export class FilterMultiDialogComponent implements OnInit {
  @Input() label: string = ''; // 動態標題
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() submitted: boolean = false;
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() searchFields: { field: string; placeholder: string }[] = [];
  @Input() searchPlaceholder: string = '輸入代碼, 名稱';

  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();

  visible: boolean = false;
  selectedValueMajor: string = ''; // 儲存 code
  selectedValueMinor: string = ''; // 儲存 name
  selectedItem: any = null;

  // 多列查詢表單
  searchForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    // 初始化多列查詢表單
    this.searchFields.forEach(field => {
      this.searchForm.addControl(field.field, new FormControl(''));
    });
  }

  // 顯示對話框
  showDialog(): void {
    this.visible = true;
  }

  // 選擇表格行時觸發
  onRowSelect(event: any): void {
    this.selectedItem = event.data;
    this.selectedValueMajor = this.selectedItem.code; // 獲取 code
    this.selectedValueMinor = this.selectedItem.name; // 獲取 name
    this.onSelect.emit(this.selectedItem); // 將選中項目發送給父元件
    if (this.control) {
      this.control.setValue(this.selectedValueMajor);
    }
    this.visible = false; // 關閉對話框
  }

  // 單列篩選
  onSearch(table: Table): void {
    Object.keys(this.searchForm.value).forEach(field => {
      const value = this.searchForm.value[field];
      table.filter(value, field, 'contains');
    });
  }

  // 清除篩選條件
  onClear(table: Table): void {
    this.searchForm.reset();
    table.clear();
  }

  // 取得可見的表格欄位
  getVisibleColumns(): any[] {
    return this.columns.filter(col => col.visible);
  }

  getFormControl(field: string): FormControl {
    const control = this.searchForm.get(field);
    if (!(control instanceof FormControl)) {
      throw new Error(`Control with field "${field}" is not a FormControl`);
    }
    return control;
  }
}
