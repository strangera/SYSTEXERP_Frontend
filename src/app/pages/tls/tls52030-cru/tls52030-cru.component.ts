import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { IODDetail, ITLS52030Data, ITLS52030Request, Tls52030Service } from '../../../service/api/tls/tls52030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { Column, createPaginationConfig, formatAmount, formatDate, LazyLoadEvent, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';
import { POStatus } from '../tls52030/tls52030.component';
import { validateMinNumber } from '../../../shared/models/system/validate-field.model';
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
  data: IODDetail[] = [];
  selectedItems: IODDetail[] = [];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'POD_SubQty', header: '應驗數量', format: formatAmount },
    { field: 'ODD_ConfirmQty', header: '驗收數量', type: 'inputNumber', validate: [validateConfirmQtySumNotExceedSubQty(), validateMinNumber(0)] },
    { field: 'ODD_ConfirmQty_Finished', header: '已驗收數量', format: formatAmount },
    { field: 'PLU_Unit', header: '單位編號' },
    { field: 'UNIT_NAME', header: '單位名稱' },
    { field: 'ODD_BuyPrc', header: '採購單價', format: formatAmount },
    { field: 'ODD_BuyPrc', header: '驗收單價', format: formatAmount },
    { field: 'PLU_StockTaxType', header: '稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'ODD_BuyNet', header: '未稅金額', format: formatAmount }, //ODD_BuyPrc * ODD_ConfirmQty驗收數量，四捨五入取整數
    { field: 'ODD_BuyTax', header: '稅額', format: formatAmount }, // =若PLU_StockTaxType =1應稅，未稅金額*0.05四捨五入取整數，若PLU_StockTaxType=0免稅，稅額0
    { field: 'ODD_BuyAmt', header: '進價小計', format: formatAmount }, // =ODD_BuyNet+ODD_BuyTax
    { field: 'PLU_TaxType', header: '售價稅別', format: (value) => value === '0' ? '免稅' : '應稅' },
    { field: 'ODD_SalePrc', header: '售價', format: formatAmount },
    { field: 'ODD_SaleTax', header: '售價稅額', format: formatAmount }, // 若售價稅別 1應稅(ODD_SalePrc * ODD_ConfirmQty)/21，取整數，若稅別0免稅，稅額0
    { field: 'ODD_SaleAmt', header: '售價小計', format: formatAmount }, // ODD_SalePrc * ODD_ConfirmQty驗收數量
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
      this.tls52030Service.GetPOS2019({ ODM_No: this.rowdata?.ODM_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data.Data;
      });
      this.sys0110Service.queryUser({ user_No: this.rowdata?.ODM_USR_No }).pipe(untilDestroyed(this)).subscribe(response => {
        this.userOptions = response.Data.map(user => ({ user_No: user.user_No, user_Name: user.user_Name }));
      })
    }
  }
  loadDropdownOptions() {
    // 專門清空資料的共用方法
    const resetFormData = () => { this.data = []; this.selectedItems = []; this.dialogData = []; this.calculateTotals(); };
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

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (!this.data || this.data.length === 0) {
        return this.messageService.errorBubble('請至少選擇一個驗收項目！');
      }
      const formData = frm.getRawValue();
      console.log(this.data);

      const details: IODDetail[] = this.data.map((item) => ({
        id: item.id,
        ODM_No: formData.ODM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        PLU_MagNo: item.PLU_MagNo,
        PLU_No: item.PLU_No,
        PLU_Unit: item.PLU_Unit,
        PLU_BoxQty: item.PLU_BoxQty,
        PLU_Name: item.PLU_Name,
        PLU_StockTaxType: item.PLU_StockTaxType,
        ODD_BuyPrc: item.ODD_BuyPrc || 0, // 採購單價 (未稅進價)
        ODD_BuyNet: item.ODD_BuyNet || 0, // 採購淨額 (已計算過並取整數)
        ODD_BuyTax: item.ODD_BuyTax || 0, // 採購稅額 (已計算過並取整數)
        ODD_BuyAmt: item.ODD_BuyAmt || 0, // 採購金額 (已計算過並取整數)
        PLU_TaxType: item.PLU_TaxType,
        ODD_SalePrc: item.ODD_SalePrc || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_SaleTax: item.ODD_SaleTax || 0, // 銷售稅額 (已計算過並取整數)
        ODD_SaleAmt: item.ODD_SaleAmt || 0, // 銷售金額 (已計算過並取整數)
        POD_SubQty: item.POD_SubQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_ConfirmQty: item.ODD_ConfirmQty || 0, // 確保有值，使用之前計算好的 POD_SubQty
        ODD_ConfirmQty_Finished: item.ODD_ConfirmQty_Finished || 0,
        ODD_Remark: item.ODD_Remark || '',
        PO_No: item.PO_No,
      }));
      const totalSaleTax = details.reduce((sum, item) => sum + (item.ODD_SaleTax || 0), 0);
      const submitData: ITLS52030Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        ODM_No: formData.ODM_No,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
        VEN_No: formData.VEN_No,
        LOGO_No: formData.LOGO_No,
        HOS_No: formData.HOS_No,
        org_id: this.rowdata?.org_id || null,
        ODM_Date: formData.ODM_Date,
        ODM_USR_No: this.authService.currentUserValue?.user_No || '',
        ODM_USR_Name: this.authService.currentUserValue?.user_Name || '',
        ODM_TotalBuyNet: formData.ODM_TotalBuyNet, // 進貨驗收金額
        ODM_TotalBuyTax: formData.ODM_TotalBuyTax, // 稅額
        ODM_TotalBuyAmt: formData.ODM_TotalBuyAmt, // 總金額
        ODM_TotalSaleNet: formData.ODM_TotalSaleAmt - totalSaleTax,
        ODM_TotalSaleTax: totalSaleTax,
        ODM_TotalSaleAmt: formData.ODM_TotalSaleAmt, // 總金額
        ODM_Status: this.isFormCreateable ? POStatus.已確認 : this.rowdata?.ODM_Status,
        ODM_TaxType: this.rowdata?.ODM_TaxType,
        ODM_Remark: formData.ODM_Remark || '',
        Details: details, // 帶入轉換後的明細資料陣列
      };
      // 處理提交邏輯 (呼叫 insert 或 update)
      this.handleSubmit(frm, () => {
        const request$ = this.isFormCreateable
          ? this.tls52030Service.insertTLS52030(submitData)
          : this.tls52030Service.updateTLS52030(submitData);

        request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
          next: () => {
            this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '修改成功');
            if (this.isFormCreateable) {
              this.dataForm.reset();
            } else {
              this.onCancel();
            }
          }
        });
      });
    })
  }
  dialogVisible = false;
  dialogLoading = false;
  totalRecords = 0;
  dialogData: IODDetail[] = [];
  selectedItemsDialog: IODDetail[] = [];
  dialogColumns: Column[] = [
    { field: 'PO_No', header: '採購單編號' },
    { field: 'APPLY_Date', header: '申請日期', format: formatDate },
    { field: 'APRV_Date', header: '審核日期', format: formatDate },
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
    const body = {
      PO_NoList: this.selectedItemsDialog.map(item => item.PO_No).filter(poNo => poNo != null)
    };
    this.tls52030Service.getPOS2017AndPOS2019(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe(response => {
      this.data = [
        ...this.data,
        ...response.Data.Data.map((item: IODDetail) => ({
          ...item,
          ODD_ConfirmQty: 0
        }))
      ];
    })
    this.dialogVisible = false;
    this.selectedItemsDialog = [];
    this.selectedItems = [];
    this.calculateTotals();
  }
  onDelete(selectedRows: IODDetail[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.calculateTotals();
  }
  isRowSelectable(event: IODDetail): boolean {
    return !this.data || !this.data.some((item: IODDetail) => item.PO_No === event.PO_No);
  }

  onRowEditSave(event: RowEditSaveEvent): void {
    const newData = event.newData;
    const index = event.ri;
    const confirmQty = Number(newData.ODD_ConfirmQty ?? 0);
    const buyPrice = Number(newData.ODD_BuyPrc ?? 0);
    const salePrice = Number(newData.ODD_SalePrc ?? 0);
    const stockTaxType = newData.PLU_StockTaxType;
    const saleTaxType = newData.PLU_TaxType;
    const buyNet = Math.round(buyPrice * confirmQty);// 未稅金額 = 驗收數量 * 單價
    const buyTax = stockTaxType === '1' ? Math.round(buyNet * 0.05) : 0;// 稅額 (若應稅 stockTaxType === '1')
    const buyAmt = buyNet + buyTax;// 進價小計 = 未稅 + 稅額
    const saleTax = saleTaxType === '1' ? Math.round((salePrice * confirmQty) / 21) : 0;// 售價稅額 (應稅 → (售價 * 數量) / 21，否則 0)
    const saleAmt = Math.round(salePrice * confirmQty); // 售價小計
    // 更新明細資料
    this.data[index] = { ...newData, ODD_BuyNet: buyNet, ODD_BuyTax: buyTax, ODD_BuyAmt: buyAmt, ODD_SaleTax: saleTax, ODD_SaleAmt: saleAmt };
    this.data = [...this.data];
    this.calculateTotals();
  }

  // 總計計算邏輯
  private calculateTotals(): void {
    let totalBuyNet = 0; // 進貨驗收金額：加總驗收明細的ODD_BuyNet 進價未稅小計
    let totalBuyTax = 0; // 稅額：單據稅別 ODM_TaxType=1應稅，則ODM_TotalBuyNet * 0.05，四捨五入取整數，若免稅，稅額0
    let totalSaleAmt = 0; // 售價總計：加總驗收明細的ODD_SaleAmt

    for (const item of this.data) {
      const net = Number(item.ODD_BuyNet ?? 0);
      const tax = Number(item.ODD_BuyTax ?? 0);
      const saleAmt = Number(item.ODD_SaleAmt ?? 0);
      totalBuyNet += net;
      totalBuyTax += tax;
      totalSaleAmt += saleAmt;
    }

    const totalBuyAmt = totalBuyNet + totalBuyTax; // 合計金額：等於ODM_TotalBuyNet + ODM_TotalBuyTax

    this.dataForm.patchValue({
      ODM_TotalBuyNet: Math.round(totalBuyNet),
      ODM_TotalBuyTax: Math.round(totalBuyTax),
      ODM_TotalBuyAmt: Math.round(totalBuyAmt),
      ODM_TotalSaleAmt: Math.round(totalSaleAmt),
    });
  }
}
// 預設0，(驗收數量+已驗數量)不可大於 應驗數量
export function validateConfirmQtySumNotExceedSubQty(): (value: string | number, rowData: IODDetail, data: IODDetail[], field: string, header: string) => {
  isValid: boolean;
  errorMessage: string[];
} {
  return (value: string | number, rowData: IODDetail, data: IODDetail[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {
    const confirmQty = Number(value); // ODD_ConfirmQty 當下輸入值
    const finishedQty = Number(rowData.ODD_ConfirmQty_Finished ?? 0);
    const subQty = Number(rowData.POD_SubQty ?? 0);
    const total = confirmQty + finishedQty;
    const isValid = !isNaN(total) && total <= subQty;
    return { isValid, errorMessage: isValid ? [] : [`「${header} + 已驗收數量」不能大於 應驗數量(${subQty})`, '驗證錯誤'], };
  };
}
