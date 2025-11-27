import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IInvoiceDetail, IInvoiceDetailByDisNo, IReturnDetailByDisNoData, IReturnDetailData, ReturnNotRebateQueryBody, Tls55030ListData, Tls55030Service } from '@service/api/tls/tls55030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from "primeng/divider";
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { combineLatest, finalize, map, startWith } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
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
    DIS_No: [{ value: '', disabled: true }],
    ACP_YYYYMM: [new Date('2025-01'), [Validators.required]],
    VEN_No: ['84445301-1', [Validators.required]],
    DIS_EntryType: ['1', [Validators.required]],
    RJM_TotalBuyAmt: [{ value: 0, disabled: true }], 			    // 退貨總金額
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
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
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

  // 修正 validateRow 的型別以使用擴展介面
  validateRow = (rowData: IRebateDetailForCRU): { isValid: boolean, errorMessage: string } => {
    // 由於 rowData 現在是 IRebateDetailForCRU 類型，存取 Rebate_Amt_New 是安全的
    if ((rowData.Rebate_Amt_New || 0) > rowData.PUR_Amt - rowData.Rebate_Amt) {
      return { isValid: false, errorMessage: '此張進項發票已超折，請確認折讓單內容' };
    }
    return { isValid: true, errorMessage: '' };
  };

  constructor(
    public readonly tls55030Service: Tls55030Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', this.dataForm);
    this.setupVendorUniformNoListener();
    this.setupRebateNameValidator();
    if (!this.isFormCreateable) {
      this.loadDetailData();
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
      this.messageService.successBubble('資料載入成功');
    });
  }
  // 監聽 VEN_No 變化並找出對應的廠商統一編號 (No)
  setupVendorUniformNoListener(): void {
    // 監聽廠商編號變動，並結合廠商下拉選單資料，找出對應的 Uniform No (No)
    combineLatest([
      this.dataForm.controls.VEN_No.valueChanges.pipe(startWith(this.dataForm.controls.VEN_No.value)),
      this.VEN_NoOptions // Observable<Pos2013Item[] | null>
    ]).pipe(untilDestroyed(this)).subscribe(([selectedVenNo, options]) => {
      // 確保 options 是陣列且選取值存在
      if (selectedVenNo && Array.isArray(options)) {
        // 尋找選中的項目，並取得其 'No' 欄位作為統一編號
        const selectedOption: Option | undefined = options.find((opt: Option) => opt['VEN_No'] === selectedVenNo);
        this.venUniformNo = selectedOption ? selectedOption['No'] : null;
      } else {
        this.venUniformNo = null;
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
    console.log(this.data);

    this.selectedItems = [];

    // 統一呼叫新的方法
    this.updateInvoiceSummaryAndFormState();
  }
  // **核心修正點：統一處理主表單禁用/啟用和彙總欄位恆禁用邏輯**
  updateFormDisableState(): void {
    if (this.data2.length || this.data.length) {
      // 有明細資料時，禁用主表單 (防止修改 ACP_YYYYMM, VEN_No, DIS_EntryType)
      this.dataForm.controls.ACP_YYYYMM.disable();
      this.dataForm.controls.VEN_No.disable();
      this.dataForm.controls.DIS_EntryType.disable();
    } else {
      // 沒有明細資料時，啟用主表單
      this.dataForm.enable();

      // **重點:** 雖然 dataForm.enable() 啟用了所有欄位，但彙總欄位必須保持禁用！
      this.dataForm.controls.RJM_TotalBuyAmt.disable();
      this.dataForm.controls.invoiceTotalAmount.disable();
      this.dataForm.controls.invoiceRemainingRebateAmount.disable();
      this.dataForm.controls.totalRebateAmount.disable();
      this.dataForm.controls.balanceAmount.disable();
      this.dataForm.controls.Rebate_Amt.disable();
      if (this.isFormReadable) {
        this.dataForm.controls.Rebate_Name.enable();
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
      totalInvoiceAmt += item.PUR_Amt;
      totalRemainingRebateAmt += item.PUR_Amt - item.Rebate_Amt;
      positiveTotalRebateAmt += item.Rebate_Amt_New || 0;
    });
    const negativeTotalRebateAmt = positiveTotalRebateAmt != 0 ? -positiveTotalRebateAmt : 0;
    const balance = totalInvoiceAmt - totalRemainingRebateAmt + negativeTotalRebateAmt;

    // 更新 FormControls
    this.dataForm.controls.invoiceTotalAmount.setValue(totalInvoiceAmt);
    this.dataForm.controls.invoiceRemainingRebateAmount.setValue(totalRemainingRebateAmt);
    this.dataForm.controls.totalRebateAmount.setValue(negativeTotalRebateAmt);
    this.dataForm.controls.Rebate_Amt.setValue(positiveTotalRebateAmt);
    this.dataForm.controls.balanceAmount.setValue(balance);
  }
  // 彙總退貨明細相關欄位 (主要是 RJM_TotalBuyAmt)
  updateReturnSummaryAmounts(newData2?: IReturnDetailData[]): void {
    // 如果是 dataChange 觸發，則更新 data2
    if (newData2) {
      this.data2 = newData2;
    }

    // 重新計算退貨總金額
    const totalBuyAmt = this.data2.reduce((total, item) => total + item.RJM_TotalBuyAmt, 0);
    this.dataForm.controls.RJM_TotalBuyAmt.setValue(totalBuyAmt);

    // 同步處理表單的 disable/enable 狀態
    this.updateFormDisableState();
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const acpDateValue = formValue.ACP_YYYYMM;
      let rebateGUIDate = '';
      if (acpDateValue) {
        const inputDate = acpDateValue instanceof Date ? acpDateValue : new Date(acpDateValue);
        if (!isNaN(inputDate.getTime())) {
          const year = inputDate.getFullYear();// 2. 獲取當前的年份
          const month = inputDate.getMonth();// 3. 獲取當前的月份 (JavaScript 月份是 0-11)
          const lastDay = new Date(year, month + 1, 0);// 4. 計算該月的最後一天：設置下一個月 (month + 1) 的第 0 天
          rebateGUIDate = this.datePipe.transform(lastDay, 'yyyy-MM-dd') || '';// 5. 格式化為 YYYY-MM-dd
        }
      }
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

          Rebate_GUIDate: rebateGUIDate,

          Rebate_Amt: item.Rebate_Amt_New || 0,
          Rebate_Net: item.Rebate_Net || 0,
          Rebate_Tax: item.Rebate_Tax || 0,
          Rebate_Name: formValue.DIS_EntryType === '1' ? '退貨' : formValue.Rebate_Name || '',
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
      // 使用 DatePipe 轉換日期格式
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
