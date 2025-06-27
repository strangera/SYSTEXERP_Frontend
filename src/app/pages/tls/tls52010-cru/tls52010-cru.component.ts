import { ChangeDetectorRef, Component, OnDestroy, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { DropDownListService, IDropdownItem } from '../../../service/api/dropdownservice/dropDownList.service';
import { IGetBudgetAmountRequest, IInsertTLS52010Request, ITLS52010Data, Tls52010Service } from '../../../service/api/tls/tls52010.service';

// 2.5.2.1  採購單維護作業 CRU
@Component({
  selector: 'app-tls52010-cru',
  templateUrl: './tls52010-cru.component.html',
})
export class TLS52010CRUComponent extends BasicCruPageComponent<ITLS52010Data> implements OnInit, OnDestroy {
  // === 表單群組 (與 POS2016 欄位對應) ===
  dataForm = this.formBuilder.nonNullable.group({
    PO_No: [{ value: '系統自動產生', disabled: true }], // 採購單號 (與 POS2016.PO_No 對應)
    VEN_No: [null, [Validators.required]], // 廠商編號 (與 POS2016.VEN_No 對應)
    vendorShortName: [{ value: '', disabled: true }], // 廠商簡稱 (前端專用，不對應資料庫欄位，顯示在 VEN_No 下一欄)
    LOGO_No: [null, [Validators.required]], // 品牌編號 (與 POS2016.LOGO_No 對應)
    remainingBudgetAmount: [{ value: 0, disabled: true }], // 剩餘預算金額 (前端顯示用，不對應資料庫欄位)
    HOS_No: [null, [Validators.required]], // 倉別 (與 POS2016.HOS_No 對應)
    PO_TotalBuyAmt: [0, []], // 採購總金額 (含稅) (對應 POS2016.PO_TotalBuyAmt)
    PO_TotalBuyTax: [0, []], // 採購總稅額 (對應 POS2016.PO_TotalBuyTax)
    PO_TotalBuyNet: [0, []], // 採購總淨額 (對應 POS2016.PO_TotalBuyNet)
    PO_TotalSaleAmt: [0, []], // 銷售總金額 (對應 POS2016.PO_TotalSaleAmt)
    APPLY_USR_No: [{ value: '', disabled: true }], // 申請人員姓名 (對應 POS2016.APPLY_USR_Name)
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期 (對應 POS2016.APPLY_Date)
    PO_Remark: [''], // 採購單備註 (對應 POS2016.PO_Remark)
    // `YYYYMM` (採購日期年月) 介面不顯示，但提交時需要用於 GetBudgetAmount
  });
  // === 下拉選單選項 ===
  vendorOptions: IDropdownItem[] = []; // 廠商下拉選單選項
  brandOptions: IDropdownItem[] = []; // 品牌下拉選單選項
  warehouseOptions: IDropdownItem[] = []; // 倉別下拉選單選項
  userOptions: { user_No: string; user_Name: string }[] = []; // 用戶選項

  private destroy$ = new Subject<void>(); // 用於管理訂閱的生命週期
  constructor(
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private cdr: ChangeDetectorRef,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS52010', this.dataForm);
    this.loadDropdownOptions();
    this.setInitialValuesAndWatchChanges();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadDropdownOptions(): void {
    // !!! 廠商別 1廠商統一編號 2身分證字號 3自編編號 (要選擇哪一個呢？還是全部載入？)
    this.dropDownListService.queryPOS2013_DropDownList({ VEN_Flag: '1' }).pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.vendorOptions = response.Data;
    });
    // 載入倉別下拉選單
    this.dropDownListService.getPOS2034Options().pipe(takeUntil(this.destroy$)).subscribe(response => {
      this.warehouseOptions = response.Data;
    });
  }
  private setInitialValuesAndWatchChanges(): void {
    this.dataForm.controls.APPLY_Date.setValue(new Date());
    const userInfo = this.authService.currentUserValue;
    this.userOptions = [{ user_No: userInfo?.user_No || '', user_Name: userInfo?.user_Name || '' }];
    this.dataForm.controls.APPLY_USR_No.setValue(this.userOptions[0]?.user_No || ''); // 假設用戶對象有 userName 屬性
    this.dataForm.controls.VEN_No.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(vendorNo => {
      if (vendorNo) { // !!! 可以改成下拉觸發事件
        const selectedVendor = this.vendorOptions.find(opt => opt.No === vendorNo);// 顯示廠商簡稱
        this.dataForm.controls.vendorShortName.setValue(selectedVendor ? selectedVendor.ShortName : ''); // 假設 Name 是簡稱
        // 載入品牌編號 (依商品主檔中該廠商的商品，顯示所有的品牌資料)
        // 這裡需要一個API：根據VEN_No獲取品牌清單
        // 目前你的 service.ts 中沒有直接提供 "根據廠商獲取品牌" 的 API
        // 只有 queryPLULOGO_DropDownList (全部品牌) 和 queryPLULOGO_OrderPrcRate_DropDownList (全部品牌含費率)
        // 這是一個**需要與後端確認的 API**：例如 `queryPLULOGO_ByVendor_DropDownList(params: { VEN_No: string }): Observable<ApiResponse<IDropdownItem[]>>`
        // 暫時用 queryPLULOGO_DropDownList 演示，但實際應是過濾後的
        this.dropDownListService.queryPLULOGO_DropDownList().pipe(takeUntil(this.destroy$)).subscribe(response => {
          // 過濾邏輯可能需要在前端處理，如果後端沒有提供按廠商過濾的品牌 API// !!! 這個 API 需要根據廠商過濾品牌
          this.brandOptions = response.Data;
          this.dataForm.controls.LOGO_No.setValue(null); // 清空品牌選擇
          this.dataForm.controls.remainingBudgetAmount.setValue(0); // 清空預算金額
        });
      } else {
        this.dataForm.controls.vendorShortName.setValue('');
        this.brandOptions = []; // 清空品牌選項
        this.dataForm.controls.LOGO_No.setValue(null); // 清空品牌選擇
        this.dataForm.controls.remainingBudgetAmount.setValue(0); // 清空預算金額
        this.cdr.detectChanges();
      }
    });
    // 監聽品牌編號變化，用於顯示剩餘預算金額和建議倉別
    this.dataForm.controls.LOGO_No.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(logoNo => {
      if (logoNo && this.dataForm.controls.APPLY_Date.value) {
        const applyDate = this.dataForm.controls.APPLY_Date.value;
        const applyYearMonth = `${applyDate.getFullYear()}${(applyDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const budgetRequest: IGetBudgetAmountRequest = {
          LOGO_No: logoNo,
          YYYYMM: applyYearMonth // 採購日期年月
        };
        // 獲取剩餘預算金額
        this.tls52010Service.GetBudgetAmount(budgetRequest).pipe(takeUntil(this.destroy$)).subscribe(response => {
          if (response.Data !== undefined) { // 假設返回的是單個數字
            this.dataForm.controls.remainingBudgetAmount.setValue(response.Data);
          } else {
            this.dataForm.controls.remainingBudgetAmount.setValue(0);
          }
        });
        // 設置建議倉別 (根據品牌設定中所屬的建議倉別)
        // 這同樣需要一個API：例如 `queryWarehouseByBrand(params: { LOGO_No: string }): Observable<ApiResponse<IDropdownItem>>`
        // 這裡假設品牌資料本身包含了建議倉別的資訊，或者需要另一個 API。
        // 為了演示，暫時不處理這個自動設定，你需要根據實際後端API補齊。
        // 例如: this.dropDownListService.getWarehouseByBrand(logoNo).subscribe(...)
      } else {
        this.dataForm.controls.remainingBudgetAmount.setValue(0);// 清空倉別選擇，或取消建議值
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(frm: FormGroup) {
    const formData = frm.getRawValue(); // 獲取所有表單值，包括 disabled 的
    const submitData: IInsertTLS52010Request = {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '', // 需從其他地方獲取，例如登入用戶資訊或配置
      VEN_No: formData.VEN_No,
      LOGO_No: formData.LOGO_No,
      HOS_No: formData.HOS_No,
      APPLY_Date: formData.APPLY_Date.toISOString().split('T')[0], // 格式化為 ISO 日期字串
      APPLY_USR_No: this.authService.currentUserValue?.user_No || '', // 假設有 userNo
      APPLY_USR_Name: formData.APPLY_USR_Name,
      PO_TotalSubQty: 0, // 採購數量總計，通常來自明細計算，如果沒有明細，預設為 0
      PO_TotalSaleNet: 0, // 銷售淨額總計，通常來自明細計算
      PO_TotalSaleTax: 0, // 銷售稅額總計，通常來自明細計算
      PO_TotalSaleAmt: formData.PO_TotalSaleAmt,
      PO_Remark: formData.PO_Remark,
      BudgetAmount: formData.BudgetAmount,
      YYYYMM: `${formData.APPLY_Date.getFullYear()}${(formData.APPLY_Date.getMonth() + 1).toString().padStart(2, '0')}`,
      Details: [] // 採購單明細，這部分你目前沒有，但通常採購單會有明細
    };
    // 處理提交邏輯 (呼叫 insert 或 update)
    // 這裡只是範例，你需要判斷是新增還是編輯模式
    this.handleSubmit(frm, () => {
      this.tls52010Service.insertTLS52010(submitData).subscribe({
        next: (response) => {
          this.messageService.successBubble(response.Message);
        },
      });
    });
  }
}
