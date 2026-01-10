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
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { Tls12040FareDataService } from './services/tls12040-fare-data.service';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { CrudModeService } from '../tls12040/Workflow/crud-mode.service';

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
  payNoOptions: any[] = [];

  // 新增：forceEditMode 屬性
  forceEditMode = true;

  fareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  originalFareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});
  showMode: 'common' | 'all' = 'common';

  // 新增：個別群組的顯示模式控制
  showModeByType: { [key: string]: 'common' | 'all' } = {
    'A': 'common',
    'B': 'common',
    'C': 'common',
    'D': 'common',
    'E': 'common'
  };
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
  private _lastPayNoOptionsLength = 0;
  private _lastViewMode: boolean | null = null;
  private _lastContractInfoLength = 0;
  // 檢視模式用 要換方式
  // isViewMode = false;

  // 使用 CRUDStatus 判斷模式
  get isReadOnlyMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get shouldForceEdit(): boolean {
    return !this.isReadOnlyMode; // 非檢視模式時允許編輯
  }

  get canToEdit(): boolean {
    return this.isReadOnlyMode; // 檢視模式時不允許編輯，其他模式允許
  }

  constructor(
    private route: ActivatedRoute,
    private tls12040Service: TLS12040Service,
    private flowService: TLS12040FlowService,
    private fareStatusService: Tls12040FareStatusService, //狀態管理服務
    private cdr: ChangeDetectorRef,
    private fareValidationService: Tls12040FareValidationService,
    private fareDataService: Tls12040FareDataService,

    private fareCalculationService: Tls12040FareCalculationService,

    private locationOptionsService: LocationOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private crudModeService: CrudModeService,

  ) {
    super();
  }

  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);

    // 優先從 CrudModeService 獲取 crudstatus
    this.crudstatus = this.crudModeService.getCrudStatus();
    console.log('從 CrudModeService 獲取初始 crudstatus:', this.crudstatus);

    // 處理路由狀態
    this.handleRouterState();

    // 初始化頁面
    this.initializePage('TLS12040', this.dataForm);

    // 驗證和保護狀態
    this.validateAndProtectCrudStatus();

    console.log('=== CRUD 狀態調試 ===');
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('isReadOnlyMode:', this.isReadOnlyMode);
    console.log('isEditMode:', this.isEditMode);
    console.log('isCreateMode:', this.isCreateMode);

    // 其他初始化
    this.initializeDataStructure();
    this.contractInfoColumns = TLS12040FareColumnDefinitions.getContractInfoColumns();
    this.loadOrgOptions();
    this.loadPayNoOptions();
    this.loadApplyNo();
    this.loadWorkflowDataWithRetry();

  }

  private loadApplyNo(): void {
    const flowState = this.flowService.getCurrentState();
    const cruData = this.flowService.getCruData();

    this.currentApplyNo = flowState?.applyNo || cruData?.apply_no || '';

    console.log('📋 當前 apply_no:', this.currentApplyNo);

    if (!this.currentApplyNo) {
      console.warn('⚠️ 未找到 apply_no');
    }
  }

  //  新增：處理路由狀態的方法
  private handleRouterState(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state;
    console.log('=== Next1 路由狀態接收 ===', state);

    if (state && state['crudstatus']) {
      this.crudstatus = state['crudstatus'];
      this.crudModeService.setCrudStatus(this.crudstatus);
      this.flowService.setCurrentState({ crudstatus: this.crudstatus }); // 同步到 flowService
      console.log('從路由接收到 CRUD 狀態:', this.crudstatus);
    } else {
      const flowState = this.flowService.getCurrentState();
      this.crudstatus = flowState.crudstatus || this.crudModeService.getCrudStatus() || CRUDStatus.Read;
      console.warn('路由未提供 crudstatus，使用 flowService 或 CrudModeService 狀態:', this.crudstatus);
      this.crudModeService.setCrudStatus(this.crudstatus);
      this.flowService.setCurrentState({ crudstatus: this.crudstatus }); // 確保儲存
    }
  }
  //  新增方法：驗證和保護 CRUD 狀態
  private validateAndProtectCrudStatus(): void {
    const flowState = this.flowService.getCurrentState();
    console.log('flowService 狀態:', flowState);

    // 檢查有效的 CRUD 狀態
    const validStatuses = [CRUDStatus.Create, CRUDStatus.Edit, CRUDStatus.Read];

    // 優先使用已定義的 crudstatus（來自路由或 CrudModeService）
    if (this.crudstatus && validStatuses.includes(this.crudstatus)) {
      console.log('crudstatus 已定義，無需修正:', this.crudstatus);
      this.crudModeService.setCrudStatus(this.crudstatus);
      this.flowService.setCurrentState({ crudstatus: this.crudstatus });
      return;
    }

    // 如果 crudstatus 未定義或無效，從 flowService 恢復
    if (flowState.crudstatus && validStatuses.includes(flowState.crudstatus)) {
      this.crudstatus = flowState.crudstatus;
      console.log('從 flowService 恢復 crudstatus:', this.crudstatus);
    } else if (flowState.isNewContract !== undefined) {
      // 僅在無有效 crudstatus 時推斷
      this.crudstatus = flowState.isNewContract ? CRUDStatus.Create :
        (flowState.applyNo ? CRUDStatus.Edit : CRUDStatus.Create);
      console.warn(`⚠️ crudstatus 未定義，根據 flowService 推斷為 ${this.crudstatus}`);
    } else {
      // 最終 fallback 為 Read
      this.crudstatus = CRUDStatus.Read;
      console.warn('flowService 未提供有效狀態，預設為 Read');
    }

    this.crudModeService.setCrudStatus(this.crudstatus);
    this.flowService.setCurrentState({ crudstatus: this.crudstatus });
    console.log('最終 CRUD 狀態:', this.crudstatus, 'isReadOnlyMode:', this.crudModeService.isReadOnlyMode);
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

  private loadOrgOptions(): void {

    const subscription = this.locationOptionsService.getOrgOptions().subscribe({
      next: (options) => {
        this.orgOptions = options;

        //  強制清除所有快取，確保重新生成欄位定義
        this.clearColumnCache();

        //  觸發變更檢測
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('載入組織選項失敗:', error);
        this.messageService.warnBubble('載入組織選項失敗');
        this.orgOptions = [];
      }
    });

    this.subscriptions.push(subscription);
  }

  private loadPayNoOptions(): void {
    console.log('📄 開始載入支付編號選項...');
    console.log('🔍 初始 payNoOptions 長度:', this.payNoOptions.length);

    const subscription = this.negotiatorService.getPOS1006Options().subscribe({
      next: (response: any[]) => {
        this.payNoOptions = response;
        console.log('✅ 支付編號選項載入完成:', this.payNoOptions.length);

        if (this.payNoOptions.length > 0) {
          console.log('🔍 第一筆資料:', this.payNoOptions[0]);
          this.clearColumnCache();
          this.cdr.detectChanges();
        } else {
          // 如果載入為空，使用重試機制
          console.log('⏳ 支付編號尚未載入，等待...');
          this.retryLoadPayNoOptions();
        }
      },
      error: (error: any) => {
        console.error('❌ 載入支付編號選項失敗:', error);
        this.messageService.warnBubble('載入支付編號選項失敗');
        this.payNoOptions = [];
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * 🔥 新增：支付編號選項重試載入機制
   */
  private retryLoadPayNoOptions(): void {
    let retryCount = 0;
    const maxRetries = 5;

    const checkInterval = setInterval(() => {
      retryCount++;
      console.log(`🔄 第 ${retryCount} 次重試載入支付編號...`);

      const subscription = this.negotiatorService.getPOS1006Options().subscribe({
        next: (response: any[]) => {
          this.payNoOptions = response;
          console.log('🔍 重試後 payNoOptions 長度:', this.payNoOptions.length);

          if (this.payNoOptions.length > 0) {
            console.log('✅ 支付編號選項延遲載入成功:', this.payNoOptions.length);
            console.log('🔍 第一筆資料:', this.payNoOptions[0]);
            this.clearColumnCache();
            this.cdr.detectChanges();
            clearInterval(checkInterval);
          } else if (retryCount >= maxRetries) {
            console.error('❌ 支付編號載入失敗，已達最大重試次數');
            clearInterval(checkInterval);
          }
        },
        error: (error: any) => {
          console.error('❌ 重試載入支付編號失敗:', error);
          if (retryCount >= maxRetries) {
            clearInterval(checkInterval);
          }
        }
      });

      this.subscriptions.push(subscription);
    }, 500); // 每 500ms 重試一次
  }

  private clearColumnCache(): void {
    this._cachedDeductionAColumns = null;
    this._cachedDeductionBColumns = null;
    this._cachedDeductionCColumns = null;
    this._cachedDeductionDColumns = null;
    this._cachedDeductionEColumns = null;

    // 重置快取標記
    this._lastOrgOptionsLength = -1;
    this._lastPayNoOptionsLength = -1;
  }

  private loadWorkflowDataWithRetry(retryCount: number = 0): void {
    // 1. 先取得 apply_no
    const cruData = this.flowService.getCruData();
    this.currentApplyNo = cruData?.apply_no || '';
    console.log('📋 從 CRU 載入 apply_no:', this.currentApplyNo);

    // 2. 載入合約資訊
    this.loadContractInfo();

    // ✅ 3. 優先載入暫存，沒有才打 API
    const next1Data = this.flowService.getNext1Data<Next1Data>();

    if (next1Data && next1Data.originalFareData) {
      console.log('✅ 使用 workflow 暫存的費用資料');
      // 🔥 修正：從暫存載入完整的 originalFareData，而不是過濾後的 fareData
      this.originalFareData = JSON.parse(JSON.stringify(next1Data.originalFareData)); // 深拷貝完整資料

      // 過濾資料以顯示
      this.filterData();

      // 🔥 新增：使用暫存資料時也要確保預設值已套用
      setTimeout(() => {
        this.applyDefaultValuesToAllItems();
        //  新增：無條件同步 org_id
        this.syncOrgIdFromPrevious();
      }, 100); // 延遲一下確保 contractInfoData 已載入

    } else {
      // 🔥 修正：無論新增或編輯模式，只要沒有暫存就從 API 載入
      // 新增模式：apply_no 為空字串，API 會回傳所有可用扣款項目
      // 編輯模式：apply_no 有值，API 會回傳該合約的扣款資料
      console.log('📡 暫存無資料，從 API 載入（apply_no:', this.currentApplyNo || '空(新增模式)', ')');
      this.loadFareDataFromAPI();
    }
  }

  // 2. 新增專門的方法，在資料載入完成後一次性套用所有預設值
  private applyDefaultValuesToAllItems(): void {
    console.log('🔧 開始為所有項目套用預設值...');

    if (!this.contractInfoData || this.contractInfoData.length === 0) {
      console.warn('⚠️ 沒有合約資訊，無法套用預設值');
      return;
    }

    let updatedCount = 0;

    this.capTypes.forEach(capType => {
      if (this.originalFareData[capType] && Array.isArray(this.originalFareData[capType])) {
        this.originalFareData[capType].forEach(item => {
          // 只對需要預設值的項目進行處理
          if (this.needsDefaultValues(item)) {
            this.fareDataService.applyDefaultValues(item, this.contractInfoData);
            updatedCount++;
          }
        });
      }
    });

    console.log(` 預設值套用完成，共更新 ${updatedCount} 個項目`);

    // 套用預設值後重新過濾資料
    this.filterData();
  }

  /**
   *  新增：檢查項目是否需要套用預設值
   */
  private needsDefaultValues(item: any): boolean {
    // 檢查關鍵欄位是否為空
    const keyFields = ['tpy_bdate', 'tpy_edate', 'gui_flag'];

    return keyFields.some(field => {
      const value = item[field];
      return value === null || value === undefined || value === '';
    });
  }
  // // 4. 移除編輯時的預設值設定（這個方法可以刪除或簡化）
  // onFareTableEdit(rowData: any, capType: string): void {
  //   console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);

  //   //  移除這行，因為預設值已經在載入時設定完成
  //   // this.ensureDefaultValues(rowData, capType);

  //   // 只保留必要的工作流程儲存
  //   this.saveFareDataToWorkflow();
  // }


  private loadFareDataWithPriority(): void {
    console.log('📊 根據模式載入資料:', {
      模式: this.crudstatus,
      apply_no: this.currentApplyNo
    });

    // 🔴 檢視模式：一律從 API 載入最新資料
    if (this.isReadOnlyMode) {
      console.log('👁️ 檢視模式：強制從 API 載入');
      this.loadFareDataFromAPI();
      return;
    }

    // 🟡 編輯/新增模式：優先使用暫存（保留用戶修改）
    const savedNext1Data = this.flowService.getNext1Data<Next1Data>();

    if (savedNext1Data?.fareData) {
      const hasValidCache = this.validateCacheData(savedNext1Data);

      if (hasValidCache) {
        console.log('💾 使用暫存資料（編輯模式）');
        this.originalFareData = this.deepCloneFareData(savedNext1Data.fareData);
        this.filterData();
        this.verifyDataIntegrity();
        return;
      } else {
        console.warn('⚠️ 暫存資料無效，重新載入');
      }
    }

    // 🟢 沒有有效暫存：從 API 載入
    this.loadFareDataFromAPI();
  }

  /**
 * 驗證暫存資料是否有效
 */
  private validateCacheData(cacheData: Next1Data): boolean {
    // 1. 檢查 apply_no 是否一致
    if (cacheData.applyNo !== this.currentApplyNo) {
      console.warn('⚠️ apply_no 不一致:', {
        暫存: cacheData.applyNo,
        當前: this.currentApplyNo
      });
      return false;
    }

    // 2. 檢查時間戳（超過 30 分鐘視為過期）
    if (cacheData.timestamp) {
      const cacheAge = Date.now() - cacheData.timestamp;
      const maxAge = 30 * 60 * 1000; // 30 分鐘

      if (cacheAge > maxAge) {
        console.warn('⚠️ 暫存資料已過期:', {
          經過時間: Math.round(cacheAge / 60000) + ' 分鐘'
        });
        return false;
      }
    }

    // 3. 檢查是否有資料
    const hasFareData = Object.keys(cacheData.fareData || {}).some(capType =>
      Array.isArray(cacheData.fareData[capType]) &&
      cacheData.fareData[capType].length > 0
    );

    if (!hasFareData) {
      console.warn('⚠️ 暫存無扣款資料');
      return false;
    }

    console.log(' 暫存資料驗證通過');
    return true;
  }

  /**
   *  新增：檢查暫存資料是否需要與 API 同步
   */
  private checkAndSyncWithAPI(): void {
    // 如果是檢視模式，不需要同步
    if (this.isReadOnlyMode) {
      // console.log('檢視模式，跳過 API 同步檢查');
      return;
    }

    // 檢查暫存資料的時間戳
    const savedNext1Data = this.flowService.getNext1Data<any>();
    if (savedNext1Data?.timestamp) {
      const cacheAge = Date.now() - savedNext1Data.timestamp;
      const maxCacheAge = 5 * 60 * 1000; // 5分鐘

      if (cacheAge > maxCacheAge) {
        // console.log('暫存資料超過5分鐘，背景同步 API 資料');
        this.backgroundSyncWithAPI();
      } else {
        console.log('暫存資料仍新鮮，無需同步');
      }
    }
  }

  /**
   *  新增：背景同步 API 資料（不影響當前顯示）
   */
  private backgroundSyncWithAPI(): void {
    const queryParams = {
      apply_no: this.currentApplyNo || '',
      showAll: true
    };

    // console.log('背景同步 API 資料，參數:', queryParams);

    const subscription = this.tls12040Service.queryTLS12040Fare(queryParams).subscribe({
      next: (response) => {
        if (response?.Data?.FaresByType) {
          // console.log('背景同步完成，檢查是否有新資料');
          this.mergeAPIDataWithCache(response.Data.FaresByType);
        }
      },
      error: (error) => {
        console.warn('背景同步失敗:', error);
        // 同步失敗不影響現有資料
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   *  新增：合併 API 資料與暫存資料
   */
  private mergeAPIDataWithCache(apiData: any): void {
    // 這裡可以實作智能合併邏輯
    // 例如：保留使用者的修改，但加入新的可選項目
    // console.log('合併 API 資料與暫存資料');

    // 簡單版本：只在沒有使用者修改時才更新
    const hasUserModifications = this.hasUserModifications();
    if (!hasUserModifications) {
      // console.log('無使用者修改，更新為 API 最新資料');
      this.processAPIData(apiData);
      this.filterData();
    } else {
      console.log('有使用者修改，保持現有資料');
    }
  }

  /**
   *  新增：檢查是否有使用者修改
   */
  private hasUserModifications(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item =>
        item._status === 'new' ||
        item._status === 'modified' ||
        item._status === 'deleted' ||
        (item.is_selected !== item._originalSelected)
      )
    );
  }

  /**
   * 新增：深度複製扣款資料，避免引用問題
   */
  private deepCloneFareData(fareData: { [key: string]: TLS12040FareItem[] }): { [key: string]: TLS12040FareItem[] } {
    const cloned: { [key: string]: TLS12040FareItem[] } = {};

    Object.keys(fareData).forEach(capType => {
      if (fareData[capType] && Array.isArray(fareData[capType])) {
        cloned[capType] = fareData[capType].map(item => ({
          ...item,
          // 確保必要屬性存在
          is_selected: Boolean(item.is_selected),
          cap_type: capType,
          id: item.id || `${capType}_${item.cap_item || Date.now()}`,
          // 保留修改狀態
          _status: item._status || 'original',
          _originalSelected: item._originalSelected !== undefined ? item._originalSelected : item.is_selected
        }));
      } else {
        cloned[capType] = [];
      }
    });

    return cloned;
  }
  /**
   *  新增：資料完整性驗證
   */
  private verifyDataIntegrity(): void {
    console.log('🔍 驗證資料完整性...');

    const totalOriginal = this.getTotalItemCount();
    const totalDisplay = Object.values(this.fareData)
      .reduce((total, items) => total + (items?.length || 0), 0);

    console.log('📊 資料完整性報告:', {
      原始資料總數: totalOriginal,
      顯示資料總數: totalDisplay,
      已選項目數: this.getTotalSelectedCount(),
      申請編號: this.currentApplyNo
    });

    if (totalOriginal === 0) {
      console.warn('⚠️ 警告：沒有任何扣款資料');
      this.messageService.infoBubble('目前沒有可用的扣款項目');
    }
  }

  // 載入合約資訊
  private loadContractInfo(): void {
    console.log('載入合約資訊...');

    // 指定型別
    const cruData = this.flowService.getCruData();
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


  // 從 API 載入扣款資料
  private loadFareDataFromAPI(): void {
    console.log('從 API 載入扣款資料，apply_no:', this.currentApplyNo);
    console.log('當前模式:', this.crudstatus);

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

        try {
          if (response?.Data?.FaresByType) {
            this.processAPIData(response.Data.FaresByType);

            // 🔥 新增：API 載入完成後立即套用預設值
            this.applyDefaultValuesToAllItems();

            // 🆕 新增：無條件同步 org_id
            this.syncOrgIdFromPrevious();

          } else {
            console.warn('API 沒有回傳有效的扣款資料');
            // this.handleEmptyData();
          }
        } catch (error) {
          console.error('處理 API 資料時發生錯誤:', error);
          this.messageService.warnBubble('資料處理失敗，請重試');
        } finally {
          this.loading = false;
          this.messageService.unblockUi();
        }
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入資料失敗，請重試');
        this.loading = false;
        this.messageService.unblockUi();
      }
    });

    this.subscriptions.push(subscription);
  }

  // 處理 API 回傳的資料
  private processAPIData(faresByType: any): void {
    console.log('開始處理 API 資料:', faresByType);

    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    // 重置原始資料
    capTypes.forEach(capType => {
      this.originalFareData[capType] = [];
    });

    capTypes.forEach(capType => {
      if (faresByType[capType] && Array.isArray(faresByType[capType])) {
        this.originalFareData[capType] = faresByType[capType].map((item: any) => {
          // 根據模式決定初始狀態
          let initialStatus: string | undefined = undefined;
          let isSelected = false;

          if (this.isCreateMode) {
            // 新增模式：所有項目都是未選擇狀態
            isSelected = false;
          } else {
            // 編輯/檢視模式：保持 API 回傳的選擇狀態
            isSelected = Boolean(item.is_selected);

            // 如果是合約既有項目且已選擇，設定為 original 狀態
            if (isSelected && item.data_source === 'CONTRACT_EXISTING') {
              initialStatus = 'original';
            }
          }

          return {
            ...item,
            id: item.id || `${capType}_${item.cap_item || Date.now()}`,
            is_selected: isSelected,
            cap_type: capType,
            _status: initialStatus,
            _originalData: { ...item },
            _originalSelected: Boolean(item.is_selected) // 保留 API 原始的選擇狀態
          };
        });

        console.log(`${capType} 類型載入 ${this.originalFareData[capType].length} 筆資料`);
      } else {
        console.log(`${capType} 類型無資料`);
      }
    });

    // 處理完成後執行過濾
    this.filterData();
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
  filterData(): void {
    console.log('【DEBUG】originalFareData:', this.originalFareData);
    this.initializeDataStructure();

    // 針對每個群組使用各自的顯示模式進行過濾
    this.capTypes.forEach(capType => {
      const groupMode = this.showModeByType[capType];
      const filteredTypeData = this.fareDataService.filterDataByMode(
        { [capType]: this.originalFareData[capType] },
        groupMode
      );
      this.fareData[capType] = filteredTypeData[capType] || [];
    });

    console.log('🔍 過濾後結果:', {
      各群組模式: this.showModeByType,
      各類型數量: Object.keys(this.fareData).reduce((acc, type) => {
        acc[type] = {
          總數: this.fareData[type].length,
          已勾選: this.fareData[type].filter(item => item.is_selected).length,
          模式: this.showModeByType[type]
        };
        return acc;
      }, {} as any)
    });
  }

  // 儲存到工作流程
  private saveFareDataToWorkflow(): void {
    console.log('儲存 next1 資料前檢查 cru:');
    const cruBefore = this.flowService.getStepData('cru');
    // console.log('cru locationInfo:', JSON.stringify(cruBefore?.data?.locationInfo || [], null, 2));

    // 🔥 關鍵修復:使用 originalFareData 並包含所有項目(包括 deleted 狀態的)
    const allFareItems = Object.values(this.originalFareData).flat();

    const next1Data = {
      fareData: this.fareData,  // 過濾後的資料（用於顯示）
      originalFareData: this.originalFareData,  // 🔥 新增：完整的原始資料（用於切換模式）
      selectedItems: allFareItems,  // 🔥 改為包含所有項目,讓 DataCleaner 處理篩選
      contractInfo: this.contractInfoData
    };

    console.log('💾 儲存到 workflow 的資料:', {
      originalFareData總數: allFareItems.length,
      fareData總數: Object.values(this.fareData).flat().length,
      已選: allFareItems.filter(item => item.is_selected).length,
      刪除: allFareItems.filter(item => item._status === 'deleted').length,
      新增: allFareItems.filter(item => item._status === 'new').length,
      修改: allFareItems.filter(item => item._status === 'modified').length
    });

    const saveResult = this.flowService.setStepData('next1', next1Data);

    if (saveResult) {
      // console.log(' next1 資料儲存成功');
      const cruAfter = this.flowService.getStepData('cru');
      // console.log('儲存 next1 後檢查 cru:', JSON.stringify(cruAfter?.data?.locationInfo || [], null, 2));
      if (
        cruBefore?.data?.locationInfo?.length > 0 &&
        (!cruAfter?.data?.locationInfo || cruAfter.data.locationInfo.length === 0)
      ) {
        console.error('🚨 next1 儲存導致 cru locationInfo 清空！');
      }
    } else {
      console.error('❌ next1 資料儲存失敗');
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
    // 檢查過濾後的 fareData 是否有資料
    // 這樣在常用模式下如果過濾後沒有項目,會顯示提示訊息
    return this.fareData[capType] &&
      Array.isArray(this.fareData[capType]) &&
      this.fareData[capType].length > 0;
  }

  // 統計方法
  getTotalItemCount(): number {
    return Object.values(this.originalFareData)
      .reduce((total, items) => total + (items?.length || 0), 0);
  }

  // getTotalSelectedCount(): number {
  //   return Object.values(this.originalFareData)
  //     .reduce((total, items) => {
  //       const selected = items?.filter(item => item.is_selected) || [];
  //       return total + selected.length;
  //     }, 0);
  // }

  // 模式切換
  toggleCommonMode(): void {
    console.log('切換顯示模式，當前模式:', this.showMode);

    // 顯示載入提示
    this.loading = true;
    this.messageService.blockUi();

    // 延遲執行，讓載入提示先顯示
    setTimeout(() => {
      if (this.showMode === 'common') {
        this.showMode = 'all';
      } else {
        this.showMode = 'common';
      }

      console.log('已切換到:', this.showMode);
      this.filterData();

      this.loading = false;
      this.messageService.unblockUi();
    }, 500); // 給予 500ms 的延遲，讓畫面有時間顯示 loading
  }

  getCommonModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '顯示常用項目';
  }

  getCurrentDisplayMode(): string {
    return this.showMode === 'common' ? '常用項目模式' : '全部項目模式';
  }

  // ========== 新增：個別群組模式控制方法 ==========

  /**
   * 切換特定群組的顯示模式
   */
  toggleCommonModeByType(capType: string): void {
    // 直接切換模式，不顯示 loading
    if (this.showModeByType[capType] === 'common') {
      this.showModeByType[capType] = 'all';
    } else {
      this.showModeByType[capType] = 'common';
    }

    // 只更新資料，不顯示 loading
    this.filterData();
    this.cdr.detectChanges();
  }

  /**
   * 全域切換所有群組（顯示 loading）
   */
  toggleAllCommonMode(): void {
    this.loading = true;

    setTimeout(() => {
      // 判斷當前是否全部都是 common
      const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');

      // 如果全部都是 common，切換為 all；否則切換為 common
      const newMode = allCommon ? 'all' : 'common';

      this.capTypes.forEach(capType => {
        this.showModeByType[capType] = newMode;
      });

      this.filterData();
      this.loading = false;
    }, 300);
  }

  /**
   * 取得全域按鈕文字
   */
  getAllCommonModeText(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部展開' : '全部收合';
  }

  /**
   * 取得全域顯示狀態
   */
  getAllDisplayMode(): string {
    const commonCount = Object.values(this.showModeByType).filter(mode => mode === 'common').length;
    const allCount = Object.values(this.showModeByType).filter(mode => mode === 'all').length;

    if (commonCount === 5) return '全部顯示：常用項目';
    if (allCount === 5) return '全部顯示：完整項目';
    return `混合模式 (常用:${commonCount} 全部:${allCount})`;
  }

  /**
   * 取得特定群組的顯示模式文字
   */
  getCurrentDisplayModeByType(capType: string): string {
    if (this.showModeByType[capType] === 'common') {
      return '合約項目 + 常用項目 + 已勾選項目';
    } else {
      return '全部項目';
    }
  }

  /**
   * 取得特定群組的按鈕文字
   */
  getCommonModeTextByType(capType: string): string {
    return this.showModeByType[capType] === 'common'
      ? '顯示全部項目'
      : '顯示常用項目';
  }

  /**
   * 判斷按鈕是否為 outlined 模式
   */
  isOutlinedMode(capType: string): boolean {
    return this.showModeByType[capType] !== 'common';
  }

  /**
   * 項目選擇變更處理
   */
  onItemSelectionChange(capType: string): void {
    // 選擇變更時可以在這裡處理邏輯
    console.log(`${capType} 類型選擇變更`);
  }

  /**
   * 取得總選中數量
   */
  getTotalSelectedCount(): number {
    return this.capTypes.reduce((total, capType) => {
      return total + (this.originalFareData[capType]?.filter(item => item.is_selected)?.length || 0);
    }, 0);
  }

  // 導航方法
  onSubmitNext(): void {
    console.log('🚀 準備前往下一步');

    const currentOrgId = this.getPreviousSelectedOrgId();
    if (currentOrgId && this.checkIfOrgIdNeedsUpdate(currentOrgId)) {
      console.log('🔧 提交前最終同步 org_id');
      this.applyOrgIdToAllItems(currentOrgId);
    }

    //  新增：驗證已選擇項目都有 org_id
    const missingOrgItems = this.findItemsWithoutOrgId();
    if (missingOrgItems.length > 0) {
      console.error('❌ 仍有項目缺少 org_id:', missingOrgItems);
      this.messageService.warnBubble('資料設定不完整，請重新載入頁面');
      return;
    }

    // 🔥 新增：檢視模式不需要驗證，直接跳轉
    if (this.isReadOnlyMode) {
      console.log('🔍 檢視模式：跳過驗證，直接跳轉');
      this.navigateToNextStep();
      return;
    }

    // 🔥 新增：編輯模式進行完整驗證
    console.log('🔍 開始進行完整驗證...');
    const validationResults = this.validateAllSelectedFareTypes();

    if (!validationResults.isValid) {
      console.error('❌ 驗證失敗:', validationResults.errors);
      this.showValidationErrors(validationResults.errors);
      return;
    }

    console.log('✅ 驗證通過，準備跳轉到下一步');

    // 呼叫共用導航方法
    this.navigateToNextStep();
  }

  /**
   * 取得下一步按鈕的標籤文字
   */
  getNextStepLabel(): string {
    const tltTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();
    if (tltTermType === '1') {
      return '下一步(租金設定)';
    }
    return '下一步(抽成設定)';
  }

  override onCancel(): void {
    console.log('⬅️ 返回上一步 (CRU)');
    console.log('當前狀態:', {
      crudstatus: this.crudstatus,
      apply_no: this.currentApplyNo,
      hasChanges: this.hasUserModifications()
    });

    // 🟢 儲存資料到工作流程
    try {
      this.saveFareDataToWorkflow();
      console.log(' Next1 資料已儲存');
    } catch (error) {
      console.error('❌ 儲存失敗:', error);
    }

    // 🔴 關鍵：確保狀態正確傳遞
    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus,  // 保持原狀態
        fromRoute: this.router.url,
        fromNext1: true,  // 標記來自 Next1
        returnToEdit: true  // 標記要保持編輯狀態
      }
    };

    console.log('🚀 導航參數:', navigationExtras.state);

    this.router.navigate(['account/tls/tls12040cru'], navigationExtras)
      .then(success => {
        if (success) {
          console.log(' 成功返回 CRU');
        } else {
          console.error('❌ 導航失敗');
        }
      });
  }

  onClearAndExit(): void {
    console.log('🚪 清除並離開');

    // 手動清除 SessionStorage
    const STORAGE_KEY = 'TLS12040_FLOW';
    sessionStorage.removeItem(STORAGE_KEY);

    // 確認清除
    const isCleared = !sessionStorage.getItem(STORAGE_KEY);
    console.log('手動清除結果:', isCleared);

    // 呼叫 service 的清除方法
    this.flowService.clearAll();

    // 導航
    this.router.navigate(['/account/tls/tls12040'])
      .then(() => {
        this.messageService.infoBubble('已清除並返回');
      });
  }



  // 重新載入資料
  reloadData(): void {
    console.log('🔄 重新載入扣款資料...');

    // 清空現有資料
    this.initializeDataStructure();

    // 重新載入
    this.loadWorkflowDataWithRetry();
  }

  private loadDefaultFareItems(): void {
    console.log('載入預設扣款項目範本...');

    this.loading = true;
    this.messageService.blockUi();

    // 新增模式下的 API 查詢參數（不帶 apply_no）
    const queryParams = {
      apply_no: '', // 新增模式不帶 apply_no
      showAll: true,
      loadDefaults: true  // 或其他 API 需要的參數來表示要載入預設項目
    };

    console.log('載入預設範本的 API 查詢參數:', queryParams);

    const subscription = this.tls12040Service.queryTLS12040Fare(queryParams).subscribe({
      next: (response) => {
        console.log('API 回傳預設扣款範本:', response);

        try {
          if (response?.Data?.FaresByType) {
            this.processAPIData(response.Data.FaresByType);
            console.log('預設扣款範本處理完成');
            this.saveFareDataToWorkflow();
          } else {
            console.log('API 沒有回傳預設扣款範本，初始化空資料');
            this.initializeEmptyData();
          }
        } catch (error) {
          console.error('處理預設扣款範本時發生錯誤:', error);
          this.messageService.warnBubble('處理扣款資料時發生錯誤');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
        this.verifyDataIntegrity();
      },
      error: (error) => {
        console.error('載入預設扣款範本失敗:', error);
        this.messageService.warnBubble('載入預設扣款項目失敗，請稍後重試');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
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
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionAColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isReadOnlyMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionAColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionAColumns;
  }

  get deductionBColumns(): ColumnDef[] {
    if (!this._cachedDeductionBColumns ||
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionBColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      if (this.isReadOnlyMode) {
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
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionCColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.isReadOnlyMode) {
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
      this._lastPayNoOptionsLength !== this.payNoOptions.length ||
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionDColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      columns = TLS12040FareColumnDefinitions.updatePayNoOptionsInColumns(columns, this.payNoOptions);
      if (this.isReadOnlyMode) {
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
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionEColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      columns = TLS12040FareColumnDefinitions.updatePayNoOptionsInColumns(columns, this.payNoOptions);
      if (this.isReadOnlyMode) {
        columns = TLS12040FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionEColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionEColumns;
  }

  private _updateCacheFlags(): void {
    this._lastOrgOptionsLength = this.orgOptions.length;
    this._lastPayNoOptionsLength = this.payNoOptions.length;
    this._lastViewMode = this.isReadOnlyMode;
    this._lastContractInfoLength = this.contractInfoData.length;
  }

  selectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型全部選擇`);

    //  使用狀態服務
    this.fareStatusService.selectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    console.log(`📄 ${capType} 類型取消全部選擇`);

    //  使用狀態服務
    this.fareStatusService.deselectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  private updateOriginalData(capType: string): void {
    this.fareData[capType].forEach(displayItem => {
      const originalItem = this.originalFareData[capType].find(item => item.id === displayItem.id);
      if (originalItem) {
        // 🔥 完整同步所有狀態欄位
        originalItem.is_selected = displayItem.is_selected;
        originalItem._status = displayItem._status;  // 🔥 關鍵修復:同步 _status

        // 🔥 新增日誌以追蹤刪除狀態
        if (displayItem._status === 'deleted') {
          console.log(`🗑️ ${capType} 類型項目 ${displayItem.cap_item} 標記為刪除`, {
            id: displayItem.id,
            data_source: displayItem.data_source
          });
        }
      }
    });
  }

  onButtonClick(event: { rowData: any; field: string }, capType: string): void {
    const { rowData, field } = event;

    console.log(`🔘 按鈕點擊: ${field}`, rowData);

    // 直接根據 field 判斷要做什麼
    if (field === 'auto_calc') {
      this.doAutoCalculate(rowData, capType);
    } else if (field === 'copy_button') {
      this.copyFareItem(rowData, capType);
    }
  }

  /**
     * 自動計算邏輯
     */
  private doAutoCalculate(rowData: any, capType: string): void {
    console.log('🧮 開始自動計算');

    const totalAmount = parseFloat(rowData.tpy_totalamt) || 0;
    const periods = parseInt(rowData.period_nos) || 0;

    // 🔥 修正：期數 >= 1 即可，允許一個月內的情況
    if (totalAmount <= 0 || periods < 1) {
      this.messageService.warnBubble('請檢查總金額和期數');
      return;
    }

    // 🔥 新增：期數 = 1 時的特殊處理
    if (periods === 1) {
      this.calculationResult = {
        totalAmount,
        periods,
        monthlyAmount: totalAmount,
        downPayment: totalAmount,
        verification: totalAmount
      };
      this.currentRowData = rowData;
      this.currentCapType = capType;
      this.showCalculationDialog = true;
      return;
    }

    const monthlyAmount = Math.round(totalAmount / periods);
    const downPayment = Math.round(totalAmount - (monthlyAmount * (periods - 1)));

    // 設定對話框資料並顯示
    this.calculationResult = {
      totalAmount,
      periods,
      monthlyAmount,
      downPayment,
      verification: Math.round(downPayment + (monthlyAmount * (periods - 1)))
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
      this.messageService.successBubble(' 自動計算完成！');
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

    // console.log(` ${capType}類型資料狀態更新完成`);
  }

  private updateOriginalDataItem(updatedItem: any, capType: string): void {
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === updatedItem.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = {
        ...this.originalFareData[capType][originalIndex],
        ...updatedItem
      };
      // console.log(`🔄 已更新原始資料: ${capType}[${originalIndex}]`);
    }
  }


  //  關閉對話框
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

      // 特殊處理 tpy_type 欄位
      if (originalItem.tpy_type) {
        // 確保複製的 tpy_type 值有效
        const tpyTypeOptions = SHARED_DROPDOWN_OPTIONS.tpyTypeOption || [];
        const isValidOption = tpyTypeOptions.some(option => option.value === originalItem.tpy_type);

        if (isValidOption) {
          copiedItem.tpy_type = originalItem.tpy_type;
          console.log(`複製 tpy_type 成功: ${originalItem.tpy_type}`);
        } else {
          // 如果原值無效，設定為第一個可用選項或預設值
          copiedItem.tpy_type = tpyTypeOptions.length > 0 ? tpyTypeOptions[0].value : null;
          console.warn(`原 tpy_type 值無效，設定為預設值: ${copiedItem.tpy_type}`);
        }
      } else {
        // 如果原項目沒有 tpy_type，設定預設值
        const tpyTypeOptions = SHARED_DROPDOWN_OPTIONS.tpyTypeOption || [];
        copiedItem.tpy_type = tpyTypeOptions.length > 0 ? tpyTypeOptions[0].value : null;
        console.log(`設定預設 tpy_type: ${copiedItem.tpy_type}`);
      }

      // 🔥 新增：使用進階日期處理邏輯
      this.handleCopiedItemDates(copiedItem, originalItem);

      // 確保必要的數值欄位有預設值
      const numericFields = ['tpy_unitamt', 'tpy_qty', 'tpy_amount'];
      numericFields.forEach(field => {
        if (!copiedItem[field] || copiedItem[field] === null || isNaN(parseFloat(copiedItem[field]))) {
          if (field === 'tpy_qty') {
            copiedItem[field] = 1; // 數量預設為 1
          } else {
            copiedItem[field] = 0; // 其他數值欄位預設為 0
          }
          console.log(`設定 ${field} 預設值: ${copiedItem[field]}`);
        }
      });

      // 確保組織欄位有預設值
      if (!copiedItem.org_id && this.orgOptions.length > 0) {
        copiedItem.org_id = this.orgOptions[0].value;
        console.log(`設定預設組織: ${copiedItem.org_id}`);
      }

      // 確保發票欄位有預設值
      if (!copiedItem.gui_flag) {
        copiedItem.gui_flag = 'Y';
        console.log(`設定預設發票狀態: Y`);
      }

      // 清理不需要的屬性
      delete copiedItem._skipAutoCalc;
      delete copiedItem._dateInitialized;

      // 找到原始項目的位置，插入到下一個位置
      const originalIndex = this.originalFareData[capType].findIndex(item => item.id === originalItem.id);

      if (originalIndex !== -1) {
        // 插入到原始項目的下一個位置
        this.originalFareData[capType].splice(originalIndex + 1, 0, copiedItem);
        console.log(`已將複製項目插入到索引 ${originalIndex + 1}`);
      } else {
        // 如果找不到原始項目，就加到最後面（備用方案）
        this.originalFareData[capType].push(copiedItem);
        console.warn(`找不到原始項目，加到最後面`);
      }

      this.filterData();
      this.saveFareDataToWorkflow();

      this.messageService.successBubble(`已成功複製扣款項目「${originalItem.cap_name}」`);
      this.cdr.detectChanges();

      console.log(`複製完成: ${originalItem.cap_item} → ${newId}`, copiedItem);

      console.log('複製後的項目詳細資訊：', {
        id: copiedItem.id,
        is_selected: copiedItem.is_selected,
        _status: copiedItem._status,
        _editing: (copiedItem as any)._editing,
        _isEditing: (copiedItem as any)._isEditing,
        editing: (copiedItem as any).editing,
        _isNewRow: (copiedItem as any)._isNewRow
      });

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

  /**
   * 🔥 新增：處理複製項目的日期邏輯（復刻自 tls13010-next1）
   */
  private handleCopiedItemDates(copiedItem: any, originalItem: any): void {
    try {
      // 取得合約資訊
      const contractInfo = this.contractInfoData[0];

      // 結束日期：永遠設定為合約終止日
      if (contractInfo?.tlt_edate) {
        const contractEndDate = new Date(contractInfo.tlt_edate);

        if (!isNaN(contractEndDate.getTime())) {
          copiedItem.tpy_edate = contractEndDate;
          console.log(`✅ 複製項目結束日期：合約終止日 ${this.formatDateForLog(contractEndDate)}`);
        } else {
          copiedItem.tpy_edate = null;
          console.warn('⚠️ 合約終止日期無效');
        }
      } else {
        copiedItem.tpy_edate = null;
        console.warn('⚠️ 沒有合約終止日期');
      }

      // 處理起始日期：原項目結束日期的下個月，但要檢查是否超過合約終止日
      if (originalItem.tpy_edate && copiedItem.tpy_edate) {
        const originalEndDate = new Date(originalItem.tpy_edate);
        const contractEndDate = new Date(copiedItem.tpy_edate);

        if (!isNaN(originalEndDate.getTime())) {
          // 計算下個月
          const nextMonth = new Date(originalEndDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          // 檢查起始日期是否超過合約終止日
          if (nextMonth > contractEndDate) {
            console.warn(`⚠️ 複製項目起始日期 ${this.formatDateForLog(nextMonth)} 已超過合約終止日 ${this.formatDateForLog(contractEndDate)}，清空起始日期`);

            copiedItem.tpy_bdate = null;

            // 給用戶提示
            this.messageService.warnBubble('複製項目的起始日期會超過合約終止日，已清空起始日期，請手動設定');
          } else {
            copiedItem.tpy_bdate = nextMonth;
            console.log(`✅ 複製項目起始日期：${this.formatDateForLog(originalEndDate)} -> ${this.formatDateForLog(nextMonth)}`);
          }
        } else {
          copiedItem.tpy_bdate = null;
          console.warn('⚠️ 原項目結束日期無效，複製項目起始日期設為 null');
        }
      } else {
        copiedItem.tpy_bdate = null;
        console.warn('⚠️ 原項目沒有結束日期或合約終止日期，複製項目起始日期設為 null');
      }

    } catch (error) {
      console.error('❌ 處理複製項目日期時發生錯誤:', error);
      copiedItem.tpy_bdate = null;
      // tpy_edate 保持已設定的合約終止日，不清空
    }
  }

  /**
   * 🔥 新增：格式化日期用於 log
   */
  private formatDateForLog(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  onFieldChange(fieldName: string, newValue: any, rowData: any, capType?: string): void {
    // 專門處理 checkbox 勾選
    if (fieldName === 'is_selected') {
      // 🔥 關鍵修復:先更新項目的選擇狀態(_status)
      this.fareStatusService.updateItemSelectionStatus(rowData);

      console.log(`🔥 is_selected 變更: ${rowData.cap_item} (${capType})`, {
        newValue,
        _status: rowData._status,
        data_source: rowData.data_source
      });

      // 然後同步到 originalData
      this.updateOriginalData(capType || 'A');
      this.filterData();
      this.saveFareDataToWorkflow();

      // 🔥 新增：勾選狀態變更時，檢查整個類型的重複日期
      if (capType) {
        this.validateDuplicateDatesForType(capType);
      }
      return;
    }

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

    // 🔥 新增：取得合約日期範圍
    const contractRange = this.getContractDateRange();

    const validationResult = this.fareValidationService.validateSingleItem(
      rowData,
      capType,
      allItemsOfType,
      contractRange  // 傳入合約日期範圍
    );

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

  /**
   * 🔥 新增：驗證整個類型的重複日期（用於即時驗證）
   */
  private validateDuplicateDatesForType(capType: string): void {
    const allItemsOfType = this.originalFareData[capType] || [];

    // 先清除所有項目的重複日期錯誤標記
    allItemsOfType.forEach(item => {
      delete item['_hasDuplicateDateError'];
      delete item['_duplicateDateMessage'];
    });

    // 重新驗證（驗證服務會自動標記重複的項目）
    this.fareValidationService.validateFareTypeData(allItemsOfType, capType);

    // 強制更新視圖
    this.cdr.detectChanges();
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
      //  關鍵：確保預設值存在
      if (!rowData.tpy_qty || rowData.tpy_qty === 0) {
        rowData.tpy_qty = 1;
        console.log('A類型計算：自動設定數量預設值為 1');
      }

      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 1; // 確保數量至少為 1

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

      // 🔥 新增：起始日期變更時，檢查重複日期
      if (rowData.is_selected) {
        this.validateDuplicateDatesForType('A');
      }
    }
  }


  // B類型計算優化
  private handleTypeBCalculation(fieldName: string, newValue: any, rowData: any): void {
    if (fieldName === 'tpy_type' && newValue === '01') {
      const totalSpace = this.getTotalLocationSpace();
      if (totalSpace > 0) {
        rowData.tpy_qty = totalSpace;
      }
    }

    if (['tpy_unitamt', 'tpy_qty', 'tpy_type'].includes(fieldName)) {
      //  同樣確保預設值
      if (!rowData.tpy_qty || rowData.tpy_qty === 0) {
        rowData.tpy_qty = 1;
      }

      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 1;

      if (unitPrice > 0 && quantity > 0) {
        rowData.tpy_amount = unitPrice * quantity;
      } else {
        rowData.tpy_amount = 0;
      }
    }

    // 🔥 新增：起始日期變更時，檢查重複日期
    if (fieldName === 'tpy_bdate' && newValue && rowData.is_selected) {
      this.validateDuplicateDatesForType('B');
    }
  }

  // C類型計算優化 - 最重要的優化
  private handleTypeCCalculation(fieldName: string, newValue: any, rowData: any): void {
    // console.log(`🆂 C類型平均分攤計算: ${fieldName} = ${newValue}`);

    // 日期變更時重新計算期數
    if (['tpy_bdate', 'tpy_edate'].includes(fieldName)) {
      console.log('📅 日期欄位變更，重新計算期數');

      // 🔥 新增：起始日期變更時，檢查重複日期
      if (fieldName === 'tpy_bdate' && rowData.is_selected) {
        this.validateDuplicateDatesForType('C');
      }

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

    // 金額相關欄位變更時的計算
    const calculationFields = ['tpy_totalamt', 'period_nos', 'tpy_amount', 'down_payment'];
    if (calculationFields.includes(fieldName)) {
      this.fareCalculationService.autoCalculateAmount(rowData, 'C', fieldName);

      // 驗證計算結果
      const isValid = this.fareCalculationService.isCalculationValid(rowData, 'C');
      if (isValid) {
        console.log(` C類型計算成功: 總額=${rowData.tpy_totalamt}, 期數=${rowData.period_nos}, 月額=${rowData.tpy_amount}, 首期=${rowData.down_payment}`);
      } else {
        console.warn(`⚠️ C類型計算結果可能有誤`);
      }
    }
  }

  // D/E類型計算優化
  private handleTypeDCalculation(fieldName: string, newValue: any, rowData: any): void {
    if (fieldName === 'tpy_rate') {
      this.fareCalculationService.autoCalculateAmount(rowData, 'D', fieldName);
    }

    // 🔥 新增：起始日期變更時，檢查重複日期
    if (fieldName === 'tpy_bdate' && newValue && rowData.is_selected) {
      this.validateDuplicateDatesForType('D');
    }
  }

  private handleTypeECalculation(fieldName: string, newValue: any, rowData: any): void {
    if (fieldName === 'tpy_rate') {
      this.fareCalculationService.autoCalculateAmount(rowData, 'E', fieldName);
    }

    // 🔥 新增：起始日期變更時，檢查重複日期
    if (fieldName === 'tpy_bdate' && newValue && rowData.is_selected) {
      this.validateDuplicateDatesForType('E');
    }
  }

  //  計算期數的輔助方法
  private updatePeriodNumbers(rowData: any): void {
    console.log('📊 開始更新期數...', {
      開始日期: rowData.tpy_bdate,
      結束日期: rowData.tpy_edate
    });

    if (rowData.tpy_bdate && rowData.tpy_edate) {
      let startDate: Date;
      let endDate: Date;

      // 智能日期解析（支援 YYYYMM 格式）
      try {
        // 🔥 處理起始日期
        if (rowData.tpy_bdate instanceof Date) {
          startDate = rowData.tpy_bdate;
        } else {
          // 🔥 新增：處理 YYYYMM 格式字串
          const startStr = String(rowData.tpy_bdate).trim();
          if (/^\d{6}$/.test(startStr)) {
            // YYYYMM 格式 (例如: "202510")
            const year = parseInt(startStr.substring(0, 4));
            const month = parseInt(startStr.substring(4, 6)) - 1; // 月份是 0-based
            startDate = new Date(year, month, 1);
            console.log(`🔄 轉換 YYYYMM 格式起始日期: ${startStr} → ${year}/${month + 1}`);
          } else {
            startDate = new Date(rowData.tpy_bdate);
          }
        }

        // 🔥 處理結束日期
        if (rowData.tpy_edate instanceof Date) {
          endDate = rowData.tpy_edate;
        } else {
          // 🔥 新增：處理 YYYYMM 格式字串
          const endStr = String(rowData.tpy_edate).trim();
          if (/^\d{6}$/.test(endStr)) {
            // YYYYMM 格式 (例如: "202511")
            const year = parseInt(endStr.substring(0, 4));
            const month = parseInt(endStr.substring(4, 6)) - 1; // 月份是 0-based
            endDate = new Date(year, month, 1);
            console.log(`🔄 轉換 YYYYMM 格式結束日期: ${endStr} → ${year}/${month + 1}`);
          } else {
            endDate = new Date(rowData.tpy_edate);
          }
        }

        // 檢查日期有效性
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('⚠️ 無效的日期格式', {
            原始起始: rowData.tpy_bdate,
            原始結束: rowData.tpy_edate,
            轉換後起始: startDate,
            轉換後結束: endDate
          });
          return;
        }

        // 計算期數
        if (startDate <= endDate) {
          const calculatedPeriods = this.calculateMonthsBetween(startDate, endDate);
          const oldPeriods = rowData.period_nos;

          rowData.period_nos = calculatedPeriods;

          console.log(` 期數更新: ${oldPeriods} → ${calculatedPeriods}`);

          // 如果期數變化，觸發C類型重新計算
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

  //  計算兩個日期間的月數
  private calculateMonthsBetween(startDate: Date, endDate: Date): number {
    // 🔥 新增：檢查 Date 物件是否有效
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('❌ calculateMonthsBetween: 無效的日期物件', { startDate, endDate });
      return 1;
    }

    console.log('📅 計算期數:', {
      開始: startDate.toISOString().slice(0, 7),
      結束: endDate.toISOString().slice(0, 7)
    });

    // 確保開始日期 <= 結束日期
    if (startDate > endDate) {
      console.warn('⚠️ 開始日期大於結束日期，期數為 1');
      return 1; // 🔥 修改：改為回傳 1 而不是 0
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth(); // 0-based
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth(); // 0-based

    // 🔥 新增：檢查年份是否合理（避免 202511 這種錯誤）
    if (startYear > 9999 || endYear > 9999) {
      console.error('❌ 日期年份異常:', {
        開始年: startYear,
        結束年: endYear,
        原始開始日期: startDate,
        原始結束日期: endDate
      });
      return 1;
    }

    // 正確的月份差計算公式
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


  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    console.log(`💾 ${capType}類型表格儲存:`, event.newData);

    const { newData } = event;

    // 根據類型執行最終計算
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
    this.crudModeService.setCrudStatus(this.crudstatus);
    this.saveFareDataToWorkflow();
  }
  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);

    //  移除這行，因為預設值已經在載入時設定完成
    // this.ensureDefaultValues(rowData, capType);

    // 只保留必要的工作流程儲存
    this.saveFareDataToWorkflow();
  }

  private ensureDefaultValues(item: any, capType: string): void {
    //  使用資料服務套用預設值
    this.fareDataService.applyDynamicDefaults(item, this.contractInfoData);
  }


  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onBeforeSave(event: { data: any, preventDefault: () => void }, capType: string): void {
    const { data } = event;

    // 只對已勾選的項目進行驗證
    if (data.is_selected) {
      const allItemsOfType = this.originalFareData[capType] || [];

      // 🔥 新增：取得合約日期範圍
      const contractRange = this.getContractDateRange();

      const validationResult = this.fareValidationService.validateSingleItem(
        data,
        capType,
        allItemsOfType,
        contractRange  // 傳入合約日期範圍
      );

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
    // 從工作流程服務取得 CRU 資料
    const cruData = this.flowService.getCruData();

    if (!cruData || !cruData.locationInfo || !Array.isArray(cruData.locationInfo)) {
      console.log('沒有位置資料可計算坪數');
      return 0;
    }

    // 計算所有有效位置的坪數總和
    const totalSpace = cruData.locationInfo
      .filter((item: any) =>
        item._status !== 'deleted' && // 排除已刪除的項目
        item.location_no && // 確保有位置編號
        item.location_no.trim() !== '' // 位置編號不是空字串
      )
      .reduce((total: number, item: any) => {
        const space = parseFloat(item.tlt_space) || 0;
        return total + space;
      }, 0);

    console.log('計算位置總坪數:', {
      位置數量: cruData.locationInfo.length,
      有效位置: cruData.locationInfo.filter((item: any) =>
        item._status !== 'deleted' && item.location_no && item.location_no.trim() !== ''
      ).length,
      總坪數: totalSpace
    });

    return totalSpace;
  }

  //  新增方法：自動設定和同步 org_id
  private async setDefaultOrgId(): Promise<void> {
    // 確保 orgOptions 已載入
    if (!this.orgOptions.length) {
      await this.loadOrgOptionsAsync();
    }

    // 從前面步驟獲取當前選擇的 org_id
    const currentSelectedOrgId = this.getPreviousSelectedOrgId();

    if (!currentSelectedOrgId) {
      console.log('⚠️ 沒有找到選擇的 org_id');
      return;
    }

    // 檢查是否需要更新
    const needsUpdate = this.checkIfOrgIdNeedsUpdate(currentSelectedOrgId);

    if (needsUpdate) {
      this.applyOrgIdToAllItems(currentSelectedOrgId);
      console.log('✅ 自動同步 org_id:', currentSelectedOrgId);
    } else {
      console.log('✅ org_id 已是最新，無需更新');
    }
  }

  //  新增方法：獲取前面步驟選擇的 org_id
  private getPreviousSelectedOrgId(): string | null {
    // 從工作流程或 CRU 資料中獲取
    const cruData = this.flowService.getCruData();
    return cruData?.org_id || null;
  }

  //  新增方法：檢查是否需要更新 org_id
  private checkIfOrgIdNeedsUpdate(currentOrgId: string): boolean {
    // 檢查所有扣款項目是否都已設定為當前的 org_id
    let hasIncorrectOrgId = false;

    Object.keys(this.fareData).forEach(capType => {
      this.fareData[capType].forEach(item => {
        if (!item.org_id || item.org_id !== currentOrgId) {
          hasIncorrectOrgId = true;
        }
      });
    });

    return hasIncorrectOrgId;
  }

  //  新增方法：應用 org_id 到所有項目
  private applyOrgIdToAllItems(orgId: string): void {
    let updatedCount = 0;

    // 更新當前顯示的資料
    Object.keys(this.fareData).forEach(capType => {
      this.fareData[capType].forEach(item => {
        if (item.org_id !== orgId) {
          item.org_id = orgId;
          // 標記為已修改（如果原本就是 new 就保持 new）
          if (item._status !== 'new') {
            item._status = 'modified';
          }
          updatedCount++;
        }
      });
    });

    // 同步到原始資料
    Object.keys(this.originalFareData).forEach(capType => {
      this.originalFareData[capType].forEach(item => {
        if (item.org_id !== orgId) {
          item.org_id = orgId;
        }
      });
    });

    console.log(`🔄 已自動更新 ${updatedCount} 項扣款項目的 org_id`);

    // 儲存到工作流程
    this.saveFareDataToWorkflow();
  }

  //  新增方法：異步載入 org options
  private async loadOrgOptionsAsync(): Promise<void> {
    return new Promise((resolve) => {
      const subscription = this.locationOptionsService.getOrgOptions().subscribe({
        next: (options) => {
          this.orgOptions = options;

          //  強制清除所有快取，確保重新生成欄位定義
          this.clearColumnCache();

          //  觸發變更檢測
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('載入組織選項失敗:', error);
          this.messageService.warnBubble('載入組織選項失敗');
          this.orgOptions = [];
          resolve(); // 即使失敗也要 resolve，避免卡住
        }
      });

      this.subscriptions.push(subscription);
    });
  }

  //  新增方法：檢查缺少 org_id 的項目
  private findItemsWithoutOrgId(): any[] {
    const missingItems: any[] = [];

    Object.keys(this.fareData).forEach(capType => {
      this.fareData[capType].forEach(item => {
        if (item.is_selected && !item.org_id) {
          missingItems.push({ item, capType });
        }
      });
    });

    return missingItems;
  }

  //  新增：簡單直接的 org_id 同步方法
  private syncOrgIdFromPrevious(): void {
    // 從前面步驟獲取當前選擇的 org_id
    const currentSelectedOrgId = this.getPreviousSelectedOrgId();

    if (!currentSelectedOrgId) {
      console.log('⚠️ 沒有找到選擇的 org_id，跳過同步');
      return;
    }

    console.log('🔄 開始同步 org_id:', currentSelectedOrgId);

    let updatedCount = 0;

    // 無條件更新所有項目的 org_id
    Object.keys(this.fareData).forEach(capType => {
      this.fareData[capType].forEach(item => {
        if (item.org_id !== currentSelectedOrgId) {
          item.org_id = currentSelectedOrgId;
          // 標記為已修改（如果原本就是 new 就保持 new）
          if (item._status !== 'new') {
            item._status = 'modified';
          }
          updatedCount++;
        }
      });
    });

    // 同步到原始資料
    Object.keys(this.originalFareData).forEach(capType => {
      this.originalFareData[capType].forEach(item => {
        if (item.org_id !== currentSelectedOrgId) {
          item.org_id = currentSelectedOrgId;
        }
      });
    });

    console.log(`✅ org_id 同步完成，共更新 ${updatedCount} 個項目`);

    // 儲存到工作流程
    this.saveFareDataToWorkflow();
  }

  /**
   * 🔥 新增：驗證所有已選中的扣款類型
   */
  private validateAllSelectedFareTypes(): { isValid: boolean, errors: string[] } {
    const allErrors: string[] = [];
    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    // 🔥 取得合約日期範圍
    const contractRange = this.getContractDateRange();

    capTypes.forEach(capType => {
      const typeData = this.originalFareData[capType] || [];
      const selectedItems = typeData.filter(item => item.is_selected);

      if (selectedItems.length > 0) {
        console.log(`🔍 驗證 ${capType} 類型，已選項目: ${selectedItems.length} 筆`);

        const validationResult = this.fareValidationService.validateFareTypeData(
          typeData,
          capType,
          contractRange  // 傳入合約日期範圍
        );

        if (!validationResult.isValid) {
          const typeName = this.getCapTypeName(capType);
          allErrors.push(`【${typeName}】`);
          allErrors.push(...validationResult.errors.map(error => `  • ${error}`));
          allErrors.push(''); // 空行分隔
        }
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * 🔥 新增：取得合約日期範圍(用於驗證)
   */
  private getContractDateRange() {
    const contractInfo = this.contractInfoData[0];

    return {
      tlt_bdate: contractInfo?.tlt_bdate || null,
      tlt_edate: contractInfo?.tlt_edate || null
    };
  }

  /**
   * 🔥 新增：顯示驗證錯誤訊息
   */
  private showValidationErrors(errors: string[]): void {
    const errorMessage = [
      '❌ 資料驗證失敗，請修正以下問題：',
      '',
      ...errors,
      '請修正上述問題後再進行下一步。'
    ].join('\n');

    this.messageService.warnBubble(errorMessage);
  }

  /**
   * 🔥 新增：導航到下一步(共用邏輯)
   */
  private navigateToNextStep(): void {
    try {
      // 儲存當前資料
      this.saveFareDataToWorkflow();

      const navigationExtras: NavigationExtras = {
        state: {
          crudstatus: this.crudstatus,
          fromRoute: this.router.url
        }
      };

      // 根據合約類型決定導航目標
      const tltTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();
      if (tltTermType === '1') {
        console.log('🔍 合約類型為固定租金(1)，直接跳轉到 next3');
        this.router.navigate(['account/tls/tls12040next3'], navigationExtras);
      } else {
        console.log('🔍 合約類型非固定租金，跳轉到 next2');
        this.router.navigate(['account/tls/tls12040next2'], navigationExtras);
      }
    } catch (error) {
      console.error('❌ 導航時發生錯誤:', error);
      this.messageService.warnBubble('儲存資料失敗，無法前往下一步');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
