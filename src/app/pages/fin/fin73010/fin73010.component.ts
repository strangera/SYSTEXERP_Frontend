import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin73010data } from '@service/api/fin/fin73010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs';
import { FIN73010Service } from './../../../service/api/fin/fin73010.service';

// FIN73010-零用金支付表
@Component({
  selector: 'app-fin73010',
  templateUrl: './fin73010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule]

})
export class FIN73010Component extends BasicQueryPageComponent<Fin73010data> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo || null], // 公司編號 / 店號

    PCS_No: [null, [Validators.maxLength(20)]], // 零用金單號
    DateFrom: [null], // 申請日期起
    DateTo: [null], // 申請日期迄
    PCS_UsrNo: [null], // 零用金申請人
    Keep_UsrNo: [null], // 零用金保管人
    PCS_Status: [null], // 狀態
    Keep_OrgID: [null], // 保管單位

    //分頁查詢
    ...createPaginationConfig([{ field: 'PCS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  lastQueryBody: any = null; // 紀錄最後一次查詢條件

  data: Fin73010data[] = [];
  footerData: Fin73010data | null = null;
  columns: Column[] = [
    // { field: 'RowType', header: '列別' },
    { field: 'SeqNo', header: '序號' },
    { field: 'RowTypeDesc', header: '列別' },
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
    { field: 'PCS_Net', header: '未稅金額', format: formatAmount, isTotal: true },
    { field: 'PCS_Tax', header: '稅額', format: formatAmount, isTotal: true },
    { field: 'PCS_Amt', header: '含稅金額', format: formatAmount, isTotal: true }
  ];

  PCS_No_Options: { PCS_No: string }[] = []; // 零用金單號選項
  UsrNo_Options: { No: string; Name: string; Label: string }[] = []; // 零用金申請人/保管人選項
  PCS_Status_Options: { No: string; Name: string; }[] = [
    { No: '1', Name: '建立' },
    { No: '2', Name: '請款' },
    { No: '3', Name: '拋轉' },
    { No: '4', Name: '撥補' }
  ]; // 單據狀態選項
  Keep_OrgID_Options: { No: string; Name: string; }[] = []; // 零用金保管人組織選項

  selectedItems: Fin73010data[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    public fin73010Service: FIN73010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73010', 'FIN/FIN73010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('request:', frm.value);
      this.loading = true;
      const payload = frm.getRawValue();
      this.fin73010Service.queryFIN73010(payload).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = payload;
            this.data = response.Data.filter((item: Fin73010data) => item.RowType !== 2); // 只顯示明細列 (html:showTotal、showPaginator)
            const sumData = response.Data.filter((item: Fin73010data) => item.RowType === 2);
            this.footerData = Array.isArray(sumData) && sumData.length > 0
              ? { ...sumData[0], RowTypeDesc: '' }
              : null;
            console.log('Result', this.footerData);
            this.totalRecords = response.TotalCount;
            this.queryStateService.setQueryState(this.ProgNo, payload);
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

  queryFunction = (body: any) => {
    return this.fin73010Service.queryFIN73010(body).pipe(
      map((response) => {
        // 在這裡統一處理資料過濾
        const filteredData = response.Data.filter(
          (item: Fin73010data) => item.RowType !== 2
        );

        // 更新總筆數（視 API 設計而定，如果 TotalCount 包含總計列，可能需要 -1）
        return {
          Data: filteredData,
          TotalCount: response.TotalCount
        };
      })
    );
  };

  btn_pdf_Loading = false;
  btn_excel_Loading = false;
  printPDF(isPDF: boolean) {
    // 如果要列印全部，需要調整 PageSize
    const exportPayload = {
      ...this.lastQueryBody,
      PageIndex: 1,
      PageSize: this.totalRecords
    };

    if (isPDF) {
      this.btn_pdf_Loading = true;
      this.fin73010Service.exportPDFFIN73010(exportPayload)
        .pipe(finalize(() => this.btn_pdf_Loading = false))
        .subscribe(blob => this.downloadBlob(blob, `零用金支付表${this.getTimestamp()}`));
    } else {
      this.btn_excel_Loading = true;
      this.fin73010Service.exportExcelFIN73010(exportPayload)
        .pipe(finalize(() => this.btn_excel_Loading = false))
        .subscribe(blob => this.downloadBlob(blob, `零用金支付表${this.getTimestamp()}`));
    }
  }


  loadOptions() {
    // 零用金單號 下拉 (POS2064MPCS_NoDropDownList 進行中，先用/Controllers/FIN70000/queryFIN73010 代替)
    this.fin73010Service.queryPOS2064MPCS_NoDropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
      this.PCS_No_Options = res.Data.map(item => ({ ...item }));
      console.log('零用金單號', this.PCS_No_Options);
    })

    //零用金申請/保管人 下拉
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.UsrNo_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
      },
    });
    // 保管單位 下拉
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      if (res.Status !== '0000') return;
      this.Keep_OrgID_Options = res.Data.map((item) => ({ ...item, Label: `${item.No} - ${item.Name}` }));
    });
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }
}