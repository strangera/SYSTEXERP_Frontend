import { Injectable } from '@angular/core';
import { Sys1000Children, SystemOption } from '../../shared/models/sys/sys1000.model';

/**
 * 根據選項類別和代碼，回傳對應的名稱。
 * @param sysType 選項類別，例如 'MAM_Status'。
 * @param value 選項代碼，例如 '0'。
 * @returns 對應的名稱，如果找不到則回傳原始值。
 */
export function getSYS1000(sysType: string, value: string | number): string | number {
  return SystemOptionsService.getOptionName(sysType, value);
}

/**
 * 取得指定 sysType 的選項，並轉換為 { value, label } 格式。
 * @param sysType 選項類別。
 * @returns 轉換後的 { value, label } 陣列。
 */
export function getSYS1000Options(sysType: string): { value: string; label: string }[] {
  return SystemOptionsService.getOptionsAsValueLabel(sysType);
}

@Injectable({
  providedIn: 'root'
})
export class SystemOptionsService {
  private static optionsCache: Record<string, SystemOption[]> = {};

  static loadOptionsFromSession() {
    const systemSetting = localStorage.getItem('SYS1000');
    if (!systemSetting) return;

    const parsedData = JSON.parse(systemSetting) as Sys1000Children[];

    const grouped = parsedData.reduce<Record<string, SystemOption[]>>((acc, item) => {
      if (!acc[item.SYS_Type]) {
        acc[item.SYS_Type] = [];
      }

      acc[item.SYS_Type].push({
        SYS_Code: item.SYS_Code,
        SYS_Name: item.SYS_Name,
        SYS_Sort: item.SYS_Sort,
      });

      return acc;
    }, {});

    // 可選排序
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.SYS_Sort - b.SYS_Sort);
    });

    SystemOptionsService.optionsCache = grouped;
  }


  static getOptions(sysType: string): SystemOption[] {
    if (Object.keys(SystemOptionsService.optionsCache).length === 0) {
      SystemOptionsService.loadOptionsFromSession();
    }
    return SystemOptionsService.optionsCache[sysType] || [];
  }

  /**
   * 取得指定 sysType 的選項，並轉換為 { value, label } 格式。
   * @param sysType 選項類別。
   * @returns 轉換後的 { value, label } 陣列。
   */
  static getOptionsAsValueLabel(sysType: string): { value: string; label: string }[] {
    // 呼叫現有的 getOptions 方法來取得原始資料
    const originalOptions = this.getOptions(sysType);

    // 使用 map 方法將每個物件轉換為新格式
    return originalOptions.map(item => ({
      value: item.SYS_Code,
      label: item.SYS_Name
    }));
  }

  /**
   * 根據選項類別和代碼，回傳對應的名稱。
   * @param sysType 選項類別，例如 'MAM_Status'。
   * @param value 選項代碼，例如 '0'。
   * @returns 對應的名稱，如果找不到則回傳原始值。
   */
  static getOptionName(sysType: string, value: string | number): string | number {
    const options = this.getOptions(sysType);
    return options.find(x => x.SYS_Code === value)?.SYS_Name || value;
  }
}
