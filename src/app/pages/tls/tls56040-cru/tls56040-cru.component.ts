import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from "primeng/table";
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls56040-cru',
  templateUrl: './tls56040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
    TableModule,
    InputTextareaComponent,
    TableComponent
  ]
})
export class TLS56040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 主檔表單定義
  dataForm = this.formBuilder.group({
    MVM_No: [{ value: '系統自動取號', disabled: true }], // 調撥單編號，readonly, 系統自動取號
    LOGO_No: [null, Validators.required], // 品牌編號，下拉選項，必填
    OUT_HOS_No: [null, Validators.required], // 調出倉別，下拉選項，必填
    IN_HOS_No: [null, Validators.required], // 調入倉別，下拉選項，必填
    APPLY_TotBuyNet: [{ value: 0, disabled: true }], // 金額，readonly，明細加總
    APPLY_TotQty: [{ value: 0, disabled: true }], // 數量，readonly，明細加總
    CRT_Date: [{ value: new Date(), disabled: true }], // 申請日期，預帶系統日期
    CRT_USR_No: [{ value: '預帶登入人員', disabled: true }], // 申請人編號，預帶登入人員
    MVM_Remark: [null, [Validators.maxLength(200)]], // 倉別調撥單說明

    // 以下主檔欄位不顯示在畫面上，但需要初始化
    SYS_StoreNo: [null], // 公司編號/店號
    MVM_Status: ['1'], // 調撥狀態，新增給1=已申請
    org_id: [null], // 組織代碼/部門代碼，給null

    OUTGODS_TotQty: [0], // 調撥發貨數量合計
    OUTGODS_TotBuyNet: [0], // 調撥發貨未稅進價小計
    OUTGODS_TotBuyTax: [0], // 調撥發貨進價稅額小計
    OUTGODS_TotBuyAmt: [0], // 調撥發貨進價合計
    OUTGODS_TotSaleAmt: [0], // 調撥發貨售價合計

    Confirm_TotQty: [0], // 調撥驗收數量合計
    Confirm_TotBuyNet: [0], // 調撥驗收未稅進價小計
    Confirm_TotBuyTax: [0], // 調撥驗收進價稅額小計
    Confirm_TotBuyAmt: [0], // 調撥驗收進價合計
    Confirm_TotSaleAmt: [0], // 調撥驗收售價合計

    OUTGODS_DATE: [null], // 發貨日期
    OUTGODS_USR_No: [null], // 發貨人員
    OUTGODS_USR_Name: [null], // 發貨人員姓名

    Confirm_DATE: [null], // 驗收日期
    Confirm_USR_No: [null], // 驗收人員
    Confirm_USR_Name: [null], // 驗收人員姓名

    // 明細檔項目 (作為 FormArray)
    details: this.formBuilder.array([])
  });

  data: any = []; // 用於表格顯示明細數據
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true, type: 'autoComplete' },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'MVD_BuyPrc', header: '進單價', visible: true },
    { field: 'CurrentStock', header: '目前庫存', visible: true }, // 需要SP讀取
    { field: 'APPLY_Qty', header: '調撥申請數量', visible: true, type: 'inputNumber' },
    { field: 'APPLY_BuyNet', header: '調撥申請進價未稅小計', visible: true },
    { field: 'MVD_Remark', header: '單項說明', visible: true, type: 'input' },
  ];
  defaultInsertData: any = {
    PLU_MagNo: null,
    PLU_No: null,
    PLU_Name: null,
    MVD_BuyPrc: 0,
    CurrentStock: 0,
    APPLY_Qty: 0,
    APPLY_BuyNet: 0,
    MVD_Remark: null,
  }

  // 下拉選單選項 (需從API獲取)
  brandOptions: { label: string; value: string }[] = [];// 品牌
  warehouseOptions: { label: string; value: string }[] = []; // 倉別
  userOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56040', this.dataForm);
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(options => {
      this.warehouseOptions = options.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.brandOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.userOptions = options.Data.map(item => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    this.dataForm.patchValue({ CRT_USR_No: this.authService.currentUserValue?.user_No });

    // 調出倉別與調入倉別必需不同 的驗證
    this.dataForm.controls['OUT_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['IN_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });

    this.dataForm.controls['IN_HOS_No'].valueChanges.subscribe(value => {
      if (value && this.dataForm.controls['OUT_HOS_No'].value === value) {
        this.dataForm.controls['IN_HOS_No'].setErrors({ 'warehouseMismatch': true });
      } else {
        this.dataForm.controls['IN_HOS_No'].setErrors(null);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 提交邏輯
      console.log('Form Submitted!', frm.value);
    });
  }
  // 商品明細的 FormArray Getter
  get details() {
    return this.dataForm.get('details') as import('@angular/forms').FormArray;
  }

  // 新增商品明細行
  addDetailRow() {
    // TODO: 系統自動取項次 MVD_SeqNo，需要呼叫 spIMSGETSEQ_GetNextSerialNo SP
    // 目前先給一個簡單的遞增值
    const nextSeqNo = this.dataForm.controls['details'].length + 1;

    const detailRow = this.formBuilder.group({
      MVD_SeqNo: [{ value: nextSeqNo, disabled: true }], // 項次，readonly
      PLU_MagNo: [null], // 商品管理編號
      PLU_No: [{ value: null, disabled: true }], // 國際條碼，readonly
      PLU_Name: [{ value: null, disabled: true }], // 商品名稱，readonly
      MVD_BuyPrc: [{ value: 0, disabled: true }], // 進單價，readonly
      CurrentStock: [{ value: 0, disabled: true }], // 目前庫存，readonly，需要SP讀取
      APPLY_Qty: [0, Validators.required], // 調撥申請數量，預設0，必填
      APPLY_BuyNet: [{ value: 0, disabled: true }], // 調撥申請進價未稅小計，readonly
      MVD_Remark: [null], // 單項說明
      // 以下為不顯示在畫面上，但需要初始化或計算的明細欄位
      PLU_Unit: [{ value: null, disabled: true }], // 單位代碼
      PLU_BoxQty: [{ value: null, disabled: true }], // 裝箱入數
      PLU_StockTaxType: [{ value: null, disabled: true }], // 進價稅別
      PLU_TaxType: [{ value: null, disabled: true }], // 售價稅別
      MVD_SalePrc: [{ value: null, disabled: true }], // 售單價
      OUTGODS_QTY: [0], // 調撥發貨數量
      Confirm_QTY: [0], // 調撥驗收數量
      APPLY_BuyTax: [{ value: 0, disabled: true }], // 調撥申請進價稅額
      APPLY_BuyAmt: [{ value: 0, disabled: true }], // 調撥申請進價合計
      APPLY_SaleAmt: [{ value: 0, disabled: true }], // 調撥申請售價小計
      OUTGODS_BuyNet: [0], // 調撥發貨進價未稅小計
      OUTGODS_BuyTax: [0], // 調撥發貨進價稅額
      OUTGODS_BuyAmt: [0], // 調撥發貨進價合計
      OUTGODS_SaleAmt: [0], // 調撥發貨售價小計
      Confirm_BuyNet: [0], // 調撥驗收進價未稅小計
      Confirm_BuyTax: [0], // 調撥驗收進價稅額
      Confirm_BuyAmt: [0], // 調撥驗收進價合計
      Confirm_SaleAmt: [0], // 調撥驗收售價小計
      CRT_Date: [null],
      CRT_USR_No: [null],
      CRT_USR_Name: [null],
      UPD_Date: [null],
      UPD_USR_No: [null],
      UPD_USR_Name: [null],
    });

    this.details.push(detailRow);

    // TODO: 監聽 PLU_MagNo 或 PLU_No 欄位的變化，觸發商品資訊查詢和庫存查詢
    // detailRow.get('PLU_MagNo')?.valueChanges.subscribe(value => { /* ... 查詢邏輯 ... */ });
    // detailRow.get('APPLY_Qty')?.valueChanges.subscribe(value => { /* ... 金額計算邏輯 ... */ });
  }

  // 刪除商品明細行
  removeDetailRow(index: number) {
    this.details.removeAt(index);
    // TODO: 重新計算主檔金額與數量
  }

  // TODO: 實現載入品牌、倉庫、人員等下拉選單資料的方法
  // loadBrandCodeOptions() { /* ... */ }
  // loadWarehouseOptions() { /* ... */ }
  // loadApplicantCodeOptions() { /* ... */ }
}
