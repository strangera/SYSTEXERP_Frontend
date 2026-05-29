import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormLabelService {
  // 儲存 controlName 到中文 label 的映射
  private controlLabels: Record<string, string> = {};

  /**
   * 註冊一個表單控制項的中文標籤。
   * @param controlName 表單控制項的英文名稱 (例如 'MVM_No')
   * @param label 表單控制項的中文標籤 (例如 '調撥單編號')
   */
  registerLabel(controlName: string, label: string): void {
    if (controlName && label) {
      this.controlLabels[controlName] = label;
    }
  }

  /**
   * 根據 controlName 獲取對應的中文標籤。
   * @param controlName 表單控制項的英文名稱
   * @returns 對應的中文標籤，如果不存在則為 undefined
   */
  getLabel(controlName: string): string | undefined {
    return this.controlLabels[controlName];
  }

  /**
   * 清除所有已註冊的標籤。
   * 在頁面初始化時呼叫，以避免不同表單之間的標籤混淆。
   */
  clearLabels(): void {
    this.controlLabels = {};
  }
}
