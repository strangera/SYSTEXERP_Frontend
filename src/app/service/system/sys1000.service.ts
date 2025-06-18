import { Injectable } from '@angular/core';
import { Sys1000Children, SystemOption } from '../../shared/models/sys/sys1000.model';

@Injectable({
  providedIn: 'root'
})
export class SystemOptionsService {
  private static optionsCache: Record<string, SystemOption[]> = {};

  static loadOptionsFromSession() {
    const systemSetting = sessionStorage.getItem('SYS1000');
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
}
