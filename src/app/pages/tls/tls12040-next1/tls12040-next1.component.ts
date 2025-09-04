import { TLS12040FareColumnDefinitions } from './services/tls12040-fare-column-definitions';
import {
  TLS12040FareItem,
  TLS12040APIResponse,
  TLS12040QueryParams,
  TLS12040FareDataContainer,
  SimpleContractInfo,
  CruData,
  Next1Data
} from './models/tls12040-next1.model';
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from "primeng/accordion";
import { ColumnDef, ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { DialogComponent } from "@shared/componentkit/dialog/dialog.component";
import { TLS12040DetailModel } from '../tls12040-cru/models/tls12040-cru.model';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FareDataService } from '../tls13010-next1/Services/fare-data.service';
import { FareStatusService } from '../tls13010-next1/Services/fare-status.service';
import { Tls12040FareStatusService } from './services/tls12040-fare-status.service';
import { SHARED_DROPDOWN_OPTIONS } from '@shared/constants/business.constants';
import { Tls12040FareCalculationService } from './services/tls12040-fare-calculation.service';
import { Tls12040FareValidationService } from './services/tls12040-fare-validation.service';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls12040-next1',
  templateUrl: './tls12040-next1.component.html',
  styleUrls: ['./tls12040-next1.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, NgFor, AccordionModule, ExpandableEditTableComponent, DialogComponent]
})
export class TLS12040Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  currentApplyNo: string = '';

  contractInfoData: SimpleContractInfo[] = [];
  currentContractData: SimpleContractInfo | null = null;
  calculationResult: any = null;
  currentRowData: any = null;
  currentCapType: string = '';
  showCalculationDialog: boolean = false;

  orgOptions: any[] = [];


  fareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  originalFareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});
  showMode: 'common' | 'all' = 'common';
  contractInfoColumns: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];

  private _cachedContractInfoColumns: ColumnDef[] | null = null;
  private _cachedDeductionAColumns: ColumnDef[] | null = null;
  private _cachedDeductionBColumns: ColumnDef[] | null = null;
  private _cachedDeductionCColumns: ColumnDef[] | null = null;
  private _cachedDeductionDColumns: ColumnDef[] | null = null;
  private _cachedDeductionEColumns: ColumnDef[] | null = null;

  private _lastOrgOptionsLength = 0;
  private _lastViewMode: boolean | null = null;
  private _lastContractInfoLength = 0;
  // 檢視模式用 要換方式
  isViewMode = false;

  constructor(
    private route: ActivatedRoute,
    private tls12040Service: TLS12040Service,
    private flowService: TLS12040FlowService,
    private fareStatusService: Tls12040FareStatusService, //狀態管理服務
    private cdr: ChangeDetectorRef,
    private fareValidationService: Tls12040FareValidationService,
    private fareCalculationService: Tls12040FareCalculationService,


  ) {
    super();
  }

  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initializePage('TLS12040', this.dataForm);
    this.initializeDataStructure();
    this.contractInfoColumns = TLS12040FareColumnDefinitions.getContractInfoColumns();

    // 載入工作流程資料
    this.loadWorkflowData();
  }

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

  // 從工作流程載入資料
  private loadWorkflowData(): void {
    console.log('開始載入工作流程資料...');

    const currentState = this.flowService.getCurrentState();
    console.log('當前工作流程狀態:', currentState);

    // 取得申請編號
    this.currentApplyNo = currentState.applyNo || '';
    console.log('申請編號:', this.currentApplyNo);

    // 載入合約基本資料
    this.loadContractInfo();

    // 載入扣款資料
    this.loadFareData();
  }

  // 載入合約資訊
  private loadContractInfo(): void {
    console.log('載入合約資訊...');

    // 指定型別
    const cruData = this.flowService.getCruData<CruData>();
    console.log('CRU 資料:', cruData);

    if (cruData) {
      this.contractInfoData = [{
        id: cruData.apply_no || 'new',
        apply_no: cruData.apply_no || '',
        tlt_no: cruData.tlt_no || '',
        tlt_name: cruData.tlt_name || '',
        ven_uniform: cruData.ven_uniform || '',
        VEN_Name: cruData.VEN_Name || '',
        contract_subno: cruData.contract_subno || '',
        tlt_term_type: cruData.tlt_term_type || '',
        tlt_bdate: cruData.tlt_bdate || '',
        tlt_edate: cruData.tlt_edate || '',
        tlt_contract_bdate: cruData.tlt_contract_bdate || '',
        tlt_contract_edate: cruData.tlt_contract_edate || ''
      }];

      this.currentContractData = this.contractInfoData[0];
      console.log('合約資訊載入完成:', this.contractInfoData);
    }
  }

  // 載入扣款資料
  private loadFareData(): void {
    console.log('開始載入扣款資料...');

    // 先檢查是否有暫存資料，指定型別
    const savedNext1Data = this.flowService.getNext1Data<Next1Data>();
    console.log('檢查 Next1 暫存資料:', savedNext1Data);

    if (savedNext1Data && savedNext1Data.fareData) {
      console.log('使用暫存的扣款資料');
      this.originalFareData = savedNext1Data.fareData;
      this.filterData();
      return;
    }

    // 沒有暫存資料，從 API 載入
    console.log('從 API 載入扣款資料，apply_no:', this.currentApplyNo);
    this.loadFareDataFromAPI();
  }

  // 從 API 載入扣款資料
  private loadFareDataFromAPI(): void {
    this.loading = true;
    this.messageService.blockUi();

    const queryParams = {
      apply_no: this.currentApplyNo || '',
      showAll: true
    };

    console.log('API 查詢參數:', queryParams);

    const subscription = this.tls12040Service.queryTLS12040Fare(queryParams).subscribe({
      next: (response) => {
        console.log('API 回傳扣款資料:', response);

        if (response?.Data?.FaresByType) {
          this.processAPIData(response.Data.FaresByType);
        } else {
          console.log('API 沒有回傳扣款資料，初始化空資料');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入扣款資料失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }

  // 處理 API 回傳的資料
  private processAPIData(faresByType: any): void {
    console.log('開始處理 API 資料:', faresByType);

    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    capTypes.forEach(capType => {
      this.originalFareData[capType] = [];

      if (faresByType[capType] && Array.isArray(faresByType[capType])) {
        this.originalFareData[capType] = faresByType[capType].map((item: any) => ({
          ...item,
          id: item.id || `${capType}_${item.cap_item || Date.now()}`,
          is_selected: item.is_selected || false,
          cap_type: capType
        }));

        console.log(`${capType} 類型載入 ${this.originalFareData[capType].length} 筆資料`);
      } else {
        console.log(`${capType} 類型無資料`);
      }
    });

    this.filterData();
    this.saveFareDataToWorkflow();
  }

  // 初始化空資料
  private initializeEmptyData(): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    capTypes.forEach(capType => {
      this.originalFareData[capType] = [];
    });
    this.filterData();
  }

  // 過濾顯示資料
  private filterData(): void {
    console.log('開始過濾資料，顯示模式:', this.showMode);

    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    capTypes.forEach(capType => {
      if (this.showMode === 'all') {
        // 全部模式：顯示所有資料
        this.fareData[capType] = [...this.originalFareData[capType]];
      } else {
        // 常用模式：顯示已選中的 + 前幾個常用的
        const selectedItems = this.originalFareData[capType].filter(item => item.is_selected);
        const unselectedItems = this.originalFareData[capType]
          .filter(item => !item.is_selected)
          .slice(0, 5); // 只顯示前5個

        this.fareData[capType] = [...selectedItems, ...unselectedItems];
      }

      console.log(`${capType} 類型過濾後：${this.fareData[capType].length} 筆`);
    });
  }

  // 儲存到工作流程
  private saveFareDataToWorkflow(): void {
    try {
      const next1Data = {
        fareData: this.originalFareData,
        selectedItems: this.getSelectedItems(),
        contractInfo: this.currentContractData
      };

      this.flowService.setNext1Data(next1Data);
      console.log('已儲存 Next1 資料到工作流程');
    } catch (error) {
      console.error('儲存 Next1 資料失敗:', error);
    }
  }

  // 取得已選項目
  private getSelectedItems(): any[] {
    const selectedItems: any[] = [];
    Object.keys(this.originalFareData).forEach(capType => {
      const typeItems = this.originalFareData[capType].filter(item => item.is_selected);
      selectedItems.push(...typeItems);
    });
    return selectedItems;
  }

  // 檢查是否有資料
  hasAnyData(): boolean {
    return Object.values(this.fareData).some(items =>
      items && Array.isArray(items) && items.length > 0
    );
  }

  hasDataForType(capType: string): boolean {
    return this.fareData[capType] &&
      Array.isArray(this.fareData[capType]) &&
      this.fareData[capType].length > 0;
  }

  // 統計方法
  getTotalItemCount(): number {
    return Object.values(this.originalFareData)
      .reduce((total, items) => total + (items?.length || 0), 0);
  }

  getTotalSelectedCount(): number {
    return Object.values(this.originalFareData)
      .reduce((total, items) => {
        const selected = items?.filter(item => item.is_selected) || [];
        return total + selected.length;
      }, 0);
  }

  // 模式切換
  toggleCommonMode(): void {
    this.showMode = this.showMode === 'common' ? 'all' : 'common';
    console.log('切換顯示模式到:', this.showMode);
    this.filterData();
  }

  getCommonModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  getCurrentDisplayMode(): string {
    return this.showMode === 'common' ? '常用項目模式' : '全部項目模式';
  }

  // 導航方法
  onSubmitNext(): void {
    console.log('準備前往下一步');
    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls13010next2']);
  }

  override onCancel(): void {
    console.log('返回上一步');
    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls12040cru']);
  }

  onClearAndExit(): void {
    console.log('清空並離開');
    this.flowService.clearAll();
    this.router.navigate(['account/tls/tls12040']);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  // 重新載入資料
  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  // 除錯用
  checkDataStatus(): void {
    console.log('=== 資料狀態檢查 ===');
    console.log('currentApplyNo:', this.currentApplyNo);
    console.log('loading:', this.loading);
    console.log('contractInfoData:', this.contractInfoData);
    console.log('originalFareData:', this.originalFareData);
    console.log('fareData:', this.fareData);
    console.log('hasAnyData():', this.hasAnyData());

    Object.keys(this.fareData).forEach(capType => {
      console.log(`${capType} 類型資料數量:`, this.fareData[capType]?.length || 0);
    });
  }

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

  get deductionAColumns(): ColumnDef[] {
    if (!this._cachedDeductionAColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionAColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionAColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionAColumns;
  }

  get deductionBColumns(): ColumnDef[] {
    if (!this._cachedDeductionBColumns ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionBColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      if (this.isViewMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionBColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionBColumns;
  }

  get deductionCColumns(): ColumnDef[] {
    if (!this._cachedDeductionCColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionCColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionCColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionCColumns;
  }

  get deductionDColumns(): ColumnDef[] {
    if (!this._cachedDeductionDColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionDColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionDColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionDColumns;
  }

  get deductionEColumns(): ColumnDef[] {
    if (!this._cachedDeductionEColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionEColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionEColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionEColumns;
  }

  private _updateCacheFlags(): void {
    this._lastOrgOptionsLength = this.orgOptions.length;
    this._lastViewMode = this.isViewMode;
    this._lastContractInfoLength = this.contractInfoData.length;
  }

  selectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型全部選擇`);

    // 🆕 使用狀態服務
    this.fareStatusService.selectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型取消全部選擇`);

    // 🆕 使用狀態服務
    this.fareStatusService.deselectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  private updateOriginalData(capType: string): void {
    this.fareData[capType].forEach(displayItem => {
      const originalItem = this.originalFareData[capType].find(item => item.id === displayItem.id);
      if (originalItem) {
        originalItem.is_selected = displayItem.is_selected;
      }
    });
  }

  onButtonClick(event: { rowData: any; field: string }, capType: string): void {
    const { rowData, field } = event;

    console.log(`🔘 按鈕點擊: ${field}`, rowData);

    // 🎯 直接根據 field 判斷要做什麼
    if (field === 'auto_calc') {
      this.doAutoCalculate(rowData, capType);
    } else if (field === 'copy_button') {
      this.copyFareItem(rowData, capType);
    }
  }

  /**
     * 🎯 自動計算邏輯
     */
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

  private updateRowDataState(rowData: any, capType: string): void {
    // 更新選擇狀態
    this.fareStatusService.handleTableDataUpdate(rowData, capType);

    // 同步到原始資料
    this.updateOriginalDataItem(rowData, capType);

    // 儲存到工作流
    this.saveFareDataToWorkflow();

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


  // 🆕 關閉對話框
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
  //複製
  private copyFareItem(originalItem: any, capType: string): void {
    console.log(`複製 ${capType} 類型項目:`, originalItem.cap_item);

    try {
      const newId = `copy_${capType}_${originalItem.cap_item}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const copiedItem = {
        ...originalItem,
        id: newId,
        is_selected: true,
        data_source: 'COPIED_ITEM',
        _status: 'new',
        _isCopiedItem: true
      };

      // 🎯 特殊處理 tpy_type 欄位
      if (originalItem.tpy_type) {
        // 確保複製的 tpy_type 值有效
        const tpyTypeOptions = SHARED_DROPDOWN_OPTIONS.tpyTypeOption || [];
        const isValidOption = tpyTypeOptions.some(option => option.value === originalItem.tpy_type);

        if (isValidOption) {
          copiedItem.tpy_type = originalItem.tpy_type;
          console.log(`✅ tpy_type 複製成功: ${originalItem.tpy_type}`);
        } else {
          // 如果原值無效，設定為第一個可用選項或預設值
          copiedItem.tpy_type = tpyTypeOptions.length > 0 ? tpyTypeOptions[0].value : null;
          console.warn(`⚠️ 原 tpy_type 值無效，設定為預設值: ${copiedItem.tpy_type}`);
        }
      } else {
        // 如果原項目沒有 tpy_type，設定預設值
        const tpyTypeOptions = SHARED_DROPDOWN_OPTIONS.tpyTypeOption || [];
        copiedItem.tpy_type = tpyTypeOptions.length > 0 ? tpyTypeOptions[0].value : null;
        console.log(`📋 設定預設 tpy_type: ${copiedItem.tpy_type}`);
      }

      // 🎯 日期複製：只複製合理的日期，異常日期設為 null
      ['tpy_bdate', 'tpy_edate'].forEach(dateField => {
        if (originalItem[dateField]) {
          if (originalItem[dateField] instanceof Date) {
            if (this.isValidDateRange(originalItem[dateField])) {
              copiedItem[dateField] = new Date(originalItem[dateField]);
              console.log(`✅ ${dateField} 日期複製成功`);
            } else {
              copiedItem[dateField] = null;
              console.warn(`⚠️ ${dateField} 日期異常，設為 null`);
            }
          } else {
            // 非 Date 物件直接保持原值，讓顯示邏輯處理
            copiedItem[dateField] = originalItem[dateField];
            console.log(`📋 ${dateField} 保持原始格式`);
          }
        }
      });

      // 🎯 確保必要的數值欄位有預設值
      const numericFields = ['tpy_unitamt', 'tpy_qty', 'tpy_amount'];
      numericFields.forEach(field => {
        if (!copiedItem[field] || copiedItem[field] === null || isNaN(parseFloat(copiedItem[field]))) {
          if (field === 'tpy_qty') {
            copiedItem[field] = 1; // 數量預設為 1
          } else {
            copiedItem[field] = 0; // 其他數值欄位預設為 0
          }
          console.log(`📋 設定 ${field} 預設值: ${copiedItem[field]}`);
        }
      });

      // 🎯 確保組織欄位有預設值
      if (!copiedItem.org_id && this.orgOptions.length > 0) {
        copiedItem.org_id = this.orgOptions[0].value;
        console.log(`📋 設定預設組織: ${copiedItem.org_id}`);
      }

      // 🎯 確保發票欄位有預設值
      if (!copiedItem.gui_flag) {
        copiedItem.gui_flag = 'Y';
        console.log(`📋 設定預設發票狀態: Y`);
      }

      // 清理不需要的屬性
      delete copiedItem._skipAutoCalc;
      delete copiedItem._dateInitialized;

      // 添加到資料中
      this.originalFareData[capType].push(copiedItem);
      this.filterData();
      this.saveFareDataToWorkflow();

      this.messageService.successBubble(`已成功複製扣款項目「${originalItem.cap_name}」`);
      this.cdr.detectChanges();

      console.log(`複製完成: ${originalItem.cap_item} → ${newId}`, copiedItem);

    } catch (error) {
      console.error('複製扣款項目時發生錯誤:', error);
      this.messageService.warnBubble('複製扣款項目失敗，請重試');
    }
  }

  private isValidDateRange(date: Date): boolean {
    if (!date || isNaN(date.getTime())) {
      return false;
    }

    const year = date.getFullYear();
    const isReasonable = year >= 1900 && year <= 2100;

    if (!isReasonable) {
      console.warn(`⚠️ 日期年份超出合理範圍: ${year}`);
    }

    return isReasonable;
  }

  onFieldChange(fieldName: string, newValue: any, rowData: any, capType?: string): void {
    console.log(`欄位變更: ${capType}.${fieldName} = ${newValue}`);

    // 根據 capType 進行對應的計算處理
    switch (capType) {
      case 'A':
        this.handleTypeACalculation(fieldName, newValue, rowData);
        break;
      case 'B':
        this.handleTypeBCalculation(fieldName, newValue, rowData);
        break;
      case 'C':
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

    if (rowData.is_selected && capType) {
      this.performRealTimeValidation(rowData, capType);
    }
    // 統一的後續處理
    this.updateRowDataState(rowData, capType || 'A');
  }

  private performRealTimeValidation(rowData: any, capType: string): void {
    const allItemsOfType = this.originalFareData[capType] || [];
    const validationResult = this.fareValidationService.validateSingleItem(rowData, capType, allItemsOfType);

    if (!validationResult.isValid) {
      console.warn(`⚠️ ${capType} 類型項目驗證失敗:`, validationResult.errors);

      // 可以在這裡標記該項目有錯誤
      rowData._hasValidationError = true;
      rowData._validationErrors = validationResult.errors;
    } else {
      // 清除錯誤標記
      delete rowData._hasValidationError;
      delete rowData._validationErrors;
    }
  }

  // A類型計算優化
  private handleTypeACalculation(fieldName: string, newValue: any, rowData: any): void {
    // 選擇坪數單位時自動帶入總坪數
    if (fieldName === 'tpy_type' && newValue === '01') {
      const totalSpace = this.getTotalLocationSpace();
      if (totalSpace > 0) {
        rowData.tpy_qty = totalSpace;
        console.log(`坪數單位選擇，自動設定數量: ${totalSpace}`);
      }
    }

    // A類型金額計算 - 任何相關欄位變更都觸發
    if (['tpy_unitamt', 'tpy_qty', 'tpy_type'].includes(fieldName)) {
      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 0;

      if (unitPrice > 0 && quantity > 0) {
        rowData.tpy_amount = unitPrice * quantity;
        console.log(`A類型即時計算: ${unitPrice} × ${quantity} = ${rowData.tpy_amount}`);
      } else {
        rowData.tpy_amount = 0;
      }
    }

    // A類型特殊處理：結束日期等於開始日期
    if (fieldName === 'tpy_bdate' && newValue) {
      rowData.tpy_edate = newValue;
    }
  }


  // 🎯 B類型計算優化
  private handleTypeBCalculation(fieldName: string, newValue: any, rowData: any): void {

    if (fieldName === 'tpy_type' && newValue === '01') {
      const totalSpace = this.getTotalLocationSpace();
      if (totalSpace > 0) {
        rowData.tpy_qty = totalSpace;
      }
    }

    if (['tpy_unitamt', 'tpy_qty', 'tpy_type'].includes(fieldName)) {
      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 0;

      if (unitPrice > 0 && quantity > 0) {
        rowData.tpy_amount = unitPrice * quantity;
      } else {
        rowData.tpy_amount = 0;
      }
    }
  }

  // 🎯 C類型計算優化 - 最重要的優化
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
    const months = (endYear - startYear) * 12 + (endMonth - startMonth);

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
        // 先檢查必填欄位
        {
          if (!newData.tpy_totalamt || !newData.period_nos) {
            this.messageService.warnBubble('請完整填寫總金額和期數');
            // 阻止退出編輯，保持在編輯狀態
            throw new Error('validation_failed');
          }

          this.fareCalculationService.autoCalculateAmount(newData, 'C');
          const isValid = this.fareCalculationService.isCalculationValid(newData, 'C');
          if (!isValid) {
            this.messageService.warnBubble('C類型資料計算有誤，請檢查輸入');
            // 阻止退出編輯
            throw new Error('validation_failed');
          }
          break;
        }
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

    this.saveFareDataToWorkflow();
  }
  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
    // this.ensureDefaultValues(rowData, capType);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onBeforeSave(event: { data: any, preventDefault: () => void }, capType: string): void {
    const { data } = event;

    // 只對已勾選的項目進行驗證
    if (data.is_selected) {
      const allItemsOfType = this.originalFareData[capType] || [];
      const validationResult = this.fareValidationService.validateSingleItem(data, capType, allItemsOfType);

      if (!validationResult.isValid) {
        const errorMessage = validationResult.errors.join('\n');
        this.messageService.warnBubble(`${this.getCapTypeName(capType)}資料有誤：\n${errorMessage}`);
        event.preventDefault(); // 阻止儲存，保持編輯狀態
        return;
      }
    }

    // C 類型的特殊計算驗證
    if (capType === 'C' && data.is_selected) {
      const isValid = this.fareCalculationService.isCalculationValid(data, 'C');
      if (!isValid) {
        this.messageService.warnBubble('C類型資料計算有誤，請檢查輸入');
        event.preventDefault();
      }
    }
  }

  private getTotalLocationSpace(): number {
    // const step1Data = this.flowService.getCruData();
    // return step1Data?.totalLocationSpace || 0;
    return 0;
  }

  ngOnDestroy(): void {
    console.log('TLS12040Next1Component 銷毀');
    this.saveFareDataToWorkflow();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

