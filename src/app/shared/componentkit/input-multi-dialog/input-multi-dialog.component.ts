import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-input-multi-dialog',
  templateUrl: './input-multi-dialog.component.html',
  styleUrls: ['./input-multi-dialog.component.scss']
})
export class InputMultiDialogComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() submitted: boolean = false;
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() filterFields: string[] = [];
  @Input() searchplaceholder: string = '輸入代碼, 名稱';

  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();

  visible: boolean = false;
  selectedValueMajor: string = '';
  selectedValueMinor: string = '';
  selectedItem: any = null;

  // 儲存每列篩選條件
  columnFilters: { [key: string]: string } = {};

  ngOnInit(): void {
    // 初始化每列的篩選條件
    this.columns.forEach(col => {
      this.columnFilters[col.field] = '';
    });
  }

  // 顯示對話框
  showDialog(): void {
    this.visible = true;
  }

  // 選擇表格行時觸發
  onRowSelect(event: any): void {
    this.selectedItem = event.data;
    this.selectedValueMajor = this.selectedItem.code;
    this.selectedValueMinor = this.selectedItem.name;
    this.onSelect.emit(this.selectedItem);
    if (this.control) {
      this.control.setValue(this.selectedValueMajor);
    }
    this.visible = false;
  }

  // 全域篩選
  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // 單列篩選
  onColumnFilter(event: any, field: string, table: Table): void {
    this.columnFilters[field] = event.target.value;
    table.filter(event.target.value, field, 'contains');
  }

  // 取得可見的表格欄位
  getVisibleColumns(): any[] {
    return this.columns.filter(col => col.visible);
  }
  
}
