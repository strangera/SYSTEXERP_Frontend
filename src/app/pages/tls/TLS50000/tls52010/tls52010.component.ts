import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS52010Request, ITLS52010Data, Tls52010Service } from '@service/api/tls/tls52010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ExportLabelService, IExportLabelRequest } from '@service/utility/exportLabel.service';
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
import { finalize, Observable } from 'rxjs'; // 只需要 map 運算符，因為我們將直接訂閱
export const enum POStatus {
  已申請 = '0',
  取消 = '1',
  已審核 = '2',
  部分驗收 = '3',
  全部驗收 = '4',
  強制結案 = '6',
  作廢 = '9',
}
// 2.5.2.1 採購單維護作業
@Component({
  selector: 'app-tls52010',
  templateUrl: './tls52010.component.html',
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
  ],
})
export class TLS52010Component extends BasicQueryPageComponent<ITLS52010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PO_No: [null, [Validators.maxLength(16)]], // 採購單編號 input
    HOS_NoList: [null], // 倉庫代碼 multi-select
    LOGO_NoList: [null], // 品牌代碼 multi-select
    VEN_No: [null], // 廠商編號 multi-select
    queryNo: [null, [Validators.maxLength(20)]], // 查詢編號 input
    PO_StatusList: [null], // 採購單狀態 multi-select
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
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'PO_No', order: -1 }]],
  });
  totalRecords = 0;
  data: ITLS52010Data[] = [];
  selectedItems: ITLS52010Data[] = []; // 用於儲存選中的項目
  lastQueryBody: IQueryTLS52010Request | null = null;
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ITLS52010Data) => { this.statusChange(rowData, POStatus.已審核); },
      disabled: (rowData: ITLS52010Data) => rowData.PO_Status !== POStatus.已申請 || !this.permissionsCache.canAudit
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ITLS52010Data) => { this.statusChange(rowData, POStatus.已申請); },
      disabled: (rowData: ITLS52010Data) => rowData.PO_Status !== POStatus.已審核 || !this.permissionsCache.canAntiAudit
    },
    {
      label: '產生標籤檔',
      icon: 'pi pi-tags',
      action: (rowData: ITLS52010Data) => { this.generateLabelFile(rowData); },
      disabled: () => !this.permissionsCache.canTagPrint
    },
    {
      label: '作廢',
      icon: 'pi pi-trash text-red-500',
      action: (rowData: ITLS52010Data) => { this.statusChange(rowData, POStatus.作廢); },
      disabled: (rowData: ITLS52010Data) => rowData.PO_Status !== POStatus.已審核 || !this.permissionsCache.canInvalidate
    },
    {
      label: '取消單據',
      icon: 'pi pi-times-circle text-gray-500',
      action: (rowData: ITLS52010Data) => { this.statusChange(rowData, POStatus.取消); },
      disabled: (rowData: ITLS52010Data) => rowData.PO_Status !== POStatus.已申請 || !this.permissionsCache.canCancel
    }
  ];
  columns: ReportColumn[] = [
    { field: 'PO_No', header: '採購單號', visible: true, width: '110px' }, // 採購單號
    { field: 'VEN_No', header: '廠商編號', visible: true, width: '90px' }, // 廠商編號
    { field: 'VEN_Name', header: '廠商名稱', visible: true, width: '150px' }, // 廠商名稱
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // 品牌代碼
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true, width: '80px' }, // 品牌名稱
    { field: 'HOS_No', header: '倉庫代碼', visible: true }, // 倉庫代碼
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 倉庫名稱
    { field: 'org_id', header: '組織代碼', visible: true }, // 組織代碼
    { field: 'ODM_TaxType', header: '稅別', visible: true, format: v => getSYS1000('ODM_TaxType', v) }, // 稅別
    { field: 'PO_Status', header: '採購單狀態', visible: true, format: value => this.poStatusOptions.find(x => x.value === value)?.label || value }, // 採購單狀態
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate, width: '80px' }, // 申請日期 (ISO 格式字串)
    { field: 'APPLY_USR_No', header: '申請人員編號', visible: true, width: '90px' }, // 申請人員編號
    { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true }, // 申請人員姓名
    { field: 'PO_TotalSubQty', header: '採購數量合計', width: '80px', visible: true, format: formatAmount }, // 採購總數量
    { field: 'PO_TotalBuyNet', header: '進價未稅小計', width: '80px', visible: true, format: formatAmount }, // 採購總淨額
    { field: 'PO_TotalBuyTax', header: '進價稅額小計', width: '80px', visible: true, format: formatAmount }, // 採購總稅額
    { field: 'PO_TotalBuyAmt', header: '進價合計', width: '80px', visible: true, format: formatAmount }, // 採購總金額
    { field: 'PO_TotalSaleAmt', header: '售價合計', width: '80px', visible: true, format: formatAmount }, // 銷售總金額
    { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate, width: '80px' }, // 核准日期 (ISO 格式字串)
    { field: 'APRV_USR_No', header: '審核人員編號', visible: true, width: '90px' }, // 核准人員編號
    { field: 'APRV_USR_Name', header: '審核人員姓名', visible: true }, // 核准人員姓名
    { field: 'ReAPRV_Date', header: '反審核日期', visible: true, format: formatDate, width: '80px' }, // 反審核日期 (ISO 格式字串)
    { field: 'ReAPRV_USR_No', header: '反審核人員編號', visible: true, width: '90px' }, // 反審核人員編號
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: true }, // 反審核人員姓名
    { field: 'VOID_Date', header: '作廢日期', visible: true, format: formatDate, width: '80px' }, // 作廢日期 (ISO 格式字串)
    { field: 'VOID_USR_No', header: '作廢人員編號', visible: true }, // 作廢人員編號
    { field: 'VOID_USR_Name', header: '作廢人員姓名', visible: true }, // 作廢人員姓名
    { field: 'CLOS_Date', header: '結案日期', visible: true, format: formatDate, width: '80px' }, // 結案日期 (ISO 格式字串)
    { field: 'CLOS_USR_No', header: '結案人員編號', visible: true, width: '90px' }, // 結案人員編號
    { field: 'CLOS_USR_Name', header: '結案人員姓名', visible: true }, // 結案人員姓名
    { field: 'PO_Remark', header: '採購單備註', visible: true, width: '150px' }, // 採購單備註
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime, width: '130px' }, // 建立日期 (ISO 格式字串)
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false, width: '90px' }, // 建立人員編號
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime, width: '130px' }, // 變更日期 (ISO 格式字串)
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false, width: '90px' }, // 變更人員編號
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
  btnLoading = false;
  warehouseOptions = this.dropdown.queryPos2034(); // 倉別
  brandOptions = this.dropdown.queryPluLogo(); // 品牌代碼
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商編號
  poStatusOptions = getSYS1000Options('PO_Status'); // 採購單狀態 (靜態資料)
  userOptions = this.dropdown.queryTblUser(); // 申請人員、審核人員、結案人員
  public permissionsCache = {
    canAudit: false,
    canAntiAudit: false,
    canTagPrint: false,
    canInvalidate: false,
    canCancel: false
  };
  constructor(
    public readonly tls52010Service: Tls52010Service, // 注入 TLS52010Service
    private readonly exportLabelService: ExportLabelService,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52010', 'TLS/TLS52010cru', this.queryForm, (form) => this.onSubmit(form));
    this.initPermissionsCache();
  }
  private initPermissionsCache() {
    this.permissionsCache.canAudit = this.hasPermission(Actions.Audit);
    this.permissionsCache.canAntiAudit = this.hasPermission(Actions.AntiAudit);
    this.permissionsCache.canTagPrint = this.hasPermission(Actions.TagPrint);
    this.permissionsCache.canInvalidate = this.hasPermission(Actions.Invalidate);
    this.permissionsCache.canCancel = this.hasPermission(Actions.CancelDocument);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52010Service.queryTLS52010(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.lastQueryBody = frm.value;
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
  printLoading = false;
  print(rowData: ITLS52010Data[], type: 'pdf' | 'excel') {
    const params = { PO_NoList: rowData.map(item => item.PO_No) };
    let export$: Observable<HttpResponse<Blob>>;
    // 2. 決定要呼叫哪個 API 服務方法
    switch (type) {
      case 'pdf':
        export$ = this.tls52010Service.exportTLS52010PDF(params);
        break;
      case 'excel':
        export$ = this.tls52010Service.exportTLS52010(params);
        break;
      default:
        return;
    }
    // 3. 呼叫通用服務執行匯出流程
    this.printLoading = true
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => { this.printLoading = false; this.selectedItems = [] })),
      '.' + type,
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }
  printDirect(rowData: ITLS52010Data[]) {
    const params = { PO_NoList: rowData.map(item => item.PO_No) };
    this.printLoading = true;
    this.fileExportService.executePdfPrint(
      this.tls52010Service.exportTLS52010PDF(params).pipe(untilDestroyed(this), finalize(() => this.printLoading = false)),
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }
  statusChange(rowData: ITLS52010Data, status: string) {
    this.btnLoading = true;
    this.tls52010Service.updateStatusTLS52010([rowData], status).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }

  close(rowData: ITLS52010Data[]) {
    this.tls52010Service.updateStatusTLS52010(rowData, POStatus.強制結案).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.selectedItems = [];
      this.onSubmit(this.queryForm);
    });
  }
  // 產生標籤
  generateLabelFile(rowData: ITLS52010Data) {
    this.btnLoading = true;
    this.tls52010Service.getLabelTLS52010({ PO_No: rowData.PO_No }).pipe(untilDestroyed(this)).subscribe(response => {
      this.selectedItems = [];
      const transformedData: IExportLabelRequest[] = response.Data.map((item: any) => ({
        PLU_MagNo: item.PLU_MagNO,
        PLU_Name: item.PLU_Name,
        PLU_SalePrc: parseFloat(item.PLU_SalePrc.trim()),
        Label_Qty: parseInt(item.Label_Qty.trim(), 10),
        PLU_Unit: item.PLU_Unit,
        PLU_OrgPLUNo: item.PLU_OrgPLUNo,
        PLU_No: item.PLU_NO
      }));
      this.exportLabelService.ExportLabel(transformedData).pipe(untilDestroyed(this), finalize(() => { this.btnLoading = false; this.selectedItems = []; })).subscribe(() => {
        this.messageService.successBubble('標籤檔案已成功下載！');
      });
    });
  }
  // 1. 將原來的 get disabledClose 刪除，改宣告為一個普通變數
  public disabledClose = false;

  // 2. 新增一個獨立的計算方法
  private calculateActionsState(selected: ITLS52010Data[]) {
    // 只有在勾選變更時，才在背景跑這一次的遍歷，平常變更偵測完全不耗能
    this.disabledClose = selected.some(item => item.PO_Status !== POStatus.部分驗收);
  }

  // 3. 在外層接收表格勾選變更事件時，主動呼叫它
  public onSelectionChange(event: ITLS52010Data[]) {
    this.selectedItems = event;
    this.calculateActionsState(event); // 即時更新結案按鈕的狀態
  }
  editDisabled(rowData: ITLS52010Data) {
    return rowData.PO_Status !== POStatus.已申請;
  }
  get selectedCount() {
    return this.selectedItems.length;
  }
}
