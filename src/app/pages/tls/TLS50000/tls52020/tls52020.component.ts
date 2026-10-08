import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS52020Request, ITLS52020Data, Tls52020Service } from '@service/api/tls/tls52020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AddButton, formatAmount, formatDate, formatDateTime } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { Actions } from '@shared/service/permission-guard.service';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
export const enum CRNtatus {
  已申請 = '0',
  已審核 = '2',
  部分驗收 = '3',
  全部驗收 = '4',
  強制結案 = '6',
  作廢 = '9',
}
// 2.5.2.2  退貨單維護作業
@Component({
  selector: 'app-tls52020',
  templateUrl: './tls52020.component.html',
  animations: [
    trigger('slideInFromLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20%)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ],
  standalone: true,
  imports: [
    ProductAutocompleteComponent,
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TableReportComponent,
    Button,
    TooltipModule,
    NgStyle,
    NgIf,
    TranslateModule
  ]
})
export class TLS52020Component extends BasicQueryPageComponent<ITLS52020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    CRN_No: ['', [Validators.maxLength(16)]], // 退貨單編號
    queryNo: ['', [Validators.maxLength(20)]], // 查詢編號 input
    HOS_NoList: [null], // 倉庫代碼 multi-select
    LOGO_NoList: [null], // 品牌代碼 multi-select
    VEN_No: [null], // 廠商編號 multi-select
    CRN_StatusList: [null], // 退貨單狀態 multi-select
    APPLY_USR: [null], // 申請人員 multi-select
    APPLY_Date_Start: [null], // 申請日期 起 calendar-range
    APPLY_Date_End: [null], // 申請日期 迄
    APRV_USR: [null], // 審核人員 multi-select
    APRV_Date_Start: [null], // 審核日期 起 calendar-range
    APRV_Date_End: [null], // 審核日期 迄
    CLOS_USR: [null], // 強制結案人員 multi-select
    CLOS_Date_Start: [null], // 強制結案日期 起 calendar-range
    CLOS_Date_End: [null], // 強制結案日期 迄
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'CRN_No', order: -1 }]],
  });
  totalRecords = 0;
  data: ITLS52020Data[] = [];
  selectedItems: ITLS52020Data[] = [];
  lastQueryBody: IQueryTLS52020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'CRN_No', header: '退貨單號', visible: true, width: '110px' }, // 退貨單號
    { field: 'VEN_No', header: '廠商編號', visible: true, width: '90px' }, // 廠商編號
    { field: 'VEN_Name', header: '廠商名稱', visible: true, width: '150px' }, // 廠商名稱
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // 品牌代碼
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true, width: '80px' }, // 品牌名稱
    { field: 'HOS_No', header: '倉庫代碼', visible: true }, // 倉庫代碼
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 倉庫名稱
    { field: 'org_id', header: '組織代碼', visible: true }, // 組織代碼
    { field: 'CRN_Status', header: '退貨單狀態', visible: true, format: value => this.crnstatusOptions.find(x => x.value === value)?.label || value }, // 退貨單狀態
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate, width: '80px' }, // 申請日期 (ISO 格式字串)
    { field: 'APPLY_USR_No', header: '申請人員編號', visible: true }, // 申請人員編號
    { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true }, // 申請人員姓名
    { field: 'CRN_TotalSubQty', header: '退貨數量合計', visible: true, format: formatAmount }, // 退貨數量合計
    { field: 'CRN_TotalBuyNet', header: '未稅進價小計', visible: true, format: formatAmount }, // 未稅進價小計
    { field: 'CRN_TotalBuyTax', header: '進價稅額小計', visible: true, format: formatAmount }, // 進價稅額小計
    { field: 'CRN_TotalBuyAmt', header: '進價合計', visible: true, format: formatAmount }, // 進價合計
    { field: 'CRN_TotalSaleAmt', header: '售價合計', visible: true, format: formatAmount }, // 售價合計
    { field: 'CRN_Remark', header: '備註', visible: true }, // 備註
    { field: 'APRV_Date', header: '核准日期', visible: true, format: formatDate, width: '80px' }, // 核准日期 (ISO 格式字串)
    { field: 'APRV_USR_No', header: '核准人員編號', visible: true }, // 核准人員編號
    { field: 'APRV_USR_Name', header: '核准人員姓名', visible: true }, // 核准人員姓名
    { field: 'ReAPRV_Date', header: '反審核日期', visible: true, format: formatDate, width: '80px' }, // 反審核日期 (ISO 格式字串)
    { field: 'ReAPRV_USR_No', header: '反審核人員編號', visible: true }, // 反審核人員編號
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: true }, // 反審核人員姓名
    { field: 'VOID_Date', header: '作廢日期', visible: true, format: formatDate, width: '80px' }, // 作廢日期 (ISO 格式字串)
    { field: 'VOID_USR_No', header: '作廢人員編號', visible: true }, // 作廢人員編號
    { field: 'VOID_USR_Name', header: '作廢人員姓名', visible: true }, // 作廢人員姓名
    { field: 'CLOS_Date', header: '結案日期', visible: true, format: formatDate, width: '80px' }, // 結案日期 (ISO 格式字串)
    { field: 'CLOS_USR_No', header: '結案人員編號', visible: true }, // 結案人員編號
    { field: 'CLOS_USR_Name', header: '結案人員姓名', visible: true }, // 結案人員姓名
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime, width: '130px' }, // 建立日期 (ISO 格式字串)
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false }, // 建立人員編號
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime, width: '130px' }, // 變更日期 (ISO 格式字串)
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false }, // 變更人員編號
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
  warehouseOptions = this.dropdown.queryPos2034(); // 倉別
  brandOptions = this.dropdown.queryPluLogo(); // 品牌代碼
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商編號
  crnstatusOptions = getSYS1000Options('CRN_Status') // 退貨單狀態 (靜態資料)
  userOptions = this.dropdown.queryTblUser(); // 申請人員、審核人員、結案人員
  addButton: AddButton[] = [
    { label: '單據審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已審核); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已申請 || !this.hasPermission(Actions.Audit) }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已申請); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已審核 || !this.hasPermission(Actions.AntiAudit) }, // 反審核
    { label: '作廢單據', icon: 'pi pi-trash text-red-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.作廢); }, disabled: (rowData: ITLS52020Data) => (rowData.CRN_Status !== CRNtatus.已申請) || !this.hasPermission(Actions.Invalidate) }, // 作廢
  ];
  constructor(
    public readonly tls52020Service: Tls52020Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52020', 'tls/tls52020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  // 表單提交處理方法
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52020Service.queryTLS52020(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
        this.lastQueryBody = frm.value;
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
  printLoading = false;
  print(rowData: ITLS52020Data[], type: 'pdf' | 'excel') {
    const params = { CRN_NoList: rowData.map(item => item.CRN_No) };
    let export$: Observable<HttpResponse<Blob>>;
    // 2. 決定要呼叫哪個 API 服務方法
    switch (type) {
      case 'pdf':
        export$ = this.tls52020Service.exportTLS52020PDF(params);
        break;
      case 'excel':
        export$ = this.tls52020Service.exportTLS52020(params);
        break;
      default:
        return;
    }

    // 3. 呼叫通用服務執行匯出流程
    this.printLoading = true
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => { this.printLoading = false; this.selectedItems = [] })), // 傳遞 Observable 並加入銷毀處理
      '.' + type,                            // 傳遞檔案副檔名 (.pdf 或 .excel)
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
  printDirect(rowData: ITLS52020Data[]) {
    const params = { CRN_NoList: rowData.map(item => item.CRN_No) };
    this.printLoading = true;
    this.fileExportService.executePdfPrint(
      this.tls52020Service.exportTLS52020PDF(params).pipe(untilDestroyed(this), finalize(() => this.printLoading = false)),
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }
  btnLoading = false;
  statusChange(rowData: ITLS52020Data, status: string) {
    this.btnLoading = true;
    const body = {
      _DetailList: [
        {
          CRN_No: rowData.CRN_No,
          CRN_Status: status,
          CRN_Status_Ori: rowData.CRN_Status
        }
      ]
    }
    this.tls52020Service.updateStatusTLS52020(body).pipe(finalize(() => this.btnLoading = false)).pipe(untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  close(rowData: ITLS52020Data[]) {
    const body = {
      _DetailList: rowData.map(item => {
        return {
          CRN_No: item.CRN_No,
          CRN_Status: CRNtatus.強制結案,
          CRN_Status_Ori: item.CRN_Status
        };
      })
    };
    this.tls52020Service.updateStatusTLS52020(body).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.selectedItems = [];
      this.onSubmit(this.queryForm);
    });
  }
  editDisabled(rowData: ITLS52020Data) {
    return rowData.CRN_Status !== CRNtatus.已申請;
  }
  get disabledClose() {
    return this.selectedItems.some(item => (item.CRN_Status !== CRNtatus.已審核) && (item.CRN_Status !== CRNtatus.部分驗收));
  }

  get selectedCount() {
    return this.selectedItems.length;
  }
}
