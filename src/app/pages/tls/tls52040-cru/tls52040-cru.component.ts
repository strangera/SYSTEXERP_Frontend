import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, createPaginationConfig, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime } from 'rxjs';
import { ITLS52040Data, Tls52040Service } from '../../../service/api/tls/tls52040.service';
@Component({
  selector: 'app-tls52040-cru',
  templateUrl: './tls52040-cru.component.html',
})
export class TLS52040CRUComponent extends BasicCruPageComponent<ITLS52040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ODM_No: [{ value: '系統自動產生', disabled: true }], // 進貨驗收單號
    VEN_No: ['', [Validators.required]], // 廠商編號
    LOGO_No: ['', [Validators.required]], // 品牌編號 (與 POS2016.LOGO_No 對應)
    HOS_No: [{ value: null as string | null, disabled: true }, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    ODM_TotalBuyNet: [{ value: 0, disabled: true }], // 進貨驗收金額
    ODM_TotalBuyTax: [{ value: 0, disabled: true }], // 稅額
    ODM_TotalBuyAmt: [{ value: 0, disabled: true }], // 合計金額
    ODM_TotalSaleAmt: [{ value: 0, disabled: true }], // 售價總計
    ODM_USR_No: [{ value: null as string | null, disabled: true }], // 申請人
    ODM_Date: [{ value: new Date(), disabled: true }], // 申請日期
    ODM_Remark: ['', [Validators.maxLength(200)]],// 進貨驗收單說明
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  vendorOptions: IDropdownItem[] = []; // 廠商下拉選單選項
  brandOptions: IDropdownItem[] = []; // 品牌下拉選單選項
  warehouseOptions: IDropdownItem[] = []; // 倉別下拉選單選項
  userOptions: { user_No: string; user_Name: string }[] = []; // 用戶選項
  data: ITLS52040Data[] = [];
  selectedItems: ITLS52040Data[] = [];
  columns: Column[] = [
    { field: 'sequence', header: '序號', visible: true },
    { field: 'isNew', header: '是否新貨', visible: true },
    { field: 'aboveNew', header: '以上新貨', visible: true },
    { field: 'productManagementCodeName', header: '商品管理編號/名稱', visible: true },
    { field: 'returnableQuantity', header: '可退回數量', visible: true },
    { field: 'returnQuantity', header: '退回數量', visible: true },
    { field: 'productUnit', header: '商品單位', visible: true },
    { field: 'unitPrice', header: '單價', visible: true },
    { field: 'tax', header: '稅額', visible: true },
    { field: 'untaxedAmount', header: '未稅金額', visible: true },
    { field: 'salePrice', header: '售價', visible: true },
    { field: 'saleSubtotal', header: '售價小計', visible: true },
    { field: 'returnInvoiceNumber', header: '退貨單號碼', visible: true },
    { field: 'itemRemarks', header: '單項備註', visible: true },
  ];
  constructor(
    private tls52030Service: Tls52040Service,
    private dropDownListService: DropDownListService,
    private sys0110Service: Sys0110Service
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS52040', this.dataForm);
    if (this.isFormEditable) {
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.LOGO_No.disable();
    }
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
    // 專門清空資料的共用方法
    const resetFormData = () => {
      this.data = [];
      // this.selectedItems = [];
      // this.dialogData = [];
      this.calculateTotals();
    };
    // 1. 供應商下拉選單
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({ ...vendor, label: `${vendor.VEN_No} - ${vendor.Name}` }));
      this.dataForm.controls.VEN_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
    });
    // 2. 品牌下拉選單
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data;
      this.dataForm.controls.LOGO_No.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(logoNo => {
        const HOS_No = this.brandOptions.find(opt => opt.No === logoNo)?.HOS_No || null;
        this.dataForm.controls.HOS_No.setValue(HOS_No);
        this.dataForm.controls.HOS_No.enable();
        resetFormData();
      });
    });
    // 3. 倉別下拉選單
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data;
      this.dataForm.controls.HOS_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => resetFormData());
    });
  }
  // 總計計算邏輯
  private calculateTotals(): void {
    // let totalBuyNet = 0; // 進貨驗收金額：加總驗收明細的ODD_BuyNet 進價未稅小計
    // let totalBuyTax = 0; // 稅額：單據稅別 ODM_TaxType=1應稅，則ODM_TotalBuyNet * 0.05，四捨五入取整數，若免稅，稅額0
    // let totalSaleAmt = 0; // 售價總計：加總驗收明細的ODD_SaleAmt

    // for (const item of this.data) {
    //   const net = Number(item.ODD_BuyNet ?? 0);
    //   const tax = Number(item.ODD_BuyTax ?? 0);
    //   const saleAmt = Number(item.ODD_SaleAmt ?? 0);
    //   totalBuyNet += net;
    //   totalBuyTax += tax;
    //   totalSaleAmt += saleAmt;
    // }

    // const totalBuyAmt = totalBuyNet + totalBuyTax; // 合計金額：等於ODM_TotalBuyNet + ODM_TotalBuyTax

    // this.dataForm.patchValue({
    //   ODM_TotalBuyNet: Math.round(totalBuyNet),
    //   ODM_TotalBuyTax: Math.round(totalBuyTax),
    //   ODM_TotalBuyAmt: Math.round(totalBuyAmt),
    //   ODM_TotalSaleAmt: Math.round(totalSaleAmt),
    // });
  }
  onShowDialog() {
  }
  onDelete(rowData: ITLS52040Data) {
  }
  onRowEditSave(event: RowEditSaveEvent): void {
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
