import { Injectable } from '@angular/core';
import { FareItem } from './../../tls13010/tls13010.model';

/**
 * 扣款預設值服務
 * 負責管理各類型扣款項目的預設值邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class FareDefaultsService {

  /**
   * 套用預設值到扣款項目
   * @param item 扣款項目
   * @param contractInfo 合約資訊(用於取得合約起訖日等資訊)
   * @param totalLocationSpace 總坪數(用於坪數單位的預設值)
   */
  applyDefaults(item: FareItem, contractInfo?: any, totalLocationSpace?: number): void {
    // 通用預設值
    this.applyCommonDefaults(item, contractInfo);

    // 根據類型套用特定預設值
    switch (item.cap_type) {
      case 'A':
        this.applyTypeADefaults(item, contractInfo, totalLocationSpace);
        break;
      case 'B':
        this.applyTypeBDefaults(item, contractInfo, totalLocationSpace);
        break;
      case 'C':
        this.applyTypeCDefaults(item, contractInfo);
        break;
      case 'D':
        this.applyTypeDDefaults(item, contractInfo, totalLocationSpace);
        break;
      case 'E':
        this.applyTypeEDefaults(item, contractInfo, totalLocationSpace);
        break;
    }
  }

  /**
   * 通用預設值(所有類型共用)
   */
  private applyCommonDefaults(item: FareItem, contractInfo?: any): void {
    // 開立發票預設為 'Y'
    if (!item.gui_flag) {
      item.gui_flag = 'Y';
    }

    // 起始日期預設為合約起始日
    if (!item.tpy_bdate && contractInfo?.tlt_contract_bdate) {
      item.tpy_bdate = contractInfo.tlt_contract_bdate;
      console.log(`📅 設定起始日期預設值: ${item.tpy_bdate}`);
    }

    // 結束日期預設為合約結束日 (A類型會在各自的方法中覆蓋)
    if (!item.tpy_edate && contractInfo?.tlt_contract_edate) {
      item.tpy_edate = contractInfo.tlt_contract_edate;
      console.log(`📅 設定結束日期預設值: ${item.tpy_edate}`);
    }
  }

  /**
   * A類型預設值:一次扣款
   */
  private applyTypeADefaults(item: FareItem, contractInfo?: any, totalLocationSpace?: number): void {
    // ⚠️ 不預設單位,由使用者選擇

    // 如果是坪數單位,自動帶入總坪數
    if (item.tpy_type === '01' && !item.tpy_qty && totalLocationSpace) {
      item.tpy_qty = totalLocationSpace;
    }

    // 🔥 修正：數量預設為 1（無論是否有單位）
    if (!item.tpy_qty) {
      item.tpy_qty = 1;
    }

    // 單價預設為 0
    if (!item.tpy_unitamt) {
      item.tpy_unitamt = 0;
    }

    // A類型的結束日期應該等於起始日期
    if (item.tpy_bdate && !item.tpy_edate) {
      item.tpy_edate = item.tpy_bdate;
    }
  }

  /**
   * B類型預設值:每月扣款
   */
  private applyTypeBDefaults(item: FareItem, contractInfo?: any, totalLocationSpace?: number): void {
    // ⚠️ 不預設單位,由使用者選擇

    // 如果是坪數單位,自動帶入總坪數
    if (item.tpy_type === '01' && !item.tpy_qty && totalLocationSpace) {
      item.tpy_qty = totalLocationSpace;
    }

    // 🔥 修正：數量預設為 1（無論是否有單位）
    if (!item.tpy_qty) {
      item.tpy_qty = 1;
    }

    // 單價預設為 0
    if (!item.tpy_unitamt) {
      item.tpy_unitamt = 0;
    }

    // 是否以日計算預設為 'Y'
    if (!item.day_account) {
      item.day_account = 'Y';
    }

    // 扣款週期數預設為 1
    if (!item.interval) {
      item.interval = 1;
    }
  }

  /**
   * C類型預設值:平均分攤
   */
  private applyTypeCDefaults(item: FareItem, contractInfo?: any): void {
    // 總金額預設為 0
    if (!item.tpy_totalamt) {
      item.tpy_totalamt = 0;
    }

    // 🔥 修正：如果有起訖日期，優先根據日期計算期數
    if (item.tpy_bdate && item.tpy_edate) {
      const calculatedPeriods = this.calculatePeriods(item.tpy_bdate, item.tpy_edate);
      // 如果計算出的期數與現有期數不同，更新並記錄
      if (item.period_nos !== calculatedPeriods) {
        console.log(`🔄 C類型期數重新計算: ${item.cap_item} 從 ${item.period_nos} 期 → ${calculatedPeriods} 期`);
        item.period_nos = calculatedPeriods;
      }
    } else if (!item.period_nos) {
      // 沒有日期時，期數預設為 1
      item.period_nos = 1;
    }

    // 首期金額預設為 0
    if (!item.down_payment) {
      item.down_payment = 0;
    }

    // 每月金額預設為 0
    if (!item.tpy_amount) {
      item.tpy_amount = 0;
    }
  }

  /**
   * D類型預設值:比率分攤
   */
  private applyTypeDDefaults(item: FareItem, contractInfo?: any, totalLocationSpace?: number): void {
    // ⚠️ 不預設單位,由使用者選擇

    // 比率預設為 0
    if (!item.tpy_rate) {
      item.tpy_rate = 0;
    }
  }

  /**
   * E類型預設值:活動扣款
   */
  private applyTypeEDefaults(item: FareItem, contractInfo?: any, totalLocationSpace?: number): void {
    // ⚠️ 不預設單位,由使用者選擇

    // 比率預設為 0
    if (!item.tpy_rate) {
      item.tpy_rate = 0;
    }
  }

  /**
   * 批次套用預設值
   * @param items 扣款項目陣列
   * @param contractInfo 合約資訊
   * @param totalLocationSpace 總坪數
   */
  batchApplyDefaults(
    items: FareItem[],
    contractInfo?: any,
    totalLocationSpace?: number
  ): FareItem[] {
    return items.map(item => {
      this.applyDefaults(item, contractInfo, totalLocationSpace);
      return item;
    });
  }

  /**
   * 計算期數(根據起訖日期)
   */
  private calculatePeriods(startDate: string | Date, endDate: string | Date): number {
    if (!startDate || !endDate) {
      return 1;
    }

    // 🔥 支援 Date 物件和字串，並處理 YYYYMM 格式
    let start: Date;
    let end: Date;

    if (startDate instanceof Date) {
      start = startDate;
    } else {
      // 處理字串格式：可能是 "YYYYMM" 或 "YYYY-MM" 或其他格式
      const startStr = String(startDate).trim();
      if (/^\d{6}$/.test(startStr)) {
        // YYYYMM 格式 (例如: "202510")
        const year = parseInt(startStr.substring(0, 4));
        const month = parseInt(startStr.substring(4, 6)) - 1; // 月份是 0-based
        start = new Date(year, month, 1);
      } else {
        start = new Date(startDate);
      }
    }

    if (endDate instanceof Date) {
      end = endDate;
    } else {
      // 處理字串格式
      const endStr = String(endDate).trim();
      if (/^\d{6}$/.test(endStr)) {
        // YYYYMM 格式 (例如: "202511")
        const year = parseInt(endStr.substring(0, 4));
        const month = parseInt(endStr.substring(4, 6)) - 1; // 月份是 0-based
        end = new Date(year, month, 1);
      } else {
        end = new Date(endDate);
      }
    }

    // 🔥 檢查日期是否有效
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('⚠️ calculatePeriods: 無效的日期', { startDate, endDate });
      return 1;
    }

    // 🔥 檢查日期順序
    if (start > end) {
      console.warn('⚠️ calculatePeriods: 開始日期大於結束日期', {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10)
      });
      return 1;
    }

    const months = (end.getFullYear() - start.getFullYear()) * 12
      + (end.getMonth() - start.getMonth()) + 1;

    return Math.max(1, months);
  }

  /**
   * 檢查項目是否需要套用預設值
   * (用於判斷是新增的項目還是已有資料的項目)
   */
  needsDefaults(item: FareItem): boolean {
    // 如果是新選擇的項目(非合約原有項目),則需要預設值
    return item.data_source !== 'CONTRACT_EXISTING' || !item._originalSelected;
  }

  /**
   * 根據單位類型更新數量
   * (當使用者切換單位時使用)
   */
  updateQuantityByUnitType(item: FareItem, totalLocationSpace?: number): void {
    if (item.tpy_type === '01' && totalLocationSpace) {
      // 坪數單位 - 自動帶入總坪數
      item.tpy_qty = totalLocationSpace;
      console.log(`🏢 使用者選擇坪數單位,自動帶入總坪數: ${totalLocationSpace}`);
    } else if (item.tpy_type && item.tpy_type !== '01') {
      // 其他單位 - 預設為 1 (但不會覆蓋已有的值)
      if (!item.tpy_qty || item.tpy_qty === totalLocationSpace) {
        item.tpy_qty = 1;
        console.log(`📝 切換到其他單位,數量設為: 1`);
      }
    }
  }

  /**
   * 取得欄位的預設值(用於表格顯示)
   */
  getFieldDefault(capType: string, fieldName: string): any {
    const defaults: Record<string, Record<string, any>> = {
      'A': {
        'tpy_unitamt': 0,
        'gui_flag': 'Y'
      },
      'B': {
        'tpy_unitamt': 0,
        'gui_flag': 'Y',
        'day_account': 'Y',
        'interval': 1
      },
      'C': {
        'tpy_totalamt': 0,
        'period_nos': 1,
        'down_payment': 0,
        'tpy_amount': 0,
        'gui_flag': 'Y'
      },
      'D': {
        'tpy_rate': 0,
        'gui_flag': 'Y'
      },
      'E': {
        'tpy_rate': 0,
        'gui_flag': 'Y'
      }
    };

    return defaults[capType]?.[fieldName];
  }
}
