import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { APS3018, APS30181, Tls55040Data, Tls55040Service, Tls55040VenData } from '@service/api/tls/tls55040.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/components/input-number/input-number.component";
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateDuplicate, validateMaxLength, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { Column, formatAmount } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Tls55040GoodDataDialogComponent } from './tls55040-good-data-dialog/tls55040-good-data-dialog.component';

@Component({
  selector: 'app-tls55040-cru',
  templateUrl: './tls55040-cru.component.html',
  standalone: true,
  imports: [NgFor, TableEditComponent, Tls55040GoodDataDialogComponent, DropdownTableComponent, TranslateModule, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, NgIf, InputNumberComponent]
})
export class TLS55040CRUComponent extends BasicCruPageComponent<Tls55040Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    OTA_No: [{ value: null as string | null, disabled: true }],
    VEN_No: [null as string | null, [Validators.required]],
    ACP_YYYYMM: [null as Date | null, [Validators.required]],
    PUR_Uniform: [{ value: null as string | null, disabled: true }],
    VEN_PayConditionDay: [null as number | null, [Validators.required]],
    ACP_PayDate: [{ value: null as Date | null, disabled: true }, [Validators.required]],
    TABTYPE: ['0' as string | null, [Validators.required]],
    PUR_TotNet: [{ value: 0 as number | null, disabled: true }],
    EVENT_TotAmt: [{ value: 0 as number | null, disabled: true }],
    ADJ_TotAmt: [{ value: 0 as number | null, disabled: true }],
    DIFF_TotAmt: [{ value: 0 as number | null, disabled: true }],
  });

  vendorQueryForm = this.formBuilder.group({
    VEN_No: [''],
  });

  // 記憶體快取核心變數
  private allVendorData: Tls55040VenData[] = [];
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

  APS30181Columns: EditColumn[] = [];
  APS30181Data: APS30181[] = [];
  APS30181selectedItems: APS30181[] = [];
  APS30181Loading = false;
  PUR_VoucherTypeOptions = getSYS1000Options('PUR_VoucherType').filter(v => v.value !== '23' && v.value !== '24');

  private calculateRepYYYYMM(dateValue: string | Date | null): string | null {
    if (!dateValue) return null;
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const repMonth = month % 2 === 0 ? month : month + 1;
    return `${year}${repMonth.toString().padStart(2, '0')}`;
  }

  private formatRepYYYYMM = (value: string, index: number | undefined, rowData: APS3018): string | number | null => {
    const repYYYYMM = this.calculateRepYYYYMM(rowData.PUR_GUIDate);
    if (!repYYYYMM) return '--';
    return `${repYYYYMM.substring(0, 4)}/${repYYYYMM.substring(4, 6)}`;
  };

  APS3018Columns: EditColumn[] = [];
  APS3018Data: APS3018[] = [];
  APS3018selectedItems: APS3018[] = [];
  APS3018Loading = false;
  defaultInsertData = {
    TABTYPE: '0',
    OTA_TaxType: '1',
    PUR_VoucherType: '25',
    PUR_DirectType: '1',
    PUR_DiscNo: '1',
    PUR_GUIDate: new Date(),
  };

  validateRepYYYYMMConsistency = (rowData: APS3018): { isValid: boolean, errorMessage: string } => {
    if (!rowData.PUR_GUIDate) return { isValid: true, errorMessage: '' };
    const currentRepMonth = this.calculateRepYYYYMM(rowData.PUR_GUIDate);
    const otherRows = this.APS3018Data.filter(item => item !== rowData && item.PUR_GUIDate);
    if (otherRows.length > 0) {
      const baseRepMonth = this.calculateRepYYYYMM(otherRows[0].PUR_GUIDate);
      if (currentRepMonth !== baseRepMonth) {
        return { isValid: false, errorMessage: `申報年月(${currentRepMonth})不一致，請檢查發票日期。` };
      }
    }
    return { isValid: true, errorMessage: '' };
  };

  ODMVisible = false;
  TABTYPEOptions = getSYS1000Options('TABTYPE');

  constructor(
    public readonly tls55040Service: Tls55040Service,
    public readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55040', this.dataForm);

    // 1. 初始化時「只呼叫一次」API，把該 MID 的所有廠商全部載入到記憶體中
    this.initAllVendorCache();

    if (!this.isFormCreateable && this.rowdata) {
      this.tls55040Service.queryDetailTLS55040({ OTA_No: this.rowdata.OTA_No }).pipe(untilDestroyed(this)).subscribe(res => {
        const detailData = res.Data?.[0];
        if (!detailData) return;
        this.APS30181Data = detailData.APS30181List;
        this.APS3018Data = detailData.APS3018List;
        this.dataForm.patchValue({
          ACP_YYYYMM: new Date(detailData.ACP_YYYYMM.substring(0, 4) + '-' + detailData.ACP_YYYYMM.substring(4, 6) + '-01'),
          ACP_PayDate: new Date(detailData.ACP_PayDate),
          TABTYPE: detailData.APS3018List[0]?.TABTYPE || null,
        });

        this.tls55040Service.queryTLS55040VenData({ VEN_No: detailData.VEN_No }).pipe(untilDestroyed(this)).subscribe(venRes => {
          const venData = venRes.Data[0];
          if (venData) {
            this.dataForm.patchValue({
              VEN_PayConditionDay: venData.VEN_PayConditionDay,
            });
          }
        });
        this.updateTotals();
        this.dataForm.disable({ emitEvent: false });
      });
    } else {
      this.dataForm.get('ACP_YYYYMM')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
        this.dataForm.get('VEN_No')?.reset(null);
        this.dataForm.get('VEN_PayConditionDay')?.reset(null);
        this.dataForm.get('ACP_PayDate')?.reset(null);
        this.dataForm.get('TABTYPE')?.reset('0');
        this.APS30181Data = [];
        this.updateTotals();
      });
    }

    this.initTableColumn();
  }

  /**
   * 2. 新增：一次性快取全量廠商資料
   */
  private initAllVendorCache(): void {
    this.vendorTableLoading = true;
    this.tls55040Service.queryTLS55040VenData({ VEN_No: '' }).pipe(
      untilDestroyed(this),
      finalize(() => this.vendorTableLoading = false)
    ).subscribe(res => {
      this.allVendorData = res.Data || [];
      // 預設狀態下，Suggestions 與 Table 顯示全部快取資料
      this.refreshVendorDisplayData(this.allVendorData);
    });
  }

  /**
   * 3. 輔助函式：統一更新前端快取綁定的顯示欄位與筆數
   */
  private refreshVendorDisplayData(filteredList: Tls55040VenData[]): void {
    this.vendorTableData = filteredList;
    this.vendorTotalRecords = filteredList.length;
    this.vevdorSuggestions = filteredList.map(item => ({
      ...item,
      label: `${item.VEN_No} - ${item.VEN_Name}`
    }));
    this.cdr.detectChanges();
  }

  /**
   * 4. 重構：完全不走後端 API，純前端記憶體篩選邏輯
   * 守備：p-autoComplete 輸入、Overlay 內部查詢表單異動
   */
  filterVendorInMemory(body?: Record<string, string>): void {
    // 取得輸入值 (可能是 autocomplete 的 label 或是查詢表單的 VEN_No)
    const rawValue = body?.['label'] || body?.['VEN_No'] || '';
    const keyword = (rawValue.includes('[object Object]') || rawValue === 'null') ? '' : rawValue.trim().toUpperCase();

    if (!keyword) {
      // 沒輸入關鍵字，還原顯示全量快取
      this.refreshVendorDisplayData(this.allVendorData);
      return;
    }

    // 支援包含(LIKE)查詢：同時比對廠商編號、名稱與品牌
    const filtered = this.allVendorData.filter(item =>
      (item.VEN_No?.toUpperCase().includes(keyword)) ||
      (item.VEN_Name?.toUpperCase().includes(keyword)) ||
      (item.LOGO_CH_NAME?.toUpperCase().includes(keyword))
    );

    this.refreshVendorDisplayData(filtered);
  }

  initTableColumn(): void {
    this.APS30181Columns = [
      { field: 'EVENT_TYPE', header: '單據別', format: (v) => v === '0' ? (this.isFormCreateable ? '進貨驗收單' : '進貨') : (this.isFormCreateable ? '進貨退回單' : '退貨'), cellClass: row => row.EVENT_TYPE === '0' ? 'text-primary' : 'text-red-500' },
      { field: 'EVENT_No', header: '單號', type: 'input', disabled: () => true },
      { field: 'EVENT_DATE', header: '單據日期', type: 'date', disabled: () => true },
      { field: 'EVENT_Net', header: '未稅金額', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum', textAlign: 'right' },
      { field: 'EVENT_Tax', header: '稅額', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum', textAlign: 'right' },
      { field: 'EVENT_Amt', header: this.isFormCreateable ? '金額小計' : '應稅金額', format: formatAmount, type: 'inputNumber', disabled: () => true, aggregate: 'sum', textAlign: 'right' },
      { field: 'ADJ_Amt', header: this.isFormCreateable ? '調整金額' : '未稅調整金額', format: formatAmount, max: 9999999999, type: 'inputNumber', aggregate: 'sum', textAlign: 'right' },
    ];
    this.APS3018Columns = [
      { field: 'TABTYPE', header: '單據別', format: v => getSYS1000('TABTYPE', v), width: '45px' },
      { field: 'PUR_GUINo', header: '發票/收據編號', type: 'input', validate: [validateDuplicate, validateRequired, validateMaxLength(10), AA00000000], maxLength: 10, onBlur: (rowData) => this.toUpperCase(rowData), width: '80px' },
      { field: 'PUR_GUIDate', header: '發票/收據日期', type: 'date', calculate: (rowData, dateValue) => { const repYYYYMM = this.calculateRepYYYYMM(dateValue); rowData.PUR_RepYYYYMM = repYYYYMM; return { 'PUR_RepYYYYMM': repYYYYMM }; }, validate: [validateRequired], width: '120px' },
      { field: 'PUR_RepYYYYMM', header: '申報年月', format: this.formatRepYYYYMM, width: '50px' },
      { field: 'OTA_TaxType', header: '課稅別', validate: [validateRequired], type: this.isFormCreateable ? 'dropdown' : undefined, options: getSYS1000Options('OTA_TaxType'), optionLabel: 'label', optionValue: 'value', format: (v) => getSYS1000('OTA_TaxType', v), disabled: () => !this.isFormCreateable, calculate: (rowData, value) => { return { PUR_Tax: value !== '1' ? 0 : rowData.PUR_Tax, PUR_TotAmt: value !== '1' ? rowData.PUR_TotNet : rowData.PUR_TotAmt }; }, width: '45px', showClear: false },
      { field: 'PUR_TotNet', header: '未稅金額', format: formatAmount, validate: [validateRequired], max: 9999999999, maxLength: 10, type: 'inputNumber', onBlur: (rowData, value) => this.onPurTotNetBlur(rowData, value), textAlign: 'right', aggregate: 'sum', min: 0, width: '80px' },
      { field: 'PUR_TotTax', header: '稅額', format: formatAmount, validate: [validateRequired], max: 9999999999, min: 0, maxLength: 10, type: 'inputNumber', textAlign: 'right', aggregate: 'sum', width: '80px', onBlur: (rowData, value) => this.onPurTotTaxBlur(rowData, value), disabled: (value, index, rowData) => { if (rowData.OTA_TaxType !== '1') { rowData.PUR_TotTax = 0; } return rowData.OTA_TaxType !== '1'; } },
      { field: 'PUR_TotAmt', header: '應稅金額', format: formatAmount, validate: [validateRequired], max: 9999999999, min: 0, maxLength: 10, type: 'inputNumber', disabled: () => true, aggregate: 'sum', textAlign: 'right', width: '80px' },
      { field: 'PUR_VoucherType', header: '發票格式', validate: [validateRequired], type: 'dropdown', options: this.PUR_VoucherTypeOptions, optionLabel: 'value', optionValue: 'value', width: '50px', showClear: false, minWidth: '50px' },
      { field: 'PUR_DirectType', header: '發票用途', type: this.isFormCreateable ? 'dropdown' : undefined, options: getSYS1000Options('PUR_DirectType'), optionLabel: 'label', optionValue: 'value', format: (v) => getSYS1000('PUR_DirectType', v), width: '60px', showClear: false },
      { field: 'PUR_DiscNo', header: '扣抵代號', type: this.isFormCreateable ? 'dropdown' : undefined, options: getSYS1000Options('PUR_DiscNo'), optionLabel: 'label', optionValue: 'value', format: (v) => getSYS1000('PUR_DiscNo', v), width: '130px', showClear: false },
    ];
  }

  onPurTotNetBlur(rowData: APS3018, newNetValue: number): void {
    const purTotNet = newNetValue || 0;
    let purTotTax = 0;
    let purTotAmt = purTotNet;
    if (rowData.OTA_TaxType === '1') {
      purTotTax = Math.round(purTotNet * 0.05);
      purTotAmt = Math.round(purTotNet * 1.05);
    }
    rowData.PUR_TotTax = Number(purTotTax);
    rowData.PUR_TotAmt = purTotAmt;
    this.updateTotals();
    this.cdr.detectChanges();
  }

  onPurTotTaxBlur(rowData: APS3018, newTaxValue: number): void {
    const purTotNet = rowData.PUR_TotNet || 0;
    const currentTax = newTaxValue || 0;
    if (rowData.OTA_TaxType === '1') {
      const expectedTax = Math.round(purTotNet * 0.05);
      if (Math.abs(currentTax - expectedTax) > 10) {
        this.messageService.warnBubble(`發票號碼 ${rowData.PUR_GUINo || ''} 稅額(${currentTax})與計算值(${expectedTax})差異較大，請檢視稅額是否異常。`);
      }
    }
    const purTotAmt = rowData.OTA_TaxType === '1' ? Math.round(purTotNet + currentTax) : purTotNet;
    rowData.PUR_TotAmt = purTotAmt;
    this.updateTotals();
    this.cdr.detectChanges();
  }

  onVenSelect(selectedData: Tls55040VenData): void {
    if (!selectedData || !selectedData.VEN_No || !selectedData.VEN_PayConditionDay) return;
    this.dataForm.patchValue({
      VEN_PayConditionDay: selectedData.VEN_PayConditionDay,
    });
    const acpYearMonth = this.dataForm.controls.ACP_YYYYMM.value;
    const payDay = this.dataForm.controls.VEN_PayConditionDay.value;
    const acpyyyyymm = this.datePipe.transform(acpYearMonth, 'yyyyMM');
    if (acpyyyyymm && payDay !== null) {
      this.tls55040Service.getPayDate({ ACP_YYYYMM: acpyyyyymm, VEN_PayConditionDay: payDay }).pipe(untilDestroyed(this)).subscribe(res => {
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

  onImport(): void {
    if (!this.dataForm.valid) return;
    this.ODMVisible = true;
  }

  onImportItems(items: APS30181[]): void {
    const newItems = items.map(item => ({ ...item, EVENT_DATE: item.EVENT_DATE } as APS30181));
    this.APS30181Data = [...this.APS30181Data, ...newItems];
    this.APS30181selectedItems = [];
    this.updateTotals();
    this.cdr.detectChanges();
  }

  updateTotals(): void {
    const PUR_TotNet = this.APS3018Data.map(item => item.PUR_TotNet || 0).reduce((sum, current) => sum + current, 0);
    const EVENT_TotAmt = this.APS30181Data.map(item => item.EVENT_Net || 0).reduce((sum, current) => sum + current, 0);
    const ADJ_TotAmt = this.APS30181Data.map(item => item.ADJ_Amt || 0).reduce((sum, current) => sum + current, 0);
    const DIFF_TotAmt = EVENT_TotAmt - PUR_TotNet + ADJ_TotAmt;
    this.dataForm.patchValue({ PUR_TotNet, EVENT_TotAmt, ADJ_TotAmt, DIFF_TotAmt });
  }

  @ViewChild('APS30181TableEdit') APS30181TableEdit!: TableEditComponent;
  @ViewChild('APS3018TableEdit') APS3018TableEdit!: TableEditComponent;

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (!this.APS30181Data.length) { this.messageService.errorBubble('請先新增單據資料 !!!'); this.loading = false; return; }
      if (!this.APS3018Data.length) { this.messageService.errorBubble('請先新增發票資料 !!!'); this.loading = false; return; }
      if (!this.APS30181TableEdit.validateAndShowErrors()) { this.loading = false; return; }
      if (!this.APS3018TableEdit.validateAndShowErrors()) { this.loading = false; return; }
      if ((this.dataForm.controls.EVENT_TotAmt.value || 0) + (this.dataForm.controls.ADJ_TotAmt.value || 0) !== (this.dataForm.controls.PUR_TotNet.value || 0)) {
        this.messageService.errorBubble('單據未稅總金額 加 總未稅調整金額 與 未稅發票總金額 不平 !!!');
        this.loading = false; return;
      }
      const body = {
        ...frm.getRawValue(),
        ACP_PayDate: this.datePipe.transform(frm.controls['ACP_PayDate'].value, 'yyyy-MM-dd'),
        ACP_YYYYMM: this.datePipe.transform(frm.controls['ACP_YYYYMM'].value, 'yyyyMM'),
        APS30181List: this.APS30181Data.map(item => ({ ...item, EVENT_DATE: this.datePipe.transform(item.EVENT_DATE, 'yyyy-MM-dd') })),
        APS3018List: this.APS3018Data.map(item => ({ ...item, PUR_RepYYYYMM: this.calculateRepYYYYMM(item.PUR_GUIDate), PUR_GUIDate: this.datePipe.transform(item.PUR_GUIDate, 'yyyy-MM-dd') }))
      };
      const $req = this.isFormCreateable ? this.tls55040Service.insertTLS55040(body) : this.tls55040Service.updateTLS55040(body);
      $req.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) { this.onCancel(res.Data); } else if (this.isFormEditable) { this.onCancel(); }
      });
    });
  }

  toUpperCase(rowData: APS3018): void { if (rowData && rowData.PUR_GUINo) { rowData.PUR_GUINo = rowData.PUR_GUINo.toUpperCase(); } }
  onTabTypeChange(event: string): void {
    this.defaultInsertData = { ...this.defaultInsertData, TABTYPE: event, PUR_DirectType: '1' };
    this.APS3018Data = [...this.APS3018Data.map(item => ({ ...item, TABTYPE: event }))];
    this.cdr.detectChanges();
  }
}

export function AA00000000(value: string): { isValid: boolean; errorMessage: string[] } {
  const cleanedValue = value ? value.trim() : '';
  if (cleanedValue.length !== 10) return { isValid: false, errorMessage: ['發票號碼必須為 10 個字元。'] };
  if (!/^[A-Z]{2}$/i.test(cleanedValue.substring(0, 2))) return { isValid: false, errorMessage: ['發票號碼前 2 碼請輸入英文字母。'] };
  if (!/^\d{8}$/.test(cleanedValue.substring(2))) return { isValid: false, errorMessage: ['發票號碼後 8 碼必須為數字。'] };
  return { isValid: true, errorMessage: [] };
}
