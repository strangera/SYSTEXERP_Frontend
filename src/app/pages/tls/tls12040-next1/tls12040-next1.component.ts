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

  ) {
    super();
  }

  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initializePage('TLS12040', this.dataForm);
    console.log('=== CRUD 狀態調試 ===');
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('路由狀態:', this.router.lastSuccessfulNavigation?.extras?.state);
    console.log('isReadOnlyMode:', this.isReadOnlyMode);
    console.log('isEditMode:', this.isEditMode);
    console.log('isCreateMode:', this.isCreateMode);

    this.initializeDataStructure();
    this.contractInfoColumns = TLS12040FareColumnDefinitions.getContractInfoColumns();

    // 加入載入組織選項
    this.loadOrgOptions();

    // 載入工作流程資料
    this.loadWorkflowDataWithRetry();
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
    console.log('載入組織選項...');

    const subscription = this.locationOptionsService.getOrgOptions().subscribe({
      next: (options) => {
        console.log('組織選項載入成功:', options);
        this.orgOptions = options;

        // 🔥 強制清除所有快取，確保重新生成欄位定義
        this.clearColumnCache();

        // 🔥 觸發變更檢測
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

  private clearColumnCache(): void {
    console.log('🗑️ 清除欄位定義快取');
    this._cachedDeductionAColumns = null;
    this._cachedDeductionBColumns = null;
    this._cachedDeductionCColumns = null;
    this._cachedDeductionDColumns = null;
    this._cachedDeductionEColumns = null;

    // 重置快取標記
    this._lastOrgOptionsLength = -1;
  }

  private loadWorkflowDataWithRetry(retryCount: number = 0): void {
    console.log('開始載入工作流程資料，重試次數:', retryCount);
    console.log('當前 CRUD 狀態:', this.crudstatus);

    // 從 SessionStorage 獲得正確的 applyNo
    const saved = sessionStorage.getItem('TLS12040_FLOW');
    let realApplyNo = '';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.stepData && Array.isArray(parsed.stepData)) {
          const cruEntry = parsed.stepData.find(([key]: [string, any]) => key === 'cru');
          if (cruEntry && cruEntry[1]?.data?.apply_no) {
            realApplyNo = cruEntry[1].data.apply_no;
          }
        }
      } catch (error) {
        console.error('解析 SessionStorage 失敗:', error);
      }
    }

    // 檢查工作流程服務狀態
    const currentState = this.flowService.getCurrentState();

    if (realApplyNo) {
      this.currentApplyNo = realApplyNo;
      console.log('設定 applyNo:', this.currentApplyNo);
    } else if (currentState.applyNo) {
      this.currentApplyNo = currentState.applyNo;
    } else {
      // 新增模式下 applyNo 為空
      this.currentApplyNo = '';
      console.log('新增模式，applyNo 為空');
    }

    // 載入合約資訊
    this.loadContractInfo();

    // 載入扣款資料（不管有沒有 apply_no 都要呼叫 API）
    this.loadFareDataFromAPI();
  }

  private loadFareDataWithPriority(): void {
    console.log('開始優先級載入扣款資料...');

    // 🆕 新增模式直接初始化空資料
    if (this.isCreateMode) {
      console.log('新增模式：直接初始化空扣款資料');
      this.initializeEmptyData();
      return;
    }

    // 1. 優先檢查 Next1 步驟的暫存資料
    const savedNext1Data = this.flowService.getNext1Data<Next1Data>();
    console.log('檢查 Next1 暫存資料:', savedNext1Data);

    if (savedNext1Data?.fareData && this.hasValidFareData(savedNext1Data.fareData)) {
      console.log('✅ 使用 Next1 暫存的扣款資料');
      this.originalFareData = { ...savedNext1Data.fareData };
      this.filterData();
      this.verifyDataIntegrity();
      return;
    }

    // 2. 真的沒有暫存才從 API 載入
    console.log('沒有暫存資料，從 API 載入');
    this.loadFareDataFromAPI();
  }

  /**
 * 🆕 新增：更嚴格的資料有效性檢查
 */
  private hasValidAndCompleteData(fareData: any): boolean {
    if (!fareData || typeof fareData !== 'object') {
      console.log('扣款資料格式無效');
      return false;
    }

    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    let hasAnyData = false;
    let totalItems = 0;
    let hasUserModifications = false; // 檢查是否有使用者修改

    for (const capType of capTypes) {
      if (fareData[capType] && Array.isArray(fareData[capType])) {
        const items = fareData[capType];
        totalItems += items.length;

        if (items.length > 0) {
          hasAnyData = true;

          // 檢查是否有使用者修改的痕跡
          const hasSelectedItems = items.some(item => item.is_selected);
          const hasModifiedItems = items.some(item =>
            item._status === 'new' ||
            item._status === 'modified' ||
            item._isCopiedItem
          );

          if (hasSelectedItems || hasModifiedItems) {
            hasUserModifications = true;
          }
        }
      }
    }

    const isValid = hasAnyData && (hasUserModifications || totalItems > 0);

    console.log('扣款資料詳細檢查:', {
      hasValidStructure: true,
      hasAnyData,
      totalItems,
      hasUserModifications,
      isValid,
      dataKeys: Object.keys(fareData)
    });

    return isValid;
  }

  /**
   * 🆕 新增：深度複製扣款資料，避免引用問題
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
   * 🆕 新增：還原已選擇狀態
   */
  private restoreSelectionStates(savedData: Next1Data): void {
    if (!savedData.selectedItems || !Array.isArray(savedData.selectedItems)) {
      console.log('沒有已選擇項目需要還原');
      return;
    }

    const restoredCount = savedData.selectedItems.length;
    console.log(`🔄 還原 ${restoredCount} 個已選擇項目的狀態`);

    // 確保選擇狀態正確同步
    savedData.selectedItems.forEach(selectedItem => {
      const capType = selectedItem.cap_type;
      const targetItem = this.originalFareData[capType]?.find(item => item.id === selectedItem.id);

      if (targetItem) {
        targetItem.is_selected = true;
        console.log(`✅ 還原選擇狀態: ${capType} - ${selectedItem.cap_name || selectedItem.cap_item}`);
      }
    });
  }

  /**
 * 簡化的資料有效性檢查
 */
  private hasValidFareData(fareData: any): boolean {
    if (!fareData || typeof fareData !== 'object') {
      return false;
    }

    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    let hasAnyData = false;

    for (const capType of capTypes) {
      if (fareData[capType] && Array.isArray(fareData[capType]) && fareData[capType].length > 0) {
        hasAnyData = true;
        break;
      }
    }

    console.log('扣款資料有效性檢查:', {
      hasValidStructure: true,
      hasAnyData,
      dataKeys: Object.keys(fareData)
    });

    return hasAnyData;
  }
  /**
   * 🆕 新增：資料完整性驗證
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
    const cruData = this.flowService.getCruData<SimpleContractInfo>();
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
      apply_no: this.currentApplyNo || '', // 新增模式時為空字串
      showAll: true
    };

    console.log('API 查詢參數:', queryParams);

    const subscription = this.tls12040Service.queryTLS12040Fare(queryParams).subscribe({
      next: (response) => {
        console.log('API 回傳扣款資料:', response);

        try {
          if (response?.Data?.FaresByType) {
            this.processAPIData(response.Data.FaresByType);
            console.log('API 資料處理完成');

            // API 載入成功後，立即儲存到工作流程
            this.saveFareDataToWorkflow();
          } else {
            console.log('API 沒有回傳扣款資料，初始化空資料');
            this.initializeEmptyData();
          }
        } catch (error) {
          console.error('處理 API 資料時發生錯誤:', error);
          this.messageService.warnBubble('處理扣款資料時發生錯誤');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
        this.verifyDataIntegrity();
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入扣款資料失敗，請稍後重試');
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

  // 儲存到工作流程
  private saveFareDataToWorkflow(): void {
    try {
      console.log('準備儲存 Next1 資料到工作流程...');

      if (!this.hasAnyData()) {
        console.log('沒有資料需要儲存');
        return;
      }

      const next1Data: Next1Data = {
        fareData: { ...this.originalFareData },
        selectedItems: this.getSelectedItems(),
        contractInfo: this.currentContractData,
        timestamp: new Date().getTime(),
        applyNo: this.currentApplyNo
      };

      // 儲存到工作流程服務
      const saveResult = this.flowService.setNext1Data(next1Data);

      if (saveResult) {
        console.log('✅ Next1 資料已儲存到工作流程:', {
          扣款項目總數: this.getTotalItemCount(),
          已選項目數: this.getTotalSelectedCount(),
          時間戳: new Date(next1Data.timestamp).toLocaleString()
        });
      }

    } catch (error) {
      console.error('儲存 Next1 資料失敗:', error);
      this.messageService.warnBubble('儲存扣款資料失敗');
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
    console.log('🚀 準備前往下一步');

    try {
      // 儲存當前資料
      this.saveFareDataToWorkflow();

      // 驗證是否有選中的項目
      // const selectedCount = this.getTotalSelectedCount();
      // if (selectedCount === 0) {
      //   this.messageService.warnBubble('請至少選擇一個扣款項目');
      //   return;
      // }

      const navigationExtras: NavigationExtras = {
        state: {
          crudstatus: this.crudstatus, // 確保這裡有設定現有狀態
          fromRoute: this.router.url
        }
      };

      this.router.navigate(['account/tls/tls12040next2'], navigationExtras);

    } catch (error) {
      console.error('❌ 前往下一步時發生錯誤:', error);
      this.messageService.warnBubble('儲存資料失敗，無法前往下一步');
    }
  }

  override onCancel(): void {
    console.log('⬅️ 返回上一步');

    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus,
        fromRoute: this.router.url
      }
    };

    try {
      // 確保資料已儲存
      this.saveFareDataToWorkflow();

      // 等待一下確保儲存完成
      setTimeout(() => {
        this.router.navigate(['account/tls/tls12040cru'], navigationExtras);
      }, 100);

    } catch (error) {
      console.error('❌ 返回上一步時發生錯誤:', error);
      // 即使儲存失敗也要導航回去且帶上狀態
      this.router.navigate(['account/tls/tls12040cru'], navigationExtras);
    }
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
      console.log('重新載入資料，當前模式:', this.crudstatus);

      // 直接重新呼叫 API 載入
      this.loadFareDataFromAPI();

      this.messageService.infoBubble('已重新載入資料');
    }
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

      console.log('🔄 重新生成 deductionAColumns');
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

      console.log('🔄 重新生成 deductionBColumns');
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

      console.log('🔄 重新生成 deductionCColumns');
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
      this._lastViewMode !== this.isReadOnlyMode ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      console.log('🔄 重新生成 deductionDColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
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

      console.log('🔄 重新生成 deductionEColumns');
      let columns = TLS12040FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = TLS12040FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
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
    this._lastViewMode = this.isReadOnlyMode;
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

    if (totalAmount <= 0 || periods <= 1) {
      this.messageService.warnBubble('請檢查總金額和期數');
      return;
    }

    const monthlyAmount = Math.round(totalAmount / periods);
    const downPayment = totalAmount - (monthlyAmount * (periods - 1));

    // 設定對話框資料並顯示
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

      // 日期複製：只複製合理的日期，異常日期設為 null
      ['tpy_bdate', 'tpy_edate'].forEach(dateField => {
        if (originalItem[dateField]) {
          if (originalItem[dateField] instanceof Date) {
            if (this.isValidDateRange(originalItem[dateField])) {
              copiedItem[dateField] = new Date(originalItem[dateField]);
              console.log(`${dateField} 日期複製成功`);
            } else {
              copiedItem[dateField] = null;
              console.warn(`${dateField} 日期異常，設為 null`);
            }
          } else {
            // 非 Date 物件直接保持原值，讓顯示邏輯處理
            copiedItem[dateField] = originalItem[dateField];
            console.log(`${dateField} 保持原始格式`);
          }
        }
      });

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
      // 🔥 關鍵：確保預設值存在
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
      // 🔥 同樣確保預設值
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
  }

  // C類型計算優化 - 最重要的優化
  private handleTypeCCalculation(fieldName: string, newValue: any, rowData: any): void {
    console.log(`🆂 C類型平均分攤計算: ${fieldName} = ${newValue}`);

    // 日期變更時重新計算期數
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

    // 金額相關欄位變更時的計算
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

  // D/E類型計算優化
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

      // 智能日期解析
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

    // 正確的月份差計算公式
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

    this.saveFareDataToWorkflow();
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
    // 從工作流程服務取得 CRU 資料
    const cruData = this.flowService.getCruData<any>();

    if (!cruData || !cruData.locationData || !Array.isArray(cruData.locationData)) {
      console.log('沒有位置資料可計算坪數');
      return 0;
    }

    // 計算所有有效位置的坪數總和
    const totalSpace = cruData.locationData
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
      位置數量: cruData.locationData.length,
      有效位置: cruData.locationData.filter((item: any) =>
        item._status !== 'deleted' && item.location_no && item.location_no.trim() !== ''
      ).length,
      總坪數: totalSpace
    });

    return totalSpace;
  }

  ngOnDestroy(): void {
    console.log('TLS12040Next1Component 銷毀');
    this.saveFareDataToWorkflow();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}

