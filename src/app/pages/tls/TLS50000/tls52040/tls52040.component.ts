import { AsyncPipe, NgStyle } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryTLS52040Request, ITLS52040Data, Tls52040Service } from '@service/api/tls/tls52040.service';
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

export const enum POStatus {
  已確認 = '1',
  已審核 = '2',
  部分驗收 = '3',
  全部驗收 = '4',
  作廢 = '9',
}
@Component({
  selector: 'app-tls52040',
  templateUrl: './tls52040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    TableReportComponent,
    Button,
    TooltipModule,
    NgStyle,
    TranslateModule,
    CalendarRangeComponent,
    AsyncPipe,
    ProductAutocompleteComponent
  ],
})
export class TLS52040Component extends BasicQueryPageComponent<ITLS52040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    RJM_No: [null, [Validators.maxLength(16)]], // 驗收編號
    LOGO_NoList: [null], // 品牌代碼
    HOS_NoList: [null], // 倉庫代碼
    VEN_No: [null], // 廠商編號
    queryNo: [null, [Validators.maxLength(20)]], // 管理編號
    RJM_StatusList: [null], // 驗收狀態
    APPLY_USR: [null], // 申請人員
    APPLY_Date_Start: [null], // 申請日期起
    APPLY_Date_End: [null], // 申請日期迄
    CRN_No: [null, [Validators.maxLength(16)]], // 採購單號
    APRV_USR: [null], // 審核人員
    APRV_Date_Start: [null], // 審核(驗收)日期起
    APRV_Date_End: [null], // 審核(驗收)日期迄
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'APPLY_Date', order: -1 }, { field: 'RJM_No', order: -1 }]],
  });
  totalRecords = 0;
  warehouseOptions = this.dropdown.queryPos2034(); // 倉別
  brandOptions = this.dropdown.queryPluLogo(); // 品牌代碼
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商編號
  poStatusOptions = getSYS1000Options('RJM_Status');
  userOptions = this.dropdown.queryTblUser(); // 申請人員、審核人員、結案人員
  pluMagNoOptions: { label: string, value: string }[] = []; // 商品管理編號
  data: ITLS52040Data[] = [];
  selectedItems: ITLS52040Data[] = [];
  lastQueryBody: IQueryTLS52040Request | null = null;
  columns: ReportColumn[] = [
    { field: 'RJM_No', header: '退貨驗收編號', visible: true, width: '110px' },
    { field: 'VEN_No', header: '廠商編號', visible: true, width: '90px' }, // 廠商編號
    { field: 'VEN_Name', header: '廠商名稱', visible: true, width: '150px' }, // 廠商名稱
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // 品牌代碼
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true, width: '80px' }, // 品牌名稱
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    // { field: 'org_id', header: '組織代碼/組織名稱', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate, sortField: 'APPLY_Date', width: '80px' },
    { field: 'APPLY_USR_No', header: '申請人員', visible: true, sortField: 'APPLY_USR_No' },
    { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true, sortField: 'APPLY_USR_Name' },
    { field: 'RJM_Status', header: '退貨驗收單狀態', visible: true, format: value => this.poStatusOptions.find(x => x.value === value)?.label || value },
    { field: 'RJM_TotalBuyNet', header: '未稅進價小計', visible: true, format: formatAmount },
    { field: 'RJM_TotalBuyTax', header: '進價稅額小計', visible: true, format: formatAmount },
    { field: 'RJM_TotalBuyAmt', header: '進價合計', visible: true, format: formatAmount },
    // { field: 'RJM_TotalSaleNet', header: '未稅售價小計', visible: true, format: formatAmount },
    // { field: 'RJM_TotalSaleTax', header: '售價稅額小計', visible: true, format: formatAmount },
    { field: 'RJM_TotalSaleAmt', header: '售價合計', visible: true, format: formatAmount },
    // { field: 'RJM_TaxType', header: '單據稅別', visible: true, format: value => value === '1' ? '應稅' : '免稅' },
    { field: 'APRV_Date', header: '審核(驗收)日期', visible: true, format: formatDate, width: '80px' },
    { field: 'APRV_USR_No', header: '審核人員', visible: true },
    { field: 'APRV_USR_Name', header: '審核人員姓名', visible: true },
    { field: 'ReAPRV_Date', header: '反審核日期', visible: true, format: formatDate, width: '80px' },
    { field: 'ReAPRV_USR_No', header: '反審核人員', visible: true },
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: true },
    { field: 'Void_Date', header: '作廢日期', visible: true, format: formatDate, width: '80px' },
    { field: 'Void_USR_No', header: '作廢人員', visible: true },
    { field: 'Void_USR_Name', header: '作廢人員姓名', visible: true },
    { field: 'RJM_Remark', header: '備註', visible: true },
    // { field: 'Request_No', header: '請款單號', visible: true },
    { field: 'ACP_No', header: '應付帳款編號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime, width: '130px' },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime, width: '130px' },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.已審核); },
      disabled: (rowData: ITLS52040Data) =>
        rowData.RJM_Status !== POStatus.已確認 ||
        !!rowData.ReAPRV_Date ||
        !rowData.CanAPRV ||
        !this.hasPermission(Actions.Audit)
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.已確認); },
      disabled: (rowData: ITLS52040Data) => rowData.Request_No !== null || rowData.RJM_Status !== POStatus.已審核 || !this.hasPermission(Actions.AntiAudit)
    },
    {
      label: '作廢單據',
      icon: 'pi pi-trash text-red-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.作廢); },
      disabled: (rowData: ITLS52040Data) => rowData.RJM_Status !== POStatus.已確認 || !this.hasPermission(Actions.Invalidate)
    },
  ];
  constructor(
    public readonly tls52040Service: Tls52040Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52040', 'TLS/TLS52040cru', this.queryForm, (f) => this.onSubmit(f));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52040Service.queryTLS52040(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.lastQueryBody = frm.value;
        const state = this.router.lastSuccessfulNavigation?.extras.state;
        const returnData = state?.['data'];
        if (returnData?.Status === 'insert') {
          this.data = [response.Data[0]];
          delete returnData['Status'];
        } else {
          this.data = response.Data;
        }
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
  btnLoading = false;
  statusChange(rowData: ITLS52040Data, status: string) {
    this.btnLoading = true;
    const body = {
      id: rowData.id,
      RJM_No: rowData.RJM_No,
      RJM_Status: status,
      RJM_Status_Ori: rowData.RJM_Status,
      Rebate_No: rowData.Request_No || '',
    }
    this.tls52040Service.updateStatusTLS52040(body).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  editDisabled(rowData: ITLS52040Data) {
    return rowData.RJM_Status !== POStatus.已確認;
  }
  get disabledClose() {
    return this.selectedItems.some(item => (item.RJM_Status !== POStatus.已審核) && (item.RJM_Status !== POStatus.部分驗收));
  }

  get selectedCount() {
    return this.selectedItems.length;
  }
  printLoading = false;
  print(rowData: ITLS52040Data[], type: 'pdf' | 'excel') {
    const params = { RJM_NoList: rowData.map(item => item.RJM_No) };
    let export$: Observable<HttpResponse<Blob>>;
    // 2. 決定要呼叫哪個 API 服務方法
    switch (type) {
      case 'pdf':
        export$ = this.tls52040Service.exportTLS52040PDF(params);
        break;
      case 'excel':
        export$ = this.tls52040Service.exportTLS52040(params);
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
}
