import {
  TLS12040FareItem,
  TLS12040APIResponse,
  TLS12040QueryParams,
  TLS12040FareDataContainer,
  TLS12040FareStatistics
} from './models/tls12040-next1.model';
import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { ExpandableEditTableComponent, ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TLS12040DetailModel } from '../tls12040-cru/models/tls12040-cru.model';
import { Tls12040FareColumnDefinitions } from './services/tls12040-fare-column-definitions';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Tls12040FareCalculationService } from './services/tls12040-fare-calculation.service';
import { Tls12040FareStatusService } from './services/tls12040-fare-status.service';
import { Tls12040FareDataService } from './services/tls12040-fare-data.service';


// 暫時介面定義 (之後可移到模型檔案)
interface CategoryItem {
  id: number;
  // 暫時放到時候建立新的model用
}

@Component({
  selector: 'app-tls12040-next1',
  templateUrl: './tls12040-next1.component.html',
  styleUrls: ['./tls12040-next1.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, NgFor, DialogComponent]
})
export class TLS12040Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  showCalculationDialog: boolean = false;
  calculationResult: any = null;
  currentRowData: any = null;
  currentCapType: string = '';

  // 顯示模式控制
  showMode: 'common' | 'all' = 'common';
  currentContractData: any = null;

  contractInfoData: TLS12040DetailModel[] = [];

  // 🆕 使用明確的 TLS12040 模型
  originalFareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  fareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  // 當前處理的資料
  currentTalentId: string = '';
  orgOptions: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];
  private _currentCRUDStatus: CRUDStatus = CRUDStatus.Read;
  private _lastCRUDStatus: CRUDStatus | null = null;
  private _cachedContractInfoColumns: ColumnDef[] | null = null;
  private _cachedDeductionAColumns: ColumnDef[] | null = null;
  private _cachedDeductionBColumns: ColumnDef[] | null = null;
  private _cachedDeductionCColumns: ColumnDef[] | null = null;
  private _cachedDeductionDColumns: ColumnDef[] | null = null;
  private _cachedDeductionEColumns: ColumnDef[] | null = null;
  private _lastOrgOptionsLength = 0;
  private _lastViewMode: boolean | null = null;
  private _lastContractInfoLength = 0;

  // 表單
  dataForm = this.formBuilder.group({});

  constructor(
    private route: ActivatedRoute,
    // private router: Router,
    private tls12040Service: TLS12040Service,
    private fareCalculationService: Tls12040FareCalculationService,
    private fareStatusService: Tls12040FareStatusService,
    private fareDataService: Tls12040FareDataService,
  ) {
    super();
  }

  get contractInfoColumns(): ColumnDef[] {
    if (!this._cachedContractInfoColumns || this._lastContractInfoLength !== this.contractInfoData.length) {
      console.log('🔄 重新生成 contractInfoColumns');
      this._cachedContractInfoColumns = Tls12040FareColumnDefinitions.getContractInfoColumns();
      this._lastContractInfoLength = this.contractInfoData.length;
    }
    return this._cachedContractInfoColumns;
  }

  get deductionAColumns(): ColumnDef[] {
    if (!this._cachedDeductionAColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastCRUDStatus !== this._currentCRUDStatus ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('重新生成 deductionAColumns');
      let columns = Tls12040FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      columns = Tls12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);

      // 預設是 Read 模式，所以大多數情況下會是唯讀
      if (this._currentCRUDStatus === CRUDStatus.Read) {
        columns = Tls12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }

      this._cachedDeductionAColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionAColumns;
  }

  get deductionBColumns(): ColumnDef[] {
    if (!this._cachedDeductionBColumns ||
      this._lastCRUDStatus !== this._currentCRUDStatus ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('重新生成 deductionBColumns');
      let columns = Tls12040FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      if (this._currentCRUDStatus === CRUDStatus.Read) {
        columns = Tls12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionBColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionBColumns;
  }

  get deductionCColumns(): ColumnDef[] {
    if (!this._cachedDeductionCColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastCRUDStatus !== this._currentCRUDStatus ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('重新生成 deductionCColumns');
      let columns = Tls12040FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      columns = Tls12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this._currentCRUDStatus === CRUDStatus.Read) {
        columns = Tls12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionCColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionCColumns;
  }

  get deductionDColumns(): ColumnDef[] {
    if (!this._cachedDeductionDColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastCRUDStatus !== this._currentCRUDStatus ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('重新生成 deductionDColumns');
      let columns = Tls12040FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = Tls12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this._currentCRUDStatus === CRUDStatus.Read) {
        columns = Tls12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionDColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionDColumns;
  }

  get deductionEColumns(): ColumnDef[] {
    if (!this._cachedDeductionEColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastCRUDStatus !== this._currentCRUDStatus ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('重新生成 deductionEColumns');
      let columns = Tls12040FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = Tls12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this._currentCRUDStatus === CRUDStatus.Read) {
        columns = Tls12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionEColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionEColumns;
  }

  private _updateCacheFlags(): void {
    this._lastOrgOptionsLength = this.orgOptions.length;
    this._lastCRUDStatus = this._currentCRUDStatus;
    this._lastContractInfoLength = this.contractInfoData.length;
  }

  setCRUDStatus(status: CRUDStatus): void {
    if (this._currentCRUDStatus !== status) {
      console.log(`CRUD 狀態變更: ${this._currentCRUDStatus} -> ${status}`);
      this._currentCRUDStatus = status;
      this._clearColumnCache(); // 清除快取以觸發重新生成
    }
  }

  private _clearColumnCache(): void {
    this._cachedContractInfoColumns = null;
    this._cachedDeductionAColumns = null;
    this._cachedDeductionBColumns = null;
    this._cachedDeductionCColumns = null;
    this._cachedDeductionDColumns = null;
    this._cachedDeductionEColumns = null;
  }
  // ========== 生命週期方法 ==========

  ngOnInit(): void {
    console.log('🚀 TLS12040Next1Component 初始化...');

    this.showMode = 'common';
    this.initializeDataStructure();
    this.initializePage('TLS12040', this.dataForm);

    // 🎯 載入 TLS12040 扣款資料
    this.loadTLS12040FareData();
  }

  ngOnDestroy(): void {
    console.log('🔄 TLS12040Next1Component 銷毀，清理訂閱...');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 🎯 TLS12040 專用資料載入方法 ==========

  /**
   * 載入 TLS12040 扣款資料 (新增模式)
   */
  private loadTLS12040FareData(): void {
    console.log('📄 TLS12040: 開始載入可用扣款項目...');

    this.loading = true;
    this.messageService.blockUi();

    // 🎯 使用明確的查詢參數
    const queryParams: TLS12040QueryParams = {
      apply_no: '',
      showAll: true
    };

    const subscription = this.tls12040Service.queryTLS12040Fare(queryParams).subscribe({
      next: (response: TLS12040APIResponse) => {
        console.log('🆕 TLS12040 API 回傳資料:', response);
        this.handleAPIResponse(response);
      },
      error: (error) => {
        console.error('🆕 TLS12040 載入可用扣款項目失敗:', error);
        this.handleAPIError(error);
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * 處理 API 回應
   */
  private handleAPIResponse(response: TLS12040APIResponse): void {
    if (response && response.Data && response.Data.FaresByType) {
      console.log('✅ TLS12040: 處理 API 資料...');

      // 🎯 處理 TLS12040 專用的資料結構
      this.originalFareData = this.processTLS12040APIData(response.Data.FaresByType);
      this.filterData();

      console.log('🆕 TLS12040: 載入可用扣款項目成功');
      this.messageService.successBubble('載入扣款項目成功');

    } else {
      console.log('🆕 TLS12040: API 沒有回傳可用扣款項目');
      this.messageService.infoBubble('目前沒有可用的扣款項目');
      this.initializeEmptyData();
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  /**
   * 處理 API 錯誤
   */
  private handleAPIError(error: any): void {
    console.error('❌ TLS12040 載入失敗:', error);
    this.messageService.warnBubble('載入可用扣款項目失敗');
    this.loading = false;
    this.messageService.unblockUi();
    this.initializeEmptyData();
  }

  // ========== 🎯 TLS12040 資料處理方法 ==========

  /**
   * 處理 TLS12040 API 資料，設定正確的初始狀態
   */
  private processTLS12040APIData(faresByType: any): { [key: string]: TLS12040FareItem[] } {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: { [key: string]: TLS12040FareItem[] } = { A: [], B: [], C: [], D: [], E: [] };

    console.log('📊 處理 TLS12040 API 資料，設定正確的初始狀態...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        console.log(`📋 處理 ${capType} 類型，共 ${faresByType[capType].length} 筆`);

        processedData[capType] = faresByType[capType].map((item: any, index: number) => {
          // 🎯 使用 TLS12040FareItem 結構處理
          const processedItem: TLS12040FareItem = {
            ...item,
            id: `temp_tls12040_${capType}_${item.cap_item}_${Date.now()}_${index}`,
            cap_type: item.cap_type || capType,
            is_selected: false,
            data_source: 'APS_AVAILABLE',
            _status: undefined,
            _originalSelected: false,
            _originalData: { ...item }
          };

          return processedItem;
        });

        console.log(`📊 ${capType} 類型處理完成: ${processedData[capType].length} 筆`);
      }
    });

    return processedData;
  }

  /**
   * 初始化空資料結構
   */
  private initializeEmptyData(): void {
    this.originalFareData = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': []
    };
    this.filterData();
  }

  /**
   * 初始化資料結構
   */
  private initializeDataStructure(): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    capTypes.forEach(capType => {
      if (!this.originalFareData[capType]) {
        this.originalFareData[capType] = [];
      }
      if (!this.fareData[capType]) {
        this.fareData[capType] = [];
      }
    });
  }

  // ========== 🎯 資料過濾和顯示方法 ==========

  /**
   * 根據顯示模式過濾資料
   */
  filterData(): void {
    console.log('🔍 TLS12040 資料過濾...', { 原始資料: this.originalFareData });
    this.initializeDataStructure();

    Object.keys(this.originalFareData).forEach(capType => {
      if (!Array.isArray(this.originalFareData[capType])) {
        this.originalFareData[capType] = [];
      }

      let filteredItems = [...this.originalFareData[capType]];

      if (this.showMode === 'common') {
        // 常用模式：合約項目 + 常用項目 + 已勾選項目
        filteredItems = filteredItems.filter((item: TLS12040FareItem) =>
          item.data_source === 'CONTRACT_EXISTING' ||
          item.is_commonly_used === 'Y' ||
          item.is_selected === true
        );
      }
      // 全部模式：顯示所有項目

      this.fareData[capType] = filteredItems;
    });

    console.log('🔍 TLS12040 過濾後結果:', {
      顯示模式: this.showMode,
      各類型數量: Object.keys(this.fareData).reduce((acc, type) => {
        acc[type] = {
          總數: this.fareData[type].length,
          已勾選: this.fareData[type].filter((item: TLS12040FareItem) => item.is_selected).length
        };
        return acc;
      }, {} as any)
    });
  }

  // ========== 🎯 統計和輔助方法 ==========

  /**
   * 獲取選中項目數量
   */
  getSelectedCount(capType: string): number {
    return this.fareData[capType]?.filter((item: TLS12040FareItem) => item.is_selected).length || 0;
  }

  /**
   * 獲取總項目數量
   */
  getTotalCount(capType: string): number {
    return this.fareData[capType]?.length || 0;
  }

  /**
   * 檢查是否有任何資料
   */
  hasAnyData(): boolean {
    return Object.values(this.originalFareData).some(items => items.length > 0);
  }

  /**
   * 獲取總選中數量
   */
  getTotalSelectedCount(): number {
    return Object.values(this.originalFareData)
      .flat()
      .filter((item: TLS12040FareItem) => item.is_selected).length;
  }

  /**
   * 獲取總項目數量
   */
  getTotalItemCount(): number {
    return Object.values(this.originalFareData)
      .flat().length;
  }

  /**
   * 檢查類型是否有資料
   */
  hasDataForType(capType: string): boolean {
    return this.fareData[capType]?.length > 0;
  }

  /**
   * 獲取類型名稱
   */
  getCapTypeName(capType: string): string {
    const typeNames: { [key: string]: string } = {
      'A': '一次扣款',
      'B': '每月扣款',
      'C': '平均分攤',
      'D': '比率分攤',
      'E': '活動扣款'
    };
    return typeNames[capType] || capType;
  }

  // ========== 🎯 模式切換方法 ==========

  /**
   * 切換顯示模式
   */
  toggleCommonMode(): void {
    if (this.showMode === 'common') {
      this.showMode = 'all';
      console.log('🔄 TLS12040: 切換到全部模式（包含已勾選項目）');
    } else {
      this.showMode = 'common';
      console.log('🔄 TLS12040: 切換到常用模式（包含已勾選項目）');
    }
    this.filterData();
  }

  /**
   * 獲取顯示模式文字
   */
  getDisplayModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  /**
   * 獲取當前顯示模式描述
   */
  getCurrentDisplayMode(): string {
    if (this.showMode === 'common') {
      return '合約項目 + 常用項目 + 已勾選項目';
    } else {
      return '全部項目';
    }
  }

  // ========== 🎯 導航和其他方法 ==========

  /**
   * 重新載入資料
   */
  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadTLS12040FareData();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  /**
   * 提交到下一步
   */
  onSubmitNext(): void {
    console.log('📤 TLS12040: 準備提交到下一步...');

    if (this.getTotalSelectedCount() === 0) {
      this.messageService.warnBubble('請至少選擇一個扣款項目');
      return;
    }

    // 這裡可以加入保存邏輯
    console.log('✅ TLS12040: 提交成功，導航到下一步');
    // this.router.navigate(['account/tls/tls12040next2']);
  }

  /**
   * 取消操作
   */
  override onCancel(): void {
    console.log('❌ TLS12040: 取消操作');
    // this.router.navigate(['account/tls/tls12040cru']);
  }

  // ========== 🎯 匯出屬性供模板使用 ==========

  /**
   * 扣款類型陣列
   */
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  /**
   * 獲取統計資訊
   */
  getStatistics(): TLS12040FareStatistics {
    const stats: TLS12040FareStatistics = {
      totalItems: this.getTotalItemCount(),
      selectedItems: this.getTotalSelectedCount(),
      commonItems: 0,
      newItems: 0,
      modifiedItems: 0,
      deletedItems: 0,
      byType: {}
    };

    // 計算各類型統計
    this.capTypes.forEach(capType => {
      const items = this.fareData[capType] || [];
      stats.byType[capType] = {
        total: items.length,
        selected: items.filter(item => item.is_selected).length,
        common: items.filter(item => item.is_commonly_used === 'Y').length
      };
    });

    return stats;
  }

  getCommonModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  onClearAndExit(): void {
    // this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls12040'], extras);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  getColumnsForType(capType: string): ColumnDef[] {
    switch (capType) {
      case 'A': return this.deductionAColumns;
      case 'B': return this.deductionBColumns;
      case 'C': return this.deductionCColumns;
      case 'D': return this.deductionDColumns;
      case 'E': return this.deductionEColumns;
      default: return [];
    }
  }

  onButtonClick(event: { rowData: any; field: string }, capType: string): void {
    const { rowData, field } = event;

    console.log(`🔘 按鈕點擊: ${field}`, rowData);

    // 🎯 直接根據 field 判斷要做什麼
    if (field === 'auto_calc') {
      this.doAutoCalculate(rowData, capType);
    }
  }

  private doAutoCalculate(rowData: any, capType: string): void {
    console.log('🧮 開始自動計算');

    const totalAmount = parseFloat(rowData.tpy_totalamt) || 0;
    const periods = parseInt(rowData.period_nos) || 0;

    if (totalAmount <= 0 || periods <= 1) {
      this.messageService.warnBubble('請檢查總金額和期數');
      return;
    }

    const monthlyAmount = Math.round(totalAmount / periods);
    const downPayment = totalAmount - (monthlyAmount * (periods - 1));

    // 🎯 設定對話框資料並顯示
    this.calculationResult = {
      totalAmount,
      periods,
      monthlyAmount,
      downPayment,
      verification: downPayment + (monthlyAmount * (periods - 1))
    };
    this.currentRowData = rowData;
    this.currentCapType = capType;
    this.showCalculationDialog = true;
  }

  onFieldChange(fieldName: string, newValue: any, rowData: any, capType?: string): void {
    console.log(`🔄 立即欄位變更: ${capType}.${fieldName} = ${newValue}`);

    // 🎯 根據 capType 進行對應的計算處理
    switch (capType) {
      case 'A':
        this.handleTypeACalculation(fieldName, newValue, rowData);
        break;
      case 'B':
        this.handleTypeBCalculation(fieldName, newValue, rowData);
        break;
      case 'C':
        // 🎯 關鍵：C類型的日期和金額計算
        this.handleTypeCCalculation(fieldName, newValue, rowData);
        break;
      case 'D':
        this.handleTypeDCalculation(fieldName, newValue, rowData);
        break;
      case 'E':
        this.handleTypeECalculation(fieldName, newValue, rowData);
        break;
      default:
        console.warn(`未知的扣款類型: ${capType}`);
    }

    // 統一的後續處理
    this.updateRowDataState(rowData, capType || 'A');
  }

  private handleTypeACalculation(fieldName: string, newValue: any, rowData: any): void {
    console.log(`🅰️ A類型計算: ${fieldName} = ${newValue}`);

    // 只有相關欄位變更時才重新計算
    if (['tpy_unitamt', 'tpy_qty'].includes(fieldName)) {
      this.fareCalculationService.autoCalculateAmount(rowData, 'A', fieldName);
      console.log(`💰 A類型計算完成: 金額 = ${rowData.tpy_amount}`);
    }

    // A類型特殊處理：開始日期變更時同步結束日期
    if (fieldName === 'tpy_bdate' && newValue) {
      rowData.tpy_edate = newValue;
      console.log(`📅 A類型同步結束日期: ${newValue}`);
    }
  }

  // B類型計算優化
  private handleTypeBCalculation(fieldName: string, newValue: any, rowData: any): void {
    console.log(`🅱️ B類型計算: ${fieldName} = ${newValue}`);

    if (['tpy_unitamt', 'tpy_qty'].includes(fieldName)) {
      this.fareCalculationService.autoCalculateAmount(rowData, 'B', fieldName);
      console.log(`💰 B類型計算完成: 金額 = ${rowData.tpy_amount}`);
    }
  }

  // C類型計算優化 - 最重要的優化
  private handleTypeCCalculation(fieldName: string, newValue: any, rowData: any): void {
    console.log(`🆂 C類型平均分攤計算: ${fieldName} = ${newValue}`);

    // 🎯 日期變更時重新計算期數
    if (['tpy_bdate', 'tpy_edate'].includes(fieldName)) {
      console.log('📅 日期欄位變更，重新計算期數');

      // 使用 setTimeout 確保日期值已經更新
      setTimeout(() => {
        this.updatePeriodNumbers(rowData);

        // 期數更新後，重新計算C類型金額
        const calculationFields = ['tpy_totalamt', 'tpy_amount', 'down_payment'];
        const hasCalculationValue = calculationFields.some(field =>
          rowData[field] && parseFloat(rowData[field]) > 0
        );

        if (hasCalculationValue) {
          console.log('🔄 期數變更後重新計算金額分攤');
          this.fareCalculationService.autoCalculateAmount(rowData, 'C', 'period_nos');
        }
      }, 10);
    }

    // 🎯 金額相關欄位變更時的計算
    const calculationFields = ['tpy_totalamt', 'period_nos', 'tpy_amount', 'down_payment'];
    if (calculationFields.includes(fieldName)) {
      this.fareCalculationService.autoCalculateAmount(rowData, 'C', fieldName);

      // 驗證計算結果
      const isValid = this.fareCalculationService.isCalculationValid(rowData, 'C');
      if (isValid) {
        console.log(`✅ C類型計算成功: 總額=${rowData.tpy_totalamt}, 期數=${rowData.period_nos}, 月額=${rowData.tpy_amount}, 首期=${rowData.down_payment}`);
      } else {
        console.warn(`⚠️ C類型計算結果可能有誤`);
      }
    }
  }

  // 🆕 計算期數的輔助方法
  private updatePeriodNumbers(rowData: any): void {
    console.log('📊 開始更新期數...', {
      開始日期: rowData.tpy_bdate,
      結束日期: rowData.tpy_edate
    });

    if (rowData.tpy_bdate && rowData.tpy_edate) {
      let startDate: Date;
      let endDate: Date;

      // 🎯 智能日期解析
      try {
        if (rowData.tpy_bdate instanceof Date) {
          startDate = rowData.tpy_bdate;
        } else {
          startDate = new Date(rowData.tpy_bdate);
        }

        if (rowData.tpy_edate instanceof Date) {
          endDate = rowData.tpy_edate;
        } else {
          endDate = new Date(rowData.tpy_edate);
        }

        // 檢查日期有效性
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('⚠️ 無效的日期格式');
          return;
        }

        // 計算期數
        if (startDate <= endDate) {
          const calculatedPeriods = this.calculateMonthsBetween(startDate, endDate);
          const oldPeriods = rowData.period_nos;

          rowData.period_nos = calculatedPeriods;

          console.log(`✅ 期數更新: ${oldPeriods} → ${calculatedPeriods}`);

          // 🎯 如果期數變化，觸發C類型重新計算
          if (oldPeriods !== calculatedPeriods) {
            console.log('🔄 期數變化，觸發C類型重新計算');
            this.fareCalculationService.autoCalculateAmount(rowData, 'C', 'period_nos');
          }
        } else {
          console.warn('⚠️ 開始日期大於結束日期');
          rowData.period_nos = 1;
        }
      } catch (error) {
        console.error('❌ 期數計算錯誤:', error);
        rowData.period_nos = 1;
      }
    } else {
      console.log('📝 日期不完整，期數保持不變');
    }
  }

  // 🆕 計算兩個日期間的月數
  private calculateMonthsBetween(startDate: Date, endDate: Date): number {
    console.log('📅 計算期數:', {
      開始: startDate.toISOString().slice(0, 7),
      結束: endDate.toISOString().slice(0, 7)
    });

    // 確保開始日期 <= 結束日期
    if (startDate > endDate) {
      console.warn('⚠️ 開始日期大於結束日期，期數為 0');
      return 0;
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth(); // 0-based
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth(); // 0-based

    // 🎯 正確的月份差計算公式
    const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    console.log('🧮 期數計算詳情:', {
      開始年: startYear,
      開始月: startMonth + 1, // 顯示時轉為 1-based
      結束年: endYear,
      結束月: endMonth + 1,
      計算公式: `(${endYear} - ${startYear}) * 12 + (${endMonth} - ${startMonth}) + 1`,
      結果: months
    });

    return Math.max(1, months); // 至少1期
  }

  // 🎯 D/E類型計算優化
  private handleTypeDCalculation(fieldName: string, newValue: any, rowData: any): void {
    if (fieldName === 'tpy_rate') {
      this.fareCalculationService.autoCalculateAmount(rowData, 'D', fieldName);
    }
  }

  private handleTypeECalculation(fieldName: string, newValue: any, rowData: any): void {
    if (fieldName === 'tpy_rate') {
      this.fareCalculationService.autoCalculateAmount(rowData, 'E', fieldName);
    }
  }

  private updateRowDataState(rowData: any, capType: string): void {
    // 更新選擇狀態
    this.fareStatusService.handleTableDataUpdate(rowData, capType);

    // 同步到原始資料
    this.updateOriginalDataItem(rowData, capType);

    // 儲存到工作流
    // this.saveFareDataToWorkflow();

    console.log(`✅ ${capType}類型資料狀態更新完成`);
  }

  private updateOriginalDataItem(updatedItem: any, capType: string): void {
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === updatedItem.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = {
        ...this.originalFareData[capType][originalIndex],
        ...updatedItem
      };
      console.log(`🔄 已更新原始資料: ${capType}[${originalIndex}]`);
    }
  }

  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    console.log(`💾 ${capType}類型表格儲存:`, event.newData);

    const { newData } = event;

    // 🎯 根據類型執行最終計算
    switch (capType) {
      case 'A':
        this.fareCalculationService.autoCalculateAmount(newData, 'A');
        if (newData.tpy_bdate) {
          newData.tpy_edate = newData.tpy_bdate;
        }
        break;
      case 'B':
        this.fareCalculationService.autoCalculateAmount(newData, 'B');
        break;
      case 'C':
        // C類型儲存時進行完整驗證
        this.fareCalculationService.autoCalculateAmount(newData, 'C');
        const isValid = this.fareCalculationService.isCalculationValid(newData, 'C');
        if (!isValid) {
          this.messageService.warnBubble('C類型資料計算有誤，請檢查輸入');
          return;
        }
        console.log(`✅ C類型儲存驗證通過: 總額=${newData.tpy_totalamt}, 期數=${newData.period_nos}`);
        break;
      case 'D':
      case 'E':
        this.fareCalculationService.autoCalculateAmount(newData, capType);
        break;
    }

    // 統一的狀態處理
    this.fareStatusService.handleTableDataUpdate(newData, capType);

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = {
        ...this.originalFareData[capType][originalIndex],
        ...newData
      };
    }

    // this.saveFareDataToWorkflow();
  }

  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
    this.ensureDefaultValues(rowData, capType);
  }

  private ensureDefaultValues(item: any, capType: string): void {
    // 🆕 使用資料服務套用預設值
    this.fareDataService.applyDynamicDefaults(item, this.contractInfoData);
  }


  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  selectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型全部選擇`);

    // 🆕 使用狀態服務
    this.fareStatusService.selectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    // this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型取消全部選擇`);

    // 🆕 使用狀態服務
    this.fareStatusService.deselectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    // this.saveFareDataToWorkflow();
  }

  private updateOriginalData(capType: string): void {
    this.fareData[capType].forEach(displayItem => {
      const originalItem = this.originalFareData[capType].find(item => item.id === displayItem.id);
      if (originalItem) {
        originalItem.is_selected = displayItem.is_selected;
      }
    });
  }

  //   private saveFareDataToWorkflow(): void {
  //   try {
  //     console.log('💾 準備儲存暫存資料...');

  //     // 🆕 使用資料服務準備儲存資料
  //     const mergedFareItems = this.fareDataService.prepareSaveData(this.originalFareData);

  //     const totalItems = mergedFareItems.length;
  //     const selectedItems = mergedFareItems.filter(item => item.is_selected).length;

  //     console.log(`💾 總共要儲存 ${totalItems} 筆資料，其中 ${selectedItems} 筆已選中`);

  //     this.contractFlowService.saveStep2Data(mergedFareItems);
  //     console.log('✅ 已成功暫存扣款資料到工作流程');

  //     this.verifyStoredData();
  //   } catch (error) {
  //     console.error('❌ 儲存暫存資料時發生錯誤:', error);
  //     this.messageService.warnBubble('儲存暫存資料失敗');
  //   }
  // }

  onCalculationDialogClose(visible: boolean): void {
    if (!visible) {
      this.closeCalculationDialog();
    }
  }

  private closeCalculationDialog(): void {
    this.showCalculationDialog = false;
    this.calculationResult = null;
    this.currentRowData = null;
    this.currentCapType = '';
  }

  onCalculationSave(): void {
    if (this.calculationResult && this.currentRowData) {
      // 套用計算結果
      this.currentRowData._skipAutoCalc = true;
      this.currentRowData.tpy_amount = this.calculationResult.monthlyAmount;
      this.currentRowData.down_payment = this.calculationResult.downPayment;

      // 觸發您現有的狀態更新
      this.updateRowDataState(this.currentRowData, this.currentCapType);
      this.messageService.successBubble('✅ 自動計算完成！');
    }

    // 關閉對話框
    this.closeCalculationDialog();
  }
}
