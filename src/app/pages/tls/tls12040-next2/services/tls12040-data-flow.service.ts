// services/tls12040-data-flow.service.ts
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, of } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import {
  ChargeSettingAPIModel,
  ChargeSettingBusinessModel,
  TLS12040DataTransformer,
  TLS12040PageState
} from '../models/tls12040-next2.model';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { DateUtils } from 'src/app/core/utils/date-utils';

// 變更追蹤介面
export interface ChangeRecord {
  itemId: string;
  itemType: 'master' | 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail';
  changedFields: string[];
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: Date;
}

export interface ChangeTracker {
  hasUnsavedChanges: boolean;
  changedItems: Map<string, ChangeRecord>;
  deletedItems: Set<string>;
  newItems: Set<string>;
}

// 狀態管理器
export interface TLS12040StateManager {
  originalApiData: ChargeSettingAPIModel[];
  currentEditData: ChargeSettingBusinessModel[];
  changeTracker: ChangeTracker;
  uiState: TLS12040PageState;
}

@Injectable({
  providedIn: 'root'
})
export class TLS12040DataFlowService {

  private stateManager: TLS12040StateManager = this.createInitialState();
  private stateSubject = new BehaviorSubject<TLS12040StateManager>(this.stateManager);

  private readonly locationOptionsService = inject(LocationOptionsService);

  public state$ = this.stateSubject.asObservable();

  constructor(
    private apiService: TLS12040Service
  ) { }

  /**
   * 載入折扣選項
   */
  async loadDiscountOptions(): Promise<any[]> {
    try {
      console.log('載入 TLS12040 折扣選項...');

      const options = await firstValueFrom(
        this.locationOptionsService.getPaperTypeOptions('T102').pipe(
          catchError(error => {
            console.error('載入折扣選項時發生錯誤:', error);
            return of([]);
          })
        )
      );

      console.log('TLS12040 折扣選項載入完成:', options?.length || 0);
      return options || [];
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      return [];
    }
  }

  /**
   * 載入資料 - 主要入口點
   */
  async loadData(
    applyNo: string | null,
    discountOptions?: any[],
    contractStartDate?: string,
    contractEndDate?: string
  ): Promise<void> {
    try {
      this.updateUIState({ loading: true, error: null });

      console.log('TLS12040DataFlowService: 開始載入資料 apply_no:', applyNo);

      // 呼叫 API
      const response = await firstValueFrom(
        this.apiService.queryTLS12040Charge(applyNo)
      );

      if (response.Status !== '0000') {
        throw new Error(response.Message || '查詢失敗');
      }

      const originalData = response.Data?.ChargeSettings || [];
      console.log('TLS12040DataFlowService: API 回傳資料:', originalData);

      // 轉換為業務模型
      let businessData = TLS12040DataTransformer.apiToBusinessModel(originalData);
      console.log('TLS12040DataFlowService: 轉換後業務資料:', businessData);

      // 如果有提供折扣選項，增強資料
      if (discountOptions && discountOptions.length > 0) {
        businessData = this.enhanceDataWithDiscountOptions(
          businessData,
          discountOptions,
          contractStartDate,
          contractEndDate
        );
        console.log('TLS12040DataFlowService: 增強後資料:', businessData);
      }

      // 更新狀態
      this.stateManager = {
        ...this.stateManager,
        originalApiData: originalData,
        currentEditData: businessData,
        changeTracker: this.createEmptyTracker()
      };

      this.updateUIState({
        loading: false,
        dataLoaded: true,
        hasUnsavedChanges: false
      });

      this.notifyStateChange();

    } catch (error) {
      console.error('TLS12040DataFlowService: 載入失敗:', error);
      this.updateUIState({
        loading: false,
        error: error instanceof Error ? error.message : '載入資料失敗'
      });
      throw error;
    }
  }

  /**
   * 更新欄位值 - 統一的變更處理
   */
  updateField(
    itemId: string | number,
    itemType: 'master' | 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail',
    fieldName: string,
    newValue: any,
    parentId?: string | number
  ): void {

    console.log('TLS12040DataFlowService: 更新欄位', {
      itemId, itemType, fieldName, newValue, parentId
    });

    // 找到要更新的項目
    const targetItem = this.findItem(itemId, itemType, parentId);
    if (!targetItem) {
      console.error(`找不到項目: ${itemId}, type: ${itemType}`);
      return;
    }

    // 記錄變更
    const oldValue = targetItem[fieldName];
    if (oldValue !== newValue) {
      this.recordChange(String(itemId), itemType, fieldName, oldValue, newValue);

      // 更新值
      targetItem[fieldName] = newValue;

      // 更新項目狀態
      this.updateItemStatus(targetItem);

      // 特殊邏輯處理
      this.handleSpecialFieldLogic(fieldName, newValue, targetItem, itemType);

      // 通知變更
      this.markAsChanged();
      this.notifyStateChange();
    }
  }

  /**
   * 新增項目
   */
  addItem(
    itemType: 'master' | 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail',
    parentId?: string | number,
    initialData?: Partial<any>
  ): string {

    console.log('TLS12040DataFlowService: 新增項目', { itemType, parentId, initialData });

    const newItem = this.createNewItem(itemType, parentId, initialData);
    const newId = newItem.id;

    // 添加到適當的陣列
    switch (itemType) {
      case 'master':
        this.stateManager.currentEditData.push(newItem);
        break;

      default:
        this.addDetailItem(newItem, itemType, String(parentId!));
        break;
    }

    // 記錄為新項目
    this.stateManager.changeTracker.newItems.add(String(newId));
    this.markAsChanged();
    this.notifyStateChange();

    return String(newId);
  }

  /**
   * 刪除項目
   */
  deleteItem(
    itemId: string | number,
    itemType: 'master' | 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail',
    parentId?: string | number
  ): void {

    console.log('TLS12040DataFlowService: 刪除項目', { itemId, itemType, parentId });

    const targetItem = this.findItem(itemId, itemType, parentId);
    if (!targetItem) return;

    const itemIdStr = String(itemId);
    const isNewItem = this.stateManager.changeTracker.newItems.has(itemIdStr);

    if (isNewItem) {
      // 新項目直接從陣列移除
      this.removeFromArray(itemIdStr, itemType, parentId ? String(parentId) : undefined);
      this.stateManager.changeTracker.newItems.delete(itemIdStr);
    } else {
      // 現有項目標記為 deleted
      targetItem._status = 'deleted';
      this.stateManager.changeTracker.deletedItems.add(itemIdStr);
    }

    this.markAsChanged();
    this.notifyStateChange();
  }

  /**
   * 取得當前編輯資料（過濾已刪除的項目）
   */
  getVisibleData(): ChargeSettingBusinessModel[] {
    return this.stateManager.currentEditData.filter(item => item._status !== 'deleted');
  }

  /**
   * 取得提交資料
   */
  getSubmitData(applyNo: string): any {
    return TLS12040DataTransformer.collectChangesForSubmission(
      this.stateManager.currentEditData,
      applyNo
    );
  }

  /**
   * 檢查是否有未儲存的變更
   */
  hasUnsavedChanges(): boolean {
    return this.stateManager.changeTracker.hasUnsavedChanges;
  }

  /**
   * 重置所有變更
   */
  resetChanges(): void {
    this.stateManager = {
      ...this.stateManager,
      currentEditData: TLS12040DataTransformer.apiToBusinessModel(this.stateManager.originalApiData),
      changeTracker: this.createEmptyTracker()
    };

    this.updateUIState({ hasUnsavedChanges: false });
    this.notifyStateChange();
  }

  /**
   * 清空所有資料
   */
  clearAll(): void {
    this.stateManager = this.createInitialState();
    this.notifyStateChange();
  }

  // ============= 私有方法 =============

  /**
   * 使用折扣選項增強資料 - 確保所有選項都出現
   */
  private enhanceDataWithDiscountOptions(
    businessData: ChargeSettingBusinessModel[],
    discountOptions: any[],
    contractStartDate?: string,
    contractEndDate?: string
  ): ChargeSettingBusinessModel[] {
    const defaultStartDate = contractStartDate || new Date().toISOString().split('T')[0];
    const defaultEndDate = contractEndDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    console.log(' TLS12040 增強資料 (學習 TLS13010):', {
      businessDataCount: businessData.length,
      discountOptionsCount: discountOptions.length,
      startDate: defaultStartDate,
      endDate: defaultEndDate
    });

    return businessData.map((commissionItem, index) => {
      console.log(`處理抽成項目 ${index + 1}:`, commissionItem.tlt_id);

      // 增強 ChargeDetails (折扣設定標籤)
      const originalChargeDetails = commissionItem.ChargeDetails || [];
      console.log(`  原始 ChargeDetails 數量: ${originalChargeDetails.length}`);
      this.debugCagBarcodeIntegrity(originalChargeDetails, `原始 ChargeDetails - 項目 ${index + 1}`);

      commissionItem.ChargeDetails = this.buildCompleteDiscountItems(
        originalChargeDetails,
        discountOptions,
        defaultStartDate,
        defaultEndDate,
        'chargeDetail',
        commissionItem
      );

      this.debugCagBarcodeIntegrity(commissionItem.ChargeDetails, `增強後 ChargeDetails - 項目 ${index + 1}`);

      // 增強 LevelChargeDetails (層級抽成標籤)
      const originalLevelDetails = commissionItem.LevelChargeDetails || [];
      console.log(`  原始 LevelChargeDetails 數量: ${originalLevelDetails.length}`);
      this.debugCagBarcodeIntegrity(originalLevelDetails, `原始 LevelChargeDetails - 項目 ${index + 1}`);

      commissionItem.LevelChargeDetails = this.buildCompleteDiscountItems(
        originalLevelDetails,
        discountOptions,
        defaultStartDate,
        defaultEndDate,
        'levelChargeDetail',
        commissionItem
      );

      this.debugCagBarcodeIntegrity(commissionItem.LevelChargeDetails, `增強後 LevelChargeDetails - 項目 ${index + 1}`);

      // YearChargeDetails 完全不處理，保持原狀
      console.log(`  YearChargeDetails 保持原狀，數量: ${commissionItem.YearChargeDetails?.length || 0}`);

      return commissionItem;
    });
  }

  private debugCagBarcodeIntegrity(items: any[], context: string): void {
    console.log(`🔍 檢查 cag_barcode 完整性 - ${context}:`);

    items.forEach((item, index) => {
      if (item.cag_barcode === '000') {
        console.log(`  項目 ${index}: 000 項目狀態`, {
          id: item.id,
          cag_barcode: item.cag_barcode,
          is_selected: item.is_selected,
          _status: item._status,
          barcode_desc: item.barcode_desc
        });
      }
    });

    const uniqueBarcodes = [...new Set(items.map(item => item.cag_barcode))];
    console.log(`  唯一的 cag_barcode 值:`, uniqueBarcodes);

    if (uniqueBarcodes.length !== items.length) {
      console.warn(`⚠️ 發現重複的 cag_barcode 值`);
    }
  }
  /**
   * 建立完整的折扣項目列表（包含所有選項）
   */
  private buildCompleteDiscountItems(
    existingDetails: any[],
    discountOptions: any[],
    contractStartDate: string,
    contractEndDate: string,
    itemType: 'chargeDetail' | 'levelChargeDetail',
    parentItem: ChargeSettingBusinessModel
  ): any[] {
    console.log('🔧 TLS12040 建立完整折扣項目 (使用日期工具):', {
      itemType,
      existingCount: existingDetails.length,
      optionsCount: discountOptions.length,
      parentTltId: parentItem.tlt_id
    });

    //  確保日期參數是正確格式
    const normalizedStartDate = DateUtils.toDateString(contractStartDate);
    const normalizedEndDate = DateUtils.toDateString(contractEndDate);

    console.log('📅 正規化後的日期:', {
      原始起始日: contractStartDate,
      正規化起始日: normalizedStartDate,
      原始結束日: contractEndDate,
      正規化結束日: normalizedEndDate
    });

    const result: any[] = [];
    const isNewContractWithoutData = existingDetails.length === 0;

    discountOptions?.forEach((option, index) => {
      const existingItems = existingDetails.filter(detail =>
        detail.cag_barcode === option.value && detail._status !== 'deleted'
      );

      if (existingItems.length > 0) {
        // 處理既有項目
        existingItems.forEach(existingItem => {
          const enhancedItem = itemType === 'levelChargeDetail' ? {
            ...existingItem,
            cag_barcode: existingItem.cag_barcode,
            barcode_desc: existingItem.barcode_desc || option.label,
            _status: existingItem._status || 'original',
            is_selected: true,
            is_configured: true,
            is_enabled: true,
            //  關鍵修正：使用日期工具正規化
            tlt_bdate: DateUtils.toDateString(existingItem.tlt_bdate) || normalizedStartDate,
            tlt_edate: DateUtils.toDateString(existingItem.tlt_edate) || normalizedEndDate,
            seq_no: existingItem.seq_no || (index + 1),
            level_bmount: existingItem.level_bmount || 0,
            level_eamount: existingItem.level_eamount || 0,
            level_charge_rate: existingItem.level_charge_rate || 0
          } : {
            ...existingItem,
            cag_barcode: existingItem.cag_barcode,
            barcode_desc: existingItem.barcode_desc || option.label,
            _status: existingItem._status || 'original',
            is_selected: true,
            is_configured: true,
            is_enabled: true,
            //  關鍵修正：使用日期工具正規化
            tlt_bdate: DateUtils.toDateString(existingItem.tlt_bdate) || normalizedStartDate,
            tlt_edate: DateUtils.toDateString(existingItem.tlt_edate) || normalizedEndDate,
            cag_charge_rate: existingItem.cag_charge_rate || 0
          };

          result.push(enhancedItem);
          console.log(` 保持既有項目: ${existingItem.cag_barcode} - 日期: ${enhancedItem.tlt_bdate} ~ ${enhancedItem.tlt_edate}`);
        });
      } else {
        // 處理新增項目
        const shouldSelectByDefault = (option.value === '000' || option.label?.includes('正品'));

        const newItem = itemType === 'levelChargeDetail' ? {
          id: this.generateTempId(),
          apply_no: parentItem.apply_no,
          tlt_id: parentItem.tlt_id,
          cag_barcode: option.value,
          barcode_desc: option.label || '',
          //  關鍵修正：直接使用正規化後的日期字串
          tlt_bdate: normalizedStartDate,
          tlt_edate: normalizedEndDate,
          is_configured: shouldSelectByDefault,
          is_enabled: shouldSelectByDefault,
          _status: shouldSelectByDefault ? 'new' : 'new',
          is_selected: shouldSelectByDefault,
          seq_no: index + 1,
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: shouldSelectByDefault ? 0 : 0
        } : {
          id: this.generateTempId(),
          apply_no: parentItem.apply_no,
          tlt_id: parentItem.tlt_id,
          cag_barcode: option.value,
          barcode_desc: option.label || '',
          //  關鍵修正：直接使用正規化後的日期字串
          tlt_bdate: normalizedStartDate,
          tlt_edate: normalizedEndDate,
          is_configured: shouldSelectByDefault,
          is_enabled: shouldSelectByDefault,
          _status: shouldSelectByDefault ? 'new' : 'new',
          is_selected: shouldSelectByDefault,
          cag_charge_rate: shouldSelectByDefault ? 0 : 0
        };

        result.push(newItem);
        console.log(`➕ 新增項目: ${option.value} - 日期: ${newItem.tlt_bdate} ~ ${newItem.tlt_edate}`);
      }
    });

    console.log(' 建立完整折扣項目完成:', {
      itemType,
      resultCount: result.length,
      日期範圍: `${normalizedStartDate} ~ ${normalizedEndDate}`
    });

    return result;
  }

  private findItem(itemId: string | number, itemType: string, parentId?: string | number): any {
    const idStr = String(itemId);
    const parentIdStr = parentId ? String(parentId) : '';

    switch (itemType) {
      case 'master':
        return this.stateManager.currentEditData.find(item => String(item.id) === idStr);

      case 'chargeDetail':
        {
          const master1 = this.stateManager.currentEditData.find(item => String(item.id) === parentIdStr);
          return master1?.ChargeDetails?.find(detail => String(detail.id) === idStr);
        }

      case 'yearChargeDetail':
        {
          const master2 = this.stateManager.currentEditData.find(item => String(item.id) === parentIdStr);
          return master2?.YearChargeDetails?.find(detail => String(detail.id) === idStr);
        }

      case 'levelChargeDetail':
        {
          const master3 = this.stateManager.currentEditData.find(item => String(item.id) === parentIdStr);
          return master3?.LevelChargeDetails?.find(detail => String(detail.id) === idStr);
        }

      default:
        return null;
    }
  }

  private recordChange(
    itemId: string,
    itemType: string,
    fieldName: string,
    oldValue: any,
    newValue: any
  ): void {
    const existingRecord = this.stateManager.changeTracker.changedItems.get(itemId);

    if (existingRecord) {
      if (!existingRecord.changedFields.includes(fieldName)) {
        existingRecord.changedFields.push(fieldName);
      }
      existingRecord.newValues[fieldName] = newValue;
      if (!existingRecord.oldValues.hasOwnProperty(fieldName)) {
        existingRecord.oldValues[fieldName] = oldValue;
      }
    } else {
      const newRecord: ChangeRecord = {
        itemId,
        itemType: itemType as any,
        changedFields: [fieldName],
        oldValues: { [fieldName]: oldValue },
        newValues: { [fieldName]: newValue },
        timestamp: new Date()
      };
      this.stateManager.changeTracker.changedItems.set(itemId, newRecord);
    }
  }

  private updateItemStatus(item: any): void {
    if (item._status === 'original') {
      item._status = 'modified';
    }
  }

  private handleSpecialFieldLogic(
    fieldName: string,
    newValue: any,
    targetItem: any,
    itemType: string
  ): void {
    // 處理 cap_saletype 同步邏輯
    if ((fieldName === 'cap_saletype1' || fieldName === 'cap_saletype2') && itemType === 'master') {
      const stringValue = this.convertToYNString(newValue);
      this.syncCapSaletypeToAllMasters(fieldName, stringValue);
    }
  }

  private syncCapSaletypeToAllMasters(fieldName: string, newValue: string): void {
    console.log(`TLS12040DataFlowService: 同步 ${fieldName} = ${newValue} 到所有主檔`);

    this.stateManager.currentEditData.forEach(master => {
      if (master._status !== 'deleted') {
        // 使用類型安全的方式更新欄位
        if (fieldName === 'cap_saletype1' && master.cap_saletype1 !== newValue) {
          master.cap_saletype1 = newValue;
          this.updateItemStatus(master);
        } else if (fieldName === 'cap_saletype2' && master.cap_saletype2 !== newValue) {
          master.cap_saletype2 = newValue;
          this.updateItemStatus(master);
        }
      }
    });
  }

  /**
   * 轉換值為 Y/N 字串格式（用於後端儲存）
   */
  private convertToYNString(value: any): string {
    if (value === true || value === 'true' || value === 'Y') {
      return 'Y';
    }
    if (value === false || value === 'false' || value === 'N') {
      return 'N';
    }
    return 'N'; // 預設為 N
  }

  /**
   * 轉換 Y/N 字串為 boolean（用於前端 checkbox 顯示）
   */
  private convertToBoolean(value: any): boolean {
    return value === 'Y' || value === true;
  }

  private createNewItem(itemType: string, parentId?: string | number, initialData?: any): any {
    const tempId = this.generateTempId();

    switch (itemType) {
      case 'master':
        return {
          id: tempId,
          apply_no: null,
          tlt_id: '',
          tlt_id_desc: '',
          cag_bdate: '',
          cag_edate: '',
          cag_taxtype: '1',
          sst_amount: null,
          sst_rate: null,
          cap_saletype1: 'N',
          cap_saletype2: 'N',
          cap_saletype5: 'N',
          cag_remark: '',
          _status: 'new',
          ChargeDetails: [],
          YearChargeDetails: [],
          LevelChargeDetails: [],
          ...initialData
        };

      case 'chargeDetail':
        return {
          id: null,
          apply_no: null,
          tlt_id: parentId ? String(parentId) : '',
          cag_barcode: '',
          tlt_bdate: null,
          tlt_edate: null,
          cag_charge_rate: null,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          ...initialData
        };

      case 'yearChargeDetail':
        return {
          id: tempId,
          apply_no: null,
          tlt_id: parentId ? String(parentId) : '',
          tlt_bdate: '',
          tlt_edate: '',
          year_amount: 0,
          extra_rate: 0,
          _status: 'new',
          ...initialData
        };

      case 'levelChargeDetail':
        return {
          id: null,
          apply_no: null,
          tlt_id: parentId ? String(parentId) : '',
          seq_no: 1,
          cag_barcode: '',
          level_bmount: null,
          level_eamount: null,
          level_charge_rate: null,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          ...initialData
        };

      default:
        throw new Error(`不支援的項目類型: ${itemType}`);
    }
  }

  private addDetailItem(newItem: any, itemType: string, parentId: string): void {
    const parentMaster = this.stateManager.currentEditData.find(master => String(master.id) === parentId);
    if (!parentMaster) {
      console.error(`找不到父項目: ${parentId}`);
      return;
    }

    switch (itemType) {
      case 'chargeDetail':
        if (!parentMaster.ChargeDetails) parentMaster.ChargeDetails = [];
        parentMaster.ChargeDetails.push(newItem);
        break;

      case 'yearChargeDetail':
        if (!parentMaster.YearChargeDetails) parentMaster.YearChargeDetails = [];
        parentMaster.YearChargeDetails.push(newItem);
        break;

      case 'levelChargeDetail':
        if (!parentMaster.LevelChargeDetails) parentMaster.LevelChargeDetails = [];
        parentMaster.LevelChargeDetails.push(newItem);
        break;
    }

    this.updateItemStatus(parentMaster);
  }

  private removeFromArray(itemId: string, itemType: string, parentId?: string): void {
    switch (itemType) {
      case 'master':
        {
          const masterIndex = this.stateManager.currentEditData.findIndex(item => String(item.id) === itemId);
          if (masterIndex > -1) {
            this.stateManager.currentEditData.splice(masterIndex, 1);
          }
          break;
        }

      case 'chargeDetail':
        if (parentId) {
          const master1 = this.stateManager.currentEditData.find(item => String(item.id) === parentId);
          if (master1?.ChargeDetails) {
            const detailIndex = master1.ChargeDetails.findIndex(detail => String(detail.id) === itemId);
            if (detailIndex > -1) {
              master1.ChargeDetails.splice(detailIndex, 1);
            }
          }
        }
        break;

      case 'yearChargeDetail':
        if (parentId) {
          const master2 = this.stateManager.currentEditData.find(item => String(item.id) === parentId);
          if (master2?.YearChargeDetails) {
            const detailIndex = master2.YearChargeDetails.findIndex(detail => String(detail.id) === itemId);
            if (detailIndex > -1) {
              master2.YearChargeDetails.splice(detailIndex, 1);
            }
          }
        }
        break;

      case 'levelChargeDetail':
        if (parentId) {
          const master3 = this.stateManager.currentEditData.find(item => String(item.id) === parentId);
          if (master3?.LevelChargeDetails) {
            const detailIndex = master3.LevelChargeDetails.findIndex(detail => String(detail.id) === itemId);
            if (detailIndex > -1) {
              master3.LevelChargeDetails.splice(detailIndex, 1);
            }
          }
        }
        break;
    }
  }

  private createInitialState(): TLS12040StateManager {
    return {
      originalApiData: [],
      currentEditData: [],
      changeTracker: this.createEmptyTracker(),
      uiState: {
        loading: false,
        saving: false,
        dataLoaded: false,
        hasUnsavedChanges: false,
        selectedTab: 'charge-detail',
        expandedMasterIds: [],
        showEditModal: false,
        showDeleteConfirm: false,
        filters: {}
      }
    };
  }

  private createEmptyTracker(): ChangeTracker {
    return {
      hasUnsavedChanges: false,
      changedItems: new Map(),
      deletedItems: new Set(),
      newItems: new Set()
    };
  }

  private updateUIState(updates: Partial<TLS12040PageState>): void {
    this.stateManager.uiState = {
      ...this.stateManager.uiState,
      ...updates
    };
  }

  private markAsChanged(): void {
    this.stateManager.changeTracker.hasUnsavedChanges = true;
    this.updateUIState({ hasUnsavedChanges: true });
  }

  private notifyStateChange(): void {
    this.stateSubject.next({ ...this.stateManager });
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}
