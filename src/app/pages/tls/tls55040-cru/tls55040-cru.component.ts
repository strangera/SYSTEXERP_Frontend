import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { APS3018, APS30181, GetPayDateBody, Tls55040Data, Tls55040Service, Tls55040VenData, Tls55040VenQueryBody } from '@service/api/tls/tls55040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Tls55040GoodDataDialogComponent } from './tls55040-good-data-dialog/tls55040-good-data-dialog.component';

@Component({
  selector: 'app-tls55040-cru',
  templateUrl: './tls55040-cru.component.html',
  standalone: true,
  // 移除 DialogComponent, TableReportComponent，加入 Tls55040GoodDataDialogComponent
  imports: [NgFor, TableEditComponent, Tls55040GoodDataDialogComponent, DropdownTableComponent, TranslateModule, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, NgIf, InputNumberComponent]
})
export class TLS55040CRUComponent extends BasicCruPageComponent<Tls55040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VEN_No: ['36260296-1' as string | null, [Validators.required]],   // 廠商編號 (下拉表格的主控項)
    ACP_YYYYMM: [new Date('2025-10-01') as Date | null, [Validators.required]],  // 結帳年月
    PUR_Uniform: [{ value: null as string | null, disabled: true }, [Validators.required]], // 統一編號 (由選取帶入)
    VEN_PayConditionDay: [null as number | null, [Validators.required]],// 付款天數 (隱藏，由選取帶入)
    ACP_PayDate: [{ value: null as Date | null, disabled: true }, [Validators.required]],// 預計付款日期 (由廠商編號連動取得)
    TABTYPE: ['0' as string | null, [Validators.required]],   // 單據種類
    // 中間加總欄位
    PUR_TotNet: [{ value: 0 as number | null, disabled: true }],// 發票總金額(未稅)
    EVENT_TotAmt: [{ value: 0 as number | null, disabled: true }],// 單據總金額(未稅)
    ADJ_TotAmt: [{ value: 0 as number | null, disabled: true }],// 調整總金額(未稅)
    DIFF_TotAmt: [{ value: 0 as number | null, disabled: true }],// 差異金額
  });

  // ========== Dropdown Table 相關屬性 (保持不變) ==========
  vendorQueryForm = this.formBuilder.group({
    VEN_No: [''], // 查詢條件
  });
  vevdorSuggestions: Tls55040VenData[] = [];
  vendorTableData: Tls55040VenData[] = [];
  vendorTotalRecords = 0;
  vendorTableLoading = false;
  vendorFieldsConfig: FieldsConfig[] = [
    { field: 'VEN_No', header: '廠商編號', mainDataField: true },
  ];
  vendorDialogColumns: Column[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'LOGO_CH_NAME', header: '品牌' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_PayConditionDay', header: '結帳後幾日付款' },
  ];
  // ========== Dropdown Table 相關屬性 END ==========

  // ========== APS30181 Table Edit 相關屬性 (保持不變) ==========
  APS30181Columns: EditColumn[] = [
    {
      field: 'EVENT_TYPE', header: '單據別', format: (v) => v === '0' ? '進貨驗收單' : '進貨退回單', cellClass: row => {
        return row.EVENT_TYPE === '0' ? 'text-primary' : 'text-red-500';
      }
    },
    { field: 'EVENT_No', header: '單號', type: 'input', disabled: () => true },
    { field: 'EVENT_DATE', header: '單據日期', type: 'date', disabled: () => true },
    { field: 'EVENT_Net', header: '未稅金額', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum' },
    { field: 'EVENT_Tax', header: '稅額', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum' },
    { field: 'EVENT_Amt', header: '金額小計', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum' },
    { field: 'ADJ_Amt', header: '調整金額', format: formatAmount, type: 'inputNumber' },
  ]
  APS30181Data: APS30181[] = []; // 主資料表格
  APS30181selectedItems: APS30181[] = [];
  APS30181Loading = false;
  PUR_VoucherTypeOptions = getSYS1000Options('PUR_VoucherType').filter(v => v.value !== '23' && v.value !== '24')
  // ========== APS30181 Table Edit 相關屬性 END ==========
  // ========== APS3018 Table Edit 相關屬性 (保持不變) ==========
  APS3018Columns: EditColumn[] = [
    { field: 'TABTYPE', header: '單據別', type: 'checkbox', falseValue: '0', trueValue: '1', label: '抵讓' },
    { field: 'PUR_GUINo', header: '發票/收據編號', type: 'input' },
    { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date' },
    { field: 'OTA_TaxType', header: '課稅別', type: 'dropdown', options: getSYS1000Options('OTA_TaxType'), optionLabel: 'label', optionValue: 'value' },
    {
      field: 'PUR_TotNet', header: '未稅金額', format: formatAmount, type: 'inputNumber',
      calculate: (rowData, value) => {
        return {
          'PUR_TotTax': rowData.OTA_TaxType === '1' ? Math.round(value * 0.05) : 0,
          'PUR_TotAmt': rowData.OTA_TaxType === '1' ? Math.round(value * 1.05) : value
        };
      }
    },
    { field: 'PUR_TotTax', header: '稅額', format: formatAmount, type: 'inputNumber' },
    { field: 'PUR_TotAmt', header: '應稅金額', format: formatAmount, type: 'inputNumber' },
    {
      field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown',
      options: this.PUR_VoucherTypeOptions,
      optionLabel: 'value', optionValue: 'value'
    },
  ]
  APS3018Data: APS3018[] = []; // 主資料表格
  APS3018selectedItems: APS3018[] = [];
  APS3018Loading = false;
  defaultInsertData = {
    TABTYPE: '0',
    OTA_TaxType: '1',
    PUR_VoucherType: '25'
  };
  // ========== APS3018 Table Edit 相關屬性 END ==========
  // ========== 彈窗相關屬性 ==========
  ODMVisible = false;
  // ========== 彈窗相關屬性 END ==========
  TABTYPEOptions = getSYS1000Options('TABTYPE')

  constructor(
    public readonly tls55040Service: Tls55040Service,
    public readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55040', this.dataForm);
    this.loadVenData();
    // 結帳年月變動時，清空廠商和連動資料，確保資料連動正確
    this.dataForm.get('ACP_YYYYMM')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.dataForm.get('VEN_No')?.reset(null);
      this.dataForm.get('VEN_PayConditionDay')?.reset(null);
      this.dataForm.get('ACP_PayDate')?.reset(null);
      this.dataForm.get('TABTYPE')?.reset('0');
      this.APS30181Data = []; // 清空明細資料
      this.updateTotals();
    });
  }

  loadVenData(body?: Record<string, string>): void {
    this.vendorTableLoading = true;
    const queryBody: Tls55040VenQueryBody = { VEN_No: body?.['VEN_No'] || '' };
    this.tls55040Service.queryTLS55040VenData(queryBody).pipe(untilDestroyed(this), finalize(() => this.vendorTableLoading = false)).subscribe(res => {
      this.vendorTableData = res.Data || [];
      this.vendorTotalRecords = res.TotalCount || 0;
      this.vevdorSuggestions = res.Data.map(item => { return { ...item, label: `${item.VEN_No} - ${item.VEN_Name}` }; });
    });
  }

  onVenSelect(selectedData: Tls55040VenData): void {
    if (!selectedData || !selectedData.VEN_No || !selectedData.VEN_PayConditionDay) return;
    this.dataForm.patchValue({
      PUR_Uniform: selectedData.VEN_Uniform,
      VEN_PayConditionDay: selectedData.VEN_PayConditionDay,
    });
    const acpYearMonth = this.dataForm.controls.ACP_YYYYMM.value;
    const payDay = this.dataForm.controls.VEN_PayConditionDay.value;
    const acpyyyyymm = this.datePipe.transform(acpYearMonth, 'yyyyMM');
    if (acpyyyyymm && payDay !== null) {
      const payDateBody: GetPayDateBody = { ACP_YYYYMM: acpyyyyymm, VEN_PayConditionDay: payDay };
      this.tls55040Service.getPayDate(payDateBody).pipe(untilDestroyed(this)).subscribe(res => {
        if (res.Data) {
          this.dataForm.controls.ACP_PayDate.setValue(new Date(res.Data));
          this.dataForm.controls.TABTYPE.setValue(selectedData.VEN_Flag);
        } else {
          this.dataForm.controls.ACP_PayDate.setValue(null);
          this.dataForm.controls.TABTYPE.setValue(null);
        }
      });
    } else {
      this.dataForm.controls.ACP_PayDate.setValue(null);
      this.dataForm.controls.TABTYPE.setValue(null);
    }
    this.APS30181Data = [];
    this.updateTotals();
  }

  /**
   * 點擊 '匯入當月驗收單' 按鈕
   */
  onImport(): void {
    if (!this.dataForm.valid) return;
    this.ODMVisible = true;
  }

  /**
   * 處理子元件回傳的匯入資料
   * @param items 子元件選取並回傳的驗收單資料 (已轉換為 APS30181 格式)
   */
  onImportItems(items: APS30181[]): void {
    const newItems = items.map(item => {
      return {
        ...item,
        EVENT_DATE: item.EVENT_DATE
      } as APS30181;
    });
    this.APS30181Data = [...this.APS30181Data, ...newItems];
    this.APS30181selectedItems = [];
    this.updateTotals();
    this.cdr.detectChanges();
  }

  /**
   * 新增：計算並更新表頭四個總計欄位
   */
  updateTotals(): void {
    // 1. PUR_TotNet = 發票資料Table (APS3018Data) 的未稅金額 (PUR_TotNet) 加總
    const PUR_TotNet = this.APS3018Data
      .map(item => item.PUR_TotNet || 0)
      .reduce((sum, current) => sum + current, 0);

    // 2. EVENT_TotAmt = 單據資料Table (APS30181Data) 的未稅金額 (EVENT_Net) 加總
    const EVENT_TotAmt = this.APS30181Data
      .map(item => item.EVENT_Net || 0)
      .reduce((sum, current) => sum + current, 0);

    // 3. ADJ_TotAmt = 單據資料Table (APS30181Data) 的調整金額 (ADJ_Amt) 加總
    // 假設 ADJ_Amt 欄位在 APS30181 結構中存在
    const ADJ_TotAmt = this.APS30181Data
      .map(item => item.ADJ_Amt || 0)
      .reduce((sum, current) => sum + current, 0);

    // 4. DIFF_TotAmt = PUR_TotNet – EVENT_TotAmt + ADJ_TotAmt
    const DIFF_TotAmt = EVENT_TotAmt - PUR_TotNet + ADJ_TotAmt;

    // 🎯 更新 dataForm 的值 (並確保值被設為 number)
    this.dataForm.patchValue({
      PUR_TotNet: PUR_TotNet,
      EVENT_TotAmt: EVENT_TotAmt,
      ADJ_TotAmt: ADJ_TotAmt,
      DIFF_TotAmt: DIFF_TotAmt,
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // TODO: 組裝完整的 Tls55040InsertBody，包含 APS30181List 和 APS3018List
      // 並呼叫 this.tls55040Service.insertTLS55040(body)
    })
  }
}
