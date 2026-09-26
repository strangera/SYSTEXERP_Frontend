import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FareValidationService } from '@pages/tls/shared/services/fare-validation.service';
import { ContractDateRange } from '@others/utils/contract-date-validator.util';
import { DiscountSettingItem } from '../../../tls13010-v2/core/models';
import { AnnualPerformanceItem, CommissionItem, DiscountLevelItem } from '../../../tls13010-v2/core/models/commission/commission-item.interface';
import { CommissionCrudService } from '../../../tls13010-v2/services/commission/commission-crud.service';

import { ConditionItem } from '../../core/models/condition/condition-types.interface';
import { LocationItem } from '../../core/models/contract/location-item.interface';
import { FareItem } from '../../core/models/deduction/fare-item.interface';

// ========== 介面 ==========

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

/** Step 2/3/4 簡化結果（用於 wizard 層級的快速判斷） */
export interface StepValidationResult {
  isValid: boolean;
  errorMessages: string[];
}

// ========== 常數 ==========

const CAP_TYPE_NAMES: Record<string, string> = {
  'A': '代扣款A類(管銷費用)',
  'B': '代扣款B類(水電費)',
  'C': '代扣款C類(分期付款)',
  'D': '代扣款D類(業績抽成)',
  'E': '代扣款E類(其他)'
};

/** 各代扣款類型的必填欄位 */
const FARE_REQUIRED_FIELDS: Record<string, { field: string; label: string }[]> = {
  'A': [
    { field: 'tpy_bdate', label: '起始年月' },
    { field: 'tpy_unitamt', label: '單價' },
    { field: 'tpy_qty', label: '數量' },
    { field: 'gui_flag', label: '開立發票' }
  ],
  'B': [
    { field: 'tpy_bdate', label: '扣款起始年月' },
    { field: 'tpy_edate', label: '扣款結束年月' },
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
    { field: 'gui_flag', label: '是否開立發票' }
  ],
  'D': [
    { field: 'tpy_bdate', label: '扣款起始年月' },
    { field: 'tpy_edate', label: '扣款結束年月' },
    { field: 'tpy_rate', label: '比率' },
    { field: 'gui_flag', label: '是否開立發票' }
  ],
  'E': [
    { field: 'tpy_bdate', label: '扣款起始年月' },
    { field: 'tpy_edate', label: '扣款結束年月' },
    { field: 'tpy_rate', label: '比率' },
    { field: 'gui_flag', label: '是否開立發票' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ContractValidatorService {

  constructor(
    private fareValidationService: FareValidationService,
    private commissionCrudService: CommissionCrudService
  ) { }

  // ========== Step 1: 合約基本資料 ==========

  validateStep1(form: FormGroup, locationData: LocationItem[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 驗證必填欄位
    const requiredFields = [
      { field: 'ven_no', label: '廠商編號' },
      { field: 'tlt_name', label: '專櫃名稱' },
      { field: 'bus_type', label: '大分類' },
      { field: 'bus_class', label: '中分類' },
      { field: 'bus_sclass', label: '小分類' },
      { field: 'tlt_bdate', label: '契約起始日' },
      { field: 'tlt_edate', label: '契約截止日' },
      { field: 'org_id', label: '營運單位' },
      { field: 'tlt_contract_bdate', label: '營運起始日' },
      { field: 'tlt_contract_edate', label: '營運截止日' },
      { field: 'tlt_term_type', label: '抽成別' },
      { field: 'comm_comp_type', label: '抽成額計算方式' },
      { field: 'invoice_type', label: '發票類型' }
    ];

    requiredFields.forEach(({ field, label }) => {
      const control = form.get(field);
      if (!control?.value || (typeof control.value === 'string' && !control.value.trim())) {
        errors.push({ field, message: `${label}為必填欄位` });
        control?.markAsTouched();
      }
    });

    // 驗證日期順序
    const tltBdate = form.get('tlt_bdate')?.value;
    const tltEdate = form.get('tlt_edate')?.value;
    if (tltBdate && tltEdate) {
      const start = this.parseDate(tltBdate);
      const end = this.parseDate(tltEdate);
      if (start && end && start > end) {
        errors.push({ field: 'tlt_edate', message: '契約起始日不可大於契約截止日' });
      }
    }

    const contractBdate = form.get('tlt_contract_bdate')?.value;
    const contractEdate = form.get('tlt_contract_edate')?.value;
    if (contractBdate && contractEdate) {
      const start = this.parseDate(contractBdate);
      const end = this.parseDate(contractEdate);
      if (start && end && start > end) {
        errors.push({ field: 'tlt_contract_edate', message: '營運截止日必須大於營運起始日' });
      }
    }

    // 動態驗證：根據抽成別
    const tltTermType = form.get('tlt_term_type')?.value || '';
    if (['4', '6'].includes(tltTermType) && !form.get('tlt_ctype_mtotal')?.value) {
      errors.push({ field: 'tlt_ctype_mtotal', message: '當前抽成別需要選擇包底類別' });
    }
    if (['4', '5', '6'].includes(tltTermType) && !form.get('overall_status')?.value) {
      errors.push({ field: 'overall_status', message: '當前抽成別需要選擇超出部份處理方式' });
    }

    // 固定租金驗證
    const rentAhead = form.get('rent_ahead')?.value;
    if (['1', '2'].includes(tltTermType) || rentAhead === 'Y') {
      const baseRent = form.get('base_rent')?.value;
      if (!baseRent || Number(baseRent) <= 0) {
        errors.push({ field: 'base_rent', message: '固定租金必須大於 0' });
      }
    }

    // 動態驗證：根據付款方式
    const paytype = form.get('paytype')?.value;
    if (paytype === '1') {
      if (!form.get('bank_id')?.value) errors.push({ field: 'bank_id', message: '匯款付款時請填寫廠商匯款銀行代號' });
      if (!form.get('vendor_acct_name')?.value) errors.push({ field: 'vendor_acct_name', message: '匯款付款時請填寫帳戶名稱' });
      if (!form.get('vendor_acct_no')?.value) errors.push({ field: 'vendor_acct_no', message: '匯款付款時請填寫銀行帳號' });
    } else if (paytype === '2') {
      if (!form.get('CHECK_TITLE')?.value) errors.push({ field: 'CHECK_TITLE', message: '支票付款時請填寫票據抬頭' });
    }

    // 位置資料 (必填：至少需要一筆)
    const validLocations = locationData.filter(loc => loc._status !== 'deleted' && loc.location_no?.trim());
    if (validLocations.length === 0) {
      errors.push({ field: 'location', message: '櫃位地點資訊至少需要填寫一筆' });
    }

    // 地點起訖日必填卡控
    const locationsWithMissingDates = validLocations.filter(
      loc => !loc.tlt_bdate || !loc.tlt_edate
    );
    if (locationsWithMissingDates.length > 0) {
      errors.push({ field: 'location_dates', message: '櫃位地點起訖日為必填' });
    }

    // 業績分攤合計必須等於 100%
    if (validLocations.length > 0) {
      const saleRateTotal = Math.round(validLocations.reduce((s, r) => s + (Number(r.sale_rate) || 0), 0) * 100) / 100;
      if (saleRateTotal !== 100) {
        errors.push({ field: 'sale_rate', message: `業績分攤(%) 合計須等於 100%（目前：${saleRateTotal}%）` });
      }
    }

    // Email 格式驗證
    const email = form.get('email')?.value;
    if (email && !this.isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Email 格式不正確' });
    }
    const invoiceEmail = form.get('invoice_email')?.value;
    if (invoiceEmail && !this.isValidEmail(invoiceEmail)) {
      errors.push({ field: 'invoice_email', message: '發票 Email 格式不正確' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // ========== Step 2: 代扣款設定 ==========

  validateStep2(
    fareItems: FareItem[],
    contractRange?: ContractDateRange
  ): StepValidationResult {
    const allErrors: string[] = [];
    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    // 清除所有錯誤標記
    fareItems.forEach(item => {
      const rec = item as unknown as Record<string, unknown>;
      delete rec['_hasValidationError'];
      delete rec['_validationErrors'];
      delete rec['_hasDuplicateDateError'];
      delete rec['_duplicateDateMessage'];
    });

    // 依類型分組
    const fareDataByType: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };
    fareItems.forEach(item => {
      if (fareDataByType[item.cap_type]) {
        fareDataByType[item.cap_type].push(item);
      }
    });

    // 驗證每個類型
    capTypes.forEach(capType => {
      const typeData = fareDataByType[capType] || [];
      const selectedItems = typeData.filter(item => item.is_selected);

      if (selectedItems.length > 0) {
        // 使用 FareValidationService 做整體驗證（日期重複等）
        const result = this.fareValidationService.validateFareTypeData(typeData, capType, contractRange);

        if (!result.isValid) {
          allErrors.push(`【${CAP_TYPE_NAMES[capType] || capType}】`);
          allErrors.push(...result.errors.map((e: string) => `  • ${e}`));
        }

        // 驗證個別項目必填欄位
        selectedItems.forEach(item => {
          const itemErrors = this.validateSingleFareItem(item, capType);
          if (itemErrors.length > 0) {
            const rec = item as unknown as Record<string, unknown>;
            rec['_hasValidationError'] = true;
            rec['_validationErrors'] = itemErrors;
          }
        });
      }
    });

    return {
      isValid: allErrors.length === 0,
      errorMessages: allErrors
    };
  }

  private validateSingleFareItem(item: FareItem, capType: string): string[] {
    const errors: string[] = [];
    const requiredFields = FARE_REQUIRED_FIELDS[capType] || [];

    requiredFields.forEach(({ field, label }) => {
      const value = (item as unknown as Record<string, unknown>)[field];
      if (value === null || value === undefined || value === '') {
        errors.push(`${label}未填寫`);
      }
    });

    return errors;
  }

  // ========== Step 3: 抽成設定 ==========

  validateStep3(
    commissionItems: CommissionItem[],
    commissionType: string,
    contractStartDate?: unknown,
    contractEndDate?: unknown
  ): StepValidationResult {
    const activeCommissions = commissionItems.filter(c => c._status !== 'deleted');

    // 清除所有錯誤標記
    this.clearStep3ErrorFlags(activeCommissions);

    if (activeCommissions.length === 0) {
      return { isValid: false, errorMessages: ['請至少設定一個抽成項目'] };
    }

    // 一般抽成 (3) 必須至少有一個已勾選折扣
    if (commissionType === '3') {
      const hasSelectedDiscount = activeCommissions.some(item =>
        item.discountSettingItems?.some((d: DiscountSettingItem) => d.selected && d._status !== 'deleted')
      );
      if (!hasSelectedDiscount) {
        return { isValid: false, errorMessages: ['請至少勾選一個折扣項目'] };
      }
    }

    let errorCount = 0;
    const errorTypes = new Set<string>();

    for (const commission of activeCommissions) {
      const activeDiscounts = commission.discountSettingItems
        ?.filter((d: DiscountSettingItem) => d.selected && d._status !== 'deleted') || [];

      for (const discount of activeDiscounts) {
        const errorFields: string[] = [];

        // 折扣別必填
        if (!discount.cag_barcode) {
          errorCount++;
          errorTypes.add('必填欄位未填');
          errorFields.push('cag_barcode');
        }

        // 日期必填
        if (!discount.tlt_bdate) { errorCount++; errorTypes.add('必填欄位未填'); errorFields.push('tlt_bdate'); }
        if (!discount.tlt_edate) { errorCount++; errorTypes.add('必填欄位未填'); errorFields.push('tlt_edate'); }

        // 日期順序
        const discStart = this.parseDate(discount.tlt_bdate);
        const discEnd = this.parseDate(discount.tlt_edate);
        if (discStart && discEnd && discStart > discEnd) {
          errorCount++;
          errorTypes.add('日期順序錯誤');
          errorFields.push('tlt_bdate', 'tlt_edate');
        }

        // 日期在契約範圍內
        if (contractStartDate && contractEndDate) {
          const cStart = this.parseDate(contractStartDate);
          const cEnd = this.parseDate(contractEndDate);
          if (discStart && cStart && discStart < cStart) {
            errorCount++; errorTypes.add('日期超出契約期間');
            if (!errorFields.includes('tlt_bdate')) errorFields.push('tlt_bdate');
          }
          if (discEnd && cEnd && discEnd > cEnd) {
            errorCount++; errorTypes.add('日期超出契約期間');
            if (!errorFields.includes('tlt_edate')) errorFields.push('tlt_edate');
          }
        }

        // 抽成率 0-100
        const rate = discount.cag_charge_rate;
        if (rate !== undefined && rate !== null && (rate < 0 || rate > 100)) {
          errorCount++;
          errorTypes.add('抽成率超出範圍');
          errorFields.push('cag_charge_rate');
        }

        if (errorFields.length > 0) {
          discount._errorFields = [...new Set(errorFields)];
        }
      }

      // 同折扣別日期重疊
      const discountGroups = new Map<string, DiscountSettingItem[]>();
      activeDiscounts.forEach((d: DiscountSettingItem) => {
        if (!d.cag_barcode) return;
        const group = discountGroups.get(d.cag_barcode) || [];
        group.push(d);
        discountGroups.set(d.cag_barcode, group);
      });
      discountGroups.forEach(groupItems => {
        if (groupItems.length < 2) return;
        const overlapCount = this.checkDateOverlap(
          groupItems as unknown as Record<string, unknown>[],
          'tlt_bdate', 'tlt_edate'
        );
        if (overlapCount > 0) {
          errorCount += overlapCount;
          errorTypes.add('同折扣別日期區間重疊');
        }
      });
    }

    if (errorCount > 0) {
      // 重建 detailItems 以反映 _errorFields
      activeCommissions.forEach(c => this.commissionCrudService.updateDetailItems(c));

      const typeList = [...errorTypes].join('、');
      return {
        isValid: false,
        errorMessages: [`抽成設定共 ${errorCount} 項錯誤：${typeList}，請修正紅框欄位`]
      };
    }

    return { isValid: true, errorMessages: [] };
  }

  private clearStep3ErrorFlags(commissions: CommissionItem[]): void {
    commissions.forEach(commission => {
      delete commission._hasValidationError;
      delete commission._errorFields;
      commission.discountSettingItems?.forEach((d: DiscountSettingItem) => {
        delete d._hasValidationError;
        delete d._hasDateOverlapError;
        delete d._errorFields;
      });
      commission.annualPerformanceItems?.forEach((a: AnnualPerformanceItem) => {
        delete a._hasValidationError;
        delete a._hasDateOverlapError;
        delete a._errorFields;
      });
      commission.discountLevelItems?.forEach((l: DiscountLevelItem) => {
        delete l._hasValidationError;
        delete l._errorFields;
      });
      this.commissionCrudService.updateDetailItems(commission);
    });
  }

  // ========== Step 4: 租金設定 ==========

  validateStep4(
    conditionItems: ConditionItem[],
    commissionType: string
  ): StepValidationResult {
    // 一般抽成 (3) 不需要 Step 4
    if (commissionType === '3') {
      return { isValid: true, errorMessages: [] };
    }

    // 過濾未刪除的條件（commissionType 已明確知道類型，不需要 type guard）
    const activeItems = conditionItems.filter(item => item._status !== 'deleted');

    // 清除錯誤標記
    activeItems.forEach(item => {
      delete item._hasValidationError;
      delete item._hasDateOverlapError;
      delete item._errorFields;
    });

    if (activeItems.length === 0) {
      return { isValid: false, errorMessages: ['請至少設定一筆租金/條件資料'] };
    }

    let errorCount = 0;
    const errorTypes = new Set<string>();

    for (const item of activeItems) {
      const errorFields: string[] = [];
      const data = item as unknown as Record<string, unknown>;

      switch (commissionType) {
        case '1': // 固定租金
          if (!data['base_rent'] || Number(data['base_rent']) <= 0) {
            errorCount++; errorTypes.add('金額必須大於 0'); errorFields.push('base_rent');
          }
          break;

        case '2': // 底租抽成取高者
          if (!data['base_rent'] || Number(data['base_rent']) <= 0) {
            errorCount++; errorTypes.add('金額必須大於 0'); errorFields.push('base_rent');
          }
          break;

        case '4': // 包底抽成
          if (!data['limit_amt'] || Number(data['limit_amt']) <= 0) {
            errorCount++; errorTypes.add('金額必須大於 0'); errorFields.push('limit_amt');
          }
          if (!data['limit_charge_rate'] || Number(data['limit_charge_rate']) <= 0) {
            errorCount++; errorTypes.add('抽成率必須大於 0'); errorFields.push('limit_charge_rate');
          }
          break;

        case '5': // 層級抽成
          if (data['start_number'] !== undefined && data['end_number'] !== undefined) {
            const gradStart = Number(data['start_number']);
            const gradEnd = Number(data['end_number']);
            // end=0 視為無上限，不卡控；起始值允許為 0
            if (gradEnd !== 0 && gradStart >= gradEnd) {
              errorCount++; errorTypes.add('業績起迄值錯誤'); errorFields.push('start_number', 'end_number');
            }
          }
          if (!data['charge_rate'] || Number(data['charge_rate']) <= 0) {
            errorCount++; errorTypes.add('抽成率必須大於 0'); errorFields.push('charge_rate');
          }
          break;

        case '6': // 包底加層級
          if (!data['limit_amt'] || Number(data['limit_amt']) <= 0) {
            errorCount++; errorTypes.add('金額必須大於 0'); errorFields.push('limit_amt');
          }
          if (data['start_number'] !== undefined && data['end_number'] !== undefined) {
            const tierStart = Number(data['start_number']);
            const tierEnd = Number(data['end_number']);
            // end=0 視為無上限，不卡控；起始值允許為 0
            if (tierEnd !== 0 && tierStart >= tierEnd) {
              errorCount++; errorTypes.add('業績起迄值錯誤'); errorFields.push('start_number', 'end_number');
            }
          }
          break;
      }

      if (errorFields.length > 0) {
        item._errorFields = [...new Set(errorFields)];
      }
    }

    if (errorCount > 0) {
      const typeList = [...errorTypes].join('、');
      return {
        isValid: false,
        errorMessages: [`租金設定共 ${errorCount} 項錯誤：${typeList}，請修正紅框欄位`]
      };
    }

    return { isValid: true, errorMessages: [] };
  }

  // ========== 輔助方法 ==========

  /** 檢查日期區間是否重疊 */
  private checkDateOverlap(
    items: Record<string, unknown>[],
    startField: string,
    endField: string
  ): number {
    let overlapCount = 0;
    const validItems = items.filter(item =>
      item[startField] && item[endField] && item['_status'] !== 'deleted'
    );

    for (let i = 0; i < validItems.length; i++) {
      const startA = this.parseDate(validItems[i][startField]);
      const endA = this.parseDate(validItems[i][endField]);
      if (!startA || !endA) continue;

      for (let j = i + 1; j < validItems.length; j++) {
        const startB = this.parseDate(validItems[j][startField]);
        const endB = this.parseDate(validItems[j][endField]);
        if (!startB || !endB) continue;

        if (startA <= endB && startB <= endA) {
          overlapCount++;
          const fieldsI = (validItems[i]['_errorFields'] as string[]) || [];
          validItems[i]['_errorFields'] = [...new Set([...fieldsI, startField, endField])];
          const fieldsJ = (validItems[j]['_errorFields'] as string[]) || [];
          validItems[j]['_errorFields'] = [...new Set([...fieldsJ, startField, endField])];
        }
      }
    }
    return overlapCount;
  }

  /** 解析日期（支援 Date、YYYY-MM-DD、YYYY/MM/DD、ISO） */
  parseDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'string') {
      const datePart = value.trim().split(/[T\s]/)[0];
      const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (match) {
        const date = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
        return isNaN(date.getTime()) ? null : date;
      }
    }
    return null;
  }

  /** 驗證 Email 格式（支援多個以分號分隔） */
  private isValidEmail(email: string): boolean {
    const emails = email.split(/[;；]/).map(e => e.trim()).filter(e => e);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(e => emailPattern.test(e));
  }
}
