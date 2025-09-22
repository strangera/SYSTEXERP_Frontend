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
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { TLS12040DataFlowService } from './services/tls12040-data-flow.service';
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
    TLS12040DataFlowService
  ],
  templateUrl: './tls12040-next2.component.html',
  styleUrl: './tls12040-next2.component.scss'
})
export class TLS12040Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private readonly notificationService = inject(NotificationService);
  private readonly flowService = inject(TLS12040FlowService);

  private discountOptions: any[] = [];
  selectedSettingTab = 'discount';

  private viewModeSubscription?: Subscription;

  private subscriptions: Subscription[] = [];

  showConfirmDialog = false;
  hasUnsavedChanges = false;
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
    private locationOptionsService: LocationOptionsService,
    private dataFlowService: TLS12040DataFlowService,

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
      // 1. 先訂閱資料狀態變更
      this.dataFlowService.state$.subscribe(state => {
        this.commissionData = state.currentEditData;
        this.loading = state.uiState.loading;
        this.dataLoaded = state.uiState.dataLoaded;
        this.hasUnsavedChanges = state.uiState.hasUnsavedChanges;

        // 加入這行：當有資料載入完成時，設定 commissionDataLoaded
        this.commissionDataLoaded = state.uiState.dataLoaded && state.currentEditData.length >= 0;

        this.cdr.detectChanges();
      });

      // 2. 初始化欄位配置
      this.initializeColumns();

      // 3. 載入折扣選項（這個還是用原本的服務）
      this.discountOptions = await this.dataFlowService.loadDiscountOptions();
      if (this.discountOptions.length === 0) {
        console.warn('沒有載入到折扣選項');
      }
      this.updateDiscountColumnOptions();

      // 4. 載入工作流程資料
      await this.loadWorkflowData();

      // 5. 設定自動儲存 (僅編輯模式)
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

    // 使用新的資料流服務載入抽成資料
    try {
      await this.dataFlowService.loadData(
        this.currentApplyNo,
        this.discountOptions,
        cruData.tlt_contract_bdate || cruData.tlt_bdate,
        cruData.tlt_contract_edate || cruData.tlt_edate
      );
      // 注意：commissionData 會透過 state$ 訂閱自動更新，不需要手動賦值
    } catch (error) {
      console.error('載入抽成資料失敗:', error);
      this.notificationService.errorBubble('載入抽成資料失敗');
    }
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

    // 重要：更新每個 commission item 的顯示資料
    this.commissionData.forEach(item => {
      this.updateItemDisplayData(item);
    });

    // 觸發變更檢測，讓表格重新渲染
    this.cdr.detectChanges();
  }

  /**
 * 更新單個項目的顯示資料
 */
  private updateItemDisplayData(commissionItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;

    // 根據當前標籤設定對應的資料到 detailItems（如果表格有使用這個屬性）
    switch (currentTab) {
      case 'discount':
        // 確保有預設的8個折扣選項
        if (!commissionItem.ChargeDetails || commissionItem.ChargeDetails.length === 0) {
          commissionItem.ChargeDetails = this.createDefaultDiscountItems(commissionItem);
        }
        break;

      case 'level':
        // 確保有預設的8個層級選項
        if (!commissionItem.LevelChargeDetails || commissionItem.LevelChargeDetails.length === 0) {
          commissionItem.LevelChargeDetails = this.createDefaultLevelItems(commissionItem);
        }
        break;

      case 'annual':
        // annual 不需要預設項目，直接使用 API 回來的資料
        if (!commissionItem.YearChargeDetails) {
          commissionItem.YearChargeDetails = [];
        }
        break;
    }
  }

  /**
 * 建立預設的 discount 項目（8個折扣選項）
 */
  private createDefaultDiscountItems(parentItem: ChargeSettingBusinessModel): any[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      return [];
    }

    return this.discountOptions.map(option => ({
      id: null,
      apply_no: parentItem.apply_no,
      tlt_id: parentItem.tlt_id,
      cag_barcode: option.value,
      tlt_bdate: null,
      tlt_edate: null,
      cag_charge_rate: 0,
      barcode_desc: option.label || '',
      is_configured: false,
      is_enabled: false,
      _status: 'new',
      _isSelected: false  // 預設不勾選
    }));
  }

  /**
   * 建立預設的 level 項目（8個折扣選項）
   */
  private createDefaultLevelItems(parentItem: ChargeSettingBusinessModel): any[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      return [];
    }

    return this.discountOptions.map((option, index) => ({
      id: null,
      apply_no: parentItem.apply_no,
      tlt_id: parentItem.tlt_id,
      seq_no: index + 1,
      cag_barcode: option.value,
      level_bmount: 0,
      level_eamount: 0,
      level_charge_rate: 0,
      barcode_desc: option.label || '',
      is_configured: false,
      is_enabled: false,
      _status: 'new',
      _isSelected: false  // 預設不勾選
    }));
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
  onDetailTabChange(event: { rowData: any, tabId: string }): void {
    console.log('內層標籤切換事件:', event);

    // 直接呼叫 changeSettingTab 來統一處理
    this.changeSettingTab(event.tabId);
  }

  onItemEdit(item: any): void { }

  onItemSave(event: { oldData: any, newData: any }): void { }

  onItemCancel(item: any): void { }

  onDetailEdit(event: any): void { }

  onDetailSave(event: { oldDetail: any, newDetail: any, parentData: any }): void { }

  onBeforeDetailSave(event: { data: any, preventDefault: () => void }): void { }

  onDetailCancel(item: ChargeSettingBusinessModel): void { }

  onBatchDelete(selectedItems: any[]): void { }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any }): void {
    // if (this.isReadOnlyMode) {
    //   this.notificationService.infoBubble('檢視模式下無法刪除項目');
    //   return;
    // }
    // const { selectedDetails, parentData } = event;

    // // 處理刪除邏輯
    // selectedDetails.forEach(detail => {
    //   if (detail._status === 'new' || !this.hasValidId(detail)) {
    //     // 新項目直接從數組移除
    //     this.removeDetailFromArrays(detail, parentData);
    //   } else {
    //     // 現有項目標記為 deleted
    //     detail._status = 'deleted';
    //     this.syncDetailToParentArray(detail, parentData);
    //   }
    // });

    // // 重新刷新顯示
    // this.refreshItemDetailDisplay(parentData);
    // this.updateMainArray(parentData);
    // this.saveToWorkflow();
  }

  onAddCommissionItem(): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    // const result = this.tableService.addCommissionItem(
    //   this.commissionData,
    //   this.getContractDate('start'),
    //   this.getContractDate('end'),
    //   this.discountOptions
    // );

    // if (result.success) {
    //   // 關鍵：新增後立即確保與 step1 同步
    //   const step1Data = this.contractFlowService.getStep1Data();
    //   if (step1Data) {
    //     result.newItem.cap_saletype1 = Boolean(step1Data.cap_saletype1);
    //     result.newItem.cap_saletype2 = Boolean(step1Data.cap_saletype2);
    //   }

    //   this.commissionData = [...this.commissionData, result.newItem];
    //   this.saveToWorkflow();
    //   this.notificationService.infoBubble('新增完成');
    // } else {
    //   this.notificationService.warnBubble(result.message || '新增失敗');
    // }
  }

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
    return 'detailItems';  // 固定使用這個屬性名稱
  }

  onFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    // 判斷是主檔還是明細
    const isDetail = this.isDetailItem(event.rowData);

    if (isDetail) {
      // 明細欄位變更 - 需要同步回正確的資料陣列
      this.handleDetailFieldChange(event);
    } else {
      // 主檔欄位變更
      this.dataFlowService.updateField(
        rowData.id,
        'master',
        fieldName,
        newValue
      );
    }
  }

  /**
 * 處理明細資料的欄位變更
 */
  private handleDetailFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    // 找到這個明細項目屬於哪個主檔
    const parentData = this.findParentOfDetail(rowData);
    if (!parentData) {
      console.error('找不到明細項目的父資料');
      return;
    }

    // 更新明細項目的值
    rowData[fieldName] = newValue;

    // 同步回正確的原始資料陣列
    this.syncDetailBackToSource(rowData, parentData);

    // 通知資料流服務
    this.dataFlowService.updateField(
      rowData.id,
      this.getDetailItemType(rowData),
      fieldName,
      newValue,
      parentData.id
    );
  }

  /**
   * 將明細變更同步回原始資料陣列
   */
  private syncDetailBackToSource(detailData: any, parentData: ChargeSettingBusinessModel): void {
    const detailId = detailData.id;

    // 根據當前標籤決定要更新哪個陣列
    switch (this.selectedSettingTab) {
      case 'discount':
        if (parentData.ChargeDetails) {
          const index = parentData.ChargeDetails.findIndex(item => item.id === detailId);
          if (index > -1) {
            parentData.ChargeDetails[index] = { ...detailData };
          }
        }
        break;

      case 'level':
        if (parentData.LevelChargeDetails) {
          const index = parentData.LevelChargeDetails.findIndex(item => item.id === detailId);
          if (index > -1) {
            parentData.LevelChargeDetails[index] = { ...detailData };
          }
        }
        break;

      case 'annual':
        if (parentData.YearChargeDetails) {
          const index = parentData.YearChargeDetails.findIndex(item => item.id === detailId);
          if (index > -1) {
            parentData.YearChargeDetails[index] = { ...detailData };
          }
        }
        break;
    }
  }

  private findParentOfDetail(detailData: any): ChargeSettingBusinessModel | null {
    // 在所有主檔中搜尋包含此明細的父項目
    for (const commissionItem of this.commissionData) {
      // 檢查 ChargeDetails
      if (commissionItem.ChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查 YearChargeDetails
      if (commissionItem.YearChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查 LevelChargeDetails
      if (commissionItem.LevelChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }
    }

    return null;
  }

  private isDetailItem(rowData: any): boolean {
    // 根據你的資料結構判斷是否為明細項目
    return !this.commissionData.some(item => item.id === rowData.id);
  }

  private getDetailItemType(rowData: any): 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail' {
    // 根據當前標籤或資料特徵判斷類型
    switch (this.selectedSettingTab) {
      case 'discount': return 'chargeDetail';
      case 'annual': return 'yearChargeDetail';
      case 'level': return 'levelChargeDetail';
      default: return 'chargeDetail';
    }
  }

  get processedCommissionData(): ChargeSettingBusinessModel[] {
    return this.visibleCommissionData.map(item => {
      // 建立一個新的物件，包含動態的 detailItems
      const processedItem = { ...item };

      // 根據當前選中的標籤，設定對應的資料到一個統一的屬性名稱
      switch (this.selectedSettingTab) {
        case 'discount':
          // 確保有 8 個折扣選項
          if (!processedItem.ChargeDetails || processedItem.ChargeDetails.length === 0) {
            processedItem.ChargeDetails = this.createDefaultDiscountItems(processedItem);
          }
          // 將資料複製到統一的 detailItems 屬性
          processedItem.detailItems = processedItem.ChargeDetails.filter(detail => detail._status !== 'deleted');
          break;

        case 'level':
          // 確保有 8 個層級選項
          if (!processedItem.LevelChargeDetails || processedItem.LevelChargeDetails.length === 0) {
            processedItem.LevelChargeDetails = this.createDefaultLevelItems(processedItem);
          }
          // 將資料複製到統一的 detailItems 屬性
          processedItem.detailItems = processedItem.LevelChargeDetails.filter(detail => detail._status !== 'deleted');
          break;

        case 'annual':
          // annual 直接使用 API 資料，不需要預設項目
          if (!processedItem.YearChargeDetails) {
            processedItem.YearChargeDetails = [];
          }
          // 將資料複製到統一的 detailItems 屬性
          processedItem.detailItems = processedItem.YearChargeDetails.filter(detail => detail._status !== 'deleted');
          break;

        default:
          processedItem.detailItems = [];
      }

      return processedItem;
    });
  }
}
