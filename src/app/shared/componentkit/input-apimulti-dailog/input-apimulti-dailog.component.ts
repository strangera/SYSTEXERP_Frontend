import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-input-apimulti-dailog',
  templateUrl: './input-apimulti-dailog.component.html',
  styleUrl: './input-apimulti-dailog.component.scss'
})
export class InputAPIMultiDailogComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() filterFields: any = [];
  @Input() searchplaceholder: string = '輸入代碼, 名稱';

  visible: boolean = false;
  selectedValueID: number = 0;
  selectedValueMajor: string = '';
  selectedValueMinor: string = '';
  selectedItem: any = null;

  queryForm = this.formBuilder.group({
    code: [''], // 綁定代碼
    name: [''], // 綁定名稱
  });

  constructor(
    private formBuilder: FormBuilder,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    //this.setPlaceholder('輸入文字', this.control);
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


  onSubmit(frm: FormGroup, table: Table) {
    console.log(frm.value);
    this.submitted = true;

    if (frm.valid ) {
      const queryParams = frm.value;
      // 動態過濾表格數據 (本地過濾)
      if (table) {
        Object.keys(queryParams).forEach((field) => {
          const value = queryParams[field];
          if (value) {
            table.filter(value, field, 'contains'); // 使用 PrimeNG 過濾 API
          }
        });
      }
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }
  }
}
