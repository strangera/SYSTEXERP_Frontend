import { FareColumnDefinitions } from './Services/fare-column-definitions';
import { FareStatusService } from './Services/fare-status.service';
import { FareDataService } from './Services/fare-data.service';
import { FareCalculationService } from './Services/fare-calculation.service';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { FareItem, ContractInfo, WorkflowStep } from '../tls13010/tls13010.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf, NgFor } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';

// 介面定義
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, NgFor]
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  // 檢視模式用
  isViewMode = false;

  // 組織table下拉
  orgOptions: any[] = [];
  private subscriptions: Subscription[] = [];
  private routerSubscription: any;

  private _cachedContractInfoColumns: ColumnDef[] | null = null;
  private _cachedDeductionAColumns: ColumnDef[] | null = null;
  private _cachedDeductionBColumns: ColumnDef[] | null = null;
  private _cachedDeductionCColumns: ColumnDef[] | null = null;
  private _cachedDeductionDColumns: ColumnDef[] | null = null;
  private _cachedDeductionEColumns: ColumnDef[] | null = null;
  private _lastOrgOptionsLength = 0;
  private _lastViewMode: boolean | null = null;
  private _lastContractInfoLength = 0;

  // 顯示模式控制
  showMode: 'common' | 'all' = 'common';

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 資料陣列
  originalFareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  fareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});

  constructor(
    private route: ActivatedRoute,
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService,
    private locationOptionsService: LocationOptionsService,
    public override router: Router,
    // 🆕 注入新的服務
    private fareCalculationService: FareCalculationService,
    private fareDataService: FareDataService,
    private fareStatusService: FareStatusService
  ) {
    super();
  }

  // ========== 🆕 欄位定義 getter (取代原有的屬性) ==========
  get contractInfoColumns(): ColumnDef[] {
    if (!this._cachedContractInfoColumns || this._lastContractInfoLength !== this.contractInfoData.length) {
      console.log('🔄 重新生成 contractInfoColumns');
      this._cachedContractInfoColumns = FareColumnDefinitions.getContractInfoColumns();
      this._lastContractInfoLength = this.contractInfoData.length;
    }
    return this._cachedContractInfoColumns;
  }

  get deductionAColumns(): ColumnDef[] {
    if (!this._cachedDeductionAColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== this.isViewMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionAColumns');
      let columns = FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
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
      let columns = FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      if (this.isViewMode) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
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
      let columns = FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
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
      let columns = FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
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
      let columns = FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isViewMode) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
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
    this.showMode = 'common';
    this.initializeViewModeFromService();
    this.initializeDataStructure();
    this.initializePage('TLS13010', this.dataForm);
    this.loadOrgOptions();
    console.log('📋 測試 loadWorkflowData...');
    try {
      this.loadWorkflowData();
      console.log('✅ loadWorkflowData 成功');
    } catch (error) {
      console.error('❌ loadWorkflowData 失敗:', error);
    }
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadWorkflowData();
      });
  }

  ngOnDestroy(): void {
    console.log('📄 NEXT1 組件銷毀，確保資料儲存');
    this.saveFareDataToWorkflow();

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 資料載入相關 ==========
  // private loadWorkflowData(): void {
  //   console.log('🚀 Next1 開始載入工作流程資料...');

  //   const workflowData = this.contractFlowService.getCurrentData();
  //   console.log('📋 工作流程資料:', workflowData);

  //   if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
  //     const modeInfo = this.contractFlowService.getWorkflowModeInfo();
  //     this.currentTalentId = modeInfo.talentId;
  //     this.currentContractData = workflowData?.queryRowData;

  //     console.log('✅ 工作流程狀態確認:', {
  //       mode: modeInfo.modeName,
  //       currentTalentId: this.currentTalentId,
  //       contractId: modeInfo.contractId
  //     });

  //     this.prepareContractInfoDisplay();
  //     this.initializeDataStructure();
  //     this.loadFareDataWithPriority();
  //   } else {
  //     console.warn('❌ 沒有工作流程資料，重導向到前一步');
  //     this.router.navigate(['account/tls/tls13010cru']);
  //   }
  // }

  private loadWorkflowData(): void {
    console.log('🔍 loadWorkflowData 開始執行');

    try {
      console.log('📋 步驟 1: 檢查 contractFlowService...');
      if (!this.contractFlowService) {
        console.error('❌ contractFlowService 未注入');
        return;
      }
      console.log('✅ contractFlowService 存在');

      console.log('📋 步驟 2: 取得工作流程資料...');
      const workflowData = this.contractFlowService.getCurrentData();
      console.log('📋 工作流程資料:', workflowData);

      console.log('📋 步驟 3: 檢查是否有有效資料...');
      const hasContractId = workflowData.contractId;
      const isNewMode = this.contractFlowService.isNewContractMode();
      console.log('📋 hasContractId:', hasContractId);
      console.log('📋 isNewMode:', isNewMode);

      if (hasContractId || isNewMode) {
        console.log('📋 步驟 4: 有有效的工作流程資料，取得模式資訊...');

        const modeInfo = this.contractFlowService.getWorkflowModeInfo();
        console.log('📋 modeInfo:', modeInfo);

        this.currentTalentId = modeInfo.talentId;
        this.currentContractData = workflowData?.queryRowData;

        console.log('✅ 工作流程狀態確認:', {
          mode: modeInfo.modeName,
          currentTalentId: this.currentTalentId,
          contractId: modeInfo.contractId
        });

        console.log('📋 步驟 5: 準備執行子方法...');

        // 🚨 逐一測試這些子方法
        console.log('📋 測試 prepareContractInfoDisplay...');
        try {
          this.prepareContractInfoDisplay();
          console.log('✅ prepareContractInfoDisplay 成功');
        } catch (error) {
          console.error('❌ prepareContractInfoDisplay 失敗:', error);
          return; // 如果這個失敗就停止
        }

        console.log('📋 測試 initializeDataStructure...');
        try {
          this.initializeDataStructure();
          console.log('✅ initializeDataStructure 成功');
        } catch (error) {
          console.error('❌ initializeDataStructure 失敗:', error);
          return;
        }

        console.log('📋 測試 loadFareDataWithPriority...');
        try {
          this.loadFareDataWithPriority();
          console.log('✅ loadFareDataWithPriority 成功');
        } catch (error) {
          console.error('❌ loadFareDataWithPriority 失敗:', error);
          return;
        }

        console.log('✅ loadWorkflowData 所有子方法完成');
      } else {
        console.warn('❌ 沒有工作流程資料，重導向到前一步');
        this.router.navigate(['account/tls/tls13010cru']);
      }

      console.log('✅ loadWorkflowData 主要邏輯完成');
    } catch (error) {
      console.error('❌ loadWorkflowData 頂層異常:', error);
    }
  }

  private loadOrgOptions(): void {
    console.log('📄 開始載入組織選項...');

    const subscription = this.locationOptionsService.getOrgOptions().subscribe({
      next: (options) => {
        console.log('✅ 組織選項載入成功:', options);
        this.orgOptions = options;
        // 🆕 載入完成後清除快取
        this._clearColumnCache();
      },
      error: (error) => {
        console.error('❌ 載入組織選項失敗:', error);
        this.messageService.warnBubble('載入組織選項失敗');
        this.orgOptions = [];
      }
    });

    this.subscriptions.push(subscription);
  }

  private initializeViewModeFromService(): void {
    const viewModeSub = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.isViewMode = isViewMode;
      console.log('🔍 Next1 檢視模式狀態更新:', isViewMode);
    });

    this.subscriptions.push(viewModeSub);
    this.isViewMode = this.contractFlowService.isViewMode();
  }

  private prepareContractInfoDisplay(): void {
    console.log('📊 準備合約資訊顯示...');

    const step1Data = this.contractFlowService.getStep1Data();
    console.log('🔍 Step1 編輯資料:', step1Data);

    const contractInfo = {
      talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '',
      tlt_no: step1Data?.tlt_no || this.currentContractData?.tlt_no || '',
      apply_no: step1Data?.apply_no || this.currentContractData?.apply_no || '',
      tlt_name: step1Data?.tlt_name || this.currentContractData?.tlt_name || '',
      VEN_Name: step1Data?.VEN_Name || this.currentContractData?.VEN_Name || '',
      ven_uniform: step1Data?.ven_uniform || this.currentContractData?.ven_uniform || '',
      contract_subno: step1Data?.contract_subno || this.currentContractData?.contract_subno || '',
      tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
      comm_comp_type: step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '2',
      tlt_bdate: step1Data?.tlt_bdate || this.currentContractData?.tlt_bdate || '',
      tlt_edate: step1Data?.tlt_edate || this.currentContractData?.tlt_edate || '',
      tlt_contract_bdate: step1Data?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate || '',
      tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate || ''
    };

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new',
      ...contractInfo
    }];

    console.log('📊 合約資訊顯示準備完成:', this.contractInfoData);
  }

  private loadFareDataWithPriority(): void {
    console.log('🔍 載入扣款資料優先順序判定...');

    const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    console.log('📦 檢查 Step2 暫存資料:', savedFareData);

    if (savedFareData && Array.isArray(savedFareData) && savedFareData.length > 0) {
      console.log('📦 使用暫存扣款資料');
      this.loadSavedFareData(savedFareData);
      return;
    }

    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式：載入可用扣款項目');
      this.loadAvailableFareData();
    } else {
      console.log('🔍 編輯模式：從 API 載入');
      this.loadFareDataFromAPI();
    }
  }

  private loadSavedFareData(savedData: FareItem[]): void {
    console.log('📦 載入暫存扣款資料:', savedData);

    try {
      // 🆕 使用服務驗證和修復資料
      this.originalFareData = this.fareDataService.validateAndFixData(savedData);
      this.filterData();

      console.log('✅ 暫存扣款資料載入完成');
      this.verifyStoredData();
    } catch (error) {
      console.error('❌ 暫存扣款資料處理失敗，重新載入:', error);

      if (this.contractFlowService.isNewContractMode()) {
        this.loadAvailableFareData();
      } else {
        this.loadFareDataFromAPI();
      }
    }
  }

  private loadAvailableFareData(): void {
    console.log('📄 新增模式：載入可用扣款項目...');

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: '',
      showAll: true
    }).subscribe({
      next: (response) => {
        console.log('🆕 新增模式 API 回傳資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 🆕 使用服務處理新增模式資料
          this.originalFareData = this.fareDataService.processNewContractAPIData(response.Data.FaresByType);
          this.filterData();
          this.saveFareDataToWorkflow();

          console.log('🆕 新增模式：載入可用扣款項目成功');
        } else {
          console.log('🆕 新增模式：API 沒有回傳可用扣款項目');
          this.messageService.infoBubble('目前沒有可用的扣款項目');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('🆕 新增模式載入可用扣款項目失敗:', error);
        this.messageService.warnBubble('載入可用扣款項目失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }

  private loadFareDataFromAPI(): void {
    console.log('📄 載入扣款資料，talent_id:', this.currentTalentId);

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: this.currentTalentId,
      showAll: true
    }).subscribe({
      next: (response) => {
        console.log('API 回傳的扣款資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 🆕 使用服務處理 API 資料
          this.originalFareData = this.fareDataService.processAPIData(
            response.Data.FaresByType,
            this.contractFlowService.isNewContractMode()
          );
          this.filterData();
          this.saveFareDataToWorkflow();

          if (this.contractFlowService.isNewContractMode()) {
            console.log('🆕 新增模式：載入可用扣款項目成功');
          } else {
            console.log('🔍 編輯模式：載入既有扣款資料成功');
          }
        } else {
          console.log('API 沒有回傳扣款資料');
          this.messageService.infoBubble('沒有找到扣款資料');
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

  private initializeEmptyData(): void {
    this.originalFareData = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': []
    };
    this.filterData();
    this.saveFareDataToWorkflow();
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

  // ========== 資料過濾和儲存 ==========
  filterData(): void {
    console.log('【DEBUG】originalFareData:', this.originalFareData);
    this.initializeDataStructure();

    // 🆕 使用資料服務進行過濾
    this.fareData = this.fareDataService.filterDataByMode(this.originalFareData, this.showMode);

    console.log('🔍 過濾後結果:', {
      顯示模式: this.showMode,
      各類型數量: Object.keys(this.fareData).reduce((acc, type) => {
        acc[type] = {
          總數: this.fareData[type].length,
          已勾選: this.fareData[type].filter(item => item.is_selected).length
        };
        return acc;
      }, {} as any)
    });
  }

  private saveFareDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存暫存資料...');

      // 🆕 使用資料服務準備儲存資料
      const mergedFareItems = this.fareDataService.prepareSaveData(this.originalFareData);

      const totalItems = mergedFareItems.length;
      const selectedItems = mergedFareItems.filter(item => item.is_selected).length;

      console.log(`💾 總共要儲存 ${totalItems} 筆資料，其中 ${selectedItems} 筆已選中`);

      this.contractFlowService.saveStep2Data(mergedFareItems);
      console.log('✅ 已成功暫存扣款資料到工作流程');

      this.verifyStoredData();
    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
      this.messageService.warnBubble('儲存暫存資料失敗');
    }
  }

  private verifyStoredData(): void {
    const savedData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    console.log('🔍 驗證儲存結果:', {
      savedDataType: Array.isArray(savedData) ? '陣列' : typeof savedData,
      savedDataLength: Array.isArray(savedData) ? savedData.length : 0,
      originalDataLength: this.getTotalItemCount()
    });

    if (Array.isArray(savedData)) {
      const selectedInSaved = savedData.filter(item => item.is_selected).length;
      const selectedInOriginal = this.getTotalSelectedCount();

      if (selectedInSaved !== selectedInOriginal) {
        console.warn('⚠️ 儲存後的選中項目數量不匹配:', {
          saved: selectedInSaved,
          original: selectedInOriginal
        });
      }
    }
  }
  // ========== 表格事件處理 (使用服務) ==========
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

  // 🎯 A類型計算優化
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

  // 🎯 B類型計算優化
  private handleTypeBCalculation(fieldName: string, newValue: any, rowData: any): void {
    console.log(`🅱️ B類型計算: ${fieldName} = ${newValue}`);

    if (['tpy_unitamt', 'tpy_qty'].includes(fieldName)) {
      this.fareCalculationService.autoCalculateAmount(rowData, 'B', fieldName);
      console.log(`💰 B類型計算完成: 金額 = ${rowData.tpy_amount}`);
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



  /**
   * 🔄 統一的狀態更新處理
   */
  private updateRowDataState(rowData: any, capType: string): void {
    // 更新選擇狀態
    this.fareStatusService.handleTableDataUpdate(rowData, capType);

    // 同步到原始資料
    this.updateOriginalDataItem(rowData, capType);

    // 儲存到工作流
    this.saveFareDataToWorkflow();

    console.log(`✅ ${capType}類型資料狀態更新完成`);
  }

  /**
   * 🔄 更新原始資料項
   */
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

  /**
   * 🆕 增強的表格儲存處理
   */
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

    this.saveFareDataToWorkflow();
  }

  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
    this.ensureDefaultValues(rowData, capType);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onItemSelectionChange(capType: string): void {
    console.log(`📄 ${capType} 類型項目選擇狀態改變`);

    // 🆕 使用狀態服務更新狀態
    this.fareData[capType].forEach(item => {
      this.fareStatusService.updateItemSelectionStatus(item);
    });

    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
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

  // ========== 輔助方法 (使用服務) ==========
  getSelectedCount(capType: string): number {
    return this.fareStatusService.getSelectedCount(this.fareData[capType]);
  }

  getTotalCount(capType: string): number {
    return this.fareStatusService.getTotalCount(this.fareData[capType]);
  }

  hasUnsavedChanges(): boolean {
    return this.fareStatusService.hasUnsavedChanges(this.originalFareData);
  }

  hasAnyData(): boolean {
    return this.fareStatusService.hasAnyData(this.originalFareData);
  }

  getTotalSelectedCount(): number {
    return this.fareStatusService.getTotalSelectedCount(this.originalFareData);
  }

  getTotalItemCount(): number {
    return this.fareStatusService.getTotalItemCount(this.originalFareData);
  }

  hasDataForType(capType: string): boolean {
    return this.fareStatusService.hasDataForType(this.fareData, capType);
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

  // ========== 模式切換 ==========
  toggleCommonMode(): void {
    if (this.showMode === 'common') {
      this.showMode = 'all';
      console.log('📄 切換到全部模式（包含已勾選項目）');
    } else {
      this.showMode = 'common';
      console.log('📄 切換到常用模式（包含已勾選項目）');
    }
    this.filterData();
  }

  getDisplayModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  getCurrentDisplayMode(): string {
    if (this.showMode === 'common') {
      return '合約項目 + 常用項目 + 已勾選項目';
    } else {
      return '全部項目';
    }
  }

  getCommonModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  // ========== 導航相關 ==========
  onSubmitNext(): void {
    if (this.isViewMode) {
      this.router.navigate(['account/tls/tls13010next2']);
      return;
    }

    this.saveFareDataToWorkflow();

    // 🆕 使用狀態服務驗證
    if (!this.fareStatusService.validateHasSelectedItems(this.originalFareData)) {
      this.messageService.warnBubble('請至少選擇一個扣款項目');
      return;
    }

    this.router.navigate(['account/tls/tls13010next2']);
  }

  override onCancel(): void {
    if (this.isViewMode) {
      this.router.navigate(['account/tls/tls13010cru']);
      return;
    }

    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls13010cru']);
  }

  onRealCancel(): void {
    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls13010']);
    this.messageService.infoBubble('已離開契約編輯流程');
  }

  onClearAndExit(): void {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.contractFlowService.clearTempData();
    this.router.navigate(['account/tls/tls13010'], extras);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  // ========== 表單相關 ==========
  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      console.log('扣款資料提交:', this.originalFareData);
      this.saveFareDataToWorkflow();
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  canQuery(): boolean {
    return true;
  }

  // ========== 其他功能 ==========
  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  saveAllChanges(): void {
    this.saveFareDataToWorkflow();
  }

  private ensureDefaultValues(item: any, capType: string): void {
    // 🆕 使用資料服務套用預設值
    this.fareDataService.applyDynamicDefaults(item, this.contractInfoData);
  }

  // ========== 匯出屬性 ==========
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  // ========== 🆕 包裝原有方法使用服務 ==========
  // 這些方法保持向後相容，內部使用服務
  private autoCalculateAmount(data: any, capType: string): void {
    this.fareCalculationService.autoCalculateAmount(data, capType);
  }

  private processAPIData(faresByType: any): Record<string, FareItem[]> {
    return this.fareDataService.processAPIData(faresByType, this.contractFlowService.isNewContractMode());
  }

  private processNewContractAPIData(faresByType: any): Record<string, FareItem[]> {
    return this.fareDataService.processNewContractAPIData(faresByType);
  }

  private validateAndFixData(data: any): Record<string, FareItem[]> {
    return this.fareDataService.validateAndFixData(data);
  }

  private cleanFareItemForStorage(item: FareItem): FareItem {
    return this.fareDataService.cleanFareItemForStorage(item);
  }

  private hasDataChanges(item: FareItem): boolean {
    return this.fareDataService.hasDataChanges(item);
  }
}
