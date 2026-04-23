import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin73010data } from '@service/api/fin/fin73010.service';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';

// FIN73010-零用金支付表
@Component({
  selector: 'app-fin73010',
  templateUrl: './fin73010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]

})
export class FIN73010Component extends BasicQueryPageComponent<Fin73010data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo || null], // 公司編號 / 店號

    PCS_No: [null, [Validators.maxLength(20)]], // 零用金單號
    DateFrom: [null], // 申請日期起
    DateTo: [null], // 申請日期迄
    PCS_UsrNo: [null], // 零用金申請人員代碼
    Keep_UsrNo: [null], // 零用金保管人代碼
    PCS_Status: [null], // 單據狀態
    Keep_OrgID: [null], // 零用金保管人組織代碼

    //分頁查詢
    ...createPaginationConfig([{ field: 'PCS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: Fin73010data[] = [];
  columns: Column[] = [
    { field: 'SeqNo', header: '序號' },
    { field: 'PCS_No', header: '零用金單號' },
    { field: 'PCS_Date', header: '零用金申請日期', format: formatDate },
    { field: 'PCS_UsrNo', header: '零用金申請人員代碼' },
    { field: 'PCS_UsrName', header: '零用金申請人員姓名' },
    { field: 'PCS_OrgID', header: '零用金申請人員組織代碼' },
    { field: 'PCS_OrgName', header: '零用金申請人員組織名稱' },
    { field: 'Keep_UsrNo', header: '零用金保管人代碼' },
    { field: 'Keep_UsrName', header: '零用金保管人姓名' },
    { field: 'Keep_OrgID', header: '零用金保管人組織代碼' },
    { field: 'Keep_OrgName', header: '零用金保管人組織名稱' },
    { field: 'PCS_Status', header: '單據狀態' },
    { field: 'PCS_StatusName', header: '單據狀態名稱' },
    { field: 'PCS_RqstNo', header: '支出請款單號' },
    { field: 'PCS_SeqNo', header: '項次' },
    { field: 'AccNo', header: '費用會計科目編號' },
    { field: 'AccName', header: '費用會計科目名稱' },
    { field: 'NOTeDesc', header: '項目摘要' },
    { field: 'PCS_DtlType', header: '明細類別' },
    { field: 'PCS_DtlTypeName', header: '明細類別名稱' },
    { field: 'PCS_GUINo', header: '發票 / 收據號碼' },
    { field: 'ORG_ID', header: '費用科目組織代碼' },
    { field: 'Dtl_OrgName', header: '費用科目組織名稱' },
    { field: 'PUR_Date', header: '憑證日期', format: formatDate },
    { field: 'PCS_Net', header: '未稅金額', format: formatAmount },
    { field: 'PCS_Tax', header: '稅額', format: formatAmount },
    { field: 'PCS_Amt', header: '含稅金額', format: formatAmount },
    // { field: 'RowTypeDesc', header: '列別說明' },
    // { field: 'RowType', header: '列別' },
  ];

  PCS_No_Options: { No: string; Name: string; }[] = []; // 零用金單號選項
  PCS_UsrNo_Options: { No: string; Name: string; }[] = []; // 零用金申請人員選項
  Keep_UsrNo_Options: { No: string; Name: string; }[] = []; // 零用金保管人選項
  PCS_Status_Options: { No: string; Name: string; }[] = []; // 單據狀態選項
  Keep_OrgID_Options: { No: string; Name: string; }[] = []; // 零用金保管人組織選項

  selectedItems: Fin73010data[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73010', 'FIN/FIN73010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('request:', JSON.stringify(frm.value, null, 2));
      // this.tls51080Service.queryTLS51080(frm.value).subscribe({
      //   next: (response) => {
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       console.log('Result', this.data);
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  loadOptions() {
    console.log('load options');
    // 組織代碼 下拉
    // this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
    //   this.SYS3100_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
    //   console.log('組織', this.SYS3100_Options);
    // })
  }
}