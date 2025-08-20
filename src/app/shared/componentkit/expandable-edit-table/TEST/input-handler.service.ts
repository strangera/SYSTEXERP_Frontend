import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
export interface InputChangeEvent {
  rowData: any;
  column: ColumnDef;
  newValue: any;
  oldValue: any;
  inputType: 'text' | 'number' | 'date' | 'dropdown';
  isDetail?: boolean;
  rowIndex?: number;
  detailIndex?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InputHandlerService implements OnDestroy {

  // 🎯 防抖輸入流
  private inputSubject = new Subject<InputChangeEvent>();

  // 🎯 存儲當前輸入值，用於防止重複處理
  private currentInputValues = new Map<string, any>();

  // 🎯 防抖延遲時間（毫秒）
  private debounceTime = 300;

  constructor() {
    this.setupInputHandler();
  }

  ngOnDestroy(): void {
    this.inputSubject.complete();
    this.currentInputValues.clear();
  }

  /**
   * 🎯 設置輸入處理器
   */
  private setupInputHandler(): void {
    this.inputSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged((prev, curr) => {
        // 比較關鍵屬性，避免重複處理相同的輸入
        return prev.rowData === curr.rowData &&
          prev.column.field === curr.column.field &&
          prev.newValue === curr.newValue;
      })
    ).subscribe(event => {
      this.processInputChange(event);
    });
  }

  /**
   * 🎯 處理輸入變更（防抖後的處理）
   */
  private processInputChange(event: InputChangeEvent): void {
    const { rowData, column, newValue, inputType } = event;

    console.log(`🎯 防抖處理 ${inputType} 輸入:`, {
      field: column.field,
      newValue,
      防抖延遲: this.debounceTime
    });

    // 根據輸入類型進行特殊處理
    switch (inputType) {
      case 'text':
        this.processTextInput(event);
        break;
      case 'number':
        this.processNumberInput(event);
        break;
      case 'date':
        this.processDateInput(event);
        break;
      case 'dropdown':
        this.processDropdownInput(event);
        break;
    }
  }

  /**
   * 🎯 處理文字輸入
   */
  private processTextInput(event: InputChangeEvent): void {
    const { rowData, column, newValue } = event;

    // 應用長度限制
    let processedValue = newValue;
    if (column.maxLength && String(newValue).length > column.maxLength) {
      processedValue = String(newValue).substring(0, column.maxLength);
    }

    // 更新數據
    rowData[column.field] = processedValue;

    console.log(`✅ 文字輸入處理完成: ${column.field} = "${processedValue}"`);
  }

  /**
   * 🎯 處理數字輸入
   */
  private processNumberInput(event: InputChangeEvent): void {
    const { rowData, column, newValue } = event;

    let processedValue = newValue;

    // 處理數字字符串，移除千分位逗號
    if (typeof newValue === 'string') {
      processedValue = newValue.replace(/,/g, '');
    }

    // 轉換為數字
    if (processedValue === '' || processedValue === null || processedValue === undefined) {
      rowData[column.field] = null;
    } else {
      const numericValue = parseFloat(processedValue);
      rowData[column.field] = isNaN(numericValue) ? 0 : numericValue;
    }

    console.log(`✅ 數字輸入處理完成: ${column.field} = ${rowData[column.field]}`);
  }

  /**
   * 🎯 處理日期輸入
   */
  private processDateInput(event: InputChangeEvent): void {
    const { rowData, column, newValue } = event;

    // 應用長度限制
    let processedValue = newValue;
    if (column.maxLength && String(newValue).length > column.maxLength) {
      processedValue = String(newValue).substring(0, column.maxLength);
    }

    // 暫時只存儲用戶輸入，不進行日期解析（留給 blur 處理）
    // 這裡可以添加一個特殊的屬性來存儲用戶輸入
    const fieldKey = this.getFieldKey(rowData, column.field, event.isDetail, event.detailIndex);
    this.currentInputValues.set(fieldKey, processedValue);

    console.log(`📅 日期輸入暫存: ${column.field} = "${processedValue}"`);
  }

  /**
   * 🎯 處理下拉選單輸入
   */
  private processDropdownInput(event: InputChangeEvent): void {
    const { rowData, column, newValue, oldValue } = event;

    rowData[column.field] = newValue;

    console.log(`📋 下拉選單處理完成: ${column.field} = ${newValue}`);
  }

  /**
   * 🎯 發送輸入變更事件（供組件調用）
   */
  handleInput(event: InputChangeEvent): void {
    // 立即更新當前值的緩存
    const fieldKey = this.getFieldKey(
      event.rowData,
      event.column.field,
      event.isDetail,
      event.detailIndex
    );

    this.currentInputValues.set(fieldKey, event.newValue);

    // 發送到防抖流
    this.inputSubject.next(event);
  }

  /**
   * 🎯 處理 Blur 事件（兜底機制）
   */
  handleBlur(event: InputChangeEvent): void {
    const fieldKey = this.getFieldKey(
      event.rowData,
      event.column.field,
      event.isDetail,
      event.detailIndex
    );

    // 檢查是否有未處理的輸入
    const cachedValue = this.currentInputValues.get(fieldKey);

    if (cachedValue !== undefined && cachedValue !== event.oldValue) {
      console.log(`🔧 Blur 兜底處理: ${event.column.field}`);

      // 立即處理，不經過防抖
      this.processInputChange({
        ...event,
        newValue: cachedValue
      });
    }

    // 特殊處理日期格式驗證（只在 blur 時進行）
    if (event.inputType === 'date') {
      this.validateAndFormatDate(event);
    }

    // 清理緩存
    this.currentInputValues.delete(fieldKey);
  }

  /**
   * 🎯 日期格式驗證和轉換（只在 blur 時執行）
   */
  private validateAndFormatDate(event: InputChangeEvent): void {
    const { rowData, column } = event;
    const fieldKey = this.getFieldKey(rowData, column.field, event.isDetail, event.detailIndex);
    const userInput = this.currentInputValues.get(fieldKey) || '';

    if (!userInput || userInput.trim() === '') {
      rowData[column.field] = null;
      console.log(`📅 日期已清空: ${column.field}`);
      return;
    }

    // 這裡可以調用原來的日期解析邏輯
    // const parsedDate = this.parseSmartDateInput(userInput, column.dateFormat);
    // if (parsedDate) {
    //   rowData[column.field] = parsedDate;
    // } else {
    //   // 顯示錯誤提示
    // }

    console.log(`📅 日期格式驗證: ${column.field} = "${userInput}"`);
  }

  /**
   * 🎯 生成字段唯一鍵
   */
  private getFieldKey(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): string {
    const mainKey = `${rowData.id || rowData.key}_${field}`;
    return isDetail ? `${mainKey}_detail_${detailIndex}` : mainKey;
  }

  /**
   * 🎯 設置防抖延遲時間
   */
  setDebounceTime(ms: number): void {
    this.debounceTime = ms;
  }

  /**
   * 🎯 獲取當前輸入值
   */
  getCurrentInputValue(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): any {
    const fieldKey = this.getFieldKey(rowData, field, isDetail, detailIndex);
    return this.currentInputValues.get(fieldKey);
  }

  /**
   * 🎯 清理特定字段的輸入緩存
   */
  clearFieldCache(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, field, isDetail, detailIndex);
    this.currentInputValues.delete(fieldKey);
  }

  /**
   * 🎯 清理所有輸入緩存
   */
  clearAllCache(): void {
    this.currentInputValues.clear();
  }
}
