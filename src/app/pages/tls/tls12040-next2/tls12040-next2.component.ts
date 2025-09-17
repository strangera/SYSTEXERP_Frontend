import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenubarComponent } from "@shared/component/menubar/menubar.component";
import { ButtonComponent } from "@shared/componentkit/button/button.component";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AccordionModule } from "primeng/accordion";
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ColumnDef, ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { CruData, SimpleContractInfo } from '../tls12040-next1/models/tls12040-next1.model';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { DialogModule } from "primeng/dialog";
import { ChargeDetailBusinessModel, ChargeSettingBusinessModel, LevelChargeDetailBusinessModel, TLS12040ChargeQueryResponse } from './models/tls12040-next2.model';
import { FormGroup } from '@angular/forms';
import { TLS12040Next2ColumnsConfig } from './services/tls12040-next2-columns.config';
import { TLS12040ChargeDataService } from './services/tls12040-charge-data.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls12040-next2',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, DialogModule,
    NgIf
  ],
  providers: [
    TLS12040ChargeDataService
  ],
  templateUrl: './tls12040-next2.component.html',
  styleUrl: './tls12040-next2.component.scss'
})
export class TLS12040Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private readonly notificationService = inject(NotificationService);
  private readonly flowService = inject(TLS12040FlowService);
  private readonly chargeDataService = inject(TLS12040ChargeDataService);

  private discountOptions: any[] = [];
  selectedSettingTab = 'discount';

  // private readonly cdr = inject(ChangeDetectorRef);
  private viewModeSubscription?: Subscription;

  private subscriptions: Subscription[] = [];

  showConfirmDialog = false;
  dataLoaded = false;
  commissionDataLoaded = false;
  contractInfoData: SimpleContractInfo[] = [];
  currentContractData: SimpleContractInfo | null = null;
  commissionColumns: ColumnDef[] = [];
  contractInfoColumns: any[] = [];
  discountColumns: ColumnDef[] = [];
  annualColumns: ColumnDef[] = [];
  levelColumns: ColumnDef[] = [];
  commissionData: ChargeSettingBusinessModel[] = [];
  dataForm: FormGroup;

  // 新增：當前申請編號
  currentApplyNo = '';

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

  settingTabs = [
    {
      id: 'discount',
      label: '折扣設定',
      allowAdd: false,
      allowBatchDelete: false,
      showCheckbox: false
    },
    {
      id: 'level',
      label: '折扣別層級抽成設定',
      allowAdd: false,
      allowBatchDelete: false,
      showCheckbox: false
    },
    {
      id: 'annual',
      label: '年度總業績抽成設定',
      allowAdd: true,
      allowBatchDelete: true,
      showCheckbox: true
    }
  ];

  taxTypeOptions: any[] = [
    { label: '應稅', value: '1' },
    { label: '免稅', value: '0' }
  ];

  constructor(
    private route: ActivatedRoute,
    private tls12040Service: TLS12040Service,
    private cdr: ChangeDetectorRef,

    private locationOptionsService: LocationOptionsService
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  get visibleCommissionData() {
    return this.commissionData.filter(item => item._status !== 'deleted');
  }

  get isGeneralCommissionMode(): boolean {
    return this.currentCommissionType === '3';
  }

  get currentCommissionType(): string {
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      return this.contractInfoData[0].tlt_term_type || '3';
    }

    const step1Data = this.flowService.getCruData<CruData>();
    if (step1Data?.tlt_term_type) {
      return step1Data.tlt_term_type.toString();
    }

    return '3';
  }

  async ngOnInit(): Promise<void> {
    this.initializePage('TLS12040', this.dataForm);

    try {
      this.initializeColumns();
      this.discountOptions = await this.chargeDataService.loadDiscountOptions();
      this.updateDiscountColumnOptions();
      // 載入工作流程資料
      await this.loadWorkflowData();

      // 設定自動儲存 (僅編輯模式)
      if (!this.isReadOnlyMode) {
        this.setupAutoSave();
      }

    } catch (error) {
      console.error('初始化失敗:', error);
      this.notificationService.errorBubble('頁面初始化失敗');
    }
  }

  private initializeColumns(): void {
    this.contractInfoColumns = TLS12040Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS12040Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS12040Next2ColumnsConfig.getCommissionColumns();
  }

  private async loadWorkflowData(): Promise<void> {
    console.log('開始載入工作流程資料...');

    const cruData = this.flowService.getCruData<CruData>();
    console.log('CRU 資料:', cruData);

    if (!cruData?.apply_no) {
      console.warn('沒有有效的申請編號');
      this.notificationService.errorBubble('缺少申請編號，請返回上一步');
      this.router.navigate(['account/tls/tls12040']);
      return;
    }

    this.currentApplyNo = cruData.apply_no;
    console.log('當前申請編號:', this.currentApplyNo);

    // 準備合約資訊顯示
    this.prepareContractInfoDisplay(cruData);

    // 載入抽成資料
    await this.loadChargeData();
  }

  /**
 * 更新折扣欄位選項
 */
  private updateDiscountColumnOptions(): void {
    console.log('更新折扣選項:', this.discountOptions);

    this.discountColumns = TLS12040Next2ColumnsConfig.getDiscountColumns(this.discountOptions);
    this.levelColumns = TLS12040Next2ColumnsConfig.getLevelColumns(this.discountOptions);

    console.log('折扣欄位更新完成:', {
      discountColumnsCount: this.discountColumns.length,
      levelColumnsCount: this.levelColumns.length
    });
  }


  private prepareContractInfoDisplay(cruData: CruData): void {
    console.log('準備合約資訊顯示');

    this.contractInfoData = [{
      id: this.currentApplyNo,
      apply_no: cruData.apply_no,
      tlt_name: cruData.tlt_name || '',
      ven_uniform: cruData.ven_uniform || '',
      VEN_Name: cruData.VEN_Name || '',
      tlt_term_type: cruData.tlt_term_type?.toString() || '3',
      tlt_no: cruData.tlt_no || '',
      contract_subno: cruData.contract_subno || '',
      tlt_bdate: cruData.tlt_bdate || '',
      tlt_edate: cruData.tlt_edate || '',
      tlt_contract_bdate: cruData.tlt_contract_bdate || '',
      tlt_contract_edate: cruData.tlt_contract_edate || '',
    }];

    console.log('合約資訊:', this.contractInfoData);
  }

  private async loadChargeData(): Promise<void> {
    console.log('開始載入抽成資料...');
    this.loading = true;

    try {
      // 使用資料載入服務
      this.commissionData = await this.chargeDataService.loadChargeData(this.currentApplyNo);

      console.log('API 回傳的原始抽成資料:', this.commissionData);
      console.log('抽成資料項目數量:', this.commissionData.length);

      // 增強每個抽成項目的子資料
      this.commissionData.forEach((commissionItem, index) => {
        console.log(`處理抽成項目 ${index + 1} BEFORE:`, {
          id: commissionItem.id,
          ChargeDetailsLength: commissionItem.ChargeDetails?.length || 0,
          LevelChargeDetailsLength: commissionItem.LevelChargeDetails?.length || 0,
          discountOptionsLength: this.discountOptions.length
        });

        // 增強 ChargeDetails (折扣設定)
        if (this.discountOptions.length > 0) {
          commissionItem.ChargeDetails = this.enhanceChargeDetails(
            commissionItem.ChargeDetails || [],
            commissionItem
          );
        }

        // 增強 LevelChargeDetails (層級抽成)
        if (this.discountOptions.length > 0) {
          commissionItem.LevelChargeDetails = this.enhanceLevelChargeDetails(
            commissionItem.LevelChargeDetails || [],
            commissionItem
          );
        }

        console.log(`處理抽成項目 ${index + 1} AFTER:`, {
          id: commissionItem.id,
          ChargeDetailsLength: commissionItem.ChargeDetails?.length || 0,
          LevelChargeDetailsLength: commissionItem.LevelChargeDetails?.length || 0,
          ChargeDetails: commissionItem.ChargeDetails,
          LevelChargeDetails: commissionItem.LevelChargeDetails
        });
      });

      this.commissionDataLoaded = true;
      this.dataLoaded = true;

      console.log('最終處理的抽成資料:', this.commissionData);

      // 強制觸發變更檢測
      this.cdr.detectChanges();

      if (this.commissionData.length > 0) {
        this.notificationService.infoBubble(`已載入 ${this.commissionData.length} 個抽成項目`);
      } else {
        this.notificationService.infoBubble('查無抽成設定資料');
      }

      // 儲存到流程服務
      if (!this.isReadOnlyMode) {
        this.flowService.setNext2Data(this.commissionData);
      }

    } catch (error) {
      console.error('載入抽成資料發生錯誤:', error);
      this.notificationService.errorBubble('載入抽成資料失敗');

      // 初始化空資料
      this.commissionData = [];
      this.commissionDataLoaded = true;
      this.dataLoaded = true;

    } finally {
      this.loading = false;
      // 再次強制觸發變更檢測
      this.cdr.detectChanges();
    }
  }

  /**
    * 增強 ChargeDetails - 與折扣選項合併
    */
  private enhanceChargeDetails(
    existingDetails: ChargeDetailBusinessModel[],
    commissionItem: ChargeSettingBusinessModel
  ): ChargeDetailBusinessModel[] {
    console.log('增強 ChargeDetails:', existingDetails);

    const result: ChargeDetailBusinessModel[] = [];

    this.discountOptions.forEach(option => {
      const existingItem = existingDetails.find(detail => detail.cag_barcode === option.value);

      if (existingItem) {
        // 已有資料的項目，補充描述
        result.push({
          ...existingItem,
          barcode_desc: existingItem.barcode_desc || option.label,
          _status: existingItem._status || 'original'
        });
      } else {
        // 新建項目 - 預設勾選正品 (000)
        const isDefaultSelected = option.value === '000' || option.label?.includes('正品');

        result.push({
          id: null,
          apply_no: commissionItem.apply_no,
          tlt_id: commissionItem.tlt_id,
          cag_barcode: option.value,
          tlt_bdate: null,
          tlt_edate: null,
          cag_charge_rate: 0,
          barcode_desc: option.label || '',
          is_configured: isDefaultSelected,
          is_enabled: isDefaultSelected,
          _status: 'new',
          _isSelected: isDefaultSelected
        });
      }
    });

    console.log('增強後的 ChargeDetails:', result);
    return result;
  }

  /**
   * 增強 LevelChargeDetails - 與折扣選項合併
   */
  private enhanceLevelChargeDetails(
    existingDetails: LevelChargeDetailBusinessModel[],
    commissionItem: ChargeSettingBusinessModel
  ): LevelChargeDetailBusinessModel[] {
    console.log('增強 LevelChargeDetails:', existingDetails);

    const result: LevelChargeDetailBusinessModel[] = [];

    this.discountOptions.forEach((option, index) => {
      const existingItem = existingDetails.find(detail => detail.cag_barcode === option.value);

      if (existingItem) {
        // 已有資料的項目
        result.push({
          ...existingItem,
          barcode_desc: existingItem.barcode_desc || option.label,
          seq_no: existingItem.seq_no || (index + 1),
          _status: existingItem._status || 'original'
        });
      } else {
        // 新建項目 - 預設勾選正品 (000)
        const isDefaultSelected = option.value === '000' || option.label?.includes('正品');

        result.push({
          id: null,
          apply_no: commissionItem.apply_no,
          tlt_id: commissionItem.tlt_id,
          seq_no: index + 1,
          cag_barcode: option.value,
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          barcode_desc: option.label || '',
          is_configured: isDefaultSelected,
          is_enabled: isDefaultSelected,
          _status: 'new',
          _isSelected: isDefaultSelected
        });
      }
    });

    console.log('增強後的 LevelChargeDetails:', result);
    return result;
  }

  /**
   * 取得當前標籤頁對應的資料
   * 這個方法會被 expandable-edit-table 呼叫
   */
  getCurrentItems(rowData: ChargeSettingBusinessModel): any[] {
    console.log('getCurrentItems 被呼叫，標籤:', this.selectedSettingTab, '資料:', rowData);

    switch (this.selectedSettingTab) {
      case 'discount':
        return rowData.ChargeDetails?.filter(item => item._status !== 'deleted') || [];
      case 'annual':
        return rowData.YearChargeDetails?.filter(item => item._status !== 'deleted') || [];
      case 'level':
        return rowData.LevelChargeDetails?.filter(item => item._status !== 'deleted') || [];
      default:
        return rowData.ChargeDetails?.filter(item => item._status !== 'deleted') || [];
    }
  }


  /**
    * 標籤切換處理
    */
  changeSettingTab(tab: string): void {
    console.log('切換標籤，從', this.selectedSettingTab, '到', tab);

    // 直接切換標籤
    this.selectedSettingTab = tab;

    // 觸發變更檢測，讓表格重新渲染
    this.cdr.detectChanges();
  }

  /**
   * 取得當前標籤對應的欄位配置
   */
  getCurrentColumns(): any[] {
    switch (this.selectedSettingTab) {
      case 'discount':
        return this.discountColumns;
      case 'annual':
        return this.annualColumns;
      case 'level':
        return this.levelColumns;
      default:
        return this.discountColumns;
    }
  }

  /**
     * 檢查項目是否有有效 ID
     */
  private hasItemId(item: any): boolean {
    return item.id && item.id !== 'temp_' && !item.id.toString().startsWith('temp_');
  }

  /**
   * 使用折扣選項增強抽成資料
   */
  private enhanceCommissionDataWithDiscountOptions(): void {
    console.log('使用折扣選項增強抽成資料...');

    this.commissionData.forEach(commissionItem => {
      // 增強 discount 項目
      if (!commissionItem.ChargeDetails || commissionItem.ChargeDetails.length === 0) {
        commissionItem.ChargeDetails = this.createInitialDiscountItems();
      }

      // 增強 level 項目
      if (!commissionItem.LevelChargeDetails || commissionItem.LevelChargeDetails.length === 0) {
        commissionItem.LevelChargeDetails = this.createInitialLevelItems();
      }
    });

    console.log('抽成資料增強完成');
  }

  /**
   * 新增：建立初始折扣項目
   */
  private createInitialDiscountItems(): any[] {
    return this.discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const shouldSelectByDefault = isFirstOption &&
        (option.value === '000' || option.label?.includes('正品'));

      return {
        id: this.generateTempId(),
        apply_no: 0,
        tlt_id: '',
        cag_barcode: option.value,
        tlt_bdate: null,
        tlt_edate: null,
        cag_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        _isSelected: shouldSelectByDefault
      };
    });
  }

  /**
   * 新增：建立初始層級項目
   */
  private createInitialLevelItems(): any[] {
    return this.discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const shouldSelectByDefault = isFirstOption &&
        (option.value === '000' || option.label?.includes('正品'));

      return {
        id: this.generateTempId(),
        apply_no: 0,
        tlt_id: '',
        seq_no: index + 1,
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        _isSelected: shouldSelectByDefault
      };
    });
  }

  /**
   * 工具方法：產生臨時 ID
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }


  private setupAutoSave(): void {
    if (this.isReadOnlyMode) {
      console.log('唯讀模式，跳過自動儲存設定');
      return;
    }

    const formSubscription = this.dataForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.saveToWorkflow();
    });
    this.subscriptions.push(formSubscription);
  }

  private saveToWorkflow(): void {
    if (this.isReadOnlyMode) {
      console.log('唯讀模式，跳過資料儲存');
      return;
    }

    // 這裡可以加入變更檢查邏輯
    this.flowService.setNext2Data(this.commissionData);
  }

  // 原有的事件處理方法保持不變
  onDetailTabChange(event: { rowData: any, tabId: string }) { }

  onItemEdit(item: any): void { }

  onItemSave(event: { oldData: any, newData: any }): void { }

  onItemCancel(item: any): void { }

  onDetailEdit(event: any): void { }

  onDetailSave(event: { oldDetail: any, newDetail: any, parentData: any }): void { }

  onBeforeDetailSave(event: { data: any, preventDefault: () => void }): void { }

  onDetailCancel(item: ChargeSettingBusinessModel): void { }

  onBatchDelete(selectedItems: any[]): void { }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any, rowIndex: number }): void { }

  onAddCommissionItem(): void { }

  onAddDetailItem(parentData: ChargeSettingBusinessModel): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    const newItem = this.createNewDetailItem(parentData);

    switch (this.selectedSettingTab) {
      case 'discount':
        if (!parentData.ChargeDetails) parentData.ChargeDetails = [];
        parentData.ChargeDetails.push(newItem);
        break;
      case 'annual':
        if (!parentData.YearChargeDetails) parentData.YearChargeDetails = [];
        parentData.YearChargeDetails.push(newItem);
        break;
      case 'level':
        if (!parentData.LevelChargeDetails) parentData.LevelChargeDetails = [];
        parentData.LevelChargeDetails.push(newItem);
        break;
    }

    // 標記主檔為已修改
    if (parentData._status === 'original') {
      parentData._status = 'modified';
    }

    this.saveToWorkflow();
  }


  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void { }

  onDetailButtonClick(event: {
    detailData: any;
    field: string;
    parentData: any;
  }): void { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  onSubmitNext(): void { }

  onClearAndExit(): void {
    console.log('清空並離開');
    this.flowService.clearAll();
    this.router.navigate(['account/tls/tls12040']);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  onConfirmDialogResult(confirmed: boolean): void { }

  override onCancel(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      this.router.navigate(['account/tls/tls12040next1']);
      return;
    }
    this.router.navigate(['account/tls/tls12040next1']);
  }

  /**
  * 建立新的明細項目
  */
  private createNewDetailItem(parentData: ChargeSettingBusinessModel): any {
    const tempId = this.generateTempId();

    switch (this.selectedSettingTab) {
      case 'discount':
        return {
          id: null,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          cag_barcode: '',
          tlt_bdate: null,
          tlt_edate: null,
          cag_charge_rate: 0,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          _isSelected: false
        };
      case 'annual':
        return {
          id: tempId,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          tlt_bdate: '',
          tlt_edate: '',
          year_amount: 0,
          extra_rate: 0,
          _status: 'new',
          _isSelected: false
        };
      case 'level':
        return {
          id: null,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          seq_no: (parentData.LevelChargeDetails?.length || 0) + 1,
          cag_barcode: '',
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          _isSelected: false
        };
      default:
        return {};
    }
  }

  getDetailKey(): string {
    switch (this.selectedSettingTab) {
      case 'discount':
        return 'ChargeDetails';
      case 'annual':
        return 'YearChargeDetails';
      case 'level':
        return 'LevelChargeDetails';
      default:
        return 'ChargeDetails';
    }
  }
}
