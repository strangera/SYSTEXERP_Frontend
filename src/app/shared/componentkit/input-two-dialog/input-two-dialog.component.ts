import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-input-two-dialog',
  templateUrl: './input-two-dialog.component.html',
  styleUrl: './input-two-dialog.component.scss'
})
export class InputTwoDialogComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() filterFields: any = [];

  visible: boolean = false;
  selectedValueID: number = 0;
  selectedValueMajor: string = '';
  selectedValueMinor: string = '';
  selectedItem: any = null;

  ngOnInit(): void {
    console.log(this.filterFields);
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('輸入文字', this.control);
    // IntLength
    this.checkIntLengthValidator(this.control);
  }

  showDialog() {
    this.visible = true;
  }

  onRowSelect(event: any) {
    this.selectedValueID = event.data.id;
    this.selectedValueMajor = event.data.code;
    this.selectedValueMinor = event.data.name;
    console.log(event);
    this.visible = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getVisibleColumns() {
    return this.columns.filter(col => col.visible);
  }
}
