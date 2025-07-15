import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ITLS52020Data, Tls52020Service } from '../../../service/api/tls/tls52020.service';
import { AddButton, Column, createPaginationConfig, formatAmount, formatDate, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { finalize, map } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { trigger, transition, style, animate } from '@angular/animations';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { FieldsConfig, DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NgStyle, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
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
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, MultiSelectComponent, DropdownTableComponent, DropdownComponent, CalendarRangeComponent, TableComponent, Button, TooltipModule, NgStyle, NgIf, TranslateModule]
})
export class TLS52020Component extends BasicQueryPageComponent<ITLS52020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    CRN_No: ['', [Validators.maxLength(16)]], // 退貨單編號
    queryNo: ['', [Validators.maxLength(20)]], // 查詢編號 input
    HOS_NoList: [null], // 倉庫代碼 multi-select
    LOGO_NoList: [null], // 品牌代碼 multi-select
    VEN_No: [null], // 廠商編號 multi-select
    CRN_StatusList: [null, [Validators.required]], // 採購單狀態 multi-select
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
    { field: 'SYS_StoreNo', header: '門店編號', visible: true }, // 門店編號 (系統)
    { field: 'VEN_No', header: '廠商代號', visible: true }, // 廠商代號
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // LOGO代碼
    { field: 'HOS_No', header: '倉庫代碼', visible: true }, // 倉庫代碼
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 倉庫名稱
    { field: 'org_id', header: '組織代碼', visible: true }, // 組織代碼
    { field: 'CRN_Status', header: '採購單狀態', visible: true, format: value => this.crnstatusOptions.find(x => x.value === value)?.label || value }, // 採購單狀態
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
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string, value: string }[] = []; // 品牌代碼
  vendorOptions: { label: string, value: string }[] = []; // 廠商編號
  crnstatusOptions: { label: string, value: string }[] = []; // 採購單狀態 (靜態資料)
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員
  addButton: AddButton[] = [
    { label: '單據審核', icon: 'pi pi-check-circle text-green-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已審核); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已申請 }, // 審核
    { label: '反審核', icon: 'pi pi-undo text-orange-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.已申請); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已審核 }, // 反審核
    { label: '作廢單據', icon: 'pi pi-trash text-red-500', action: (rowData: ITLS52020Data) => { this.statusChange(rowData, CRNtatus.作廢); }, disabled: (rowData: ITLS52020Data) => rowData.CRN_Status !== CRNtatus.已審核 }, // 作廢
  ];
  constructor(
    private tls52020Service: Tls52020Service,
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52020', 'tls/tls52020cru', this.queryForm, (form) => this.onSubmit(form));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this), map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.warehouseOptions = options; });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this), map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.brandOptions = options.map(item => ({ label: `${item.value} - ${item.label}`, value: item.value })); });
    // 廠商編號 (VEN_No)
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this), map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.vendorOptions = options.map(item => ({ label: `${item.value} - ${item.label}`, value: item.value })); });
    // 採購單狀態 (PO_Status) - 靜態資料，已更新為你提供的正確值
    this.crnstatusOptions = [
      { label: '已申請', value: '0' },
      { label: '已審核', value: '2' },
      { label: '部分驗收', value: '3' },
      { label: '全部驗收', value: '4' },
      { label: '強制結案', value: '6' },
      { label: '作廢', value: '9' },
    ];
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options;
    });
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
  print(rowData: ITLS52020Data[]) {
    console.log('列印多筆事件:', rowData);
  }
  btnLoading = false;
  statusChange(rowData: ITLS52020Data, status: string) {
    this.btnLoading = true;
    const body = {
      idList: [rowData.id],
      CRN_Status: status
    }
    this.tls52020Service.updateStatusTLS52020(body).pipe(finalize(() => this.btnLoading = false)).pipe(untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  close(rowData: ITLS52020Data[]) {
    const body = {
      idList: rowData.map(item => item.id),
      CRN_Status: CRNtatus.強制結案
    }
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
    { field: 'PLU_MagNo', header: '管理編號', mainDataField: true },
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
      this.suggestions = [...results.Data];
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
