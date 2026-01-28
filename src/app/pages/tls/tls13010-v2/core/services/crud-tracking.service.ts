/**
 * 共用 CRUD 追蹤服務
 * 用於追蹤表格資料的新增、修改、刪除狀態
 * 可被代扣款、抽成、條件設定等模組共用
 */

/**
 * 追蹤狀態類型
 */
export type TrackingStatus = 'new' | 'modified' | 'deleted' | 'original';

/**
 * 資料來源類型
 */
export type DataSource = 'CONTRACT_EXISTING' | 'APS_AVAILABLE' | 'COPIED_ITEM' | 'MANUAL';

/**
 * 可追蹤項目的基礎介面
 */
export interface TrackableItem {
  id?: string | number;
  is_selected: boolean;
  data_source: string;
  _status?: TrackingStatus;
  _originalSelected?: boolean;
  _originalData?: Partial<TrackableItem>;
  [key: string]: unknown;
}

/**
 * CRUD 操作結果
 */
export interface CrudOperations<T> {
  toInsert: T[];
  toUpdate: T[];
  toDelete: T[];
}

/**
 * 變更檢測配置
 */
export interface ChangeDetectionConfig {
  /** 要比較的欄位列表 */
  editableFields: string[];
  /** 數值欄位列表 (用於數值比較) */
  numericFields?: string[];
  /** 日期欄位列表 (用於日期比較) */
  dateFields?: string[];
}

/**
 * CRUD 追蹤服務
 */
export class CrudTrackingService<T extends TrackableItem> {

  /**
   * 初始化項目的追蹤狀態
   * @param item 項目
   * @param isFromContract 是否來自契約既有資料
   */
  static initializeItem<T extends TrackableItem>(
    item: T,
    isFromContract: boolean
  ): T {
    return {
      ...item,
      data_source: isFromContract ? 'CONTRACT_EXISTING' : 'APS_AVAILABLE',
      is_selected: isFromContract,
      _status: isFromContract ? 'original' : undefined,
      _originalSelected: isFromContract,
      _originalData: isFromContract ? { ...item } : undefined
    };
  }

  /**
   * 更新勾選狀態變更後的追蹤狀態
   * @param item 項目
   * @param config 變更檢測配置
   */
  static updateSelectionStatus<T extends TrackableItem>(
    item: T,
    config: ChangeDetectionConfig
  ): T {
    const isContractExisting = item.data_source === 'CONTRACT_EXISTING';
    const hasChanges = this.hasDataChanges(item, config);

    if (item.is_selected) {
      // 被勾選
      if (isContractExisting) {
        // 原有項目
        if (item._status === 'deleted') {
          // 從刪除恢復
          item._status = hasChanges ? 'modified' : 'original';
        } else {
          // 檢查變更
          item._status = hasChanges ? 'modified' : 'original';
        }
      } else {
        // 新增項目
        item._status = 'new';
      }
    } else {
      // 取消勾選
      if (isContractExisting) {
        // 標記為刪除
        item._status = 'deleted';
      } else {
        // 新增項目未勾選，清除狀態
        delete item._status;
      }
    }

    return item;
  }

  /**
   * 更新欄位值變更後的追蹤狀態
   * @param item 項目
   * @param config 變更檢測配置
   */
  static updateFieldChangeStatus<T extends TrackableItem>(
    item: T,
    config: ChangeDetectionConfig
  ): T {
    // 只有被勾選的項目才需要追蹤變更
    if (!item.is_selected) {
      return item;
    }

    const isContractExisting = item.data_source === 'CONTRACT_EXISTING';

    if (isContractExisting) {
      const hasChanges = this.hasDataChanges(item, config);
      item._status = hasChanges ? 'modified' : 'original';
    } else {
      // 新增項目保持 new 狀態
      item._status = 'new';
    }

    return item;
  }

  /**
   * 檢查項目是否有資料變更
   * @param item 項目
   * @param config 變更檢測配置
   */
  static hasDataChanges<T extends TrackableItem>(
    item: T,
    config: ChangeDetectionConfig
  ): boolean {
    if (!item._originalData) {
      return false;
    }

    for (const field of config.editableFields) {
      const current = this.normalizeValue(item[field], field, config);
      const original = this.normalizeValue(item._originalData[field], field, config);

      if (current !== original) {
        return true;
      }
    }

    return false;
  }

  /**
   * 正規化值以進行比較
   */
  private static normalizeValue(
    value: unknown,
    field: string,
    config: ChangeDetectionConfig
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // 數值欄位
    if (config.numericFields?.includes(field)) {
      const num = parseFloat(String(value));
      return isNaN(num) ? '0' : num.toString();
    }

    // 日期欄位
    if (config.dateFields?.includes(field)) {
      if (value instanceof Date) {
        return value.toISOString().slice(0, 7); // YYYY-MM
      }
      // 處理 YYYYMM 或 YYYY-MM 格式
      const dateStr = String(value).replace(/[^0-9]/g, '');
      return dateStr.slice(0, 6); // YYYYMM
    }

    return String(value).trim();
  }

  /**
   * 分類項目為 CRUD 操作
   * @param items 所有項目
   * @param cleanFn 清理函數 (將前端項目轉換為 API 格式)
   */
  static categorizeOperations<T extends TrackableItem, C>(
    items: T[],
    cleanFn: (item: T) => C
  ): CrudOperations<C> {
    const toInsert: C[] = [];
    const toUpdate: C[] = [];
    const toDelete: C[] = [];

    items.forEach(item => {
      // 處理刪除項目
      if (item._status === 'deleted') {
        if (this.hasValidId(item.id)) {
          toDelete.push({ id: Number(item.id) } as unknown as C);
        }
        return;
      }

      // 只處理被勾選的項目
      if (!item.is_selected) return;

      // 清理資料
      const cleanItem = cleanFn(item);

      // 分類到對應操作
      if (item._status === 'new') {
        toInsert.push(cleanItem);
      } else if (item._status === 'modified') {
        toUpdate.push(cleanItem);
      }
      // original 狀態不需要提交
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 檢查 ID 是否有效
   */
  static hasValidId(id: unknown): boolean {
    if (id === null || id === undefined) return false;
    if (typeof id === 'number') return id > 0;
    if (typeof id === 'string') {
      const numId = parseInt(id, 10);
      return !isNaN(numId) && numId > 0;
    }
    return false;
  }

  /**
   * 複製項目
   * @param item 原始項目
   * @param generateId 生成新 ID 的函數
   */
  static copyItem<T extends TrackableItem>(
    item: T,
    generateId: () => string | number = () => Date.now()
  ): T {
    return {
      ...item,
      id: generateId(),
      data_source: 'COPIED_ITEM',
      is_selected: true,
      _status: 'new' as TrackingStatus,
      _originalSelected: false,
      _originalData: undefined
    };
  }

  /**
   * 建立新項目
   * @param template 模板資料
   * @param generateId 生成新 ID 的函數
   */
  static createNewItem<T extends TrackableItem>(
    template: Partial<T>,
    generateId: () => string | number = () => Date.now()
  ): T {
    return {
      ...template,
      id: generateId(),
      data_source: 'MANUAL',
      is_selected: true,
      _status: 'new',
      _originalSelected: false,
      _originalData: undefined
    } as T;
  }

  /**
   * 刪除項目 (標記為刪除或從陣列移除)
   * @param items 項目陣列
   * @param itemId 要刪除的項目 ID
   * @returns 更新後的陣列
   */
  static deleteItem<T extends TrackableItem>(
    items: T[],
    itemId: string | number
  ): T[] {
    return items.map(item => {
      if (item.id !== itemId) return item;

      if (item._status === 'new' || item.data_source !== 'CONTRACT_EXISTING') {
        // 新增項目直接移除 (返回 null，之後過濾掉)
        return null as unknown as T;
      } else {
        // 原有項目標記為刪除
        return {
          ...item,
          is_selected: false,
          _status: 'deleted' as TrackingStatus
        };
      }
    }).filter(item => item !== null);
  }

  /**
   * 取得顯示用的項目 (過濾掉已刪除的)
   */
  static getDisplayItems<T extends TrackableItem>(items: T[]): T[] {
    return items.filter(item => item._status !== 'deleted');
  }

  /**
   * 取得已勾選的項目
   */
  static getSelectedItems<T extends TrackableItem>(items: T[]): T[] {
    return items.filter(item => item.is_selected && item._status !== 'deleted');
  }

  /**
   * 取得有變更的項目數量
   */
  static getChangeCount<T extends TrackableItem>(items: T[]): {
    newCount: number;
    modifiedCount: number;
    deletedCount: number;
    totalChanges: number;
  } {
    let newCount = 0;
    let modifiedCount = 0;
    let deletedCount = 0;

    items.forEach(item => {
      switch (item._status) {
        case 'new':
          if (item.is_selected) newCount++;
          break;
        case 'modified':
          modifiedCount++;
          break;
        case 'deleted':
          deletedCount++;
          break;
      }
    });

    return {
      newCount,
      modifiedCount,
      deletedCount,
      totalChanges: newCount + modifiedCount + deletedCount
    };
  }

  /**
   * 備份項目的原始資料
   */
  static backupOriginalData<T extends TrackableItem>(item: T): T {
    return {
      ...item,
      _originalData: { ...item },
      _originalSelected: item.is_selected
    };
  }

  /**
   * 重置項目到原始狀態
   */
  static resetToOriginal<T extends TrackableItem>(item: T): T | null {
    if (!item._originalData) {
      return null;
    }

    return {
      ...item,
      ...item._originalData,
      is_selected: item._originalSelected ?? false,
      _status: item._originalSelected ? 'original' : undefined
    } as T;
  }
}
