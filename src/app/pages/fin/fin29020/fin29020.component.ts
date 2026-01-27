/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29020Detail, FIN29020Service } from '@service/api/fin/fin29020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin29020',
  templateUrl: './fin29020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    CommonModule,
    TableComponent,
    InputTextRangeComponent,
    DropdownComponent
  ]
})
export class FIN29020Component extends BasicQueryPageComponent<FIN29020Detail> implements OnInit {
  constructor(
    private fin29020Service: FIN29020Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private validationService: ValidationService
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    DateFrom: [null],           // 匯款日期(起)
    DateTo: [null],             // 匯款日期(迄)    
    BNK_No: [null],             // 公司匯出銀行代號 APS3007.BNK_No
    WslipNoFrom: [null, this.validationService.numberValidator],          // 匯款單號(起)
    WslipNoTo: [null, this.validationService.numberValidator],            // 匯款單號(迄)
    VEN_No: [null],             // 廠商代號 APS3004.PAM_Target
    ...createPaginationConfig([])
  });

  data: FIN29020Detail[] = [];
  // 設定預設排序依據為 "RmtDate" (匯款日期)，這對於分組顯示至關重要
  multiSortMeta: any[] = [{ field: 'RmtDate', order: 1 }];
  selectedItems: FIN29020Detail[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportXLSXbtnLoading = false;

  footerData: any = null;

  columns: Column[] = [
    { field: 'WslipNo', header: '匯款單號', visible: true },
    { field: 'BankInfo', header: '銀行代號', visible: true },
    { field: 'RmtDate', header: '匯款日期', visible: true },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'VendorBankNo', header: '匯款銀行帳號', visible: true },
    { field: 'VendorBankNane', header: '解款銀行名稱', visible: true },
    { field: 'VendorAccNo', header: '銀行帳號', visible: true },
    { field: 'VendorAccName', header: '帳戶名稱', visible: true },
    // { field: 'STO_No', header: '分店編號', visible: false },
    // { field: 'VEN_No', header: '廠商編號', visible: false },
    // { field: 'CompanyBNK_Name', header: '匯款銀行名稱', visible: false },
    // { field: 'CompanyBNK_BranchNo', header: '匯款銀行分行代號', visible: false },
    // { field: 'VendorBNK_No', header: '解款銀行代號', visible: false },
    // { field: 'VendorBNK_BranchNo', header: '解款銀行分行代號', visible: false },
    // { field: 'VendorBNK_AccNo', header: '解款帳號', visible: false },
    // { field: 'RMT_Fee', header: '匯款手續費', visible: false, format: formatAmount },
    // { field: 'RMT_Status', header: '匯款狀態', visible: false },
    // { field: 'RMT_ExpMediaCnt', header: '媒體匯出次數', visible: false },

    // 加入 isSubTotal: true 讓 app-table 自動計算小計
    { field: 'PayAmount', header: '帳款金額', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'RemitAmount', header: '匯款金額', visible: true, format: formatAmount, isSubTotal: true },
  ];

  //#region 下拉選單
  BankCodeOptions: any[] = [];
  VendorNoOptions: any[] = [];
  RmtStatusOptions: any[] = [
    { label: '未確認', value: '0' },
    { label: '已確認', value: '1' }
  ];
  //#endregion

  ngOnInit(): void {
    this.initializePage('FIN29020', 'account/fin/fin29020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  // 定義一個警告閥值
  readonly DATA_WARNING_THRESHOLD = 3000;

  onSubmit(form: FormGroup) {
    console.log('查詢條件:', form.getRawValue());
    this.handleSubmit(form, () => {
      this.fin29020Service.queryFIN29020(this.buildQueryPayload(form.getRawValue()))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {

          let result = response.Data;
          console.log('API回傳資料:', result); // 檢查原始回傳資料
          let finalData: FIN29020Detail[] = [];


          // 剝皮處理
          // =========================================================
          // 如果 result 是陣列，且第一筆資料裡面包含 'fIN29020_SubTotals'
          // [ { Total..., SubTotals... } 先要把外層陣列剝掉
          if (Array.isArray(result) && result.length > 0 && (result[0]?.fIN29020_SubTotals || result[0]?.FIN29020_SubTotals)) {
            result = result[0];
          }

          // 1.資料處理
          // =========================================================
          // 嘗試取得 SubTotals
          const subTotals = result?.fIN29020_SubTotals

          if (Array.isArray(subTotals)) {
            finalData = subTotals.flatMap((group: any) =>
              group.fIN29020_Details || group.FIN29020_Details || []
            );
          }
          else if (Array.isArray(result)) {
            finalData = result;
          }

          // 2. 數量過多提醒
          // =========================================================
          if (finalData.length > this.DATA_WARNING_THRESHOLD) {
            this.messageService.warnBubble?.('資料量過大提醒', `共 ${finalData.length} 筆資料`);
          }

          this.data = finalData;

          // 3. 總計處理 (Footer)
          // =========================================================
          this.footerData = {
            VendorName: '總計',
            PayAmount: result?.Total_PayAmount,
            RemitAmount: result?.Total_RemitAmount
          };

          console.log('扁平化處理後，回傳資料:', this.data); // 確認最終資料

          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  loadOptions() {
    // 銀行代號下拉
    this.dropdownApiService.queryAps1001NoBranch().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BankCodeOptions = list.map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });

    // 廠客代號下拉
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
  }

  // ========= 匯出 =========
  onExportPDF(form: FormGroup) {
    this.exportPDFbtnLoading = true;
    this.fin29020Service.exportFIN29020PDF(this.buildQueryPayload(form.getRawValue()))
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '匯款明細表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX(form: FormGroup) {
    this.exportXLSXbtnLoading = true;
    this.fin29020Service.exportFIN29020(this.buildQueryPayload(form.getRawValue()))
      .pipe(untilDestroyed(this), finalize(() => (this.exportXLSXbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '匯款明細表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(formValue: any): any {
    return {
      ...formValue,
      DateFrom: this.toDateOnly(formValue.DateFrom),
      DateTo: this.toDateOnly(formValue.DateTo),
    };
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
