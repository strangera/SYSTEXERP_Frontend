import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tls56040',
  templateUrl: './tls56040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TranslateModule,
    TableComponent,
    CommonModule
  ],
})
export class TLS56040Component extends BasicQueryPageComponent<any> implements OnInit {
  // 查詢表單定義，欄位名稱對應資料庫schema
  queryForm = this.formBuilder.group({
    MVM_No: [null, [Validators.maxLength(12)]],               // varchar(12)
    MVM_Status: [null, [Validators.maxLength(1)]],            // varchar(1)
    PLU_MagNo: [null],                                      // 非 POS2021 欄位，保留不設驗證
    LOGO_No: [null],                                        // 非 POS2021 欄位，保留不設驗證
    OUT_HOS_No: [null, [Validators.maxLength(6)]],       // varchar(6)
    IN_HOS_No: [null, [Validators.maxLength(6)]],    // varchar(6)
    CRT_USR_No: [null, [Validators.maxLength(8)]],            // varchar(8)
    UPD_USR_No: [null, [Validators.maxLength(8)]],            // varchar(8)
    MVM_Date_Start: [new Date()],                             // datetime，預設無驗證
    MVM_Date_End: [new Date()],                               // datetime，預設無驗證
    MVM_ConfirmDate_Start: [null],                            // datetime，預設無驗證
    MVM_ConfirmDate_End: [null],                              // datetime，預設無驗證
    ...createPaginationConfig([{ field: 'MVM_No', order: 1 }]),  // 分頁與排序參數，不需加驗證
  });
  totalRecords = 0;
  data: any[] = [];
  // 表格欄位定義，使用schema名稱和中文標題
  columns: Column[] = [
    { field: 'MVM_No', header: '倉別請領單編號', visible: true },
    { field: 'SYS_StoreNo', header: '店號', visible: true }, // 調出倉別
    { field: 'MVM_Status', header: '倉別調撥單狀態', visible: true },
    { field: 'MVM_Type', header: '移轉型態', visible: true },
    { field: 'MVM_MoveStoreNo', header: '對方移入/出店號', visible: true }, // 調入倉別
    { field: 'MVM_MoveNo', header: '對方移入/出編號', visible: true },
    { field: 'MVM_Date', header: '移轉日期', visible: true },
    { field: 'USR_Name', header: '輸入人員姓名', visible: true },
    { field: 'MVM_TotalQty', header: '移轉數量(入數計)', visible: true },
    { field: 'MVM_TotalSubQty', header: '數量合計', visible: true },
    { field: 'MVM_TotalBuyNet', header: '未稅進價小計', visible: true },
    { field: 'MVM_TotalBuyTax', header: '進價稅額小計', visible: true },
    { field: 'MVM_TotalBuyAmt', header: '進價合計', visible: true },
    { field: 'MVM_TotalSaleNet', header: '未稅售價小計', visible: true },
    { field: 'MVM_TotalSaleTax', header: '售價稅額小計', visible: true },
    { field: 'MVM_TotalSaleAmt', header: '售價合計', visible: true },
    { field: 'MVM_Remark', header: '備註', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true },
    { field: 'CRT_USR_No', header: '建立人員', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true },
    { field: 'UPD_USR_No', header: '變更人員', visible: true },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'MVM_ConfirmTotalSubQty', header: '移入驗收數量(個數計)', visible: true },
    { field: 'MVM_ConfirmDate', header: '移入驗收日期/移出確認日期', visible: true },
    { field: 'MVM_TaxType', header: '是否已轉出檔案', visible: true },
    { field: 'MVM_SenderName', header: '送貨人員姓名', visible: true },
  ];

  // 倉別調撥單狀態選項 (根據需求，這可能與 MVM_Status 的資料庫值有映射關係)
  issuanceNoteStatusOptions = [
    { label: '已申請', value: '1' },
    { label: '已審核', value: '2' },
    { label: '已發貨', value: '3' },
    { label: '已收貨確認', value: '4' },
    { label: '已作廢', value: '9' },
  ];

  LOGO_Noptions = []; // TODO: 需要呼叫API取得PLULOGO商品品牌設定檔的資料
  warehouseOptions = []; // TODO: 需要呼叫API取得POS2034倉庫設定檔的資料
  userCodeOptions = []; // TODO: 需要呼叫API取得人員資訊

  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', '/TLS/TLS56040CRU', this.queryForm, (form) => this.onSubmit(form));
    // TODO: 預帶登入人員 (申請人)，需要呼叫service取得登入人員資訊
    // 例如: this.queryForm.patchValue({ CRT_USR_No: this.authService.getLoggedInUser().userNo });

    // TODO: 呼叫API以載入下拉選單選項
    // this.getBrandCodeOptions();
    // this.getWarehouseOptions();
    // this.getUserCodeOptions();
  }

  onSubmit(frm: FormGroup) {
    // 處理查詢邏輯
    this.handleSubmit(frm, () => {
      // 模擬API返回的數據 (實際應用中應從後端服務獲取)
      const mockData = [
        {
          MVM_No: 'I20250809001',
          SYS_StoreNo: 'WH001',
          MVM_Type: '1', // 1=移出
          MVM_MoveStoreNo: 'ST001',
          MVM_MoveNo: 'O20250809001',
          MVM_Date: '2025-08-09T10:00:00',
          USR_Name: '王小明',
          MVM_TotalQty: 10,
          MVM_TotalSubQty: 100,
          MVM_TotalBuyNet: 500.0000,
          MVM_TotalBuyTax: 50.0000,
          MVM_TotalBuyAmt: 550.0000,
          MVM_TotalSaleNet: 1000.0000,
          MVM_TotalSaleTax: 100.0000,
          MVM_TotalSaleAmt: 1100.0000,
          MVM_Status: '1', // 已申請
          MVM_Remark: '緊急調撥',
          CRT_Date: '2025-08-09T09:00:00',
          CRT_USR_No: 'APL001',
          UPD_Date: '2025-08-09T11:00:00',
          UPD_USR_No: 'APR001', // 模擬審核人
          VEN_No: 'VEN001',
          MVM_ConfirmTotalSubQty: 100,
          MVM_ConfirmDate: '2025-08-09T11:30:00',
          MVM_TaxType: '1',
          MVM_SenderName: '物流A',
          PLU_No: 'P000000000001',
          PLU_MagNo: 'GM001',
          PLU_Name: '商品A',
          PLU_Spec: '規格1',
          MVD_Qty: 10,
          MVD_SubQty: 100,
          MVD_BuyPrc: 50.0000,
          MVD_SalePrc: 100.0000,
          MVD_GiftFlag: 'N',
          MVD_ConfirmSubQty: 100,
          Expiry_Date: '2026-12-31T00:00:00'
        },
        // 可新增更多模擬數據
      ];
      this.data = mockData;
      this.totalRecords = mockData.length;
      this.loading = false;
    });
  }
}
