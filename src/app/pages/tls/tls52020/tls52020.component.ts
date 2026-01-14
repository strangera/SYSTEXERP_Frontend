import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { ITLS52020Data, Tls52020Service } from '../../../service/api/tls/tls52020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig, formatAmount, formatDate, formatDateTime } from '../../../shared/componentkit/table/table.model';
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
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, DropdownTableComponent, DropdownComponent, CalendarRangeQuickComponent, TableComponent, Button, TooltipModule, NgStyle, NgIf, TranslateModule]
})
export class TLS52020Component extends BasicQueryPageComponent<ITLS52020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    CRN_No: ['', [Validators.maxLength(16)]], // 退貨單編號
    queryNo: ['', [Validators.maxLength(20)]], // 查詢編號 input
    HOS_NoList: [null], // 倉庫代碼 multi-select
    LOGO_NoList: [null], // 品牌代碼 multi-select
    VEN_No: [null], // 廠商編號 multi-select
    CRN_StatusList: [null], // 採購單狀態 multi-select
    APPLY_USR: [null], // 申請人員 multi-select
    APPLY_Date_Start: [null], // 申請日期 起 calendar-range
    APPLY_Date_End: [null], // 申請日期 迄
    APRV_USR: [null], // 審核人員 multi-select
    APRV_Date_Start: [null], // 審核日期 起 calendar-range
    APRV_Date_End: [null], // 審核日期 迄
    CLOS_USR: [null], // 強制結案人員 multi-select
    CLOS_Date_Start: [null], // 強制結案日期 起 calendar-range
    CLOS_Date_End: [null], // 強制結案日期 迄
    ...createPaginationConfig([{ field: 'APPLY_Date', order: -1 }, { field: 'CRN_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: ITLS52020Data[] = [];
  selectedItems: ITLS52020Data[] = [];
  columns: Column[] = [
    { field: 'CRN_No', header: '退貨單號', visible: true }, // 採購單號
    { field: 'VEN_No', header: '廠商編號', visible: true }, // 廠商編號
    { field: 'VEN_Name', header: '廠商名稱', visible: true }, // 廠商名稱
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // 品牌代碼
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true }, // 品牌名稱
    { field: 'HOS_No', header: '倉庫代碼', visible: true }, // 倉庫代碼
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 倉庫名稱
    { field: 'org_id', header: '組織代碼', visible: true }, // 組織代碼
    { field: 'CRN_Status', header: '退貨單狀態', visible: true, format: value => this.crnstatusOptions.find(x => x.value === value)?.label || value }, // 採購單狀態
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate }, // 申請日期 (ISO 格式字串)
    { field: 'APPLY_USR_No', header: '申請人員編號', visible: true }, // 申請人員編號
    { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true }, // 申請人員姓名
    { field: 'CRN_TotalSubQty', header: '退貨數量合計', visible: true, format: formatAmount }, // 退貨數量合計
    { field: 'CRN_TotalBuyNet', header: '未稅進價小計', visible: true, format: formatAmount }, // 未稅進價小計
    { field: 'CRN_TotalBuyTax', header: '進價稅額小計', visible: true, format: formatAmount }, // 進價稅額小計
    { field: 'CRN_TotalBuyAmt', header: '進價合計', visible: true, format: formatAmount }, // 進價合計
    { field: 'CRN_TotalSaleAmt', header: '售價合計', visible: true, format: formatAmount }, // 售價合計
    { field: 'CRN_Remark', header: '備註', visible: true }, // 備註
    { field: 'APRV_Date', header: '核准日期', visible: true, format: formatDate }, // 核准日期 (ISO 格式字串)
    { field: 'APRV_USR_No', header: '核准人員編號', visible: true }, // 核准人員編號
    { field: 'APRV_USR_Name', header: '核准人員姓名', visible: true }, // 核准人員姓名
    { field: 'ReAPRV_Date', header: '反審核日期', visible: true, format: formatDate }, // 反審核日期 (ISO 格式字串)
    { field: 'ReAPRV_USR_No', header: '反審核人員編號', visible: true }, // 反審核人員編號
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: true }, // 反審核人員姓名
    { field: 'VOID_Date', header: '作廢日期', visible: true, format: formatDate }, // 作廢日期 (ISO 格式字串)
    { field: 'VOID_USR_No', header: '作廢人員編號', visible: true }, // 作廢人員編號
    { field: 'VOID_USR_Name', header: '作廢人員姓名', visible: true }, // 作廢人員姓名
    { field: 'CLOS_Date', header: '結案日期', visible: true, format: formatDate }, // 結案日期 (ISO 格式字串)
    { field: 'CLOS_USR_No', header: '結案人員編號', visible: true }, // 結案人員編號
    { field: 'CLOS_USR_Name', header: '結案人員姓名', visible: true }, // 結案人員姓名
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期 (ISO 格式字串)
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false }, // 建立人員編號
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期 (ISO 格式字串)
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false }, // 變更人員編號
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
  warehouseOptions = this.dropdown.queryPos2034(); // 倉別
  brandOptions = this.dropdown.queryPluLogo(); // 品牌代碼
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商編號
  crnstatusOptions = getSYS1000Options('CRN_Status') // 採購單狀態 (靜態資料)
  userOptions = this.dropdown.queryTblUser(); // 申請人員、審核人員、結案人員
  addButton: AddButton[] = [
    { label: '單據審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已審核); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已申請 }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已申請); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已審核 }, // 反審核
    { label: '作廢單據', icon: 'pi pi-trash text-red-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.作廢); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已審核 }, // 作廢
  ];
  constructor(
    private readonly tls52020Service: Tls52020Service,
    private readonly dropdown: DropdownApiService,
    private readonly tls52010Service: Tls52010Service,
    private readonly fileExportService: FileExportService
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52020', 'tls/tls52020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  // 表單提交處理方法
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52020Service.queryTLS52020(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
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
    );
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
  // 管理編號
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + '/' + item.PLU_No + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
}
