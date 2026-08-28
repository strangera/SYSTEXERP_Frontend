/**
 * Step 2: 代扣款設定子組件
 *
 * 功能:
 * - 顯示五種類型 (A/B/C/D/E) 的代扣款項目
 * - 支援 CRUD 追蹤 (insert/update/delete)
 * - 支援勾選新增、複製項目
 * - 支援坪數總和計算 (當選擇坪數單位時)
 * - 支援常用項目/全部項目切換
 * - 顯示專櫃契約書資訊
 */
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { TLS13010DropdownService } from '@pages/tls/shared/constants/tls13010.dropdown';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { ColumnDef, ExpandableEditTableComponent } from '@others/component/expandable-edit-table/expandable-edit-table.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { LocationOptionsService } from '@others/services/dropdownservice/location-options.service';

import { getContractInfoColumns } from '../../../../core/constants/commission-columns';
import {
  FARE_CAP_TYPE_LABELS,
  FARE_CHANGE_DETECTION_CONFIG,
  FareCapType,
  getDeductionColumnsByType,
  setColumnsReadonly
} from '../../../../core/constants/fare-columns.config';
import { ContractInfo, LocationItem } from '../../../../core/models/contract';
import { FareItem } from '../../../../core/models/deduction';
import { ChangeDetectionConfig, CrudTrackingService } from '../../../../core/services/crud-tracking.service';

@Component({
  selector: 'app-step2-deduction',
  templateUrl: './step2-deduction.component.html',
  styleUrls: ['./step2-deduction.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    AccordionModule,
    ButtonModule,
    ToggleButtonModule,
    ExpandableEditTableComponent,
    ButtonComponent,
    DialogComponent
  ]
})
export class Step2DeductionComponent implements OnInit, OnChanges, OnDestroy {
  // ========== 輸入屬性 ==========
  @Input() fareItems: FareItem[] = [];
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create;
  @Input() contractForm?: FormGroup;
  @Input() locationData: LocationItem[] = [];
  @Input() talentId?: string;

  // ========== 輸出事件 ==========
  @Output() fareItemsChange = new EventEmitter<FareItem[]>();

  // ========== 常數 ==========
  readonly CRUDStatus = CRUDStatus;
  readonly FareCapType = FareCapType;
  readonly FARE_CAP_TYPE_LABELS = FARE_CAP_TYPE_LABELS;
  readonly capTypes: FareCapType[] = [
    FareCapType.A,
    FareCapType.B,
    FareCapType.C,
    FareCapType.D,
    FareCapType.E
  ];

  // ========== 資料狀態 ==========
  /** 原始資料 (包含所有項目) */
  originalFareData: Record<string, FareItem[]> = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  /** 顯示用資料 (根據顯示模式過濾) */
  fareData: Record<string, FareItem[]> = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  /** 各類型的顯示模式 */
  showModeByType: Record<string, 'common' | 'all'> = {
    'A': 'common', 'B': 'common', 'C': 'common', 'D': 'common', 'E': 'common'
  };

  /** 合約資訊資料 */
  contractInfoData: ContractInfo[] = [];

  /** 合約資訊欄位定義 */
  contractInfoColumns: ColumnDef[] = [];

  /** 組織選項 */
  orgOptions: { label: string; value: string }[] = [];

  /** 支付編號選項 */
  payNoOptions: { label: string; value: string | number }[] = [];

  /** 欄位定義快取 */
  private columnCache: Record<string, ColumnDef[]> = {};

  /** 總坪數 (從位置資料計算) */
  totalLocationSpace = 0;

  /** 訂閱管理 */
  private subscriptions: Subscription[] = [];

  /** 是否正在載入 */
  isLoading = false;

  /** 常駐編輯模式 */
  forceEditMode = true;

  /** 自動計算對話框 */
  showCalculationDialog = false;
  calculationResult: { totalAmount: number; periods: number; monthlyAmount: number; downPayment: number } | null = null;
  private currentCalculatingItem: FareItem | null = null;
  private currentCalculatingCapType = '';

  constructor(
    private apiService: TLS13010Service,
    private locationOptionsService: LocationOptionsService,
    private dropdownService: TLS13010DropdownService,
    private cdr: ChangeDetectorRef
  ) {
    this.initContractInfoColumns();
  }

  // ========== 生命週期 ==========
  ngOnInit(): void {
    this.loadOrgOptions();
    this.loadPayNoOptions();
    this.calculateTotalLocationSpace();
    this.setupContractInfo();

    // 如果沒有傳入 fareItems，自動載入資料
    if (!this.fareItems || this.fareItems.length === 0) {
      this.loadFareData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // fareItems 僅在首次載入時處理（從 parent 接收初始資料）
    // 之後 Step 2 內部透過 originalFareData 自行管理狀態，
    // 避免 emitChanges → parent 回寫 → ngOnChanges 的無意義循環重建
    if (changes['fareItems']?.firstChange && this.fareItems) {
      this.processFareItems();
      this.cdr.detectChanges();
    }

    // locationData 變更時重新計算坪數
    if (changes['locationData']) {
      this.calculateTotalLocationSpace();
    }

    // contractForm 變更時更新合約資訊
    if (changes['contractForm']) {
      this.setupContractInfo();
    }

    // crudstatus 變更時清除欄位快取
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

  get shouldForceEdit(): boolean {
    return this.crudstatus !== CRUDStatus.Read;
  }

  get contractDates(): { bdate: string; edate: string } {
    if (!this.contractForm) {
      return { bdate: '', edate: '' };
    }
    return {
      bdate: this.contractForm.get('tlt_bdate')?.value || '',
      edate: this.contractForm.get('tlt_edate')?.value || ''
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
      talent_id: formValue.talent_id || '',
      apply_no: formValue.apply_no || '',
      tlt_no: formValue.tlt_no || '',
      tlt_name: formValue.tlt_name || '',
      vendor_ven_no: formValue.vendor_ven_no || '',
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

  // ========== 欄位定義 ==========
  getColumnsForType(capType: string): ColumnDef[] {
    const cacheKey = `${capType}_${this.isFormReadonly}`;

    if (!this.columnCache[cacheKey]) {
      let columns = getDeductionColumnsByType(
        capType as FareCapType,
        this.contractDates,
        this.payNoOptions
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

  // ========== 顯示模式相關方法 ==========
  /** 取得全域切換按鈕文字 */
  getAllCommonModeText(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部載入' : '顯示常用';
  }

  /** 取得全域顯示模式說明 */
  getAllDisplayMode(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部顯示: 常用項目' : '全部顯示: 全部項目';
  }

  /** 切換所有類型的顯示模式 */
  toggleAllCommonMode(): void {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    const newMode = allCommon ? 'all' : 'common';

    this.capTypes.forEach(capType => {
      this.showModeByType[capType] = newMode;
    });

    this.filterAllTypes();
  }

  /** 取得類型顯示名稱 */
  getCapTypeName(capType: string): string {
    return FARE_CAP_TYPE_LABELS[capType as FareCapType] || capType;
  }

  /** 取得類型切換按鈕文字 */
  getCommonModeTextByType(capType: string): string {
    return this.showModeByType[capType] === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  /** 取得類型顯示模式說明 */
  getCurrentDisplayModeByType(capType: string): string {
    return this.showModeByType[capType] === 'common'
      ? '合約項目 + 常用項目 + 已勾選項目'
      : '全部項目';
  }

  /** 切換單一類型的顯示模式 */
  toggleShowMode(capType: string): void {
    this.showModeByType[capType] = this.showModeByType[capType] === 'common' ? 'all' : 'common';
    this.filterDataForType(capType);
  }

  getShowModeLabel(capType: string): string {
    return this.showModeByType[capType] === 'common' ? '顯示常用項目' : '顯示全部項目';
  }

  // ========== 資料狀態檢查 ==========
  /** 檢查是否有任何資料 */
  hasAnyData(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].length > 0
    );
  }

  /** 檢查特定類型是否有資料 (用於顯示) */
  hasDataForType(capType: string): boolean {
    return this.fareData[capType] && this.fareData[capType].length > 0;
  }

  // ========== 批次選擇 ==========
  /** 全部選擇指定類型 */
  selectAllByType(capType: string): void {
    const items = this.fareData[capType] || [];
    items.forEach(item => {
      if (!item.is_selected) {
        item.is_selected = true;
        this.handleSelectionChange(item, capType);
      }
    });
    this.cdr.detectChanges();
  }

  /** 取消選擇指定類型 */
  deselectAllByType(capType: string): void {
    const items = this.fareData[capType] || [];
    items.forEach(item => {
      if (item.is_selected) {
        item.is_selected = false;
        this.handleSelectionChange(item, capType);
      }
    });
    this.cdr.detectChanges();
  }

  // ========== 資料處理 ==========
  private processFareItems(): void {
    // 清空原始資料
    this.originalFareData = { 'A': [], 'B': [], 'C': [], 'D': [], 'E': [] };

    // 將 fareItems 分類到各類型
    this.fareItems.forEach(item => {
      const capType = item.cap_type?.toUpperCase() || 'B';
      if (this.originalFareData[capType]) {
        this.originalFareData[capType].push(item);
      }
    });

    // 根據顯示模式過濾
    this.filterAllTypes();
  }

  private filterAllTypes(): void {
    this.capTypes.forEach(capType => {
      this.filterDataForType(capType);
    });
  }

  private filterDataForType(capType: string): void {
    const items = this.originalFareData[capType] || [];
    const showMode = this.showModeByType[capType];

    if (showMode === 'common') {
      // 常用模式：顯示常用項目、已選取項目、契約既有項目、或複製的項目
      this.fareData[capType] = items.filter(item =>
        item.is_commonly_used === 'Y' ||
        item.is_selected ||
        item.data_source === 'CONTRACT_EXISTING' ||
        item.data_source === 'COPIED_ITEM'  // 複製項目永遠顯示
      );
    } else {
      // 全部模式
      this.fareData[capType] = [...items];
    }
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

  // ========== 欄位變更處理 ==========
  onFieldChange(
    fieldName: string,
    newValue: unknown,
    rowData: FareItem,
    capType: string
  ): void {
    // 勾選狀態變更
    if (fieldName === 'is_selected') {
      this.handleSelectionChange(rowData, capType);
      return;
    }

    // 更新欄位值
    rowData[fieldName] = newValue;

    // 單位切換時自動維護數量：
    // - 選「坪數」(tpy_type = '01')：以坪數加總覆蓋數量（使用者可於選完後再手動改）
    // - 從坪數改成其他單位，且數量仍停在先前自動帶入的總坪數（未被手動改過）：還原為 1
    if (fieldName === 'tpy_type' && this.totalLocationSpace > 0) {
      if (newValue === '01') {
        rowData.tpy_qty = this.totalLocationSpace;
      } else if (rowData.tpy_qty === this.totalLocationSpace) {
        rowData.tpy_qty = 1;
      }
    }

    // 執行計算
    this.performCalculation(rowData, capType, fieldName);

    // 更新追蹤狀態
    this.updateItemStatus(rowData, capType);

    // 發射變更
    this.emitChanges();
  }

  private handleSelectionChange(rowData: FareItem, capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];

    // 使用 CRUD 追蹤服務更新狀態
    CrudTrackingService.updateSelectionStatus(rowData, config as ChangeDetectionConfig);

    // 如果是新勾選的項目
    if (rowData.is_selected) {
      // 自動帶入契約起訖日期 (如果尚未設定)
      if (!rowData.tpy_bdate && this.contractDates.bdate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rowData as any).tpy_bdate = this.convertToDate(this.contractDates.bdate);
      }
      if (!rowData.tpy_edate && this.contractDates.edate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rowData as any).tpy_edate = this.convertToDate(this.contractDates.edate);
      }

      // 如果選擇坪數單位，設定預設數量為總坪數
      if (rowData.tpy_type === '01' && this.totalLocationSpace > 0) {
        if (!rowData.tpy_qty || rowData.tpy_qty === 0 || rowData.tpy_qty === 1) {
          rowData.tpy_qty = this.totalLocationSpace;
        }
      }

      this.performCalculation(rowData, capType);
    }

    this.emitChanges();
    this.cdr.detectChanges();
  }

  /**
   * 將日期值轉換為 Date 物件
   * 支援 Date 物件、YYYYMM 字串、YYYY/MM 字串、YYYY-MM-DD 字串
   */
  private convertToDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;

    // 已經是 Date 物件
    if (value instanceof Date) {
      return value;
    }

    const str = String(value).trim();

    // YYYYMM 格式
    if (/^\d{6}$/.test(str)) {
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10) - 1;
      return new Date(year, month, 1);
    }

    // YYYY/MM 或 YYYY-MM 格式
    const monthMatch = str.match(/^(\d{4})[/-](\d{1,2})$/);
    if (monthMatch) {
      const year = parseInt(monthMatch[1], 10);
      const month = parseInt(monthMatch[2], 10) - 1;
      return new Date(year, month, 1);
    }

    // YYYY/MM/DD 或 YYYY-MM-DD 格式
    const dateMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const day = parseInt(dateMatch[3], 10);
      return new Date(year, month, day);
    }

    // 嘗試用 Date 解析
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private updateItemStatus(rowData: FareItem, capType: string): void {
    const config = FARE_CHANGE_DETECTION_CONFIG[capType as keyof typeof FARE_CHANGE_DETECTION_CONFIG];
    CrudTrackingService.updateFieldChangeStatus(rowData, config as ChangeDetectionConfig);
  }

  // ========== 計算邏輯 ==========
  private performCalculation(rowData: FareItem, capType: string, changedField?: string): void {
    switch (capType) {
      case 'A':
        this.calculateTypeA(rowData);
        break;
      case 'B':
        this.calculateTypeB(rowData);
        break;
      case 'C':
        this.calculateTypeC(rowData, changedField);
        break;
      // D, E 類型通常不需要計算
    }
  }

  private calculateTypeA(rowData: FareItem): void {
    const unitAmt = parseFloat(String(rowData.tpy_unitamt || 0));
    const qty = parseFloat(String(rowData.tpy_qty || 0));

    // 如果選擇坪數單位且數量為 0，使用總坪數
    if (rowData.tpy_type === '01' && qty === 0 && this.totalLocationSpace > 0) {
      rowData.tpy_qty = this.totalLocationSpace;
      rowData.tpy_amount = Math.round(unitAmt * this.totalLocationSpace);  // 四捨五入取整數
    } else {
      rowData.tpy_amount = Math.round(unitAmt * qty);  // 四捨五入取整數
    }

    // A 類型：結束日期 = 起始日期
    if (rowData.tpy_bdate) {
      rowData.tpy_edate = rowData.tpy_bdate;
    }
  }

  private calculateTypeB(rowData: FareItem): void {
    const unitAmt = parseFloat(String(rowData.tpy_unitamt || 0));
    const qty = parseFloat(String(rowData.tpy_qty || 0));

    // 如果選擇坪數單位且數量為 0，使用總坪數
    if (rowData.tpy_type === '01' && qty === 0 && this.totalLocationSpace > 0) {
      rowData.tpy_qty = this.totalLocationSpace;
      rowData.tpy_amount = Math.round(unitAmt * this.totalLocationSpace);  // 四捨五入取整數
    } else {
      rowData.tpy_amount = Math.round(unitAmt * qty);  // 四捨五入取整數
    }
  }

  private calculateTypeC(rowData: FareItem, changedField?: string): void {
    const totalAmt = parseFloat(String(rowData.tpy_totalamt || 0));
    const periods = this.calculatePeriods(rowData.tpy_bdate, rowData.tpy_edate);

    rowData.period_nos = periods;

    if (changedField === 'down_payment') {
      // 輸入首期 → 算每月金額
      const downPayment = parseFloat(String(rowData.down_payment || 0));
      if (totalAmt > 0 && periods > 1) {
        rowData.tpy_amount = Math.round((totalAmt - downPayment) / (periods - 1));
      }
    } else {
      // 輸入每月金額（或總金額、日期）→ 算首期金額
      const monthlyAmt = parseFloat(String(rowData.tpy_amount || 0));
      if (totalAmt > 0 && monthlyAmt > 0 && periods > 1) {
        rowData.down_payment = Math.round(totalAmt - (monthlyAmt * (periods - 1)));
      } else {
        rowData.down_payment = Math.round(monthlyAmt);
      }
    }
  }

  /**
   * 為項目套用預設日期 (契約起訖日)
   * 編輯模式和新增模式都會套用
   */
  private applyDefaultDatesToItem(item: FareItem, capType: string): void {
    const dates = this.contractDates;
    if (!dates.bdate && !dates.edate) return;

    // 如果項目沒有起始日期，套用契約起始日
    if (!item.tpy_bdate && dates.bdate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any).tpy_bdate = this.convertToDate(dates.bdate);
    }

    // A 類型：結束日期 = 起始日期
    if (capType === 'A') {
      if (item.tpy_bdate) {
        item.tpy_edate = item.tpy_bdate;
      }
    } else {
      // 其他類型：如果沒有結束日期，套用契約結束日
      if (!item.tpy_edate && dates.edate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item as any).tpy_edate = this.convertToDate(dates.edate);
      }
    }
  }

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

  /**
   * 解析年月格式 (支援 YYYYMM, YYYY/MM, YYYY-MM, Date 物件)
   */
  private parseYearMonth(value: string | Date): { year: number; month: number } | null {
    if (!value) return null;

    // 如果是 Date 物件
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return { year: value.getFullYear(), month: value.getMonth() + 1 };
    }

    // 字串格式
    const str = String(value).trim();

    // YYYYMM 格式 (如 "202510")
    if (/^\d{6}$/.test(str)) {
      const year = parseInt(str.substring(0, 4), 10);
      const month = parseInt(str.substring(4, 6), 10);
      if (year > 1900 && year < 2200 && month >= 1 && month <= 12) {
        return { year, month };
      }
    }

    // YYYY/MM 或 YYYY-MM 格式
    const match = str.match(/^(\d{4})[/-](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      if (year > 1900 && year < 2200 && month >= 1 && month <= 12) {
        return { year, month };
      }
    }

    // 嘗試用 Date 解析
    const date = new Date(str);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2200) {
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }

    return null;
  }

  /**
   * 重新計算 C 類型的期數和首期金額 (載入資料時使用)
   */
  private recalculateTypeCFields(rowData: FareItem): void {
    const periods = this.calculatePeriods(rowData.tpy_bdate, rowData.tpy_edate);
    rowData.period_nos = periods;

    const totalAmt = parseFloat(String(rowData.tpy_totalamt || 0));
    const monthlyAmt = parseFloat(String(rowData.tpy_amount || 0));

    // 計算首期金額
    if (totalAmt > 0 && monthlyAmt > 0 && periods > 1) {
      rowData.down_payment = Math.round(totalAmt - (monthlyAmt * (periods - 1)));
    } else if (monthlyAmt > 0) {
      rowData.down_payment = Math.round(monthlyAmt);
    }
  }

  // ========== 按鈕事件 ==========
  onButtonClick(event: { field: string; rowData: FareItem }, capType: string): void {
    if (event.field === 'copy_button') {
      this.copyItem(event.rowData, capType);
    } else if (event.field === 'auto_calc') {
      this.autoCalculateTypeC(event.rowData);
    }
  }

  private copyItem(rowData: FareItem, capType: string): void {
    // 產生唯一 ID
    const newId = `copy_${capType}_${rowData.cap_item}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const copiedItem = CrudTrackingService.copyItem(rowData, () => newId) as unknown as FareItem;
    copiedItem.cap_type = capType;
    copiedItem['_isCopiedItem'] = true;

    // 清空數值欄位，讓使用者自行填寫
    const fieldsToReset = ['tpy_unitamt', 'tpy_qty', 'tpy_amount', 'tpy_totalamt', 'down_payment', 'period_nos', 'tpy_rate'];
    fieldsToReset.forEach(field => {
      if (field === 'tpy_qty') {
        copiedItem[field] = 1;
      } else {
        copiedItem[field] = null;
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
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === rowData.id);
    if (originalIndex !== -1) {
      this.originalFareData[capType].splice(originalIndex + 1, 0, copiedItem);
    } else {
      this.originalFareData[capType].push(copiedItem);
    }

    // 重新過濾顯示
    this.filterDataForType(capType);

    // 發射變更
    this.emitChanges();
    this.cdr.detectChanges();
  }

  private autoCalculateTypeC(rowData: FareItem): void {
    const totalAmt = parseFloat(String(rowData.tpy_totalamt || 0));
    const periods = this.calculatePeriods(rowData.tpy_bdate, rowData.tpy_edate);

    if (totalAmt <= 0 || periods < 1) return;

    const monthlyAmt = Math.round(totalAmt / periods);
    const downPayment = Math.round(totalAmt - (monthlyAmt * (periods - 1)));

    this.calculationResult = {
      totalAmount: totalAmt,
      periods,
      monthlyAmount: monthlyAmt,
      downPayment
    };
    this.currentCalculatingItem = rowData;
    this.currentCalculatingCapType = 'C';
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

      this.updateItemStatus(this.currentCalculatingItem, this.currentCalculatingCapType);
      this.emitChanges();
      this.cdr.detectChanges();
    }

    this.showCalculationDialog = false;
    this.currentCalculatingItem = null;
    this.calculationResult = null;
  }

  // ========== 資料載入 ==========
  async loadFareData(): Promise<void> {
    if (!this.talentId) {
      this.loadAvailableFareItems();
      return;
    }

    this.isLoading = true;

    try {
      // 載入契約既有代扣款資料
      const response = await this.apiService.queryTLS13010Fare({
        talentId: this.talentId,
        showAll: true
      }).toPromise();

      if (response?.Status === '0000' && response.Data?.FaresByType) {
        this.processLoadedItemsByType(response.Data.FaresByType);
      }
    } catch (error) {
      console.error('載入代扣款資料失敗:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAvailableFareItems(): Promise<void> {
    this.isLoading = true;

    try {
      // 新增模式：載入所有可用的代扣款項目
      const response = await this.apiService.queryTLS13010Fare({
        talentId: '',
        showAll: true
      }).toPromise();

      if (response?.Status === '0000' && response.Data?.FaresByType) {
        this.processLoadedItemsByType(response.Data.FaresByType);
      }
    } catch (error) {
      console.error('載入可用代扣款項目失敗:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 處理按類型分類的代扣款資料
   * @param faresByType API 回傳的 { A: [], B: [], C: [], D: [], E: [] } 結構
   */
  private processLoadedItemsByType(
    faresByType: Record<string, FareItem[]>
  ): void {
    // 清空現有資料
    this.originalFareData = { 'A': [], 'B': [], 'C': [], 'D': [], 'E': [] };

    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    capTypes.forEach(capType => {
      const items = faresByType[capType] || [];

      items.forEach(item => {
        // 判斷是否為契約既有項目
        const itemIsExisting = item.data_source === 'CONTRACT_EXISTING' ||
          (item.is_selected && !item.is_new_item);

        const initializedItem = CrudTrackingService.initializeItem(
          item,
          itemIsExisting
        ) as unknown as FareItem;

        // 確保 cap_type 正確
        initializedItem.cap_type = capType;

        // 為沒有日期的項目設定預設值 (契約起訖日期)
        this.applyDefaultDatesToItem(initializedItem, capType);

        // C 類型：根據日期重新計算期數和首期金額
        if (capType === 'C' && initializedItem.tpy_bdate && initializedItem.tpy_edate) {
          this.recalculateTypeCFields(initializedItem);
        }

        this.originalFareData[capType].push(initializedItem);
      });
    });

    this.filterAllTypes();

    this.emitChanges();
    this.cdr.detectChanges();
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
    // 父組件透過 loading 控制渲染時機，確保 dropdownService 已完成初始化
    this.payNoOptions = this.dropdownService.getPayNoOptions();
  }

  // ========== 變更發射 ==========
  private emitChanges(): void {
    // 合併所有類型的資料
    const allItems: FareItem[] = [];
    this.capTypes.forEach(capType => {
      allItems.push(...this.originalFareData[capType]);
    });

    this.fareItemsChange.emit(allItems);
  }

  // ========== 統計資訊 ==========
  getSelectedCount(capType: string): number {
    const items = this.originalFareData[capType] || [];
    return items.filter(item => item.is_selected && item._status !== 'deleted').length;
  }

  getTotalCount(capType: string): number {
    return (this.originalFareData[capType] || []).length;
  }

  getChangeCount(capType: string): { newCount: number; modifiedCount: number; deletedCount: number } {
    const items = this.originalFareData[capType] || [];
    let newCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    items.forEach(item => {
      if (item._status === 'new' && item.is_selected) newCount++;
      else if (item._status === 'modified') modifiedCount++;
      else if (item._status === 'deleted') deletedCount++;
    });

    return { newCount, modifiedCount, deletedCount };
  }
}
