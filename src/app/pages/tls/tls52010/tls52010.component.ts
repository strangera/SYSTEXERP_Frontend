import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ITLS52010Data, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount, formatDateTime, formatYN } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IPOS2013Request } from '../../../service/api/dropdownservice/dropDownList.service'; // 導入 DropDownListService 和所需介面
import { finalize, map } from 'rxjs'; // 只需要 map 運算符，因為我們將直接訂閱

// 2.5.2.1 採購單維護作業
@Component({
  selector: 'app-tls52010',
  templateUrl: './tls52010.component.html',
})
export class TLS52010Component extends BasicQueryPageComponent<ITLS52010Data> implements OnInit {
  // 查詢表單定義
  queryForm = this.formBuilder.group({
    PO_No: ['', [Validators.maxLength(16)]], // 採購單編號 input
    HOS_No: [null], // 倉庫代碼 multi-select
    LOGO_No: [null], // 品牌代碼 multi-select
    VEN_No: [null], // 廠商編號 multi-select
    PO_Status: [null, [Validators.required]], // 採購單狀態 multi-select
    APPLY_USR: [null], // 申請人員 multi-select
    APPLY_Date_Start: [null], // 申請日期 起 calendar-range
    APPLY_Date_End: [null], // 申請日期 迄
    APRV_USR: [null], // 審核人員 multi-select
    APRV_Date_Start: [null], // 審核日期 起 calendar-range
    APRV_Date_End: [null], // 審核日期 迄
    CLOS_USR: [null], // 強制結案人員 multi-select
    CLOS_Date_Start: [null], // 強制結案日期 起 calendar-range
    CLOS_Date_End: [null], // 強制結案日期 迄
    ...createPaginationConfig([{ field: 'APPLY_Date', order: -1 }, { field: 'PO_No', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: ITLS52010Data[] = [];

  // 表格欄位定義
  columns: Column[] = [
    { field: 'PO_No', header: '採購單號', visible: true }, // 採購單號
    { field: 'SYS_StoreNo', header: '門店編號', visible: true }, // 門店編號 (系統)
    { field: 'VEN_No', header: '廠商代號', visible: true }, // 廠商代號
    { field: 'LOGO_No', header: '品牌代碼', visible: true }, // LOGO代碼
    { field: 'HOS_No', header: '倉庫代碼', visible: true }, // 倉庫代碼
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 倉庫名稱
    { field: 'org_id', header: '組織代碼', visible: true }, // 組織代碼
    { field: 'ODM_TaxType', header: '稅別', visible: true, format: value => value === '1' ? '應稅' : '免稅' }, // 稅別
    { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDateTime }, // 申請日期 (ISO 格式字串)
    { field: 'APPLY_USR_No', header: '申請人員編號', visible: true }, // 申請人員編號
    { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true }, // 申請人員姓名
    { field: 'PO_TotalSubQty', header: '採購總數量', visible: true, format: formatAmount }, // 採購總數量
    { field: 'PO_TotalBuyNet', header: '採購總淨額', visible: true, format: formatAmount }, // 採購總淨額
    { field: 'PO_TotalBuyTax', header: '採購總稅額', visible: true, format: formatAmount }, // 採購總稅額
    { field: 'PO_TotalBuyAmt', header: '採購總金額', visible: true, format: formatAmount }, // 採購總金額
    { field: 'PO_TotalSaleNet', header: '銷售總淨額', visible: true, format: formatAmount }, // 銷售總淨額
    { field: 'PO_TotalSaleTax', header: '銷售總稅額', visible: true, format: formatAmount }, // 銷售總稅額
    { field: 'PO_TotalSaleAmt', header: '銷售總金額', visible: true, format: formatAmount }, // 銷售總金額
    { field: 'PO_Status', header: '採購單狀態', visible: true, format: value => this.poStatusOptions.find(x => x.value === value)?.label || value }, // 採購單狀態
    { field: 'APRV_Date', header: '核准日期', visible: true, format: formatDateTime }, // 核准日期 (ISO 格式字串)
    { field: 'APRV_USR_No', header: '核准人員編號', visible: true }, // 核准人員編號
    { field: 'APRV_USR_Name', header: '核准人員姓名', visible: true }, // 核准人員姓名
    { field: 'VOID_Date', header: '作廢日期', visible: true, format: formatDateTime }, // 作廢日期 (ISO 格式字串)
    { field: 'VOID_USR_No', header: '作廢人員編號', visible: true }, // 作廢人員編號
    { field: 'VOID_USR_Name', header: '作廢人員姓名', visible: true }, // 作廢人員姓名
    { field: 'CLOS_Date', header: '結案日期', visible: true, format: formatDateTime }, // 結案日期 (ISO 格式字串)
    { field: 'CLOS_USR_No', header: '結案人員編號', visible: true }, // 結案人員編號
    { field: 'CLOS_USR_Name', header: '結案人員姓名', visible: true }, // 結案人員姓名
    { field: 'PO_Remark', header: '採購單備註', visible: true }, // 採購單備註
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime }, // 建立日期 (ISO 格式字串)
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true }, // 建立人員編號
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true }, // 建立人員姓名
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime }, // 變更日期 (ISO 格式字串)
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true }, // 變更人員編號
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true }, // 變更人員姓名
    { field: 'CanClos', header: '是否可結案', visible: true, format: formatYN }, // 是否可結案
  ];
  // 聲明用於儲存下拉選單選項的變數，直接為陣列型別
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string, value: string }[] = []; // 品牌代碼
  vendorOptions: { label: string, value: string }[] = []; // 廠商編號
  poStatusOptions: { label: string, value: string }[] = []; // 採購單狀態 (靜態資料)
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員

  constructor(
    private tls52010Service: Tls52010Service, // 注入 TLS52010Service
    private dropDownListService: DropDownListService // 注入 DropDownListService
  ) {
    super(); // 呼叫父類別的建構子
  }

  ngOnInit(): void {
    // 初始化頁面，設定服務名稱、CRU 路徑和表單提交處理函數
    this.initializePage('TLS52010', 'TLS/TLS52010CRU', this.queryForm, (form) => this.onSubmit(form));

    // 呼叫 API 獲取下拉選單資料並直接賦值給陣列變數
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.warehouseOptions = options;
    });

    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.brandOptions = options;
    });

    // 廠商編號 (VEN_No)
    const venFlagParams: IPOS2013Request = { VEN_Flag: '' }; // 根據實際需求設定 VEN_Flag
    this.dropDownListService.queryPOS2013_DropDownList(venFlagParams).pipe(
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.vendorOptions = options;
    });

    // 採購單狀態 (PO_Status) - 靜態資料，已更新為你提供的正確值
    this.poStatusOptions = [
      { label: '已申請', value: '0' },
      { label: '取消(審核前使用)', value: '1' },
      { label: '已審核', value: '2' },
      { label: '部分驗收', value: '3' },
      { label: '全部驗收', value: '4' },
      { label: '作廢(審核後使用)', value: '5' },
      { label: '強制結案', value: '6' }
    ];

    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryUser_Name_DropDownList().pipe(
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
  }

  // 表單提交處理方法
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls52010Service.queryTLS52010(frm.value).pipe(finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
