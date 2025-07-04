import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/api/dropdownservice/dropDownList.service';
import { IODDetail, ITLS52030Data, Tls52030Service } from '../../../service/api/tls/tls52030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { Column, createPaginationConfig, LazyLoadEvent, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
// 2.5.2.3  進貨驗收作業CRU
@Component({
  selector: 'app-tls52030-cru',
  templateUrl: './tls52030-cru.component.html',
})
export class TLS52030CRUComponent extends BasicCruPageComponent<ITLS52030Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ODM_No: [{ value: '系統自動產生', disabled: true }], // 進貨驗收單號
    VEN_No: ['', [Validators.required]], // 廠商編號
    LOGO_No: ['', [Validators.required]], // 品牌編號 (與 POS2016.LOGO_No 對應)
    HOS_No: [{ value: null as string | null, disabled: true }, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    ODM_TotalBuyNet: [{ value: 0, disabled: true }], // 進貨驗收金額
    ODM_TotalBuyTax: [{ value: 0, disabled: true }], // 稅額
    ODM_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    ODM_USR_No: [{ value: null as string | null, disabled: true }], // 申請人
    ODM_Date: [{ value: new Date(), disabled: true }], // 申請日期
    ODM_TotalSaleAmt: [{ value: 0, disabled: true }], // 售價總計
    ODM_Remark: ['', [Validators.maxLength(200)]],// 進貨驗收單說明
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  vendorOptions: IDropdownItem[] = []; // 廠商下拉選單選項
  brandOptions: IDropdownItem[] = []; // 品牌下拉選單選項
  warehouseOptions: IDropdownItem[] = []; // 倉別下拉選單選項
  userOptions: { user_No: string; user_Name: string }[] = []; // 用戶選項
  data: IODDetail[] = [];
  selectedItems: IODDetail[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'POD_SubQty', header: '應驗數量' },
    { field: 'ODD_ConfirmQty', header: '驗收數量', type: 'inputNumber' }, // 預設0，(驗收數量+已驗數量)不可大於 應驗數量
    { field: 'ODD_ConfirmQty_Finished', header: '已驗收數量' },
    { field: 'PLU_Unit', header: '商品單位' },
    { field: 'OOD_BuyPrc', header: '採購單價' },
    { field: '', header: '驗收單價' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'ODD_BuyNet', header: '未稅金額' }, // = ODD_BuyPrc * ODD_ConfirmQty驗收數量，四捨五入取整數
    { field: 'ODD_BuyTax', header: '稅額' }, // =若PLU_StockTaxType =1應稅，未稅金額*0.05四捨五入取整數，若PLU_StockTaxType=0免稅，稅額0
    { field: 'ODD_BuyAmt', header: '進價小計' }, // =ODD_BuyNet+ODD_BuyTax
    { field: 'PLU_TaxType', header: '售價稅別' },
    { field: 'ODD_SalePrc', header: '售價' },
    { field: 'ODD_SaleTax', header: '售價稅額' }, // 若售價稅別 1應稅(ODD_SalePrc * ODD_ConfirmQty)/21，取整數，若稅別0免稅，稅額0
    { field: 'ODD_SaleAmt', header: '售價小計' }, // ODD_SalePrc * ODD_ConfirmQty驗收數量
    { field: 'PO_No', header: '採購單編號' },
    { field: 'ODD_Remark', header: '單項備註', type: 'input' },
  ]
  constructor(
    private tls52030Service: Tls52030Service,
    private dropDownListService: DropDownListService,
    private sys0110Service: Sys0110Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52030', this.dataForm);
    this.loadDropdownOptions();
    if (this.isFormCreateable) {
      this.dataForm.controls.ODM_Date.setValue(new Date());
      this.userOptions = [{ user_No: this.user?.user_No || '', user_Name: this.user?.user_Name || '' }];
      this.dataForm.controls.ODM_USR_No.setValue(this.userOptions[0]?.user_No || ''); // 假設用戶對象有 userName 屬性
    } else {
      this.sys0110Service.queryUser({ user_No: this.rowdata?.ODM_USR_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.userOptions = response.Data.map(user => ({ user_No: user.user_No, user_Name: user.user_Name }));
      })
    }
  }
  loadDropdownOptions() {
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({ ...vendor, label: `${vendor.VEN_No} - ${vendor.Name}` }));
      // 監聽廠商編號變化
      this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(vendorNo => {
        this.data = [];
        this.selectedItems = [];
        this.calculateTotals();
        // this.dialogData = [];
      });
    });
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data;// 品牌
      // 監聽品牌編號變化，用於顯示剩餘預算金額和建議倉別
      this.dataForm.controls.LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(logoNo => {
        const HOS_No = this.brandOptions.find(opt => opt.No === logoNo)?.HOS_No || null;
        this.dataForm.controls.HOS_No.setValue(HOS_No);
        this.dataForm.controls.HOS_No.enable();
        this.data = [];
        this.selectedItems = [];
        this.calculateTotals();
        // this.dialogData = [];
      });
    });
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data;// 倉別
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
  // 總計計算邏輯
  private calculateTotals(): void {
    // let totalBuyNet = 0; // 採購金額(即所有明細的「小計」加總)
    // let totalBuyTax = 0; // 採購金額(即所有明細的「小計」加總)
    // let totalSaleAmt = 0; // 售價總計(即所有明細的「售價小計」加總)
    // this.data.forEach(item => {
    //   totalBuyNet += item.POD_BuyNet || 0;
    //   totalBuyTax += item.PLU_StockTaxType === '1' ? Math.round((item.POD_BuyNet || 0) * 0.05) : 0;
    //   totalSaleAmt += item.POD_SaleAmt || 0;
    // });
    // const totalBuyAmt = totalBuyNet + totalBuyTax;
    // this.dataForm.controls.PO_TotalBuyNet.setValue(Math.round(totalBuyNet));
    // this.dataForm.controls.PO_TotalBuyTax.setValue(Math.round(totalBuyTax));
    // this.dataForm.controls.PO_TotalBuyAmt.setValue(Math.round(totalBuyAmt));
    // this.dataForm.controls.PO_TotalSaleAmt.setValue(Math.round(totalSaleAmt));
  }
  dialogVisible = false;
  dialogLoading = false;
  totalRecords = 0;
  dialogData: IODDetail[] = [];
  selectedItemsDialog: IODDetail[] = [];
  dialogColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'PLU_BoxQty', header: '包裝入數' },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'PLU_SalePrc_UNI', header: '單價', showSort: false },
    { field: 'PLU_SalePrc', header: '售價' },
  ]
  onShowDialog() {
    this.dialogVisible = true
    this.dialogLoading = true;
    this.tls52030Service.getPOS2016(this.dataForm.value).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.dialogData = response.Data.Data;
      this.totalRecords = response.Data.TotalCount;
    })
  }
  onLazyLoad(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog.map(item => ({ ...item, POD_SubQty: 0, POD_Remark: '' }))];
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  onDelete(selectedRows: IODDetail[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
  }
  isRowSelectable(event: IODDetail): boolean {
    return !this.data || !this.data.some((item: IODDetail) => item.PLU_MagNo === event.PLU_MagNo);
  }
  onRowEditSave(event: RowEditSaveEvent) {
    // const newData: IODDetail = event.newData;
    // // 確保 POD_SubQty 是數字且不為負數，如果為 null 或 undefined 設為 0
    // const quantity = newData.POD_SubQty ? Math.max(0, newData.POD_SubQty) : 0;
    // // SA: "單價：未稅進價。自動帶入商品主檔的PLU_SalePrc售價/1.05 x進貨折數。"
    // const unitPriceNet = newData.PLU_SalePrc_UNI || 0;
    // // SA: "小計:未稅進價 X 數量，計算取到整數"
    // const subtotalNet = Math.round(unitPriceNet * quantity);
    // // SA: "售價: 含稅售價。自動帶入商品主檔的含稅售價。不可修改"
    // // SA: "售價小計" (在 columns 中為 totalPrice，但 SA 文件中沒有明確定義計算方式，
    // // 這裡依據邏輯假設為 含稅售價 * 數量，並取整數)
    // const salePrice = newData.PLU_SalePrc || 0;
    // const totalPrice = Math.round(salePrice * quantity);
    // // 更新 data 陣列中的對應項目
    // // PrimeNG 的 RowEditSaveEvent 通常會自動更新表格的底層數據，但為了更明確和確保不可變性
    // // 這裡直接使用 index 更新，並觸發變更檢測
    // const index = this.data.findIndex(item => item.PLU_MagNo === newData.PLU_MagNo);
    // if (index > -1) {
    //   this.data[index] = {
    //     ...this.data[index], // 保留原有數據
    //     POD_SubQty: quantity, // 更新數量
    //     POD_BuyNet: subtotalNet, // 更新小計 (未稅進價 * 數量，取整數)
    //     POD_SaleAmt: totalPrice // 更新售價小計 (含稅售價 * 數量，取整數)
    //   };
    //   this.data = [...this.data];
    //   this.cdr.detectChanges(); // 觸發變更檢測，確保 UI 更新
    // }
    // this.calculateTotals(); // 更新單行後重新計算總計
  }
}
