import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ITLS52040Data, Tls52040Service } from '../../../service/api/tls/tls52040.service';
import { AddButton, Column, createPaginationConfig, formatAmount, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { finalize, map, Subject, takeUntil } from 'rxjs';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';

export const enum POStatus {
  已確認 = '1',
  已審核 = '2',
  作廢 = '9',
}
@Component({
  selector: 'app-tls52040',
  templateUrl: './tls52040.component.html',
})
export class TLS52040Component extends BasicQueryPageComponent<ITLS52040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ODM_No: ['', [Validators.maxLength(16)]], // 驗收編號
    LOGO_NoList: [null], // 品牌代碼
    HOS_NoList: [null], // 倉庫代碼
    VEN_No: [''], // 廠商代號
    PLU_MagNo: ['', [Validators.maxLength(20)]], // 管理編號
    ODM_StatusList: [null, [Validators.required]], // 驗收狀態
    ODM_USR: [''], // 申請人員
    ODM_Date_Start: [''], // 申請日期起
    ODM_Date_End: [''], // 申請日期迄
    PO_No: ['', [Validators.maxLength(16)]], // 採購單號
    APRV_USR: [''], // 審核人員
    APRV_Date_Start: [''], // 審核(驗收)日期起
    APRV_Date_End: [''], // 審核(驗收)日期迄
    ...createPaginationConfig([{ field: 'ODM_Date', order: -1 }, { field: 'ODM_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  warehouseOptions: IDropdownItem[] = []; // 倉別
  pluMagNoOptions: { label: string, value: string }[] = []; // 商品管理編號
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  poStatusOptions: { label: string, value: string }[] = []; // 採購單狀態 (靜態資料)
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員
  private destroy$ = new Subject<void>(); // 用於管理訂閱的生命週期
  data: ITLS52040Data[] = [];
  selectedItems: ITLS52040Data[] = [];
  columns: Column[] = [
    { field: 'ODM_No', header: '退貨驗收編號', visible: true },
    { field: 'SYS_StoreNo', header: '公司編號/店號', visible: false },
    { field: 'VEN_No', header: '廠商代號', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    { field: 'org_id', header: '組織代碼/所屬部門', visible: true },
    { field: 'ODM_Date', header: '申請日期', visible: true, format: formatDateTime },
    { field: 'ODM_USR_No', header: '申請人員', visible: true },
    { field: 'ODM_USR_Name', header: '申請人員姓名', visible: true },
    { field: 'ODM_TotalBuyNet', header: '未稅進價小計', visible: true, format: formatAmount },
    { field: 'ODM_TotalBuyTax', header: '進價稅額小計', visible: true, format: formatAmount },
    { field: 'ODM_TotalBuyAmt', header: '進價合計', visible: true, format: formatAmount },
    { field: 'ODM_TotalSaleNet', header: '未稅售價小計', visible: true, format: formatAmount },
    { field: 'ODM_TotalSaleTax', header: '售價稅額小計', visible: true, format: formatAmount },
    { field: 'ODM_TotalSaleAmt', header: '售價合計', visible: true, format: formatAmount },
    { field: 'ODM_Status', header: '驗收狀態', visible: true, format: value => this.poStatusOptions.find(x => x.value === value)?.label || value },
    // { field: 'ODM_TaxType', header: '單據稅別', visible: true, format: value => value === '1' ? '應稅' : '免稅' },
    { field: 'APRV_Date', header: '審核(驗收)日期', visible: true, format: formatDateTime },
    { field: 'APRV_USR_No', header: '審核人員', visible: true },
    { field: 'APRV_USR_Name', header: '審核人員姓名', visible: true },
    { field: 'ReAPRV_Date', header: '反審核日期', visible: true, format: formatDateTime },
    { field: 'ReAPRV_USR_No', header: '反審核人員', visible: true },
    { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: true },
    { field: 'Void_Date', header: '作廢日期', visible: true, format: formatDateTime },
    { field: 'Void_USR_No', header: '作廢人員', visible: true },
    { field: 'Void_USR_Name', header: '作廢人員姓名', visible: true },
    { field: 'ODM_Remark', header: '備註', visible: true },
    { field: 'Request_No', header: '請款單號', visible: true },
    { field: 'ACP_No', header: '應付帳款編號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.已審核); },
      disabled: (rowData: ITLS52040Data) => rowData.ODM_Status !== POStatus.已確認
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.已確認); },
      disabled: (rowData: ITLS52040Data) => rowData.Request_No !== null || rowData.ODM_Status !== POStatus.已審核
    },
    {
      label: '作廢單據',
      icon: 'pi pi-trash text-red-500',
      action: (rowData: ITLS52040Data) => { this.statusChange(rowData, POStatus.作廢); },
      disabled: (rowData: ITLS52040Data) => rowData.ODM_Status !== POStatus.已確認
    },
  ];
  constructor(
    private tls52040Service: Tls52040Service,
    private dropDownListService: DropDownListService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52040', 'TLS/TLS52040cru', this.queryForm, (f) => this.onSubmit(f));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this), takeUntil(this.destroy$)).subscribe(response => {
      this.warehouseOptions = response.Data;
    });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this), takeUntil(this.destroy$)).subscribe(response => {
      this.brandOptions = response.Data.map(brand => ({
        ...brand,
        label: `${brand.No} - ${brand.Name}`,
      }));
    });
    // 廠商編號 (VEN_No)
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this), takeUntil(this.destroy$)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({
        ...vendor,
        label: `${vendor.VEN_No} - ${vendor.Name}`,
      }));
    });
    // 採購單狀態 (PO_Status) - 靜態資料，已更新為你提供的正確值
    this.poStatusOptions = [
      { label: '已確認', value: '1' },
      { label: '已審核', value: '2' },
      { label: '作廢', value: '9' },
    ];
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryUser_Name_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52040Service.queryTLS52040(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
  statusChange(rowData: ITLS52040Data, status: string) {
    const body = {
      id: rowData.id,
      ODM_No: rowData.ODM_No,
      ODM_Status: status,
      ODM_Status_Ori: rowData.ODM_Status,
      Request_No: rowData.Request_No
    }
    this.tls52040Service.updateStatusTLS52040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onSubmit(this.queryForm);
    });
  }
  editDisabled(rowData: ITLS52040Data) {
    return rowData.ODM_Status !== POStatus.已確認;
  }
}
