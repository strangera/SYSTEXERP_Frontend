import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { Subscription } from 'rxjs';

import { TLS13010DropdownService } from '@pages/tls/shared/constants/tls13010.dropdown';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { ColumnDef, ExpandableEditTableComponent } from '@others/component/expandable-edit-table/expandable-edit-table.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { LocationOptionsService } from '@others/services/dropdownservice/location-options.service';

import { getContractInfoColumns } from '../../../../../tls13010-v2/core/constants/commission-columns';
import {
  FARE_CAP_TYPE_LABELS,
  FARE_CHANGE_DETECTION_CONFIG,
  FareCapType,
  getDeductionColumnsByType,
  setColumnsReadonly
} from '../../../../../tls13010-v2/core/constants/fare-columns.config';
import { ChangeDetectionConfig, CrudTrackingService, TrackableItem } from '../../../../../tls13010-v2/core/services/crud-tracking.service';
import { LocationItem } from '../../../../core/models/contract/location-item.interface';
import { FareItem, FaresByType } from '../../../../core/models/deduction/fare-item.interface';

/** 合約資訊介面 */
interface ContractInfo {
  id: number;
  apply_no?: string;
  tlt_no?: string;
  tlt_name?: string;
  ven_uniform?: string;
  VEN_Name?: string;
  contract_subno?: string;
  tlt_term_type?: string;
  tlt_ctype_mtotal?: string;
  overall_status?: string;
  tlt_bdate?: string;
  tlt_edate?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
}

interface CalculationResult {
  monthlyAmount: number;
  downPayment: number;
  totalAmount: number;
  periods: number;
}

@Component({
  selector: 'app-step2-deduction',
  templateUrl: './step2-deduction.component.html',
  styleUrls: ['./step2-deduction.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AccordionModule,
    ButtonComponent,
    ExpandableEditTableComponent,
    DialogComponent
  ]
})
export class Step2DeductionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fareItems: FareItem[] = [];
  @Input() contractForm?: FormGroup;
  @Input() locationData: LocationItem[] = [];
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create;
  @Input() isViewMode = false;

  @Output() dataChange = new EventEmitter<FareItem[]>();

  private subscriptions: Subscription[] = [];

  // ========== 常數 ==========
  readonly capTypes: FareCapType[] = [
    FareCapType.A,
    FareCapType.B,
    FareCapType.C,
    FareCapType.D,
  ];

  // 依類型分組的資料
  fareData: FaresByType = {
    A: [], B: [], C: [], D: []
  };

  // 各類型顯示模式
  showModeByType: { [key: string]: 'common' | 'all' } = {
    A: 'common', B: 'common', C: 'common', D: 'common', E: 'common'
  };

  // 合約資訊顯示
  contractInfoData: ContractInfo[] = [];
  contractInfoColumns: ColumnDef[] = [];

  /** 組織選項 */
  orgOptions: { label: string; value: string }[] = [];

  /** 支付編號選項 */
  payNoOptions: { label: string; value: string | number }[] = [];

  /** 欄位定義快取 */
  private columnCache: Record<string, ColumnDef[]> = {};

  /** 總坪數 */
  totalLocationSpace = 0;

  loading = false;
  shouldForceEdit = true;

  // 計算對話框
  showCalculationDialog = false;
  calculationResult: CalculationResult | null = null;
  currentCalculatingItem: FareItem | null = null;

  constructor(
    private locationOptionsService: LocationOptionsService,
    private dropdownService: TLS13010DropdownService,
    private cdr: ChangeDetectorRef
  ) {
    this.initContractInfoColumns();
  }

  ngOnInit(): void {
    this.loadOrgOptions();
    this.loadPayNoOptions();
    this.calculateTotalLocationSpace();
    this.setupContractInfo();
    this.groupFaresByType();
    this.shouldForceEdit = !this.isViewMode;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fareItems'] && this.fareItems) {
      this.groupFaresByType();
      this.cdr.detectChanges();
    }
    if (changes['locationData']) {
      this.calculateTotalLocationSpace();
    }
    if (changes['contractForm']) {
      this.setupContractInfo();
    }
    if (changes['crudstatus']) {
      this.clearColumnCache();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== Getter ==========
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get contractDates(): { bdate: string; edate: string } {
    if (!this.contractForm) {
      return { bdate: '', edate: '' };
    }
    return {
      bdate: this.contractForm.get('tlt_contract_bdate')?.value || '',
      edate: this.contractForm.get('tlt_contract_edate')?.value || ''
    };
  }

  // ========== 合約資訊 ==========
  private initContractInfoColumns(): void {
    this.contractInfoColumns = getContractInfoColumns();
  }

  private setupContractInfo(): void {
    if (!this.contractForm) {
      this.contractInfoData = [];
      return;
    }

    const formValue = this.contractForm.getRawValue();
    this.contractInfoData = [{
      id: 1,
      apply_no: formValue.apply_no || '',
      tlt_no: formValue.tlt_no || '',
      tlt_name: formValue.tlt_name || '',
      ven_uniform: formValue.ven_uniform || '',
      VEN_Name: formValue.VEN_Name || '',
      contract_subno: formValue.contract_subno || '',
      tlt_term_type: formValue.tlt_term_type || '',
      tlt_ctype_mtotal: formValue.tlt_ctype_mtotal || '',
      overall_status: formValue.overall_status || '',
      tlt_bdate: formValue.tlt_bdate || '',
      tlt_edate: formValue.tlt_edate || '',
      tlt_contract_bdate: formValue.tlt_contract_bdate || '',
      tlt_contract_edate: formValue.tlt_contract_edate || ''
    }];
  }

  // ========== 欄位定義 (使用 TLS13010 v2 共用 config) ==========
  getColumnsForType(capType: string): ColumnDef[] {
    const cacheKey = `${capType}_${this.isFormReadonly}`;

    if (!this.columnCache[cacheKey]) {
      let columns = getDeductionColumnsByType(
        capType as FareCapType,
        this.contractDates
      );

      // 更新組織選項
      columns = columns.map(col => {
        if (col.field === 'org_id') {
          return { ...col, options: this.orgOptions };
        }
        return col;
      });

      // 唯讀模式處理
      if (this.isFormReadonly) {
        columns = setColumnsReadonly(columns, true);
      }

      this.columnCache[cacheKey] = columns;
    }

    return this.columnCache[cacheKey];
  }

  private clearColumnCache(): void {
    this.columnCache = {};
  }

  // ========== 顯示模式 ==========
  getCapTypeName(capType: string): string {
    return FARE_CAP_TYPE_LABELS[capType as FareCapType] || capType;
  }

  getAllCommonModeText(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部載入' : '顯示常用';
  }

  getAllDisplayMode(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部顯示: 常用項目' : '全部顯示: 全部項目';
  }

  toggleAllCommonMode(): void {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    const newMode = allCommon ? 'all' : 'common';

    Object.keys(this.showModeByType).forEach(key => {
      this.showModeByType[key] = newMode;
    });
  }

  getCommonModeTextByType(capType: string): string {
    return this.showModeByType[capType] === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  getCurrentDisplayModeByType(capType: string): string {
    return this.showModeByType[capType] === 'common'
      ? '合約項目 + 常用項目 + 已勾選項目'
      : '全部項目';
  }

  toggleCommonModeByType(capType: string): void {
    this.showModeByType[capType] = this.showModeByType[capType] === 'common' ? 'all' : 'common';
  }

  isOutlinedMode(capType: string): boolean {
    return this.showModeByType[capType] === 'all';
  }

  // ========== 資料處理 ==========
  private groupFaresByType(): void {
    this.fareData = { A: [], B: [], C: [], D: [] };

    this.fareItems.forEach(item => {
      const type = item.cap_type as keyof FaresByType;
      if (this.fareData[type]) {
        // 套用預設合約起訖日期（如果項目沒有日期）
        this.applyDefaultDatesToItem(item, type);

        // C 類型：根據日期計算期數和首期金額
        if (type === 'C' && item.tpy_bdate && item.tpy_edate) {
          this.recalculateTypeCFields(item);
        }
        this.fareData[type].push(item);
      }
    });
  }

  /**
   * 為沒有日期的項目套用合約起訖日期
   */
  private applyDefaultDatesToItem(item: FareItem, capType: string): void {
    const dates = this.contractDates;
    if (!dates.bdate && !dates.edate) return;

    if (!item.tpy_bdate && dates.bdate) {
      item.tpy_bdate = dates.bdate;
    }

    // A 類型：結束日期 = 起始日期
    if (capType === 'A') {
      if (item.tpy_bdate) {
        item.tpy_edate = item.tpy_bdate;
      }
    } else {
      if (!item.tpy_edate && dates.edate) {
        item.tpy_edate = dates.edate;
      }
    }
  }

  /**
   * 重新計算 C 類型的期數和首期金額
   */
  private recalculateTypeCFields(rowData: FareItem, changedField?: string): void {
    const periods = this.calculatePeriods(rowData.tpy_bdate, rowData.tpy_edate);

    if (rowData.period_nos !== periods) {
      rowData.period_nos = periods;
    }

    const totalAmt = parseFloat(String(rowData.tpy_totalamt || 0));

    if (changedField === 'down_payment') {
      // 輸入首期 → 算每月金額
      const downPayment = parseFloat(String(rowData.down_payment || 0));
      if (totalAmt > 0 && periods > 1) {
        rowData.tpy_amount = Math.ceil((totalAmt - downPayment) / (periods - 1));
      }
    } else {
      // 輸入每月金額（或總金額、日期）→ 算首期金額
      const monthlyAmt = parseFloat(String(rowData.tpy_amount || 0));
      let newDownPayment = rowData.down_payment;
      if (totalAmt > 0 && monthlyAmt > 0 && periods > 1) {
        newDownPayment = Math.ceil(totalAmt - (monthlyAmt * (periods - 1)));
      } else if (monthlyAmt > 0) {
        newDownPayment = Math.ceil(monthlyAmt);
      }
      if (rowData.down_payment !== newDownPayment) {
        rowData.down_payment = newDownPayment;
      }
    }
  }

  /**
   * 計算期數 (支援 Date 物件、YYYYMM、YYYY/MM、YYYY-MM-DD)
   */
  private calculatePeriods(startDate?: string | Date, endDate?: string | Date): number {
    if (!startDate || !endDate) return 1;

    try {
      const start = this.parseYearMonth(startDate);
      const end = this.parseYearMonth(endDate);

      if (!start || !end) return 1;

      const months = (end.year - start.year) * 12 + (end.month - start.month) + 1;
      return Math.max(1, months);
    } catch {
      return 1;
    }
  }

  private parseYearMonth(value: string | Date): { year: number; month: number } | null {
    if (!value) return null;

    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return { year: value.getFullYear(), month: value.getMonth() + 1 };
    }

    const str = String(value).trim();

    // YYYYMM
    if (/^\d{6}$/.test(str)) {
      return { year: parseInt(str.substring(0, 4), 10), month: parseInt(str.substring(4, 6), 10) };
    }

    // YYYY/MM or YYYY-MM or YYYY/MM/DD or YYYY-MM-DD
    const match = str.match(/^(\d{4})[/-](\d{1,2})/);
    if (match) {
      return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
    }

    // fallback: Date parse
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }

    return null;
  }

  hasDataForType(capType: string): boolean {
    const data = this.fareData[capType as keyof FaresByType];
    if (!data || data.length === 0) return false;

    const mode = this.showModeByType[capType];
    if (mode === 'common') {
      // 常用模式：顯示常用項目、已選取項目、契約既有項目、複製項目
      return data.some((item: FareItem) =>
        (item._status !== 'deleted' || item.data_source === 'CONTRACT_EXISTING') && (
          item.is_commonly_used === 'Y' ||
          item.is_selected ||
          item.data_source === 'CONTRACT_EXISTING' ||
          item.data_source === 'COPIED_ITEM'
        )
      );
    }
    return data.some(item => item._status !== 'deleted' || item.data_source === 'CONTRACT_EXISTING');
  }

  getDisplayDataForType(capType: string): FareItem[] {
    const data = this.fareData[capType as keyof FaresByType] || [];
    const mode = this.showModeByType[capType];

    // 過濾已刪除項目，但保留 CONTRACT_EXISTING 的（取消勾選仍需顯示）
    let filteredData = data.filter(item =>
      item._status !== 'deleted' || item.data_source === 'CONTRACT_EXISTING'
    );

    if (mode === 'common') {
      // 常用模式：顯示常用項目、已選取項目、契約既有項目、複製項目
      filteredData = filteredData.filter(item =>
        item.is_commonly_used === 'Y' ||
        item.is_selected ||
        item.data_source === 'CONTRACT_EXISTING' ||
        item.data_source === 'COPIED_ITEM'
      );
    }

    return filteredData;
  }

  // ========== 坪數計算 ==========
  private calculateTotalLocationSpace(): void {
    if (!this.locationData || this.locationData.length === 0) {
      this.totalLocationSpace = 0;
      return;
    }

    const raw = this.locationData.reduce((sum, loc) => {
      const space = parseFloat(String(loc.tlt_space || 0));
      return sum + (isNaN(space) ? 0 : space);
    }, 0);
    this.totalLocationSpace = parseFloat(raw.toFixed(2));
  }

  // ========== 選項載入 ==========
  private loadOrgOptions(): void {
    const sub = this.locationOptionsService.getOrgOptions().subscribe({
      next: (options) => {
        this.orgOptions = options;
        this.clearColumnCache();
      },
      error: (error) => {
        console.error('載入組織選項失敗:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadPayNoOptions(): void {
    this.payNoOptions = this.dropdownService.getPayNoOptions();

    if (this.payNoOptions.length === 0) {
      // 如果 payNoOptions 為空，主動呼叫 API 載入
      this.dropdownService.initPayNoOptionsWithRetry().subscribe({
        next: (options) => {
          this.payNoOptions = options;
          if (this.payNoOptions.length > 0) {
            this.clearColumnCache();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('❌ 載入支付編號選項失敗:', err);
        }
      });
    }
  }

  // ========== 批次選擇 (使用 CrudTrackingService) ==========
  selectAllByType(capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];
    const data = this.fareData[capType as keyof FaresByType];
    data.forEach(item => {
      if (item._status !== 'deleted' && !item.is_selected) {
        item.is_selected = true;
        CrudTrackingService.updateSelectionStatus(item as unknown as TrackableItem, config as ChangeDetectionConfig);
      }
    });
    this.emitDataChange();
    this.cdr.detectChanges();
  }

  deselectAllByType(capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];
    const data = this.fareData[capType as keyof FaresByType];
    data.forEach(item => {
      if (item._status !== 'deleted' && item.is_selected) {
        item.is_selected = false;
        CrudTrackingService.updateSelectionStatus(item as unknown as TrackableItem, config as ChangeDetectionConfig);
      }
    });
    this.emitDataChange();
    this.cdr.detectChanges();
  }

  getTotalSelectedCount(): number {
    let count = 0;
    Object.values(this.fareData).forEach(items => {
      count += items.filter((item: FareItem) => item.is_selected && item._status !== 'deleted').length;
    });
    return count;
  }

  // ========== 事件處理 (使用 CrudTrackingService) ==========
  onItemSelectionChange(capType: string): void {
    this.emitDataChange();
  }

  onFieldChange(fieldName: string, newValue: unknown, rowData: FareItem, capType: string): void {
    // 勾選狀態變更
    if (fieldName === 'is_selected') {
      this.handleSelectionChange(rowData, capType);
      return;
    }

    // 更新欄位值
    (rowData as unknown as Record<string, unknown>)[fieldName] = newValue;

    // 當單位改為「坪數」(tpy_type = '01') 時，自動帶入坪數總和
    if (fieldName === 'tpy_type' && newValue === '01' && this.totalLocationSpace > 0) {
      rowData.tpy_qty = this.totalLocationSpace;
    }

    // 依類型自動計算金額
    this.performCalculation(rowData, capType, fieldName);

    // 使用 CrudTrackingService 判斷是否真的有修改
    this.updateItemStatus(rowData, capType);
    this.emitDataChange();
  }

  private handleSelectionChange(rowData: FareItem, capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];
    CrudTrackingService.updateSelectionStatus(rowData as unknown as TrackableItem, config as ChangeDetectionConfig);

    // 如果是新勾選的項目，自動帶入契約日期
    if (rowData.is_selected) {
      if (!rowData.tpy_bdate && this.contractDates.bdate) {
        rowData.tpy_bdate = this.contractDates.bdate;
      }
      if (!rowData.tpy_edate && this.contractDates.edate) {
        if (capType === 'A') {
          rowData.tpy_edate = rowData.tpy_bdate;
        } else {
          rowData.tpy_edate = this.contractDates.edate;
        }
      }

      // 如果選擇坪數單位，設定預設數量為總坪數
      if (rowData.tpy_type === '01' && this.totalLocationSpace > 0) {
        if (!rowData.tpy_qty || rowData.tpy_qty === 0 || rowData.tpy_qty === 1) {
          rowData.tpy_qty = this.totalLocationSpace;
        }
      }

      // 帶入日期/數量後自動計算金額
      this.performCalculation(rowData, capType);
    }

    this.emitDataChange();
    this.cdr.detectChanges();
  }

  /**
   * 依類型自動計算金額
   * - A 類（一次性）: amount = ceil(unitamt × qty), edate = bdate
   * - B 類（月繳）: amount = ceil(unitamt × qty)
   * - C 類（分期）: 重算期數、首期金額
   * - D/E 類（費率）: 不需要自動計算
   */
  private performCalculation(rowData: FareItem, capType: string, changedField?: string): void {
    switch (capType) {
      case 'A': {
        const qty = rowData.tpy_qty || 0;
        const unitAmt = rowData.tpy_unitamt || 0;
        rowData.tpy_amount = Math.ceil(unitAmt * qty);
        // A 類結束日期永遠等於起始日期
        if (rowData.tpy_bdate) {
          rowData.tpy_edate = rowData.tpy_bdate;
        }
        break;
      }
      case 'B': {
        const qty = rowData.tpy_qty || 0;
        const unitAmt = rowData.tpy_unitamt || 0;
        rowData.tpy_amount = Math.ceil(unitAmt * qty);
        break;
      }
      case 'C':
        this.recalculateTypeCFields(rowData, changedField);
        break;
      // D, E: 費率類，不需要自動計算金額
    }
  }

  private updateItemStatus(rowData: FareItem, capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];
    CrudTrackingService.updateFieldChangeStatus(rowData as unknown as TrackableItem, config as ChangeDetectionConfig);
  }

  onButtonClick(event: { field: string; rowData: FareItem }, capType: string): void {
    if (event.field === 'copy_button') {
      this.copyItem(event.rowData, capType);
    } else if (event.field === 'auto_calc') {
      this.autoCalculateTypeC(event.rowData);
    }
  }

  private copyItem(rowData: FareItem, capType: string): void {
    const newId = `copy_${capType}_${rowData.cap_item}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const copiedItem = CrudTrackingService.copyItem(rowData as unknown as TrackableItem, () => newId) as unknown as FareItem;
    copiedItem.cap_type = capType as FareItem['cap_type'];

    // 清空數值欄位
    const fieldsToReset = ['tpy_unitamt', 'tpy_qty', 'tpy_amount', 'tpy_totalamt', 'down_payment', 'period_nos', 'tpy_rate'];
    fieldsToReset.forEach(field => {
      if (field === 'tpy_qty') {
        (copiedItem as unknown as Record<string, unknown>)[field] = 1;
      } else {
        (copiedItem as unknown as Record<string, unknown>)[field] = null;
      }
    });

    // 設定日期為合約日期
    if (this.contractDates.bdate) {
      copiedItem.tpy_bdate = this.contractDates.bdate;
    }
    if (this.contractDates.edate) {
      copiedItem.tpy_edate = this.contractDates.edate;
    }

    // 預設值
    if (!copiedItem.gui_flag) {
      copiedItem.gui_flag = 'Y';
    }

    // 插入到原始項目的下一個位置
    const items = this.fareData[capType as keyof FaresByType];
    const originalIndex = items.findIndex(item => item.id === rowData.id);
    if (originalIndex !== -1) {
      items.splice(originalIndex + 1, 0, copiedItem);
    } else {
      items.push(copiedItem);
    }

    this.emitDataChange();
    this.cdr.detectChanges();
  }

  private autoCalculateTypeC(rowData: FareItem): void {
    const totalAmt = parseFloat(String(rowData.tpy_totalamt || 0));
    const periods = this.calculatePeriods(rowData.tpy_bdate, rowData.tpy_edate);

    if (totalAmt <= 0 || periods < 1) return;

    const monthlyAmt = Math.ceil(totalAmt / periods);
    const downPayment = Math.ceil(totalAmt - (monthlyAmt * (periods - 1)));

    this.calculationResult = {
      totalAmount: totalAmt,
      periods,
      monthlyAmount: monthlyAmt,
      downPayment
    };
    this.currentCalculatingItem = rowData;
    this.showCalculationDialog = true;
  }

  onCalculationDialogClose(visible: boolean): void {
    this.showCalculationDialog = visible;
    if (!visible) {
      this.currentCalculatingItem = null;
      this.calculationResult = null;
    }
  }

  onCalculationSave(): void {
    if (this.currentCalculatingItem && this.calculationResult) {
      this.currentCalculatingItem.tpy_amount = this.calculationResult.monthlyAmount;
      this.currentCalculatingItem.period_nos = this.calculationResult.periods;
      this.currentCalculatingItem.down_payment = this.calculationResult.downPayment;

      this.updateItemStatus(this.currentCalculatingItem, 'C');
      this.emitDataChange();
      this.cdr.detectChanges();
    }

    this.showCalculationDialog = false;
    this.currentCalculatingItem = null;
    this.calculationResult = null;
  }

  onFareTableSave(event: { row?: FareItem; oldData?: unknown; newData?: unknown }, capType: string): void {
    if (event.row) {
      this.updateItemStatus(event.row, capType);
    }
    this.emitDataChange();
  }

  onFareTableEdit(_event: unknown, _capType: string): void {
    // 編輯模式進入
  }

  onFareTableCancel(_event: unknown, _capType: string): void {
    // 取消編輯
  }

  onBeforeSave(_event: unknown, _capType: string): void {
    // 儲存前驗證
  }

  // ========== 統計 ==========
  getSelectedCount(capType: string): number {
    const items = this.fareData[capType as keyof FaresByType] || [];
    return items.filter((item: FareItem) => item.is_selected && item._status !== 'deleted').length;
  }

  getTotalCount(capType: string): number {
    return (this.fareData[capType as keyof FaresByType] || []).length;
  }

  getChangeCount(capType: string): { newCount: number; modifiedCount: number; deletedCount: number } {
    const items = this.fareData[capType as keyof FaresByType] || [];
    let newCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    items.forEach((item: FareItem) => {
      if (item._status === 'new' && item.is_selected) newCount++;
      else if (item._status === 'modified') modifiedCount++;
      else if (item._status === 'deleted') deletedCount++;
    });

    return { newCount, modifiedCount, deletedCount };
  }

  // ========== 變更發射 ==========
  private emitDataChange(): void {
    const allItems: FareItem[] = [];
    Object.values(this.fareData).forEach(items => {
      allItems.push(...items);
    });

    this.dataChange.emit(allItems);
  }
}
