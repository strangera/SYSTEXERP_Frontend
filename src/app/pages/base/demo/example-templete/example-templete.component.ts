import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, Validators } from '@angular/forms';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-example-templete',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    TableComponent
  ],
  templateUrl: './example-templete.component.html',
})
export class ExampleTempleteComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    field: ['', Validators.required],
    ...createPaginationConfig([{ field: 'field', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0; // 總記錄數
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {}; // 用於儲存選中的項目
  columns: Column[] = [
    { field: 'field', header: '欄位' }, // 欄位定義
  ];
  constructor() {
    super();
  }
  ngOnInit(): void {
    // 初始化頁面，設置查詢表單和其他必要的配置
    this.initializePage('exampleProgNo', 'exampleCruPage', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => { // 提交表單後的處理
      console.log('Dropdown form submitted with values:', frm.value);
    });
  }
}

