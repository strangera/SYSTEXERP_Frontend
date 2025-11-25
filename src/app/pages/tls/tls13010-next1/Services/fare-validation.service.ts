import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  conflictItems?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FareValidationService {

  /**
   * 驗證整個扣款類型的資料
   */
  validateFareTypeData(fareData: any[], capType: string): ValidationResult {
    const errors: string[] = [];
    const conflictItems: any[] = [];

    // 只驗證已勾選的項目
    const selectedItems = fareData.filter(item => item.is_selected);

    if (selectedItems.length === 0) {
      return { isValid: true, errors: [] };
    }

    // 1. 必填欄位檢查
    const requiredFieldErrors = this.validateRequiredFields(selectedItems, capType);
    errors.push(...requiredFieldErrors);

    // 2. 時間重複檢查
    const timeConflictResult = this.validateTimeConflicts(selectedItems, capType);
    errors.push(...timeConflictResult.errors);
    conflictItems.push(...(timeConflictResult.conflictItems || []));

    return {
      isValid: errors.length === 0,
      errors,
      conflictItems
    };
  }

  /**
   * 必填欄位檢查
   */
  private validateRequiredFields(selectedItems: any[], capType: string): string[] {
    const errors: string[] = [];

    // 定義各類型的必填欄位
    const requiredFieldsMap: { [key: string]: Array<{ field: string, label: string }> } = {
      'A': [
        { field: 'tpy_bdate', label: '起始年月' },
        //TODO: 需求變更，暫時不檢查單位
        // { field: 'tpy_type', label: '單位' },
        { field: 'tpy_unitamt', label: '單價' },
        { field: 'tpy_qty', label: '數量' },
        // { field: 'org_id', label: '組織' },
        { field: 'gui_flag', label: '開立發票' }
      ],
      'B': [
        { field: 'tpy_bdate', label: '扣款起始年月' },
        { field: 'tpy_edate', label: '扣款結束年月' },
        //TODO: 需求變更，暫時不檢查單位
        // { field: 'tpy_type', label: '單位' },
        { field: 'tpy_unitamt', label: '單價' },
        { field: 'tpy_qty', label: '數量' },
        { field: 'gui_flag', label: '是否開立發票' },
        { field: 'day_account', label: '是否以日計算' },
        { field: 'interval', label: '扣款週期數' }
      ],
      'C': [
        { field: 'tpy_bdate', label: '扣款起始年月' },
        { field: 'tpy_edate', label: '扣款結束年月' },
        { field: 'tpy_totalamt', label: '總金額' },
        { field: 'tpy_amount', label: '每月金額' },
        // { field: 'org_id', label: '組織' },
        { field: 'gui_flag', label: '是否開立發票' }
      ],
      'D': [
        { field: 'tpy_bdate', label: '扣款起始年月' },
        { field: 'tpy_edate', label: '扣款結束年月' },
        //TODO: 需求變更，暫時不檢查單位
        // { field: 'tpy_type', label: '單位' },
        { field: 'tpy_rate', label: '比率' },
        // { field: 'org_id', label: '組織' },
        { field: 'gui_flag', label: '是否開立發票' }
      ],
      'E': [
        { field: 'tpy_bdate', label: '扣款起始年月' },
        { field: 'tpy_edate', label: '扣款結束年月' },
        //TODO: 需求變更，暫時不檢查單位
        // { field: 'tpy_type', label: '單位' },
        { field: 'tpy_rate', label: '比率' },
        // { field: 'org_id', label: '組織' },
        { field: 'gui_flag', label: '是否開立發票' }
      ]
    };

    const requiredFields = requiredFieldsMap[capType] || [];

    selectedItems.forEach((item, index) => {
      const itemErrors: string[] = [];

      requiredFields.forEach(({ field, label }) => {
        const value = item[field];

        if (this.isEmpty(value)) {
          itemErrors.push(`${label}為必填`);
        }

        // 特別檢查數值欄位
        if (['tpy_unitamt', 'tpy_qty', 'tpy_amount', 'tpy_totalamt', 'tpy_rate'].includes(field)) {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue <= 0) {
            itemErrors.push(`${label}必須大於0`);
          }
        }
      });

      if (itemErrors.length > 0) {
        const itemName = item.cap_name || item.cap_item || `第${index + 1}項`;
        errors.push(`${capType}類型「${itemName}」：${itemErrors.join('、')}`);
      }
    });

    return errors;
  }

  /**
   * 時間衝突檢查
   */
  private validateTimeConflicts(selectedItems: any[], capType: string): { errors: string[], conflictItems?: any[] } {
    const errors: string[] = [];
    const conflictItems: any[] = [];

    // 按扣款代號分組
    const groupedByCapItem = this.groupByCapItem(selectedItems);

    Object.entries(groupedByCapItem).forEach(([capItem, items]) => {
      if (items.length <= 1) return;

      // 🔥 新增：檢查相同扣款代號下的相同起始日期重複
      const duplicateDateErrors = this.findDuplicateStartDates(items as any[], capItem, capType);
      errors.push(...duplicateDateErrors);

      // 檢查同一扣款代號下的時間衝突
      const conflicts = this.findTimeConflicts(items as any[]);

      if (conflicts.length > 0) {
        conflicts.forEach(conflict => {
          const item1Name = conflict.item1.cap_name || capItem;
          const item2Name = conflict.item2.cap_name || capItem;

          errors.push(
            `${capType}類型扣款代號「${capItem}」時間重複：`
            // +`${item1Name}(${this.formatDateRange(conflict.item1)}) 與 ` +
            // `${item2Name}(${this.formatDateRange(conflict.item2)})`
          );

          conflictItems.push(conflict.item1, conflict.item2);
        });
      }
    });

    return { errors, conflictItems };
  }

  /**
   * 🔥 新增：檢查相同扣款代號下是否有相同的起始日期
   * PK 組合: (MID, talent_id, cap_type, cap_item, tpy_bdate)
   */
  private findDuplicateStartDates(items: any[], capItem: string, capType: string): string[] {
    const errors: string[] = [];
    const dateMap = new Map<string, any[]>();

    console.log(`🔍 [重複日期檢查] ${capType} 類型扣款代號「${capItem}」，共 ${items.length} 筆已勾選資料`);

    // 按起始日期分組
    items.forEach(item => {
      const startDate = this.parseDate(item.tpy_bdate);
      if (!startDate) {
        console.log(`⚠️ [重複日期檢查] 項目 ${item.cap_item} 的起始日期無效:`, item.tpy_bdate);
        return;
      }

      const dateKey = this.formatDateKey(startDate);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(item);

      console.log(`📅 [重複日期檢查] 項目 ${item.cap_item} 的日期 key: ${dateKey}`);
    });

    console.log(`📊 [重複日期檢查] 日期分組結果:`, Array.from(dateMap.entries()).map(([key, items]) => ({
      date: key,
      count: items.length
    })));

    // 檢查是否有重複的日期
    dateMap.forEach((duplicateItems, dateKey) => {
      if (duplicateItems.length > 1) {
        const formattedDate = this.formatDateDisplay(duplicateItems[0].tpy_bdate);

        console.log(`🔥 [重複日期檢查] 發現重複！日期 ${formattedDate} 有 ${duplicateItems.length} 筆`);

        // 🔥 標記所有重複的項目
        duplicateItems.forEach(item => {
          item._hasDuplicateDateError = true;
          item._duplicateDateMessage = `起始年月「${formattedDate}」與其他 ${duplicateItems.length - 1} 筆資料重複`;
          console.log(`🏷️ [重複日期檢查] 標記項目 ${item.id} (${item.cap_item}) 為重複`);
        });

        errors.push(
          `扣款代號「${capItem}」在起始年月「${formattedDate}」有 ${duplicateItems.length} 筆重複的資料，` +
          `請檢查是否有誤。相同日期不能有多筆已勾選的資料。`
        );
      }
    });

    return errors;
  }

  /**
   * 格式化日期為 key (用於比對)
   */
  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * 格式化日期顯示
   */
  private formatDateDisplay(dateValue: any): string {
    const date = this.parseDate(dateValue);
    if (!date) return '日期無效';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}年${month}月`;
  }

  /**
   * 按扣款代號分組
   */
  private groupByCapItem(items: any[]): { [capItem: string]: any[] } {
    return items.reduce((groups, item) => {
      const capItem = item.cap_item;
      if (!groups[capItem]) {
        groups[capItem] = [];
      }
      groups[capItem].push(item);
      return groups;
    }, {});
  }

  /**
   * 找出時間衝突的項目
   */
  private findTimeConflicts(items: any[]): Array<{ item1: any, item2: any }> {
    const conflicts: Array<{ item1: any, item2: any }> = [];

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (this.isTimeOverlap(items[i], items[j])) {
          conflicts.push({ item1: items[i], item2: items[j] });
        }
      }
    }

    return conflicts;
  }

  /**
   * 檢查兩個項目的時間是否重疊
   */
  private isTimeOverlap(item1: any, item2: any): boolean {
    const start1 = this.parseDate(item1.tpy_bdate);
    const end1 = this.parseDate(item1.tpy_edate || item1.tpy_bdate);
    const start2 = this.parseDate(item2.tpy_bdate);
    const end2 = this.parseDate(item2.tpy_edate || item2.tpy_bdate);

    // 如果任一日期無效，不視為重疊
    if (!start1 || !end1 || !start2 || !end2) {
      return false;
    }

    // 檢查時間區間是否重疊
    // 重疊條件：start1 <= end2 && start2 <= end1
    return start1 <= end2 && start2 <= end1;
  }

  /**
   * 解析日期（支援各種格式）
   */
  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (typeof dateValue === 'string') {
      // 🔥 處理 YYYYMM 或 YYYY/MM 格式
      let normalizedDate = dateValue;

      // 移除所有非數字字元
      const digitsOnly = dateValue.replace(/\D/g, '');

      // 如果是 6 位數字 (YYYYMM)，轉換為 YYYY-MM-01
      if (digitsOnly.length === 6) {
        const year = digitsOnly.substring(0, 4);
        const month = digitsOnly.substring(4, 6);
        normalizedDate = `${year}-${month}-01`;
      }
      // 如果是 8 位數字 (YYYYMMDD)，轉換為 YYYY-MM-DD
      else if (digitsOnly.length === 8) {
        const year = digitsOnly.substring(0, 4);
        const month = digitsOnly.substring(4, 6);
        const day = digitsOnly.substring(6, 8);
        normalizedDate = `${year}-${month}-${day}`;
      }

      const date = new Date(normalizedDate);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * 格式化日期範圍顯示
   */
  private formatDateRange(item: any): string {
    const startDate = this.parseDate(item.tpy_bdate);
    const endDate = this.parseDate(item.tpy_edate || item.tpy_bdate);

    if (!startDate) return '日期無效';

    const formatDate = (date: Date) => {
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    if (!endDate || startDate.getTime() === endDate.getTime()) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  /**
   * 檢查值是否為空
   */
  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * 單一項目即時驗證
   */
  validateSingleItem(item: any, capType: string, allItems: any[]): ValidationResult {
    if (!item.is_selected) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];

    // 必填欄位檢查
    const requiredErrors = this.validateRequiredFields([item], capType);
    errors.push(...requiredErrors);

    // 時間衝突檢查（與其他已選項目）
    const otherSelectedItems = allItems.filter(other =>
      other.is_selected &&
      other.id !== item.id &&
      other.cap_item === item.cap_item
    );

    if (otherSelectedItems.length > 0) {
      const conflictResult = this.validateTimeConflicts([item, ...otherSelectedItems], capType);
      errors.push(...conflictResult.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
