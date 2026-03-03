import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { EditColumn } from '../table-edit.model';
import { TableUtilityService } from './table-edit-utility.service';

/**
 * TableDataService 負責管理表格的完整資料 (_fullData) 和顯示資料 (_tableData) 的狀態。
 * 包含資料的初始化、新增、刪除、修改狀態標記等核心邏輯。
 */
@Injectable()  // 🔧 移除 providedIn: 'root'，改為在 Component 層級提供
export class TableEditDataService {
  // 完整資料 (包含 deleted 狀態的資料)
  private _fullData: any[] = [];
  // 內部用於表格顯示的資料 (過濾掉 Deleted，包含新增行)
  private _tableData: any[] = [];

  // 公開屬性，供 Component 讀取
  public get tableData(): any[] { return this._tableData; }
  public get fullData(): any[] { return this._fullData; }
  // 私有屬性：用於儲存外部資料的唯一標識符，幫助判斷內容是否有變動
  private _externalDataFingerprint = '';

  constructor(private tableUtilityService: TableUtilityService) { }

  // --- 私有輔助方法 ---
  private calculateRow(rowData: any, columns: EditColumn[], changedField?: string): void {
    columns.forEach(col => {
      if (col.calculate) {
        if (changedField) {
          if (col.field === changedField) {
            const updates = col.calculate(rowData, rowData[col.field]);
            this.applyUpdates(rowData, updates);
          }
        }
      }
    });
  }

  private applyUpdates(rowData: any, updates: any) {
    if (updates) {
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          rowData[key] = updates[key];
        }
      }
    }
  }

  private getCleanData(keepDeletedData: boolean, canInsert: boolean): any[] {
    if (keepDeletedData) {
      // 保留 Deleted 資料，從 _fullData 取得
      return this._fullData.filter(item => !item._isAutoInsertCandidate);
    } else {
      // 預設行為：過濾掉 Deleted 狀態的資料，從 _tableData 取得
      return this._tableData.filter(item => !item._isAutoInsertCandidate);
    }
  }

  // --- 核心資料操作方法 ---

  /**
   * 1. 載入和初始化資料（相當於 ngOnChanges 的核心邏輯）。
   * @param data 外部傳入的原始資料
   */
  public initializeData(
    data: any[],
    columns: EditColumn[],
    dataKey: string,
    dataStatusField: string,
    dataStatusValue: any,
    keepDeletedData: boolean,
    canInsert: boolean,
    rowValidate: ((rowData: any, index?: number) => { isValid: boolean, errorMessage: string; }) | undefined,
    defaultInsertData: any,
    disabled: boolean
  ): { tableData: any[], cleanData: any[] } {

    // 步驟 1 & 2: 保留舊的 deleted 資料 (如果設定是 keepDeletedData=true)
    const existingDeletedItems = keepDeletedData
      ? this._fullData.filter(item => item[dataStatusField] === dataStatusValue.Deleted)
      : [];

    // 步驟 3: 初始化新傳入的資料，並計算欄位/驗證行
    this._fullData = data.filter(item => item != null).map((item: any, index) => {
      // 1. 強制確保有 Key (不管狀態是什麼)
      if (!item[dataKey]) {
        item[dataKey] = `temp-${uuidv4()}`;
      }
      // 2. 如果沒有狀態才設定為 Original
      if (item[dataStatusField] === undefined) {
        item[dataStatusField] = dataStatusValue.Original;
      }
      this.calculateRow(item, columns);
      if (rowValidate) {
        item._rowValidationError = rowValidate(item, index);
      }
      return item;
    });

    // 步驟 4: 合併舊的 deleted 資料
    if (existingDeletedItems.length > 0) {
      const existingKeys = new Set(
        this._fullData
          .map(item => item[dataKey])
          .filter(key => key !== undefined && key !== null && key !== '')
      );
      const deletedToRestore = existingDeletedItems.filter(item => {
        const itemKey = item[dataKey];
        return itemKey && !existingKeys.has(itemKey);
      });
      this._fullData = [...this._fullData, ...deletedToRestore];
    }

    // 步驟 5: 顯示用資料:過濾掉 deleted 狀態
    this._tableData = [...this._fullData.filter(item => item[dataStatusField] !== dataStatusValue.Deleted)];
    // 步驟 6: 如果內部資料中沒有新增行，則插入
    const shouldInsertCandidateRow = canInsert && !disabled;
    if (!this._tableData.some(item => item['_isAutoInsertCandidate']) && shouldInsertCandidateRow) {
      // insertNewRow 已經會更新 this._tableData
      this.insertNewRow(columns, dataKey, defaultInsertData, dataStatusField, dataStatusValue);
    }
    this._externalDataFingerprint = JSON.stringify(data);
    return {
      tableData: this._tableData, // 供表格顯示
      cleanData: this.getCleanData(keepDeletedData, canInsert) // 供 dataChange 發射
    };
  }

  /**
   * 新增一筆新的候選行到 _tableData。
   */
  public insertNewRow(
    columns: EditColumn[],
    dataKey: string,
    defaultInsertData: any,
    dataStatusField: string,
    dataStatusValue: any,
  ): any {
    const { newRowData, data } = this.tableUtilityService.insertNewRow(
      this._tableData,
      columns,
      dataKey,
      defaultInsertData,
      dataStatusField,
      dataStatusValue
    );
    this._tableData = data;
    return newRowData;
  }

  /**
   * 當 defaultInsertData 改變時，更新現有的「自動新增候選行」的預設值。
   */
  public updateCandidateRowDefaults(dataKey: string, dataStatusField: string, defaultInsertData: any): void {
    const candidateRow = this._tableData.find(item => item['_isAutoInsertCandidate'] === true);
    if (candidateRow && defaultInsertData) {
      const newDefaults = defaultInsertData;
      for (const key in newDefaults) {
        if (Object.prototype.hasOwnProperty.call(newDefaults, key)) {
          if (key !== dataKey && key !== dataStatusField && key !== '_isAutoInsertCandidate') {
            candidateRow[key] = newDefaults[key];
          }
        }
      }
    }
  }

  /**
   * 處理單一欄位值變更的邏輯，包括狀態轉換、驗證、計算和自動新增。
   */
  public updateRowOnValueChange(
    rowData: any,
    value: any,
    col: EditColumn,
    index: number,
    columns: EditColumn[],
    dataKey: string,
    dataStatusField: string,
    dataStatusValue: any,
    keepDeletedData: boolean,
    canInsert: boolean,
    rowValidate: ((rowData: any, index?: number) => { isValid: boolean; errorMessage: string; }) | undefined,
    defaultInsertData: any,
  ): { shouldInsertNewRow: boolean; cleanData: any[] } {

    let shouldInsertNewRow = false;

    //  新增：識別 template 欄位的使用者輸入
    const isUserInput = (col as any)?.isUserInput === true;

    // 1. 狀態標記
    if (rowData[dataStatusField] === dataStatusValue.Original) {
      rowData[dataStatusField] = dataStatusValue.Modified;
    }

    const isAutoInsertCandidate = rowData['_isAutoInsertCandidate'];

    // 新增：判定輸入生效，不限於 value
    const isEffectiveValue =
      isUserInput || (value !== undefined && value !== null && value !== '');

    // 2. 自動新增下一筆
    if (isAutoInsertCandidate && isEffectiveValue && canInsert) {
      this.insertNewRow(columns, dataKey, defaultInsertData, dataStatusField, dataStatusValue);
      rowData['_isAutoInsertCandidate'] = false;
      shouldInsertNewRow = true;

      rowData[dataStatusField] = dataStatusValue.New;

      this._fullData = [...this._fullData, rowData];
    }
    rowData[col.field] = value;
    // 3. 執行欄位計算
    this.calculateRow(rowData, columns, col.field);

    // 4. 行驗證
    if (rowValidate && !isAutoInsertCandidate) {
      rowData._rowValidationError = rowValidate(rowData, index);
    } else if (isAutoInsertCandidate) {
      delete rowData._rowValidationError;
    }

    // 5. 同步 fullData
    const fullIndex = this._fullData.findIndex(item => item[dataKey] === rowData[dataKey]);
    if (fullIndex !== -1) {
      this._fullData[fullIndex] = rowData;
    }

    return {
      shouldInsertNewRow,
      cleanData: this.getCleanData(keepDeletedData, canInsert),
    };
  }

  /**
   * 處理刪除行邏輯。
   */
  public deleteRows(
    selectedItems: any[],
    dataKey: string,
    dataStatusField: string,
    dataStatusValue: any,
    canInsert: boolean,
    keepDeletedData: boolean
  ): { tableData: any[], fullData: any[], cleanData: any[] } {
    const itemsToDelete = new Set(selectedItems.map((item: any) => item[dataKey]));

    // 1. 更新完整資料 (_fullData)
    this._fullData = this._fullData.map(item => {
      if (itemsToDelete.has(item[dataKey])) {
        // 原本或修改過的資料，將狀態改為 Deleted
        if (item[dataStatusField] === dataStatusValue.Original || item[dataStatusField] === dataStatusValue.Modified) {
          return { ...item, [dataStatusField]: dataStatusValue.Deleted };
        }
        return null; // 新增的資料直接移除 (返回 null，在 filter 中過濾掉)
      }
      return item;
    }).filter(item => item !== null);

    // 2. 更新內部顯示資料 (只在畫面上隱藏 Deleted 資料)
    this._tableData = [...this._fullData.filter(item => item[dataStatusField] !== dataStatusValue.Deleted)];
    // 3. 檢查並插入新增行 (如果清空了)
    if (this._tableData.length === 0 && canInsert) {
      // 這裡不執行 insertRow，因為我們還缺少 columns 和 defaultInsertData
      // 讓 Component 端在收到空資料後自行決定是否呼叫 insertRow，這裡只需要返回狀態即可。
      // 為了簡化，讓 Component 根據返回的 this._tableData.length 執行 insertRow。
    }

    return {
      tableData: this._tableData,
      fullData: this._fullData, // 供 delete.emit 使用
      cleanData: this.getCleanData(keepDeletedData, canInsert)
    };
  }

  /**
 * 檢查傳入的外部資料是否與 Service 內部維護的完整資料狀態同步。
 * 用於避免 ngOnChanges/dataChange 循環調用 Service.initializeData。
 */
  public isSynchronized(data: any[], dataKey: string): boolean {
    // 簡單檢查：比對長度 (排除新增候選行，如果有)
    const currentCleanData = this._fullData.filter(item => !item._isAutoInsertCandidate);
    // 1. 長度檢查
    if (data.length !== currentCleanData.length) {
      return false;
    }
    // 2. 標識符檢查 (確保所有 key 都存在)
    const dataKeys = new Set(data.map(item => item[dataKey]).filter(key => key !== undefined && key !== null));
    const currentKeys = new Set(currentCleanData.map(item => item[dataKey]).filter(key => key !== undefined && key !== null));

    // 檢查 Key 數量和 Key 集合是否相同
    if (dataKeys.size !== currentKeys.size) {
      return false;
    }
    for (const key of dataKeys) {
      if (!currentKeys.has(key)) {
        return false;
      }
    }
    // 3. 新增：檢查外部資料指紋
    // 如果外部資料與上次初始化時儲存的指紋不同，則認為需要同步
    const incomingFingerprint = JSON.stringify(data); // 使用最簡單的 JSON 序列化作為指紋
    if (incomingFingerprint !== this._externalDataFingerprint) {
      // 外部資料內容發生了變化（例如 onAutoCalculate），需要同步
      return false;
    }
    // 這是最寬鬆的檢查，只要長度相等且非空的第一個 key 相等，就認為是同步的
    return true;
  }
}
