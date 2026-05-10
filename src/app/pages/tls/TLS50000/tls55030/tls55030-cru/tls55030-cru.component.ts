import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IInvoiceDetail, IInvoiceDetailByDisNo, IReturnDetailByDisNoData, IReturnDetailData, ReturnNotRebateQueryBody, Tls55030ListData, Tls55030Service } from '@service/api/tls/tls55030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from "primeng/divider";
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { combineLatest, debounceTime, distinctUntilChanged, finalize, map, startWith } from 'rxjs';
import { columns, columns2 } from './tls55030-cru.model';
import { TLS55030DialogComponent } from './tls55030-dialog.component'; // 引入新的 Dialog 子元件

// =================================================================================
// 應用層計算欄位擴展介面 (繼承自 IInvoiceDetail，確保類型安全)
// 這是用來儲存前端表格資料，包含後端沒有的計算/輸入欄位
// =================================================================================
export interface IRebateDetailForCRU extends IInvoiceDetail {
  Rebate_Amt_New?: number; // 新增/輸入的折讓金額
  Rebate_Net?: number;    // 計算後的折讓淨額
  Rebate_Tax?: number;    // 計算後的折讓稅額
  Rebate_Name: string | null;    // 新增/輸入的折讓名稱
  Rebate_GUIDate: Date;  // 新增/輸入的折讓日期
}

@Component({
  selector: 'app-tls55030-cru',
  templateUrl: './tls55030-cru.component.html',
  standalone: true,
  imports: [
    TableEditComponent, AsyncPipe, RadiobuttonComponent, TranslateModule,
    MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent,
    InputTextComponent, TableReportComponent, DialogComponent, ButtonComponent, NgIf, InputNumberComponent, TLS55030DialogComponent, ButtonModule,
    CalendarRangeQuickComponent, RadioButtonModule,
    DividerModule, DividerModule
  ]
})
export class TLS55030CRUComponent extends BasicCruPageComponent<Tls55030ListData> implements OnInit {
  @ViewChild('dialogs') dialogComponent!: TLS55030DialogComponent;
  dataForm = this.formBuilder.group({
    DIS_No: [{ value: '系統自動產生', disabled: true }],
    ACP_YYYYMM: [new Date(), [Validators.required]],
    VEN_No: [null, [Validators.required]],
    DIS_EntryType: ['1', [Validators.required]],
    RJM_TotalBuyAmt: [{ value: 0, disabled: true }],    // 退貨總金額 (含稅)
    RJM_TotalBuyNet: [{ value: 0, disabled: true }],    // 退貨總未稅金額
    RJM_TotalBuyTax: [{ value: 0, disabled: true }],    // 退貨總稅額
    invoiceTotalAmount: [{ value: 0, disabled: true }], 			  // 發票總金額(自取) - 彙總所有選取的發票金額
    invoiceRemainingRebateAmount: [{ value: 0, disabled: true }], 	// 發票剩餘可折總金額(自取) - 彙總所有選取的發票剩餘可折金額
    totalRebateAmount: [{ value: 0, disabled: true }], 			    // 折讓總金額(自取) - 彙總所有折讓明細的金額 (APS30231.Rebate_Amt)
    balanceAmount: [{ value: 0, disabled: true }], 				      // 餘額(自取) - 計算結果 (RJM_TotalBuyAmt - totalRebateAmount)
    // 折讓單開立金額
    Rebate_Amt: [{ value: 0, disabled: true }], // 折讓金額
    Rebate_Name: [null as string | null], // 品名
    radioOption: ['1'], // 品名選項
  });
  // Dropdown options
  DIS_EntryTypeOptions = getSYS1000Options('DIS_EntryType');
  VEN_NoOptions = this.dropdown.queryPos2013TltTalent();
  HOS_NoOptions = this.dropdown.queryPos2034();
  // 新增屬性：用於儲存選中廠商的統一編號 (No, 即 API 所需的 VEN_No 參數)
  venUniformNo: string | null = null;
  // 退貨明細 =======================================================
  data2: IReturnDetailData[] = [];
  selectedItems2: IReturnDetailData[] = [];
  columns2 = columns2;

  // 折讓單明細 (使用擴展後的介面 IRebateDetailForCRU) =======================================================
  data: IRebateDetailForCRU[] = []; // <--- 介面已更新
  selectedItems: IRebateDetailForCRU[] = []; // <--- 介面已更新
  columns = columns;
  defaultInsertData = {}

  // 修正 validateRow 的型別以使用擴展介面
  validateRow = (rowData: IRebateDetailForCRU): { isValid: boolean, errorMessage: string } => {
    if (!rowData.PUR_GUINo) return { isValid: true, errorMessage: '' };

    // 1. 找出表格中所有「同一張發票」的資料列
    const sameInvoiceRows = this.data.filter(item => item.PUR_GUINo === rowData.PUR_GUINo);

    // 2. 累加這些資料列中，使用者「本次輸入」的所有折讓金額
    const currentTotalRebateNew = sameInvoiceRows.reduce((sum, item) => sum + (item.Rebate_Amt_New || 0), 0);

    // 3. 檢查：(API回傳的已折金額 + 本次表格內所有同發票號碼的輸入總和) 是否超過 發票總金額
    // 注意：這裡的 rowData.Rebate_Amt 是 API 回傳的原始已折金額
    const isOverRebate = (rowData.Rebate_Amt + currentTotalRebateNew) > rowData.PUR_Amt;

    if (isOverRebate) {
      return {
        isValid: false,
        errorMessage: `發票 ${rowData.PUR_GUINo} 累計折讓金額已超過發票金額 (上限: ${rowData.PUR_Amt - rowData.Rebate_Amt})`
      };
    }

    return { isValid: true, errorMessage: '' };
  };

  constructor(
    public readonly tls55030Service: Tls55030Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', this.dataForm);
    this.setupVendorUniformNoListener();
    this.setupRebateNameValidator();
    // 監聽結帳年月，隨時更新 Table 的預設折讓日期
    this.dataForm.controls.ACP_YYYYMM.valueChanges
      .pipe(startWith(this.dataForm.controls.ACP_YYYYMM.value), untilDestroyed(this))
      .subscribe(date => {
        this.updateTableDefaultDate(date);
      });
    if (!this.isFormCreateable) {
      this.loadDetailData();
    }
    // 設定this.columns的field為PUR_GUINo的欄位的onBlur事件
    this.columns.forEach(col => {
      if (col.field === 'PUR_GUINo') {
        col.onBlur = (rowData: IRebateDetailForCRU) => {
          // 1. 強制轉大寫
          if (rowData.PUR_GUINo) {
            rowData.PUR_GUINo = rowData.PUR_GUINo.toUpperCase();
          }
          // 2. 呼叫元件內部的自動帶入邏輯 (假設我們把邏輯寫在 component 實體中)
          this.handleInvoiceAutoFill(rowData);
        }
      }
      if (['Rebate_Amt_New', 'Rebate_Net', 'Rebate_Tax'].includes(col.field)) {
        const originalOnBlur = col.onBlur;
        col.onBlur = (rowData: IRebateDetailForCRU) => {
          if (originalOnBlur) originalOnBlur(rowData, null, col, 0); // 執行 model 裡的計算邏輯
          this.updateInvoiceSummaryAndFormState();   // 強制觸發下方的「折讓總金額」與「餘額」重新計算
          this.cdr.detectChanges();
        };
      }
    });
  }
  /**
 * 當發票編號失焦時，自動比對預載入清單並帶入資料
 */
  public handleInvoiceAutoFill(rowData: IRebateDetailForCRU): void {
    const inputNo = rowData.PUR_GUINo;
    if (!inputNo || !this.dataForm.controls.VEN_No.value) return;

    this.loading = true; // 開啟 Loading 遮罩

    const body = {
      VEN_No: this.dataForm.controls.VEN_No.value,
      PUR_GUINo: inputNo, // 帶入發票編號
      PageIndex: 1,
      PageSize: 1 // 只需要一筆
    };

    this.tls55030Service.queryTLS55030RebateDetailOption(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        // 因為是精確查詢編號，取第一筆即可
        const matchedInvoice = res.Data && res.Data.length > 0 ? res.Data[0] : null;

        if (matchedInvoice) {
          Object.assign(rowData, {
            TABTYPE: matchedInvoice.TABTYPE,
            PUR_TaxType: matchedInvoice.PUR_TaxType,
            PUR_DirectType: matchedInvoice.PUR_DirectType,
            PUR_Amt: matchedInvoice.PUR_Amt,
            PUR_VoucherType: matchedInvoice.PUR_VoucherType,
            PUR_GUIDate: matchedInvoice.PUR_GUIDate,
            Rebate_Amt: matchedInvoice.Rebate_Amt,
            Rebate_Amt_New: rowData.Rebate_Amt_New || 0
          });
          this.updateInvoiceSummaryAndFormState();
          this.messageService.successBubble(`已自動帶入發票 ${inputNo} 的資料`);
        } else {
          // --- 查無資料：清空 ---
          this.messageService.errorBubble(`查無發票編號：${inputNo}，請確認廠商及編號是否正確。`);

          // 建議：逐一賦值為 undefined 或初始狀態，並確保屬性名稱正確
          rowData.TABTYPE = '';
          rowData.PUR_TaxType = '';
          rowData.PUR_DirectType = '';
          rowData.PUR_Amt = 0; // 金額建議回歸 0
          rowData.PUR_VoucherType = '';
          rowData.PUR_GUIDate = '';
          rowData.Rebate_Amt = 0;
          rowData.Rebate_Amt_New = 0;

          // 如果你有使用 dataService，可能需要通知它資料已變更
          this.updateInvoiceSummaryAndFormState();
        }

        // 關鍵：除了 markForCheck，如果是 Array 類型的 Table，有時需要重給 reference
        // 但因為這裡是修改 rowData 內容，我們強制執行一次 detectChanges
        this.cdr.detectChanges();
      });
  }
  /**
   * 根據結帳年月計算該月最後一天，並存入 tableDefaultData
   */
  private updateTableDefaultDate(acpDateValue: Date | null): void {
    if (acpDateValue) {
      const inputDate = acpDateValue instanceof Date ? acpDateValue : new Date(acpDateValue);
      if (!isNaN(inputDate.getTime())) {
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth();
        // 計算該月最後一天
        const lastDay = new Date(year, month + 1, 0);
        // 更新預設值物件 (確保欄位名稱與 columns 中的 field 一致)
        this.defaultInsertData = {
          ...this.defaultInsertData,
          Rebate_GUIDate: lastDay
        };
      }
    }
  }
  // 在非新增模式下 (編輯/查詢)，根據 DIS_No 載入發票/退貨明細資料。
  loadDetailData(): void {
    const disNo = this.rowdata?.DIS_No; // 假設 DIS_No 是從路由傳入，並儲存在 this.paramBody.id 中
    const venNo = this.dataForm.controls.VEN_No.value; // 假設主單資訊已經載入或可取得
    if (!disNo || !venNo) { return; }
    this.loading = true;
    // 1. 查詢發票/收據明細 (Rebate Detail)
    const loadRebate$ = this.tls55030Service.queryTLS55030RebateDetailByDisNo({ DIS_No: disNo }).pipe(map(res => {
      const rebateDetails: IInvoiceDetailByDisNo[] = res.Data || [];
      const convertedData: IRebateDetailForCRU[] = rebateDetails.map(item => ({
        ...item,
        Rebate_Amt: item.Rebate_Amt_Existed, // 將已折讓金額視為本次輸入
        Rebate_Amt_New: item.Rebate_Amt, // 先給0
        Rebate_Net: item.Rebate_Net, // 需從 Rebate_Amt 計算或後端提供
        Rebate_Tax: item.Rebate_Tax,  // 需從 Rebate_Amt 計算或後端提供
        Rebate_GUIDate: new Date(item.Rebate_GUIDate), // 預設為今天
      }));
      this.data = convertedData;

      if (!this.isFormCreateable) {
        if (this.dataForm.get('DIS_EntryType')?.value !== '1') {
          this.dataForm.get('Rebate_Name')?.setValue(convertedData[0].Rebate_Name);
        }
      }
      this.updateInvoiceSummaryAndFormState(); // 彙總金額並更新表單狀態
    })
    );
    // 2. 查詢退貨明細 (Return Detail)
    const loadReturn$ = this.tls55030Service.queryTLS55030ReturnDetailByDisNo({ DIS_No: disNo }).pipe(
      map(res => {
        const returnDetails: IReturnDetailByDisNoData[] = res.Data || [];
        const convertedData: IReturnDetailData[] = returnDetails.map(item => ({
          id: item.id,
          RJM_No: item.RJM_No,
          APRV_Date: item.APRV_Date,
          HOS_NAME: item.HOS_NAME,
          RJM_TotalBuyNet: Number(item.Rebate_Net), // 這裡用 Rebate_Net 暫時對應 RJM_TotalBuyNet
          RJM_TotalBuyTax: Number(item.Rebate_Tax), // 這裡用 Rebate_Tax 暫時對應 RJM_TotalBuyTax
          RJM_TotalBuyAmt: Number(item.Rebate_Amt), // 這裡用 Rebate_Amt 暫時對應 RJM_TotalBuyAmt
        }));
        this.data2 = convertedData;
        this.updateReturnSummaryAmounts(); // 彙總退貨金額並更新表單狀態
      })
    );
    combineLatest([loadRebate$, loadReturn$]).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(() => {
      console.log('資料載入成功');
    });
  }
  // 監聽 VEN_No 變化並找出對應的廠商統一編號 (No)
  // 在 TLS55030CRUComponent 內

  // 修改原本的監聽器或新增一個
  setupVendorUniformNoListener(): void {
    combineLatest([
      this.dataForm.controls.VEN_No.valueChanges.pipe(
        startWith(this.dataForm.controls.VEN_No.value),
        debounceTime(300),      // <-- 新增：防止使用者快速切換時狂打 API
        distinctUntilChanged()  // <-- 新增：確保值真的有變才執行
      ),
      this.VEN_NoOptions
    ]).pipe(untilDestroyed(this)).subscribe(([selectedVenNo, options]) => {

      if (selectedVenNo && Array.isArray(options)) {
        // 1. 尋找對應的廠商統一編號 (No)
        const selectedOption = options.find(opt => opt['VEN_No'] === selectedVenNo);
        this.venUniformNo = selectedOption ? selectedOption['No'] : null;

        // 2. 觸發子元件預載入 API
        // 這裡建議加上判斷，確保 dialogComponent 已經初始化
        if (this.dialogComponent) {
          this.dialogComponent.preloadInvoiceData(selectedVenNo);
        }

      } else {
        // 3. 處理清空狀態
        this.venUniformNo = null;
        if (this.dialogComponent) {
          this.dialogComponent.dialogData = [];
          this.dialogComponent.totalRecords = 0;
        }
      }
    });
  }

  /**
   * 設置 Rebate_Name 的動態驗證器。
   * 當 DIS_EntryType 不等於 '1' 時，Rebate_Name 必填。
   */
  setupRebateNameValidator(): void {
    const disEntryTypeControl = this.dataForm.controls.DIS_EntryType;
    const rebateNameControl = this.dataForm.controls.Rebate_Name;

    // 立即執行一次，以確保初始狀態的驗證正確
    this.applyRebateNameValidation(disEntryTypeControl.value, rebateNameControl);

    // 監聽 DIS_EntryType 的變化
    disEntryTypeControl.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.applyRebateNameValidation(value, rebateNameControl);
    });
  }

  /**
   * 根據 DIS_EntryType 的值設定 Rebate_Name 的驗證器。
   */
  private applyRebateNameValidation(disEntryType: string | null | undefined, rebateNameControl: any): void {
    // 當 DIS_EntryType 不等於 '1' 時， Rebate_Name 必填
    if (disEntryType !== '1') {
      rebateNameControl.setValidators([Validators.required]);
    } else {
      rebateNameControl.setValidators(null);
    }
    // 更新控制項的驗證狀態
    rebateNameControl.updateValueAndValidity();
  }

  // 處理子元件回傳的退貨明細資料
  handleReturnSelection(selectedReturns: IReturnDetailData[]) {
    this.data2 = [...this.data2, ...selectedReturns];
    this.selectedItems2 = [];
    // --- 關鍵修改：如果是退貨類別，自動帶入第一筆的倉別名稱 ---
    if (this.dataForm.controls.DIS_EntryType.value === '1' && selectedReturns.length > 0) {
      const firstReturn = selectedReturns[0];
      // 雖然畫面上「品名」欄位在退貨模式下是 hidden，但我們還是把值存入 form，方便 onSubmit 取用
      this.dataForm.controls.Rebate_Name.setValue(firstReturn.HOS_NAME || '退貨');
    }
    this.updateReturnSummaryAmounts(); // <--- 使用新的方法來更新金額和狀態
  }

  // 處理子元件回傳的折讓單明細資料
  handleInvoiceSelection(selectedInvoices: IInvoiceDetail[]) {
    const newItems: IRebateDetailForCRU[] = selectedInvoices.map(item => ({
      ...item,
      Rebate_Amt_New: 0,
      Rebate_Net: 0,
      Rebate_Tax: 0
    }));
    this.data = [...this.data, ...newItems];
    this.selectedItems = [];
    this.updateInvoiceSummaryAndFormState();
  }
  // **核心修正點：統一處理主表單禁用/啟用和彙總欄位恆禁用邏輯**
  updateFormDisableState(): void {
    if (this.data2.length || this.data.length) {
      this.dataForm.controls.ACP_YYYYMM.disable();
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.DIS_EntryType.disable();
    } else {
      if (!this.isFormReadable) {
        this.dataForm.controls.ACP_YYYYMM.enable();
        this.dataForm.controls.VEN_No.enable();
        this.dataForm.controls.DIS_EntryType.enable();
      }

      // 彙總欄位恆禁用清單更新
      const permanentDisabledControls = [
        'DIS_No', // <--- 確保單號始終鎖定
        'RJM_TotalBuyAmt',
        'RJM_TotalBuyNet',
        'RJM_TotalBuyTax',
        'invoiceTotalAmount',
        'invoiceRemainingRebateAmount',
        'totalRebateAmount',
        'balanceAmount',
        'Rebate_Amt'
      ];

      permanentDisabledControls.forEach(key => {
        this.dataForm.get(key)?.disable({ emitEvent: false });
      });

      // 特別處理 Rebate_Name：只有在可編輯且 EntryType != '1' 時才啟用
      if (!this.isFormReadable && this.dataForm.controls.DIS_EntryType.value !== '1') {
        this.dataForm.controls.Rebate_Name.enable();
      } else if (this.isFormReadable) {
        // 唯讀模式下 Rebate_Name 也應鎖定
        this.dataForm.controls.Rebate_Name.disable();
      }
    }
  }
  // 彙總發票/折讓單明細相關欄位並處理主表單狀態
  updateInvoiceSummaryAndFormState(newData?: IRebateDetailForCRU[]): void {
    // 如果是 dataChange 觸發，則更新 data
    if (newData) {
      this.data = newData;
    }

    // 1. 重新計算彙總欄位
    this.updateSummaryAmounts();
    this.updateFormDisableState();
  }
  // 彙總欄位更新函數
  updateSummaryAmounts(): void {
    let totalInvoiceAmt = 0;
    let totalRemainingRebateAmt = 0;
    let positiveTotalRebateAmt = 0;

    this.data.forEach(item => {
      // 確保輸入的折讓金額在計算前已經處理過（或在此處強制取整）
      const rebateNew = Math.round(item.Rebate_Amt_New || 0);

      totalInvoiceAmt += item.PUR_Amt; // 發票總金額累加
      totalRemainingRebateAmt += item.PUR_Amt - item.Rebate_Amt; // 發票剩餘可折金額累加 (發票金額 - 已折金額)
      positiveTotalRebateAmt += rebateNew; // 折讓總金額累加 (只計算使用者輸入的折讓金額，且確保是正數)
    });

    // 全部取整數
    const finalPositiveAmt = Math.round(positiveTotalRebateAmt); // 折讓總金額
    const negativeTotalRebateAmt = finalPositiveAmt !== 0 ? -finalPositiveAmt : 0; // 轉為負數表示扣除的金額 (如果有折讓金額才轉負數，沒有則保持0)
    // 總餘額 = 退貨總金額 - 折讓總金額 (注意：折讓總金額是正數，但在計算餘額時應該扣除，所以用負數表示)
    const balance = Math.round(totalRemainingRebateAmt + negativeTotalRebateAmt);

    // 更新 FormControls
    this.dataForm.controls.invoiceTotalAmount.setValue(Math.round(totalInvoiceAmt));
    this.dataForm.controls.invoiceRemainingRebateAmount.setValue(Math.round(totalRemainingRebateAmt));
    this.dataForm.controls.totalRebateAmount.setValue(negativeTotalRebateAmt);
    this.dataForm.controls.Rebate_Amt.setValue(finalPositiveAmt);
    this.dataForm.controls.balanceAmount.setValue(balance);
  }
  // 彙總退貨明細相關欄位 (主要是 RJM_TotalBuyAmt)
  updateReturnSummaryAmounts(newData2?: IReturnDetailData[]): void {
    // 如果是 dataChange 觸發，則更新 data2
    if (newData2) this.data2 = newData2;

    // 使用 reduce 一次算出三個總和
    const summary = this.data2.reduce((acc, item) => {
      acc.totalAmt += (item.RJM_TotalBuyAmt || 0);
      acc.totalNet += (item.RJM_TotalBuyNet || 0);
      acc.totalTax += (item.RJM_TotalBuyTax || 0);
      return acc;
    }, { totalAmt: 0, totalNet: 0, totalTax: 0 });

    // 更新 FormControls，並使用 Math.round 確保與後端精度一致
    this.dataForm.controls.RJM_TotalBuyAmt.setValue(Math.round(summary.totalAmt));
    this.dataForm.controls.RJM_TotalBuyNet.setValue(Math.round(summary.totalNet));
    this.dataForm.controls.RJM_TotalBuyTax.setValue(Math.round(summary.totalTax));

    // 同步處理表單的 disable/enable 狀態
    this.updateFormDisableState();
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const isTableValid = this.tableEditComponent.validateAndShowErrors();
      if (!isTableValid) {
        this.loading = false;
        return;
      }
      const formValue = frm.getRawValue();
      const entryType = formValue.DIS_EntryType;
      // ---------------------------------------------------------
      // 2. 核心卡控邏輯調整
      // ---------------------------------------------------------
      const isAmountMatched = false;
      const errorMessage = '';

      if (entryType === '1') {
        // 類別為「退貨」：檢查【發票折讓總金額】是否等於【退貨明細總金額】
        // 注意：totalRebateAmount 在畫面上顯示為負數，所以運算時取絕對值
        const totalRebateAbs = Math.abs(formValue.totalRebateAmount || 0);
        const totalReturnAmt = Math.round(formValue.RJM_TotalBuyAmt || 0);

        // if (totalRebateAbs !== totalReturnAmt) {
        //   isAmountMatched = false;
        //   errorMessage = '【退貨總金額】與【折讓總金額】不相符';
        // } else {
        //   isAmountMatched = true;
        // }
      } else {
        // 類別為「一般折讓」或「活動券」：檢查【發票折讓總金額】是否等於【折讓單開立金額】
        const totalRebateAbs = Math.abs(formValue.totalRebateAmount || 0);
        const openRebateAmt = Math.round(formValue.Rebate_Amt || 0);

        // if (totalRebateAbs !== openRebateAmt) {
        //   isAmountMatched = false;
        //   errorMessage = '【折讓單開立金額】與【發票折讓明細總額】不相符';
        // } else {
        //   isAmountMatched = true;
        // }
      }
      // if (!isAmountMatched) {
      //   this.messageService.errorBubble(errorMessage);
      //   this.loading = false;
      //   return;
      // }
      const paramBody = {
        DIS_No: this.isFormCreateable ? undefined : formValue.DIS_No,
        ACP_YYYYMM: this.datePipe.transform(formValue.ACP_YYYYMM, 'yyyyMM') || '',
        VEN_No: formValue.VEN_No,
        DIS_EntryType: formValue.DIS_EntryType,
        rebateDetails: this.data.map(item => ({
          id: item.id || 0,
          PUR_GUINo: item.PUR_GUINo,
          PUR_GUIDate: item.PUR_GUIDate,
          TABTYPE: item.TABTYPE,
          PUR_TaxType: item.PUR_TaxType,
          GUI_Amt: item.PUR_Amt,
          Rebate_GUIDate: this.datePipe.transform(item.Rebate_GUIDate, 'yyyy-MM-dd') || '',
          Rebate_Amt: Math.round(item.Rebate_Amt_New || 0),
          Rebate_Net: Math.round(item.Rebate_Net || 0),
          Rebate_Tax: Math.round(item.Rebate_Tax || 0),
          Rebate_Name: formValue.DIS_EntryType === '1'
            ? (formValue.Rebate_Name || '退貨')
            : (formValue.Rebate_Name || ''),
        })),
        returnDetails: this.data2.map(item => ({
          id: item.id || 0,
          EVENT_ID: item.RJM_No,
          Rebate_Amt: item.RJM_TotalBuyAmt,
          Rebate_Net: item.RJM_TotalBuyNet,
          Rebate_Tax: item.RJM_TotalBuyTax
        }))
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          this.tls55030Service.insertTLS55030(paramBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '新增成功');
            this.dataForm.reset();
            this.data = [];
            this.data2 = [];
            this.updateFormDisableState();
          });
          break;
        case CRUDStatus.Edit:
          this.tls55030Service.updateTLS55030(paramBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '修改成功');
            this.onCancel();
          });
          break;
        default:
          return;
      }
    });
  }

  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    VEN_No: [null],
    HOS_No: [null],
  });
  dialogData: IReturnDetailData[] = [];
  dialogColumns: ReportColumn[] = [
    { field: 'RJM_No', header: '退貨單號' },
    { field: 'APRV_Date', header: '退貨日期' },
    { field: 'HOS_No', header: '倉別代號' },
    { field: 'HOS_NAME', header: '倉別名稱' },
    { field: 'VEN_NO', header: '廠商編號' },
    { field: 'RJM_TotalBuyNet', header: '未稅金額', format: formatAmount },
    { field: 'RJM_TotalBuyTax', header: '稅額', format: formatAmount },
    { field: 'RJM_TotalBuyAmt', header: '含稅金額', format: formatAmount },
  ];
  dialoglastQueryBody: ReturnNotRebateQueryBody | null = null;
  dialogLoading = false;
  dialogtotalRecords = 0;

  onQuery(frm: FormGroup) {
    this.dialogLoading = true;
    const formValue = frm.getRawValue();
    const paramBody = {
      ...formValue,
      APRV_Date_Start: this.datePipe.transform(formValue.APRV_Date_Start, 'yyyy-MM-dd'),
      APRV_Date_End: this.datePipe.transform(formValue.APRV_Date_End, 'yyyy-MM-dd'),
      PageIndex: 1,
      PageSize: 30,
      SortBy: [{ field: 'RJM_No', order: 1 }]
    };
    this.tls55030Service.queryTLS55030ReturnNotRebate(paramBody as ReturnNotRebateQueryBody).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe((res) => {
      this.dialogData = res.Data;
      this.dialogtotalRecords = res.TotalCount || res.Data.length;
      this.dialoglastQueryBody = paramBody as ReturnNotRebateQueryBody;
    })
  }
}
