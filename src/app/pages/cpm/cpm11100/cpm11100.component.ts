import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Cpm11100Service } from './../../../service/api/cpm/cpm11100.service';


// 財產變更記錄查詢
export interface cpm11100 {
  ROW_NO: number; // 行號
  TLT_NO: string; // 專櫃編號
  TLT_NAME: string; // 專櫃名稱
  BUS_TYPE_NAME: string; // 大分類
  FLOOR_DESC: string; // 樓層
  TLT_FLOOR: string; // 平面圖
  LOCATION_NO: string; // 位置
  TLT_OPENFLAG: string; // 營運狀態
  TLT_OPENSTATUS: string; // 營運狀態說明
}

// CPM11000-全館店櫃資訊查詢
@Component({
  selector: 'app-cpm11100',
  standalone: true,
  templateUrl: './cpm11100.component.html',
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class Cpm11100Component extends BasicQueryPageComponent<cpm11100> implements OnInit {
  // 查詢 (Hugo
  // "觀看平面圖功能可參考TLS12050
  queryForm = this.formBuilder.group({
    KEYWORD: ["", [Validators.maxLength(100)]], // 專櫃品牌
    TLT_OPENFLAG: [null, [Validators.maxLength(1)]], // 營運狀態 (NULL=全部、0=已撤櫃、1=營運中)

    //分頁查詢
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: cpm11100[] = [];
  columns: Column[] = [
    // { field: 'ROW_NO', header: '行號', visible: false },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'TLT_NAME', header: '專櫃名稱' },
    { field: 'BUS_TYPE_NAME', header: '大分類' },
    { field: 'FLOOR_DESC', header: '樓層' },
    { field: 'TLT_FLOOR', header: '平面圖' },
    { field: 'LOCATION_NO', header: '位置' },
    { field: 'TLT_OPENFLAG', header: '營運狀態代碼' },
    { field: 'TLT_OPENSTATUS', header: '營運狀態名稱' },
  ];

  selectedItems: cpm11100[] = [];// 多選項目

  TLT_OPENFLAG_OPTIONS: { value: string; label: string }[] = [
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營運中' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private readonly cpm11100Service: Cpm11100Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11100', 'CPM/CPM11100cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('全館店櫃request:', JSON.stringify(frm.value, null, 2));
      this.loading = false;
      this.cpm11100Service.queryCPM11100(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  // 讀取 下拉
  loadOptions() {
    console.log('讀取下拉選項');
  }
}
