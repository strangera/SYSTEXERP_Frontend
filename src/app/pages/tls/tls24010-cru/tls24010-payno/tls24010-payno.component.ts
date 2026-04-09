import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS5008Data, Tls24010Service } from '@service/api/tls/tls24010.service';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { forkJoin } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-payno',
  standalone: true,
  imports: [
    TableEditComponent
  ],
  templateUrl: './tls24010-payno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls24010PaynoComponent implements OnInit, OnChanges {
  @Input() data: POS5008Data[] = [];
  payNoData: POS5008Data[] = [];
  checkPayNoList: string[] = []; // 已審核的付款別清單
  private previousData: POS5008Data[] = [];
  columns: EditColumn[] = [
    { field: 'PAY_No', header: '付款別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'PAY_No', onChange: (rowData: any, value: any, col: EditColumn, index: number) => this.handlePayNoChange(rowData) },
    { field: 'TXN_PayAmt', header: '金額', type: 'inputNumber', disabled: () => true },
    { field: 'CRD_Type', header: '信用卡別', type: 'dropdown', options: getSYS1000Options('CRD_Type'), optionLabel: 'label', optionValue: 'value', disabled: (value: any, index?: number, rowData?: any) => rowData.PAY_Type !== "0" },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象', type: 'input', disabled: (value: any, index?: number, rowData?: any) => rowData.PAY_No === "10" },
    { field: 'TERM_No', header: '分期數', type: 'dropdown', options: SystemOptionsService.getOptions('T109'), optionLabel: 'SYS_Name', optionValue: 'SYS_Code', disabled: (value: any, index?: number, rowData?: any) => rowData.PAY_Type !== "0" || rowData.PAY_No === "12" || rowData.PAY_No === "14" },
  ];

  PAY_TypeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef,
    public readonly tls24010Service: Tls24010Service,
    private readonly datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.loadPayTypeOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newData: POS5008Data[] = changes['data']?.currentValue;

    if (newData && !this.isSameData(newData, this.previousData)) {
      if (this.PAY_TypeOptions.length > 0) {
        this.processData(newData);
      } else {
        // 如果選項尚未載入，則在載入完成後處理數據
        this.loadPayTypeOptions(() => this.processData(newData));
      }
    }
  }

  private loadPayTypeOptions(callback?: () => void): void {
    if (this.PAY_TypeOptions.length > 0 && !callback) return; // 如果已經載入過且沒有 callback，直接返回（避免重複觸發）

    if (!this.data || this.data.length === 0) return; // 取到付款別資料才做查詢，避免不必要的 API 呼叫

    const payload = {
      TXN_Date: this.datePipe.transform(this.data[0]?.TXN_Date, 'yyyy-MM-dd') || '',
      ECR_No: this.data[0]?.ECR_No || '',
      Talent_ID: this.data[0]?.Talent_ID || 0,
    }
    forkJoin({
      CheckResult: this.tls24010Service.queryTLS24010CheckStatus(payload),
      POS1006Result: this.dropDownListService.queryPOS1006_DropDownList()
    }).pipe(untilDestroyed(this)).subscribe(({ CheckResult, POS1006Result }) => {

      this.checkPayNoList = CheckResult.Data?.payNoList || [];

      this.PAY_TypeOptions = POS1006Result.Data.map(item => ({
        ...item,
        PAY_No: item.No,
        PAY_Name: item.Name,
        label: item.Name
      }));

      // 下拉選單排除掉已被審核的項目
      const filteredOptions = this.PAY_TypeOptions.filter(
        item => !this.checkPayNoList.includes(item.No)
      );

      this.columns = this.columns.map(col => {
        if (col.field === 'PAY_No') {
          return {
            ...col,
            options: filteredOptions
          };
        }
        return col;
      });

      if (callback) {
        callback();
      }

      this.cdr.markForCheck();
    });
  }

  private processData(newData: POS5008Data[]): void {
    if (this.PAY_TypeOptions.length === 0) {
      console.warn('PAY_TypeOptions is not loaded yet. Skipping data processing.');
      return;
    }

    this.payNoData = newData.map((item) => {
      const selectedOption = this.PAY_TypeOptions.find(i => i.No === item.PAY_No);
      const mappedPAYType = selectedOption?.PAY_Type;

      let crdNoTxnCouponNoTxnPayDesc = '';
      if (mappedPAYType === '0') {
        crdNoTxnCouponNoTxnPayDesc = item.CRD_No || '';
      } else if (mappedPAYType === 'A') {
        crdNoTxnCouponNoTxnPayDesc = item.TXN_PayDesc || '';
      } else {
        crdNoTxnCouponNoTxnPayDesc = item.TXN_CouponNo || '';
      }

      return {
        ...item,
        PAY_OverPay: selectedOption?.PAY_OverPay,
        TERM_No: item.TERM_No != null ? String(item.TERM_No) : null,
        PAY_Type: mappedPAYType,

        // 將選定的值賦予給欄位顯示用屬性
        CRD_NoTXN_CouponNoTXN_PayDesc: crdNoTxnCouponNoTxnPayDesc,

        // 為了數據一致性，將值同步回原始屬性 (如果您需要的話)
        CRD_No: crdNoTxnCouponNoTxnPayDesc,
        TXN_CouponNo: crdNoTxnCouponNoTxnPayDesc,
        TXN_PayDesc: crdNoTxnCouponNoTxnPayDesc
      };
    });

    this.previousData = newData;
    this.cdr.markForCheck();
  }

  handlePayNoChange(rowData: POS5008Data): void {
    if (rowData.PAY_No === "12" || rowData.PAY_No === "14") {
      rowData.TERM_No = null;
    }
  }

  private isSameData(newData: POS5008Data[], oldData: POS5008Data[]): boolean {
    if (newData.length !== oldData.length) return false;
    return newData.every((item, index) => item.ID === oldData[index]?.ID);
  }

  onFieldChange(event: { rowData: POS5008Data, field: string, value: string, index?: number }): void {
    const selectedItem = this.PAY_TypeOptions.find(item => item.No === event.rowData.PAY_No);
    let shouldUpdateView = false;

    // 獲取當前的 PAY_Type
    const currentPayType = selectedItem?.PAY_Type || event.rowData.PAY_Type;

    if (selectedItem) {
      event.rowData.PAY_Type = selectedItem.PAY_Type;
      event.rowData.PAY_OverPay = selectedItem.PAY_OverPay;

      if (event.field === 'PAY_No') {
        // ... (清空邏輯保持不變)
        event.rowData.CRD_Type = null;
        event.rowData.CRD_NoTXN_CouponNoTXN_PayDesc = null;
        event.rowData.TERM_No = null;
        shouldUpdateView = true;
      }
    }

    // ====== 修正點：同步 CRD_NoTXN_CouponNoTXN_PayDesc 的變動到原始欄位 ======
    if (event.field === 'CRD_NoTXN_CouponNoTXN_PayDesc') {
      // 將新值寫入 CRD_NoTXN_CouponNoTXN_PayDesc
      event.rowData.CRD_NoTXN_CouponNoTXN_PayDesc = event.value;

      // 根據 PAY_Type 將值同步到正確的原始欄位
      if (currentPayType === '0') {
        event.rowData.CRD_No = event.value; // 信用卡
        event.rowData.TXN_CouponNo = event.value;
        event.rowData.TXN_PayDesc = event.value;
      } else if (currentPayType === 'A') {
        event.rowData.TXN_PayDesc = event.value; // 應收付款對象
        event.rowData.CRD_No = event.value;
        event.rowData.TXN_CouponNo = event.value;
      } else {
        event.rowData.TXN_CouponNo = event.value; // 券號 (其他類型)
        event.rowData.CRD_No = event.value;
        event.rowData.TXN_PayDesc = event.value;
      }
    }
    // =========================================================================

    // 關鍵的清空邏輯 (針對 12 和 14)
    if (event.rowData.PAY_No === "12" || event.rowData.PAY_No === "14") {
      if (event.rowData.TERM_No !== null) {
        event.rowData.TERM_No = null;
        shouldUpdateView = true;
      }
    }

    if (shouldUpdateView) {
      this.cdr.markForCheck();
      // Immutable 更新 payNoData，確保父元件讀取時能偵測到變動
      this.payNoData = [...this.payNoData];
    }
  }
  rowEditDisabled = (row: any): boolean => row.Check_Status === 'Y'; // 已審核disabled資料
  isRowSelectable = (row: any): boolean => row.Check_Status !== 'Y'; // 已審核禁用選取

  /** 有已審核資料才顯示提示訊息 */
  get hasCheckedData(): boolean {
    return this.checkPayNoList.length > 0;
  }
}
