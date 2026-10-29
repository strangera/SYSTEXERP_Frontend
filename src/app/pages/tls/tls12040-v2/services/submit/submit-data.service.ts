import { Injectable } from '@angular/core';

import { CommissionItem as V2CommissionItem } from '../../../tls13010-v2/core/models/commission/commission-item.interface';
import { ConditionItem } from '../../core/models/condition/condition-types.interface';
import { LocationItem } from '../../core/models/contract/location-item.interface';
import { FareItem } from '../../core/models/deduction/fare-item.interface';

@Injectable({
  providedIn: 'root'
})
export class SubmitDataService {

  /**
   * 組裝完整提交資料
   * 從 wizard 接收所有步驟資料，轉換為後端 API 所需格式
   */
  assembleSubmitData(
    formValue: Record<string, unknown>,
    locationData: LocationItem[],
    fareItems: FareItem[],
    commissionItems: V2CommissionItem[],
    conditionItems: ConditionItem[],
    isNewContract: boolean,
    isRenewalMode: boolean,
    commissionType: string
  ): Record<string, unknown> {
    // 續約模式下確保 apply_type 為 '2'
    if (isRenewalMode) {
      formValue['apply_type'] = '2';
    }

    return {
      contractInfo: {
        operation: isNewContract ? 'INSERT' : 'UPDATE',
        data: {
          ...formValue,
          locationInfo: this.cleanLocationItems(locationData)
        }
      },
      deductions: this.cleanDeductionItems(fareItems, isNewContract),
      commissions: this.cleanCommissionItems(commissionItems, isNewContract),
      conditions: this.assembleConditions(conditionItems, commissionType, isNewContract),
      metadata: {
        apply_no: formValue['apply_no'] || '',
        contractId: formValue['apply_no'] || '',
        commissionType,
        isNewContract,
        submittedAt: new Date().toISOString(),
        totalOperations: 0
      }
    };
  }

  // ========== 私有清理方法 ==========

  /** 判斷 ID 是否為有效的資料庫 ID（非臨時 ID） */
  private hasValidId(id: unknown): boolean {
    if (!id) return false;
    const str = String(id);
    return !str.startsWith('temp_') && !str.includes('new_') && !isNaN(Number(str)) && Number(str) > 0;
  }

  /** 清理位置資料 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cleanLocationItems(locations: LocationItem[]): any[] {
    return locations.map(loc => ({
      ...loc,
      id: this.hasValidId(loc.id) ? loc.id : undefined,
      tlt_bdate: this.formatDateToString(loc.tlt_bdate),
      tlt_edate: this.formatDateToString(loc.tlt_edate),
      _status: (this.hasValidId(loc.id) && loc._status === 'original') ? 'modified' : (loc._status || 'new')
    }));
  }

  /**
   * 清理代扣款資料
   * - 只有 is_selected 的項目才送新增/修改
   * - 取消勾選的既有項目送刪除
   * - 日期轉為 YYYYMM 格式
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cleanDeductionItems(fareItems: FareItem[], isCreateMode: boolean): { toInsert: any[]; toUpdate: any[]; toDelete: any[] } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toInsert: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toUpdate: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toDelete: any[] = [];

    fareItems.forEach(item => {
      // 已刪除的項目：有效 ID 才送刪除
      if (item._status === 'deleted') {
        if (this.hasValidId(item.id)) {
          toDelete.push({ id: Number(item.id) });
        }
        return;
      }

      // 未勾選的項目：既有的送刪除，新增的跳過
      if (!item.is_selected) {
        if (this.hasValidId(item.id)) {
          toDelete.push({ id: Number(item.id) });
        }
        return;
      }

      // 已勾選的項目：清理欄位
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanItem: any = {
        ...(this.hasValidId(item.id) ? { id: Number(item.id) } : {}),
        cap_type: item.cap_type || '',
        cap_item: item.cap_item || '',
        tpy_bdate: this.formatDateToYearMonth(item.tpy_bdate),
        tpy_edate: this.formatDateToYearMonth(item.tpy_edate),
        tpy_type: item.tpy_type,
        tpy_qty: Number(item.tpy_qty) || 0,
        tpy_unitamt: Number(item.tpy_unitamt) || 0,
        tpy_amount: Number(item.tpy_amount) || 0,
        tpy_totalamt: Number(item.tpy_totalamt) || 0,
        gui_flag: item.gui_flag,
        day_account: item.day_account,
        interval: Number(item.interval) || 0,
        down_payment: Number(item.down_payment) || 0,
        period_nos: Number(item.period_nos) || 0,
        tpy_rate: Number(item.tpy_rate) || 0,
        // D 類型專用欄位
        cap_saletype: item.cap_saletype || '',
        instms_type: item.instms_type || '',
        edc_bank: item.edc_bank || '',
        pay_no: item.pay_no || '',
        calc_type: item.calc_type || '',
        over_base_rate: Number(item.over_base_rate) || 0,
        rent_plus_rate: Number(item.rent_plus_rate) || 0
      };

      // Create 模式：所有已勾選都是 insert
      if (isCreateMode || item._status === 'new') {
        toInsert.push(cleanItem);
      } else if (item._status === 'modified') {
        toUpdate.push(cleanItem);
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 清理抽成資料：主檔 + 三種明細分開成獨立 CRUD 結構
   * 對應後端：masters / discountSettings / annualSettings / levelSettings
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cleanCommissionItems(commissionItems: V2CommissionItem[], isCreateMode: boolean): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const masters = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discountSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const annualSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const levelSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };

    commissionItems.forEach(item => {
      // 已刪除的主檔
      if (item._status === 'deleted') {
        if (this.hasValidId(item.id)) {
          masters.toDelete.push({ id: Number(item.id) });
        }
        return;
      }

      // 清理主檔
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanMaster: any = {
        ...(this.hasValidId(item.id) ? { id: Number(item.id) } : {}),
        tlt_id: item.tlt_id || '',
        tlt_id_desc: item.tlt_id_desc || '',
        cag_taxtype: item.cag_taxtype,
        sst_amount: Number(item.sst_amount) || 0,
        sst_rate: Number(item.sst_rate) || 0,
        cap_saletype1: item.cap_saletype1 ? 'Y' : 'N',
        cap_saletype2: item.cap_saletype2 ? 'Y' : 'N',
        cap_saletype3: item.cap_saletype3 ? 'Y' : 'N',
        cap_saletype5: item.cap_saletype5 ? 'Y' : 'N',
        cag_bdate: this.formatDateToString(item.cag_bdate),
        cag_edate: this.formatDateToString(item.cag_edate),
        cag_remark: item.remark || item.cag_remark || ''
      };

      if (isCreateMode || item._status === 'new') {
        masters.toInsert.push(cleanMaster);
      } else if (item._status === 'modified') {
        masters.toUpdate.push(cleanMaster);
      }

      // 處理折扣設定明細 (discountSettingItems → discountSettings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item.discountSettingItems || []).forEach((detail: any) => {
        if (detail._status === 'deleted') {
          // 新建/續約模式下的項目不需要刪除（DB 中不存在）
          if (!isCreateMode && this.hasValidId(detail.id)) {
            discountSettings.toDelete.push({ id: String(detail.id) });
          }
          return;
        }
        // 未勾選的項目：既有的送刪除，新增/續約的跳過
        if (!detail.selected) {
          if (!isCreateMode && item._status !== 'new' && detail._status !== 'new' && this.hasValidId(detail.id)) {
            discountSettings.toDelete.push({ id: String(detail.id) });
          }
          return;
        }
        // 已勾選的項目
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanDetail: any = {
          ...(this.hasValidId(detail.id) ? { id: String(detail.id) } : {}),
          tlt_id: item.tlt_id || '',
          cag_barcode: detail.cag_barcode || '',
          tlt_bdate: this.formatDateToString(detail.tlt_bdate),
          tlt_edate: this.formatDateToString(detail.tlt_edate),
          cag_charge_rate: (Number(detail.cag_charge_rate) || 0) / 100 // UI 百分比 → API 小數
        };
        if (isCreateMode || detail._status === 'new' || !this.hasValidId(detail.id)) {
          discountSettings.toInsert.push({ ...cleanDetail, id: String(detail.id || '') });
        } else if (detail._status === 'modified') {
          discountSettings.toUpdate.push(cleanDetail);
        }
      });

      // 處理年度業績明細 (annualPerformanceItems → annualSettings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item.annualPerformanceItems || []).forEach((detail: any) => {
        if (detail._status === 'deleted') {
          // 新建/續約模式下的項目不需要刪除（DB 中不存在）
          if (!isCreateMode && this.hasValidId(detail.id)) {
            annualSettings.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanDetail: any = {
          ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
          tlt_id: item.tlt_id || '',
          tlt_bdate: this.formatDateToString(detail.tlt_bdate),
          tlt_edate: this.formatDateToString(detail.tlt_edate),
          year_amount: Number(detail.year_amount) || 0,
          extra_rate: (Number(detail.extra_rate) || 0) / 100 // UI 百分比 → API 小數
        };
        if (isCreateMode || detail._status === 'new' || !this.hasValidId(detail.id)) {
          annualSettings.toInsert.push(cleanDetail);
        } else if (detail._status === 'modified') {
          annualSettings.toUpdate.push(cleanDetail);
        }
      });

      // 處理層級抽成明細 (discountLevelItems → levelSettings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item.discountLevelItems || []).forEach((detail: any, index: number) => {
        if (detail._status === 'deleted') {
          // 新建/續約模式下的項目不需要刪除（DB 中不存在）
          if (!isCreateMode && this.hasValidId(detail.id)) {
            levelSettings.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }
        // 未勾選的項目：既有的送刪除，新增/續約的跳過
        if (detail.selected === false || detail.is_enabled === false) {
          if (!isCreateMode && item._status !== 'new' && detail._status !== 'new' && this.hasValidId(detail.id)) {
            levelSettings.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanDetail: any = {
          ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
          tlt_id: item.tlt_id || '',
          charged_id: String(detail.charged_id || ''), // 關聯折扣 ID
          seq_no: index + 1,
          cag_barcode: detail.cag_barcode || '',
          level_bmount: Number(detail.level_bmount) || 0,
          level_eamount: Number(detail.level_eamount) || 0,
          level_charge_rate: (Number(detail.level_charge_rate) || 0) / 100 // UI 百分比 → API 小數
        };
        if (isCreateMode || detail._status === 'new' || !this.hasValidId(detail.id)) {
          levelSettings.toInsert.push(cleanDetail);
        } else if (detail._status === 'modified') {
          levelSettings.toUpdate.push(cleanDetail);
        }
      });
    });

    return { masters, discountSettings, annualSettings, levelSettings };
  }

  /**
   * 根據抽成類型將 conditionItems 分配到對應的條件 bucket
   * 每種類型明確列出欄位，避免送出多餘欄位
   */
  private assembleConditions(
    conditionItems: ConditionItem[],
    commissionType: string,
    isCreateMode: boolean
  ): Record<string, { toInsert: unknown[]; toUpdate: unknown[]; toDelete: unknown[] }> {
    const emptyCrud = () => ({ toInsert: [] as unknown[], toUpdate: [] as unknown[], toDelete: [] as unknown[] });

    const result: Record<string, { toInsert: unknown[]; toUpdate: unknown[]; toDelete: unknown[] }> = {
      fixedRents: emptyCrud(),
      baseRentHigher: emptyCrud(),
      baseCommissions: emptyCrud(),
      graduated: emptyCrud(),
      baseTier: emptyCrud()
    };

    const typeMap: Record<string, string> = {
      '1': 'fixedRents',
      '2': 'baseRentHigher',
      '4': 'baseCommissions',
      '5': 'graduated',
      '6': 'baseTier'
    };
    const key = typeMap[String(commissionType).trim()];
    if (!key) return result;

    const bucket = result[key];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conditionItems.forEach((item: any) => {
      const status = item._status || 'original';

      if (status === 'deleted') {
        if (this.hasValidId(item.id)) {
          bucket.toDelete.push({ id: Number(item.id) });
        }
        return;
      }

      if (status === 'original') return; // 未變更不處理

      const cleanItem = this.buildCleanConditionItem(item, commissionType, status !== 'new' && !isCreateMode);

      if (isCreateMode || status === 'new') {
        bucket.toInsert.push(cleanItem);
      } else if (status === 'modified') {
        bucket.toUpdate.push(cleanItem);
      }
    });

    return result;
  }

  /**
   * 根據抽成類型，明確提取需要的欄位
   * INSERT 不帶 apply_no（由後端從 contractInfo 關聯）
   * UPDATE 帶 apply_no（識別既有資料）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildCleanConditionItem(item: any, commissionType: string, includeApplyNo: boolean): Record<string, unknown> {
    // 基礎欄位：所有類型共用
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base: Record<string, any> = {
      ...(this.hasValidId(item.id) ? { id: Number(item.id) } : {}),
      apply_no: includeApplyNo ? (item.apply_no || null) : null,
      cag_bdate: this.formatDateToString(item.cag_bdate),
      cag_edate: this.formatDateToString(item.cag_edate)
    };

    switch (String(commissionType).trim()) {
      case '1': // 固定租金
        return { ...base, base_rent: item.base_rent || 0 };

      case '2': // 底租抽成取高者
        return { ...base, base_rent: item.base_rent || 0, cag_charge_rate: item.cag_charge_rate || 0 };

      case '4': // 包底抽成
        return { ...base, limit_amt: item.limit_amt || 0, limit_charge_rate: item.limit_charge_rate || 0 };

      case '5': // 層級抽成
        return { ...base, seq_no: item.seq_no || 0, start_number: item.start_number || 0, end_number: item.end_number || 0, charge_rate: item.charge_rate || 0 };

      case '6': // 包底加層級
        return { ...base, seq_no: item.seq_no || 0, limit_amt: item.limit_amt || 0, start_number: item.start_number || 0, end_number: item.end_number || 0, charge_rate: item.charge_rate || 0 };

      default:
        return base;
    }
  }

  // ========== 日期格式化 ==========

  /** 將日期值格式化為 YYYY-MM-DD 字串 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatDateToString(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value.split('T')[0].replace(/\//g, '-');
    if (value instanceof Date && !isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(value);
  }

  /** 將日期值格式化為 YYYYMM 字串 (代扣款用) */
  private formatDateToYearMonth(value: Date | string | null | undefined): string {
    if (!value) return '';
    if (value instanceof Date && !isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    if (typeof value === 'string') {
      // 處理各種字串格式: "2026/02", "2026-02", "202602", "2026-02-05T..."
      const cleaned = value.replace(/[/\-T]/g, '');
      // 取前6碼 YYYYMM
      return cleaned.substring(0, 6);
    }
    return String(value);
  }
}
