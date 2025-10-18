// tls13010-form-init.service.ts

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * TLS13010 表單初始化服務
 * 負責處理表單的預設值設定和初始化邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class TLS13010FormInitService {

  /**
   * 取得表單預設值
   * @returns 包含所有預設值的物件
   */
  getDefaultFormValues(): any {
    return {
      // 基本資訊 - 系統自動產生的欄位設為空
      talent_id: '',
      apply_no: '',
      tlt_name: '',
      tlt_no: '',
      ven_no: '',
      ven_uniform: '',
      VEN_Name: '',
      paper_type: '',                  // 這個欄位在 constants 中沒有定義,保持空白
      bus_type: '',
      bus_class: '',
      bus_sclass: '',
      contract_subno: '1',             // 預設版次為 1

      // 預設值
      tlt_term_type: '3',              // 抽成別:一般抽成
      comm_comp_type: '2',             // 除稅
      tlt_openflag: '9',               // 合約未生效

      // 其他預設值
      org_id: '',
      tlt_kind: '1',                   // 專櫃種類:正櫃
      deco_type: '1',                  // 裝潢方式:統設統裝(A統)
      edc_yn: 'Y',                     // 是否使用業主商店代號:是
      tlt_ctype_mtotal: '',
      overall_status: '1',
      deposit: 0,
      rece_yn: 'Y',                    // 是否使用業主收銀機:是
      pos_yn: 'Y',                     // 是否使用業主商店代號:是
      cash_yn: 'N',
      comm_yn: 'Y',                    // 是否為抽成:是
      rent_ahead: 'N',                 // 預收租金
      VEN_Address: '',

      // Y/N 欄位預設值
      invoice_type: '0',               // 請款單據別:發票
      vip_yn: 'Y',
      credit_card: '',
      total_amt_unit: 'M',             // 預設為月
      total_amt_vendor_unit: 'M',      // 預設為月
      paytype: '1',                    // 付款方式:匯款
      money_type: '30',                // 結帳方式:月結
      store_way: '1',                  // 配合方式:專櫃
      check_typeList: ['1', '2', '3'], // 對帳方式:郵寄 + 網路(複選)
      water_flag: 'N',
      electric_flag: 'N',
      gas_flag: 'N',

      // 其他欄位
      tlt_bdate: '',
      tlt_edate: '',
      contact_Date: '',
      tlt_contract_bdate: '',
      tlt_contract_edate: '',
      feedback_date: '',
      due_date: '',
      contact_USR_No: '',
      contact_USR_Name: '',
      email: '',
      invoice_email: '',
      CHECK_TITLE: '',
      store_tel: '',
      bank_id: '',
      vendor_acct_name: '',
      vendor_acct_no: '',
      contact_tel: '',
      contact_fax: '',
      contact_addr: '',
      tlt_remark: '',
      base_rent: 0,
      rent_period: 0,
      total_amt: '',
      total_amt_vendor: '',
      check_day: 0,
      construct_fees: 0,
      expiration_fees: 0,
      open_fees: 0,
      ticket_remarks: '',
      cap_saletype1: '',
      cap_saletype2: '',
      cap_saletype3: '',
      cap_saletype4: '',
      cap_saletype5: '',
      open_deposit: '',
      construct_deposit: '',
      expiration_deposit: '',
      selectedBankInfo: null
    };
  }

  /**
   * 初始化空白表單
   * @param formGroup 要初始化的表單群組
   */
  initializeEmptyForm(formGroup: FormGroup): void {
    const defaultValues = this.getDefaultFormValues();
    formGroup.patchValue(defaultValues);

    console.log(' 表單已初始化為預設值');
  }

  /**
   * 根據模式取得標題
   * @param isNewMode 是否為新增模式
   * @param isViewMode 是否為檢視模式
   * @returns 標題文字
   */
  getFormTitle(isNewMode: boolean, isViewMode: boolean): string {
    if (isViewMode) {
      return '檢視合約資料';
    }
    return isNewMode ? '新增合約資料' : '編輯合約資料';
  }

  /**
   * 取得申請編號的 placeholder
   * @param isNewMode 是否為新增模式
   * @returns placeholder 文字
   */
  getApplyNoPlaceholder(isNewMode: boolean): string {
    return isNewMode ? "'系統自動產生'" : '';
  }

  /**
   * 重設表單為預設值
   * @param formGroup 要重設的表單群組
   */
  resetFormToDefaults(formGroup: FormGroup): void {
    formGroup.reset();

    // 重設後設定必要的預設值
    formGroup.patchValue({
      comm_comp_type: '2',
      invoice_type: '0',
      contract_subno: '1',
      tlt_term_type: '3',
      tlt_openflag: '9',
      tlt_kind: '1',
      deco_type: '1',
      edc_yn: 'Y',
      rece_yn: 'Y',
      pos_yn: 'Y',
      comm_yn: 'Y',
      rent_ahead: 'N',
      vip_yn: 'Y',
      total_amt_unit: 'M',
      total_amt_vendor_unit: 'M',
      paytype: '1',
      money_type: '30',
      store_way: '1',
      check_typeList: ['1', '2', '3'],
      water_flag: 'N',
      electric_flag: 'N',
      gas_flag: 'N',
      cash_yn: 'N',
      overall_status: '1'
    });

    console.log(' 表單已重設為預設值');
  }

  /**
   * 取得新增模式的初始狀態
   * @returns 新增模式的初始狀態設定
   */
  getNewModeInitialState(): any {
    return {
      approve_status: '1',      // 未審核
      contract_subno: '1',      // 版次 1
      tlt_openflag: '9',        // 合約未生效
      overall_status: '1',      // 整體狀態
      comm_comp_type: '2',      // 除稅
      tlt_term_type: '3',       // 一般抽成
    };
  }

  /**
   * 檢查必填欄位是否已填寫
   * @param formGroup 要檢查的表單群組
   * @returns 必填欄位清單和是否全部填寫完成
   */
  checkRequiredFields(formGroup: FormGroup): {
    isComplete: boolean;
    missingFields: string[]
  } {
    const requiredFields = [
      'tlt_name',
      'ven_uniform',
      'bus_type',
      'bus_class',
      'tlt_bdate',
      'tlt_edate',
      'org_id',
      'tlt_contract_bdate',
      'tlt_contract_edate',
      'tlt_term_type',
      'comm_comp_type',
      'invoice_type'
    ];

    const missingFields: string[] = [];

    requiredFields.forEach(fieldName => {
      const control = formGroup.get(fieldName);
      if (control && !control.value) {
        missingFields.push(fieldName);
      }
    });

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * 取得欄位的顯示名稱 (用於錯誤訊息)
   */
  getFieldDisplayName(fieldName: string): string {
    const fieldNameMap: { [key: string]: string } = {
      'tlt_name': '專櫃名稱',
      'ven_uniform': '廠商統一編號',
      'bus_type': '大分類',
      'bus_class': '中分類',
      'tlt_bdate': '洽談起始日',
      'tlt_edate': '洽談迄日',
      'org_id': '組織代號',
      'tlt_contract_bdate': '合約起始日',
      'tlt_contract_edate': '合約迄日',
      'tlt_term_type': '抽成別',
      'comm_comp_type': '佣金計算',
      'invoice_type': '請款單據別'
    };

    return fieldNameMap[fieldName] || fieldName;
  }

  /**
 * 為新增模式設定特定的初始值
 * @param formGroup 表單群組
 */
  setNewModeSpecificValues(formGroup: FormGroup): void {
    const newModeState = this.getNewModeInitialState();
    formGroup.patchValue(newModeState);

    console.log(' 新增模式特定值已設定');
  }
}
