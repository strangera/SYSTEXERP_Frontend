import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { DialogComponent } from "@shared/componentkit/dialog/dialog.component";
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';
import { ContractInfo, FareItem, WorkflowStep } from '../tls13010/tls13010.model';
import { FareCalculationService } from './Services/fare-calculation.service';
import { FareColumnDefinitions } from './Services/fare-column-definitions';
import { FareDataService } from './Services/fare-data.service';
import { FareDefaultsService } from './Services/fare-defaults.service';
import { FareStatusService } from './Services/fare-status.service';
import { FareValidationService } from './Services/fare-validation.service';
import { DateUtils } from 'src/app/core/utils/date-utils';


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
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, NgFor, DialogComponent]
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  payNoOptions: any[] = [];

  private _lastPayNoOptionsLength = 0;
  forceEditMode: boolean = true;

  //  對話框相關屬性
  showCalculationDialog: boolean = false;
  calculationResult: any = null;
  currentRowData: any = null;
  currentCapType: string = '';

  // 將 CRUDStatus 暴露給模板使用
  readonly CRUDStatus = CRUDStatus;

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

  showModeByType: { [key: string]: 'common' | 'all' } = {
    'A': 'common',
    'B': 'common',
    'C': 'common',
    'D': 'common',
    'E': 'common'
  };

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
    private fareCalculationService: FareCalculationService,
    private fareDataService: FareDataService,
    private fareStatusService: FareStatusService,
    private cdr: ChangeDetectorRef,
    private fareValidationService: FareValidationService,
    private tls13010DropdownService: TLS13010DropdownService,
    private fareDefaultsService: FareDefaultsService
  ) {
    super();
  }

  get shouldForceEdit(): boolean {
    return this.crudstatus !== CRUDStatus.Read; // 檢視模式時關閉常駐編輯
  }


  // ==========  欄位定義 getter (取代原有的屬性) ==========
  get contractInfoColumns(): ColumnDef[] {
    if (!this._cachedContractInfoColumns || this._lastContractInfoLength !== this.contractInfoData.length) {
      // console.log('🔄 重新生成 contractInfoColumns');
      this._cachedContractInfoColumns = FareColumnDefinitions.getContractInfoColumns();
      this._lastContractInfoLength = this.contractInfoData.length;
    }
    return this._cachedContractInfoColumns;
  }

  get deductionAColumns(): ColumnDef[] {
    if (!this._cachedDeductionAColumns ||
      this._lastOrgOptionsLength !== this.orgOptions.length ||
      this._lastViewMode !== (this.crudstatus === CRUDStatus.Read) ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionAColumns');
      let columns = FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.crudstatus === CRUDStatus.Read) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
      }
      this._cachedDeductionAColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionAColumns;
  }

  get deductionBColumns(): ColumnDef[] {
    if (!this._cachedDeductionBColumns ||
      this._lastViewMode !== (this.crudstatus === CRUDStatus.Read) ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionBColumns');
      let columns = FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      if (this.crudstatus === CRUDStatus.Read) {
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
      this._lastViewMode !== (this.crudstatus === CRUDStatus.Read) ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      // console.log('🔄 重新生成 deductionCColumns');
      let columns = FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      if (this.crudstatus === CRUDStatus.Read) {
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
      this._lastPayNoOptionsLength !== this.payNoOptions.length ||  // 加這行
      this._lastViewMode !== (this.crudstatus === CRUDStatus.Read) ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      let columns = FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      columns = FareColumnDefinitions.updatePayNoOptionsInColumns(columns, this.payNoOptions); // 加這行

      if (this.crudstatus === CRUDStatus.Read) {
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
      this._lastPayNoOptionsLength !== this.payNoOptions.length ||  // 加這行
      this._lastViewMode !== (this.crudstatus === CRUDStatus.Read) ||
      this._lastContractInfoLength !== this.contractInfoData.length) {

      let columns = FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      columns = FareColumnDefinitions.updateOrgOptionsInColumns(columns, this.orgOptions);
      columns = FareColumnDefinitions.updatePayNoOptionsInColumns(columns, this.payNoOptions); // 加這行

      if (this.crudstatus === CRUDStatus.Read) {
        columns = FareColumnDefinitions.setColumnsReadonly(columns, true);
      }

      this._cachedDeductionEColumns = columns;
      this._updateCacheFlags();
    }
    return this._cachedDeductionEColumns;
  }

  private _updateCacheFlags(): void {
    this._lastOrgOptionsLength = this.orgOptions.length;
    this._lastPayNoOptionsLength = this.payNoOptions.length;
    this._lastViewMode = (this.crudstatus === CRUDStatus.Read);
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
    window.scrollTo(0, 0);
    this.showMode = 'common';
    this.initializeViewModeFromService();
    this.initializeDataStructure();
    this.initializePage('TLS13010', this.dataForm);
    this.loadOrgOptions();
    this.loadPayNoOptions();
    try {
      this.loadWorkflowData();
    } catch (error) {
      console.error('❌ loadWorkflowData 失敗:', error);
    }
    // this.routerSubscription = this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe(() => {
    //     this.loadWorkflowData();
    //   });
  }

  ngOnDestroy(): void {
    // console.log('📄 NEXT1 組件銷毀，確保資料儲存');
    this.saveFareDataToWorkflow();

    // if (this.routerSubscription) {
    //   this.routerSubscription.unsubscribe();
    // }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadWorkflowData(): void {
    try {
      if (!this.contractFlowService) {
        console.error('❌ contractFlowService 未注入');
        return;
      }
      // console.log('✅ contractFlowService 存在');

      // console.log('📋 步驟 2: 取得工作流程資料...');
      const workflowData = this.contractFlowService.getCurrentData();
      // console.log('📋 工作流程資料:', workflowData);

      // console.log('📋 步驟 3: 檢查是否有有效資料...');
      const hasContractId = workflowData.contractId;
      const isNewMode = this.contractFlowService.isNewContractMode();
      // console.log('📋 hasContractId:', hasContractId);
      // console.log('📋 isNewMode:', isNewMode);

      if (hasContractId || isNewMode) {

        const modeInfo = this.contractFlowService.getWorkflowModeInfo();

        this.currentTalentId = modeInfo.talentId;
        this.currentContractData = workflowData?.queryRowData;
        this.setupTotalLocationSpace();
        this.prepareContractInfoDisplay();
        this.initializeDataStructure();

        this.loadFareDataWithPriority();
      } else {
        this.router.navigate(['account/tls/tls13010cru']);
      }
    } catch (error) {
      console.error('❌ loadWorkflowData 頂層異常:', error);
    }
  }

  private loadOrgOptions(): void {
    // console.log('📄 開始載入組織選項...');

    const subscription = this.locationOptionsService.getOrgOptions().subscribe({
      next: (options) => {
        // console.log('✅ 組織選項載入成功:', options);
        this.orgOptions = options;
        //  載入完成後清除快取
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

  /**
  * 載入支付編號選項
  */
  private loadPayNoOptions(): void {
    console.log('📄 開始載入支付編號選項...');
    console.log('🔍 初始 payNoOptions 長度:', this.payNoOptions.length);

    // 先嘗試直接取得
    this.payNoOptions = this.tls13010DropdownService.getPayNoOptions();

    console.log('🔍 直接取得後的 payNoOptions:', this.payNoOptions);
    console.log('🔍 payNoOptions 長度:', this.payNoOptions.length);

    if (this.payNoOptions.length > 0) {
      console.log('✅ 支付編號選項載入成功 (直接):', this.payNoOptions.length);
      console.log('🔍 第一筆資料:', this.payNoOptions[0]);
      this._clearColumnCache();
      this.cdr.detectChanges();
    } else {
      // 如果還沒載入完成，訂閱 service 的載入狀態
      console.log('⏳ 支付編號尚未載入，等待...');

      // 使用多次重試機制
      let retryCount = 0;
      const maxRetries = 5;

      const checkInterval = setInterval(() => {
        retryCount++;
        console.log(`🔄 第 ${retryCount} 次重試...`);

        this.payNoOptions = this.tls13010DropdownService.getPayNoOptions();
        console.log('🔍 重試後 payNoOptions 長度:', this.payNoOptions.length);

        if (this.payNoOptions.length > 0) {
          console.log('✅ 支付編號選項延遲載入成功:', this.payNoOptions.length);
          console.log('🔍 第一筆資料:', this.payNoOptions[0]);
          this._clearColumnCache();
          this.cdr.detectChanges();
          clearInterval(checkInterval);
        } else if (retryCount >= maxRetries) {
          console.error('❌ 支付編號載入失敗，已達最大重試次數');
          console.log('🔍 檢查 dropdown service 狀態...');
          // 直接檢查 service
          console.log('🔍 Service payNoOptions:', this.tls13010DropdownService.payNoOptions);
          clearInterval(checkInterval);
        }
      }, 500); // 每 500ms 重試一次
    }
  }

  private initializeViewModeFromService(): void {
    // 🔑 優先從 workflowStatus 恢復 crudStatus (支援頁面重新整理)
    const workflowStatus = this.contractFlowService.getCurrentStatus();
    if (workflowStatus?.crudStatus) {
      this.crudstatus = workflowStatus.crudStatus;
      console.log(`   從 workflowStatus 恢復 CRUD 狀態: ${this.crudstatus}`);

      // 同步 isViewMode 狀態
      const isViewMode = this.crudstatus === CRUDStatus.Read;
      this.contractFlowService.setViewMode(isViewMode);
    } else {
      // fallback: 初始化 CRUD 狀態
      const currentViewMode = this.contractFlowService.isViewMode();
      this.crudstatus = currentViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      console.log(`   從 isViewMode 推斷 CRUD 狀態: ${this.crudstatus}`);
    }

    // 監聽檢視模式變更
    const viewModeSub = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.crudstatus = isViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      // console.log('🔍 Next1 檢視模式狀態更新:', isViewMode);
    });

    this.subscriptions.push(viewModeSub);

    console.log(`   最終 CRUD 狀態: ${this.crudstatus}`);
  }

  private setupTotalLocationSpace(): void {
    const step1Data = this.contractFlowService.getStep1Data();
    const totalSpace = step1Data?.totalLocationSpace || 0;

    // console.log('🏢 從 Step1 取得總坪數:', totalSpace);
    this.fareCalculationService.setTotalLocationSpace(totalSpace);
  }

  private prepareContractInfoDisplay(): void {
    // console.log('📊 準備合約資訊顯示...');

    const step1Data = this.contractFlowService.getStep1Data();
    // console.log('🔍 Step1 編輯資料:', step1Data);

    const contractInfo = {
      talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '',
      tlt_no: step1Data?.tlt_no || this.currentContractData?.tlt_no || '',
      vendor_ven_no: step1Data?.vendor_ven_no || this.currentContractData?.vendor_ven_no || '',
      apply_no: step1Data?.apply_no || this.currentContractData?.apply_no || '',
      tlt_name: step1Data?.tlt_name || this.currentContractData?.tlt_name || '',
      VEN_Name: step1Data?.VEN_Name || this.currentContractData?.VEN_Name || '',
      ven_uniform: step1Data?.ven_uniform || this.currentContractData?.ven_uniform || '',
      contract_subno: step1Data?.contract_subno || this.currentContractData?.contract_subno || '',
      tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
      comm_comp_type: step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '2',
      // 🔑 正規化日期欄位，避免時區問題
      tlt_bdate: DateUtils.toDateString(step1Data?.tlt_bdate || this.currentContractData?.tlt_bdate),
      tlt_edate: DateUtils.toDateString(step1Data?.tlt_edate || this.currentContractData?.tlt_edate),
      tlt_contract_bdate: DateUtils.toDateString(step1Data?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate),
      tlt_contract_edate: DateUtils.toDateString(step1Data?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate)
    };

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new',
      ...contractInfo
    }];

    // console.log('📊 合約資訊顯示準備完成:', this.contractInfoData);
  }

  private loadFareDataWithPriority(): void {
    // console.log('🔍 載入扣款資料優先順序判定...');

    const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    // console.log('📦 檢查 Step2 暫存資料:', savedFareData);

    if (savedFareData && Array.isArray(savedFareData) && savedFareData.length > 0) {
      // console.log('📦 使用暫存扣款資料');
      this.loadSavedFareData(savedFareData);
      return;
    }

    if (this.contractFlowService.isNewContractMode()) {
      // console.log(' 新增模式：載入可用扣款項目');
      this.loadAvailableFareData();
    } else {
      // console.log('🔍 編輯模式：從 API 載入');
      this.loadFareDataFromAPI();
    }
  }

  private loadSavedFareData(savedData: FareItem[]): void {
    // console.log('📦 載入暫存扣款資料:', savedData);

    try {
      //  使用服務驗證和修復資料
      this.originalFareData = this.fareDataService.validateAndFixData(
        savedData,
        this.contractInfoData[0],  //傳入合約資訊
        this.fareCalculationService.getTotalLocationSpace()  //傳入總坪數
      );
      this.filterData();

      // console.log('✅ 暫存扣款資料載入完成');
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
    // console.log('📄 新增模式：載入可用扣款項目...');

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: '',
      showAll: true
    }).subscribe({
      next: (response) => {
        // console.log(' 新增模式 API 回傳資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          //  使用服務處理新增模式資料
          this.originalFareData = this.fareDataService.processNewContractAPIData(
            response.Data.FaresByType,
            this.contractInfoData[0],  //傳入合約資訊
            this.fareCalculationService.getTotalLocationSpace()  //傳入總坪數
          );
          this.filterData();
          this.saveFareDataToWorkflow();

          // console.log(' 新增模式：載入可用扣款項目成功');
        } else {
          // console.log(' 新增模式：API 沒有回傳可用扣款項目');
          this.messageService.infoBubble('目前沒有可用的扣款項目');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error(' 新增模式載入可用扣款項目失敗:', error);
        this.messageService.warnBubble('載入可用扣款項目失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }

  private loadFareDataFromAPI(): void {
    // console.log('📄 載入扣款資料，talent_id:', this.currentTalentId);

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: this.currentTalentId,
      showAll: true
    }).subscribe({
      next: (response) => {
        // console.log('API 回傳的扣款資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          //  使用服務處理 API 資料
          this.originalFareData = this.fareDataService.processAPIData(
            response.Data.FaresByType,
            this.contractFlowService.isNewContractMode(),
            this.contractInfoData[0],  // 傳入合約資訊
            this.fareCalculationService.getTotalLocationSpace()  //傳入總坪數
          );

          // 🔥 新增：強制觸發變更檢測
          this.cdr.detectChanges();

          this.filterData();
          this.saveFareDataToWorkflow();

          if (this.contractFlowService.isNewContractMode()) {
            console.log(' 新增模式：載入可用扣款項目成功');
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
    this.initializeDataStructure();

    // 一次性處理所有群組，每個群組使用各自的模式
    this.fareData = this.fareDataService.filterDataByModePerType(
      this.originalFareData,
      this.showModeByType
    );
  }
  private saveFareDataToWorkflow(): void {
    try {
      // console.log('💾 準備儲存暫存資料...');

      //  使用資料服務準備儲存資料
      const mergedFareItems = this.fareDataService.prepareSaveData(this.originalFareData);

      const totalItems = mergedFareItems.length;
      const selectedItems = mergedFareItems.filter(item => item.is_selected).length;

      // console.log(`💾 總共要儲存 ${totalItems} 筆資料，其中 ${selectedItems} 筆已選中`);

      this.contractFlowService.saveStep2Data(mergedFareItems);
      // console.log('✅ 已成功暫存扣款資料到工作流程');

      this.verifyStoredData();
    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
      this.messageService.warnBubble('儲存暫存資料失敗');
    }
  }

  private verifyStoredData(): void {
    const savedData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    // console.log('🔍 驗證儲存結果:', {
    //   savedDataType: Array.isArray(savedData) ? '陣列' : typeof savedData,
    //   savedDataLength: Array.isArray(savedData) ? savedData.length : 0,
    //   originalDataLength: this.getTotalItemCount()
    // });

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

    // 只對已勾選項目進行即時驗證
    if (rowData.is_selected && capType) {
      this.performRealTimeValidation(rowData, capType);
    }

    // 🔥 關鍵修改：擴充為所有業務欄位
    const businessFields = [
      // 共用欄位
      'tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_qty', 'tpy_unitamt',
      'tpy_amount', 'tpy_totalamt', 'tpy_rate', 'org_id', 'gui_flag',

      // B 類型特有
      'day_account', 'interval',

      // C 類型特有
      'down_payment', 'period_nos',

      // D/E 類型特有
      'cap_saletype', 'edc_bank', 'instms_type', 'pay_no',
      'calc_type', 'rent_plus_rate', 'over_base_rate'
    ];

    if (businessFields.includes(fieldName)) {
      // 業務欄位變更：完整狀態更新
      this.updateRowDataState(rowData, capType || 'A');
    } else {
      // 其他欄位（理論上不應該有）：簡單更新
      console.warn('⚠️ 未預期的欄位變更:', fieldName);
      this.updateOriginalDataItem(rowData, capType || 'A');
      this.saveFareDataToWorkflow();
    }
  }

  /**
    *  即時驗證單一項目
    */
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

  private getTotalLocationSpace(): number {
    const step1Data = this.contractFlowService.getStep1Data();
    return step1Data?.totalLocationSpace || 0;
  }

  // A類型計算優化
  private handleTypeACalculation(fieldName: string, newValue: any, rowData: any): void {
    // 選擇坪數單位時自動帶入總坪數
    if (fieldName === 'tpy_type' && newValue === '01') {
      const totalSpace = this.getTotalLocationSpace();
      if (totalSpace > 0) {
        rowData.tpy_qty = totalSpace;
      }
    }

    // A類型金額計算 - 任何相關欄位變更都觸發
    if (['tpy_unitamt', 'tpy_qty', 'tpy_type'].includes(fieldName)) {
      // 🔥 關鍵：確保預設值存在
      if (!rowData.tpy_qty || rowData.tpy_qty === 0) {
        rowData.tpy_qty = 1;
        console.log(' A類型計算：自動設定數量預設值為 1');
      }

      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 1; // 確保數量至少為 1

      if (unitPrice > 0 && quantity > 0) {
        rowData.tpy_amount = Math.ceil(unitPrice * quantity);  // 改為無條件進位
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
      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 1;

      if (unitPrice > 0 && quantity > 0) {
        rowData.tpy_amount = Math.ceil(unitPrice * quantity);  // 改為無條件進位
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
      // console.log('📅 日期欄位變更，重新計算期數');

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
          // console.log('🔄 期數變更後重新計算金額分攤');
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
        // console.log(`✅ C類型計算成功: 總額=${rowData.tpy_totalamt}, 期數=${rowData.period_nos}, 月額=${rowData.tpy_amount}, 首期=${rowData.down_payment}`);
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
    // console.log('📊 開始更新期數...', {
    //   開始日期: rowData.tpy_bdate,
    //   結束日期: rowData.tpy_edate
    // });

    if (rowData.tpy_bdate && rowData.tpy_edate) {
      let startDate: Date;
      let endDate: Date;

      // 智能日期解析
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

          // console.log(`✅ 期數更新: ${oldPeriods} → ${calculatedPeriods}`);

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

    // console.log(`✅ ${capType}類型資料狀態更新完成`);
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
      // console.log(`🔄 已更新原始資料: ${capType}[${originalIndex}]`);
    }
  }

  /**
   *  增強的表格儲存處理
   */
  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    // console.log(`💾 ${capType}類型表格儲存:`, event.newData);

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

  onFareTableEdit(rowData: any, capType: string): void {
    // console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
    this.ensureDefaultValues(rowData, capType);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onItemSelectionChange(capType: string): void {
    console.log(`🔥 勾選事件被觸發: ${capType}`);

    // 直接處理選擇變更
    this.fareData[capType].forEach(item => {
      this.fareStatusService.updateItemSelectionStatus(item);
    });

    this.updateOriginalData(capType);
    this.filterData();
    this.saveFareDataToWorkflow();
  }

  selectAllByType(capType: string): void {
    console.log(`🔄 ${capType} 類型全部選擇`);

    //  使用狀態服務
    this.fareStatusService.selectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);

    //  修正：重新過濾數據
    this.filterData();

    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    console.log(`🔄 ${capType} 類型取消全部選擇`);

    //  使用狀態服務
    this.fareStatusService.deselectAllItems(this.fareData[capType]);
    this.updateOriginalData(capType);

    //  修正：重新過濾數據
    this.filterData();

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
    // 顯示載入提示
    this.loading = true;

    // 延遲執行，讓載入提示先顯示
    setTimeout(() => {
      if (this.showMode === 'common') {
        this.showMode = 'all';
      } else {
        this.showMode = 'common';
      }

      this.filterData();
      this.loading = false;
      this.messageService.unblockUi();
    }, 500); // 稍微加長延遲時間
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

  onSubmitNext(): void {
    console.log('🔍 開始進行完整驗證...');

    // 儲存當前資料
    this.saveFareDataToWorkflow();

    // 🔥 檢視模式：不需要驗證，直接跳轉
    if (this.crudstatus === CRUDStatus.Read) {
      console.log('🔍 檢視模式：跳過驗證，直接跳轉');
      const contractTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();
      if (contractTermType === '1') {
        this.router.navigate(['account/tls/tls13010next3']);
      } else {
        this.router.navigate(['account/tls/tls13010next2']);
      }
      return;
    }

    // 🔥 編輯模式：必須驗證
    // 驗證所有已選中的扣款類型
    const validationResults = this.validateAllSelectedFareTypes();

    if (!validationResults.isValid) {
      console.error('❌ 驗證失敗:', validationResults.errors);
      this.showValidationErrors(validationResults.errors);
      return;
    }

    console.log('✅ 驗證通過，準備跳轉到下一步');

    // 取得合約類型，決定導航目標
    const contractTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();
    if (contractTermType === '1') {
      console.log('🔍 合約類型為1，直接跳轉到 next3');
      this.router.navigate(['account/tls/tls13010next3']);
    } else {
      console.log('🔍 合約類型非1，跳轉到 next2');
      this.router.navigate(['account/tls/tls13010next2']);
    }
  }

  override onCancel(): void {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    if (this.crudstatus === CRUDStatus.Read) {
      this.router.navigate(['account/tls/tls13010cru'], extras);
      return;
    }

    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls13010cru'], extras);
  }

  onRealCancel(): void {
    this.saveFareDataToWorkflow();

    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url }
    };

    this.router.navigate(['account/tls/tls13010'], extras);
    this.messageService.infoBubble('已離開契約編輯流程');
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
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
    //  使用資料服務套用預設值
    this.fareDataService.applyDynamicDefaults(item, this.contractInfoData);
  }

  // ========== 匯出屬性 ==========
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
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
   * 您的自動計算邏輯 - 完全自由發揮！
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

    const monthlyAmount = Math.ceil(totalAmount / periods);  // 改為無條件進位
    const downPayment = Math.ceil(totalAmount - (monthlyAmount * (periods - 1)));  // 改為無條件進位

    // 設定對話框資料並顯示
    this.calculationResult = {
      totalAmount,
      periods,
      monthlyAmount,
      downPayment,
      verification: Math.ceil(downPayment + (monthlyAmount * (periods - 1)))  // 改為無條件進位
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

      // 清空大部分數值欄位
      const fieldsToReset = [
        'tpy_unitamt', 'tpy_qty', 'tpy_amount', 'tpy_totalamt',
        'down_payment', 'period_nos', 'tpy_rate'
      ];

      fieldsToReset.forEach(field => {
        if (field === 'tpy_qty') {
          copiedItem[field] = 1;
        } else {
          copiedItem[field] = null;
        }
      });

      // 新的日期處理邏輯
      this.handleCopiedItemDates(copiedItem, originalItem);

      // 其他欄位處理...
      if (originalItem.tpy_type) {
        const tpyTypeOptions = TLS13010_DROPDOWN_OPTIONS.tpyTypeOption || [];
        const isValidOption = tpyTypeOptions.some(option => option.value === originalItem.tpy_type);
        copiedItem.tpy_type = isValidOption ? originalItem.tpy_type :
          (tpyTypeOptions.length > 0 ? tpyTypeOptions[0].value : null);
      }

      // 組織和發票狀態預設值
      if (!copiedItem.org_id && this.orgOptions.length > 0) {
        copiedItem.org_id = this.orgOptions[0].value;
      }
      if (!copiedItem.gui_flag) {
        copiedItem.gui_flag = 'Y';
      }

      // 清理不需要的屬性
      delete copiedItem._skipAutoCalc;
      delete copiedItem._dateInitialized;

      // 插入到原始項目的下一個位置
      const originalIndex = this.originalFareData[capType].findIndex(item => item.id === originalItem.id);
      if (originalIndex !== -1) {
        this.originalFareData[capType].splice(originalIndex + 1, 0, copiedItem);
      } else {
        this.originalFareData[capType].push(copiedItem);
      }

      this.filterData();
      this.saveFareDataToWorkflow();

      this.messageService.successBubble(`已成功複製扣款項目「${originalItem.cap_name}」`);
      this.cdr.detectChanges();

    } catch (error) {
      console.error('複製扣款項目時發生錯誤:', error);
      this.messageService.warnBubble('複製扣款項目失敗，請重試');
    }
  }

  // 新增專門處理複製項目日期的方法
  // 修正後的處理複製項目日期方法
  private handleCopiedItemDates(copiedItem: any, originalItem: any): void {
    try {
      // 取得合約資訊
      const contractInfo = this.contractInfoData[0];

      // 結束日期：永遠設定為合約終止日
      if (contractInfo?.tlt_edate) {
        const contractEndDate = new Date(contractInfo.tlt_edate);

        if (!isNaN(contractEndDate.getTime())) {
          copiedItem.tpy_edate = contractEndDate;
          console.log(`複製項目結束日期：合約終止日 ${this.formatDateForLog(contractEndDate)}`);
        } else {
          copiedItem.tpy_edate = null;
          console.warn('合約終止日期無效');
        }
      } else {
        copiedItem.tpy_edate = null;
        console.warn('沒有合約終止日期');
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
            console.warn(`複製項目起始日期 ${this.formatDateForLog(nextMonth)} 已超過合約終止日 ${this.formatDateForLog(contractEndDate)}，清空起始日期`);

            copiedItem.tpy_bdate = null;

            // 給用戶提示
            this.messageService.warnBubble('複製項目的起始日期會超過合約終止日，已清空起始日期，請手動設定');
          } else {
            copiedItem.tpy_bdate = nextMonth;
            console.log(`複製項目起始日期：${this.formatDateForLog(originalEndDate)} -> ${this.formatDateForLog(nextMonth)}`);
          }
        } else {
          copiedItem.tpy_bdate = null;
          console.warn('原項目結束日期無效，複製項目起始日期設為 null');
        }
      } else {
        copiedItem.tpy_bdate = null;
        console.warn('原項目沒有結束日期或合約終止日期，複製項目起始日期設為 null');
      }

    } catch (error) {
      console.error('處理複製項目日期時發生錯誤:', error);
      copiedItem.tpy_bdate = null;
      // tpy_edate 保持已設定的合約終止日，不清空
    }
  }

  // 輔助方法：格式化日期用於 log
  private formatDateForLog(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  /**
  * 驗證所有已選中的扣款類型
  */
  private validateAllSelectedFareTypes(): { isValid: boolean, errors: string[] } {
    const allErrors: string[] = [];
    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    // 🔥 新增：取得合約日期範圍
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
   * 顯示驗證錯誤訊息
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
 * 切換特定群組的顯示模式
 */
  // 切換特定群組的顯示模式（不顯示全域 loading）
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

  // 全域切換所有群組（顯示 loading）
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

  // 取得全域按鈕文字
  getAllCommonModeText(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部展開' : '全部收合';
  }

  // 取得全域顯示狀態
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

  isOutlinedMode(capType: string): boolean {
    return this.showModeByType[capType] !== 'common';
  }
}
