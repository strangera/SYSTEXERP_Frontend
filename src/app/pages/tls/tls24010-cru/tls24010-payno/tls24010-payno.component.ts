import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { POS5008Data } from '@service/api/tls/tls24010.service';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-tls24010-payno',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './tls24010-payno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tls24010PaynoComponent implements OnInit, OnChanges {
  @Input() data: POS5008Data[] = [];
  payNoData: POS5008Data[] = [];
  private previousData: POS5008Data[] = [];

  columns: Column[] = [
    { field: 'ID', header: 'ID', hidden: true },
    { field: 'PAY_No', header: '付款別', type: 'dropdown', options: [], optionLabel: 'label', optionValue: 'PAY_No', onChange: (data) => this.handlePayNoChange(data) },
    { field: 'TXN_PayAmt', header: '金額', type: 'inputNumber', disabled: () => true },
    { field: 'CRD_Type', header: '信用卡別', type: 'dropdown', options: getSYS1000Options('CRD_Type'), optionLabel: 'label', optionValue: 'value', disabled: (rowData) => rowData.PAY_Type !== "0" },
    { field: 'CRD_NoTXN_CouponNoTXN_PayDesc', header: '信用卡卡號/券號/應收付款對象', type: 'input', disabled: (rowData) => rowData.PAY_No === "10" },
    { field: 'TERM_No', header: '分期數', type: 'dropdown', options: SystemOptionsService.getOptions('T109'), optionLabel: 'SYS_Name', optionValue: 'SYS_Code', disabled: (rowData) => rowData.PAY_Type !== "0" || rowData.PAY_No === "12" || rowData.PAY_No === "14" },
  ];

  PAY_TypeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef,
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
    if (this.PAY_TypeOptions.length > 0) {
      if (callback) {
        callback();
      }
      return;
    }

    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe((res) => {
      const newPAY_TypeOptions = res.Data.map(item => ({
        ...item,
        PAY_No: item.No,
        PAY_Name: item.Name,
        label: item.Name
      }));

      this.PAY_TypeOptions = newPAY_TypeOptions;

      // Immutable 更新 columns 參考
      this.columns = this.columns.map(col => {
        if (col.field === 'PAY_No') {
          return {
            ...col,
            options: newPAY_TypeOptions
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
}
