import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm13010Service, QueryCPM13010Request, QueryCPM13010Response } from '@service/api/cpm/cpm13010.service';
import { finalize } from 'rxjs';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { ButtonModule } from 'primeng/button';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-cpm13010',
  templateUrl: './cpm13010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule,
    InputNumberComponent,
    ButtonModule,
    NgStyle
  ],
})
// 5.11.7 專櫃停車費折抵設定作業
export class CPM13010Component extends BasicQueryPageComponent<QueryCPM13010Response> implements OnInit {
  queryForm = this.formBuilder.group({
    PKNG_DiscHour: [null, [Validators.max(999), Validators.min(0)]], // 折抵時數，允許小數一位
    PKNG_SaleAmt: [null, [Validators.max(99999999), Validators.min(0)]], // 消費金額，允許小數兩位
    ...createPaginationConfig([{ field: 'PKNG_SeqNo', order: 1 }]), // 預設依序號排序
  });

  totalRecords = 0;
  data: QueryCPM13010Response[] = [];
  selectedRows: QueryCPM13010Response[] = []; // 用於表格多選/刪除

  columns: Column[] = [
    { field: 'PKNG_SeqNo', header: '序號', visible: false },
    { field: 'PKNG_DiscHour', header: '折抵時數', visible: true },
    { field: 'PKNG_SaleAmt', header: '折抵金額', visible: true },
    { field: 'PKNG_Status', header: '狀態', visible: true, format: (val: string) => val === 'A' ? '生效' : (val === 'D' ? '刪除' : val) },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  constructor(
    private cpm13010Service: Cpm13010Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化頁面，設定程式代號和新增/修改頁面路由
    this.initializePage('CPM13010', '/CPM/CPM13010cru', this.queryForm, (frm) => this.onSubmit(frm));
  }

  // 表單提交邏輯 (查詢)
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.cpm13010Service.queryCPM13010(frm.value as QueryCPM13010Request)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            if (response.Data) {
              this.data = response.Data;
              this.totalRecords = response.TotalCount || response.Data.length;
              this.queryStateService.setQueryState(this.ProgNo, frm.value);
            } else {
              this.data = [];
              this.totalRecords = 0;
              this.messageService.warnBubble(response.Message);
            }
          },
          error: (error) => {
            this.messageService.errorBubble("查詢失敗：" + error.message);
          },
        });
    });
  }

  // onDelete (刪除功能，此處僅為模板，需根據實際需求實現)
  onDelete(selectedRows: QueryCPM13010Response[]) {
    const IDs = selectedRows.map(row => row.ID);
    this.cpm13010Service.deleteCPM13010({ IDs }).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status === '0000') {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
        this.messageService.successBubble(res.Message);
      } else {
        this.messageService.errorBubble(res.Message);
      }
    });
  }
  btnLoading = false;
  onUpload() {
    const params = {
    }
    this.btnLoading = true;
  }
  // 狀態為刪除禁止下傳
  get isDisabled(): boolean {
    return this.selectedRows.some(row => row.PKNG_Status === 'D');
  }
}
