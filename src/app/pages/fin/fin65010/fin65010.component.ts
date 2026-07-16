

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Services
// Shared
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { APS3006Response, Fin65010Service, QueryFIN65010Response } from 'src/app/service/api/fin/fin65010.service';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextRangeComponent } from 'src/app/shared/components/input-text-range/input-text-range.component';
import { Column, createPaginationConfig, formatAmount } from 'src/app/others/component/table/table.model';
import { apiOption } from 'src/app/shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-fin65010',
  templateUrl: './fin65010.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextRangeComponent, CalendarRangeComponent, ButtonComponent, TableReportComponent, TranslateModule]
})
export class FIN65010Component extends BasicQueryPageComponent<QueryFIN65010Response> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_No: [null], // 廠商代碼
    CHK_No_S: [null], // 票據號碼起
    CHK_No_E: [null], // 票據號碼迄
    CHK_IssueDate_S: [null], // 開票日期起
    CHK_IssueDate_E: [null], // 開票日期迄
    PAM_No: [null], // 開票單號
    VouNo_S: [null], //傳票號碼起
    VouNo_E: [null], //傳票號碼迄

    //分頁查詢
    ...createPaginationConfig([{ field: 'CheckNo', order: 0 }]), // 分頁和排序參數
  });

  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  historyRequestBody: any = null; // 儲存最後一次查詢的條件

  VEN_No_Options: apiOption[] = []; // 廠商的下拉選單
  PAM_No_Options: apiOption[] = []; // 營運狀況的下拉選單

  data: QueryFIN65010Response[] = [];
  columns: Column[] = [
    { field: 'CheckNo', header: '票據號碼', visible: true },
    { field: 'IssueDate', header: '開票日期', visible: true },
    { field: 'BNK_No', header: '銀行代號', visible: true },
    { field: 'BNK_AccNo', header: '銀行帳號', visible: true },
    { field: 'PaymentBank', header: '付款銀行', visible: true },
    { field: 'DueDate', header: '到期日', visible: true },
    { field: 'VEN_No', header: '廠商代號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'Summary', header: '摘要', visible: true, align: 'left' },
    { field: 'Amount', header: '金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'IssueAmount', header: '開票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'ContactName', header: '聯絡人姓名', visible: true },
    { field: 'ContactPhone', header: '聯絡人電話', visible: true },
  ];

  selectedItems: QueryFIN65010Response[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly fin65010Service: Fin65010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN65010', 'FIN/FIN65010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('request:', JSON.stringify(frm.value, null, 2));
      this.fin65010Service.queryFIN65010(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.historyRequestBody = frm.value;
            this.totalRecords = response.TotalCount;
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

  loadOptions() {
    {
      // 廠商代號 下拉選單
      this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
        this.VEN_No_Options = response.Data.map((item: any) => ({
          No: item.VEN_No,
          Name: item.Name,
          Label: item.VEN_No + '-' + item.Name,
        }));

        console.log('VEN_No_Options:', this.VEN_No_Options);
      });
      // 開票單號 下拉選單
      this.fin65010Service.queryAPS3006_DropDownList(null).pipe(untilDestroyed(this)).subscribe((response) => {
        this.PAM_No_Options = response.Data.map((item: APS3006Response) => ({
          No: item.PAM_No,
          Name: item.BNK_AccName,
          Label: item.PAM_No + '-' + item.BNK_AccName,
        }));

        console.log('PAM_No_Options:', this.PAM_No_Options);
      });
    }
  }
}
