import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ContractInfo } from '../../core/models/contract/contract-info.interface';
import { LocationItem } from '../../core/models/contract/location-item.interface';

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

@Injectable({
  providedIn: 'root'
})
export class ContractValidatorService {

  /**
   * 驗證 Step 1 - 合約基本資料
   */
  validateStep1(form: FormGroup, locationData: LocationItem[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 驗證必填欄位
    const requiredFields = [
      { field: 'tlt_name', label: '櫃位名稱' },
      { field: 'ven_uniform', label: '廠商統一編號' },
      { field: 'bus_type', label: '大分類' },
      { field: 'bus_class', label: '中分類' },
      { field: 'org_id', label: '組織代碼' },
      { field: 'tlt_bdate', label: '契約起始日' },
      { field: 'tlt_edate', label: '契約截止日' },
      { field: 'tlt_contract_bdate', label: '營運起始日' },
      { field: 'tlt_contract_edate', label: '營運截止日' },
      { field: 'tlt_term_type', label: '抽成別' },
      { field: 'invoice_type', label: '請款單據別' }
    ];

    requiredFields.forEach(({ field, label }) => {
      const control = form.get(field);
      if (!control?.value) {
        errors.push({ field, message: `${label}為必填欄位` });
      }
    });

    // 驗證日期順序
    const tltBdate = form.get('tlt_bdate')?.value;
    const tltEdate = form.get('tlt_edate')?.value;
    if (tltBdate && tltEdate && new Date(tltBdate) > new Date(tltEdate)) {
      errors.push({ field: 'tlt_edate', message: '契約截止日必須大於契約起始日' });
    }

    const contractBdate = form.get('tlt_contract_bdate')?.value;
    const contractEdate = form.get('tlt_contract_edate')?.value;
    if (contractBdate && contractEdate && new Date(contractBdate) > new Date(contractEdate)) {
      errors.push({ field: 'tlt_contract_edate', message: '營運截止日必須大於營運起始日' });
    }

    // 驗證位置資料
    const validLocations = locationData.filter(loc => loc._status !== 'deleted');
    if (validLocations.length === 0) {
      warnings.push({ field: 'location', message: '建議設定至少一個櫃位地點' });
    }

    // 驗證聯名卡折數
    const vipYn = form.get('vip_yn')?.value;
    const creditCard = form.get('credit_card')?.value;
    if (vipYn === 'Y' && (!creditCard || creditCard <= 0)) {
      errors.push({ field: 'credit_card', message: '配合聯名卡時，聯名卡折數為必填' });
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 驗證 Email 格式（支援多個以分號分隔）
   */
  private isValidEmail(email: string): boolean {
    const emails = email.split(/[;；]/).map(e => e.trim()).filter(e => e);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(e => emailPattern.test(e));
  }
}
