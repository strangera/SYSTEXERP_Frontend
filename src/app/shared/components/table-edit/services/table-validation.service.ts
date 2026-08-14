/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { EditColumn } from '../table-edit.model';
import { validateRequired } from '../validate-field.model';
// 定義 RowValidationFn 類型，這是 TableEditComponent 的 @Input() rowValidate 參數的類型
type RowValidationFn = (rowData: any, index?: number) => { isValid: boolean, errorMessage: string; } | undefined;

@Injectable({
  providedIn: 'root'
})
export class TableValidationService {
  private readonly messageService = inject(NotificationService);

  /**
   * 對單一欄位執行驗證，並更新 rowData 中的錯誤狀態
   * @param rowData 當前行資料 (會被修改：更新 _validationErrors)
   * @param col 欄位配置
   * @param value 變更後的值
   * @param allData 完整的表格資料 (用於跨行驗證)
   * @param index 該列在表格中的索引 (用於 col.disabled 判斷)
   * @returns 欄位是否有效 (boolean)
   */
  public validateField(rowData: any, col: EditColumn, value: any, allData: any[], index?: number): boolean {
    if (rowData._isAutoInsertCandidate) {
      // 如果是新增候選行，確保沒有任何錯誤狀態被設定
      if (rowData._validationErrors) {
        delete rowData._validationErrors[col.field];
      }
      return true; // 視為通過
    }
    if (!rowData._validationErrors) {
      rowData._validationErrors = {};
    }
    let isValidField = true;
    let errorMessage = '';

    // 該欄位對這一列本來就是 disabled：值本來就不可能由使用者填寫，直接視為驗證通過，不執行 col.validate
    const isFieldDisabled = col.disabled && col.disabled(value, index, rowData);

    // 執行該欄位的所有驗證規則
    if (col.validate && !isFieldDisabled) {
      for (const validateFn of col.validate) {
        // 將完整的 allData 陣列傳遞給驗證函數
        const validationResult = validateFn(value, rowData, allData, col.field, col.header);
        if (!validationResult.isValid) {
          isValidField = false;
          // 只顯示第一個錯誤訊息
          errorMessage = validationResult.errorMessage[0];
          break; // 找到一個錯誤就停止
        }
      }
    }

    // 更新錯誤狀態
    if (!isValidField) {
      rowData._validationErrors[col.field] = errorMessage;
    } else {
      delete rowData._validationErrors[col.field]; // 欄位有效時，清除錯誤
    }

    return isValidField;
  }

  /**
   * 執行完整的表格驗證並處理錯誤提示。這是給父元件呼叫的核心方法。
   *
   * @param data 表格資料 (TableEditComponent.data)
   * @param columns 欄位配置 (TableEditComponent.columns)
   * @param selectedItems 已選擇的資料 (TableEditComponent.selectedItems)
   * @param tableRequired 表格是否必填 (TableEditComponent.tableRequired)
   * @param validateOnlySelected 是否只驗證選擇的行 (TableEditComponent.validateOnlySelected)
   * @param rowValidate 整行驗證函式 (TableEditComponent.rowValidate)
   * @returns { isValid: boolean, isTableEmpty: boolean } 整個表格是否有效及表格是否為空（必填時）
   */
  public validateAndShowErrors(
    data: any[],
    columns: EditColumn[],
    selectedItems: any[],
    tableRequired: boolean,
    validateOnlySelected: boolean,
    rowValidate: RowValidationFn | undefined,
  ): { isValid: boolean, isTableEmpty: boolean, firstErrorIndex: number | undefined } {

    // 1. 清除所有行的舊有驗證錯誤狀態
    for (const rowData of data) {
      if (rowData._validationErrors) { delete rowData._validationErrors; }
      if (rowData._rowValidationError) { delete rowData._rowValidationError; }
    }

    // --- 【整體必填檢查】 ---
    let tableDataEmpty = false;
    if (tableRequired) {
      const actualData = data.filter(row => !row._isAutoInsertCandidate);
      let shouldCheckActualDataEmpty = true;

      if (validateOnlySelected) {
        if (selectedItems && selectedItems.length > 0) {
          shouldCheckActualDataEmpty = false;
        }
      } else {
        if (actualData.length > 0) {
          shouldCheckActualDataEmpty = false;
        }
      }

      if (shouldCheckActualDataEmpty) {
        tableDataEmpty = true;
        return { isValid: false, isTableEmpty: tableDataEmpty, firstErrorIndex: 0 };
      }
    }

    // 確定要驗證的資料集 (使用 data，因為它的索引與 _tableData 相同，如果 data 傳入的是 _tableData)
    let rowsToValidate: any[] = [];
    if (validateOnlySelected) {
      rowsToValidate = selectedItems || [];
    } else {
      rowsToValidate = data || [];
    }
    if (rowsToValidate.length === 0 && !tableRequired) {
      return { isValid: true, isTableEmpty: false, firstErrorIndex: undefined };
    }

    // 遍歷需要驗證的行 (欄位和行驗證)
    for (let i = 0; i < rowsToValidate.length; i++) {
      const rowData = rowsToValidate[i];

      // 排除新增候選行
      if (rowData._isAutoInsertCandidate) {
        continue;
      }

      // --- 欄位驗證 (Field Validation) ---
      for (const col of columns) {
        // 使用 service 的 validateField 方法執行驗證並更新 rowData
        const isValidField = this.validateField(rowData, col, rowData[col.field], data, i); // data 是 _tableData

        if (!isValidField) {
          // 發現錯誤時，發出錯誤訊息，並返回失敗
          this.messageService.errorBubble(`｢${col.header}」 ` + rowData._validationErrors[col.field], '表格欄位驗證失敗');
          return { isValid: false, isTableEmpty: tableDataEmpty, firstErrorIndex: i }; // 返回第一個錯誤的索引 i
        }
      }

      // --- 整行驗證 (Row Validation) ---
      if (rowValidate) {
        // 執行整行驗證並儲存結果
        rowData._rowValidationError = rowValidate(rowData, i);
      }

      if (rowData._rowValidationError?.isValid === false) {
        // 發現整行錯誤時，發出錯誤訊息，並返回失敗
        this.messageService.errorBubble(rowData._rowValidationError.errorMessage, '表格驗證失敗');
        return { isValid: false, isTableEmpty: tableDataEmpty, firstErrorIndex: i }; // 返回第一個錯誤的索引 i
      }
    }

    return { isValid: true, isTableEmpty: tableDataEmpty, firstErrorIndex: undefined }; // 所有驗證通過
  }

  /**
   * 檢查該行是否包含任何欄位錯誤或整行驗證錯誤。
   * @param rowData 當前行資料
   * @returns 是否有錯誤
   */
  public hasRowError(rowData: any): boolean {
    if (rowData._isAutoInsertCandidate) {
      return false;
    }

    if (rowData._rowValidationError?.isValid === false) {
      return true;
    }

    if (rowData._validationErrors && Object.keys(rowData._validationErrors).length > 0) {
      return true;
    }
    return false;
  }

  /**
   * 判斷此 col 的 validate 參數是否有 validateRequired 的 function。
   * @param col 欄位配置
   * @returns 是否必填
   */
  public isRequired(col: EditColumn): boolean {
    // 直接比對函式引用，不受壓縮混淆影響
    return col.validate?.some(validate => validate === validateRequired) ?? false;
  }
}
