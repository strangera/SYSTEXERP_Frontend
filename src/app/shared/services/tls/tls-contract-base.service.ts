import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '@service/system/auth.service';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import {
  TLS_COMMON_FORM_DEFAULTS,
  TLS_CREATE_MODE_DEFAULTS,
  TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE,
  getTLS13010FormDefaults,
  getTLS12040FormDefaults
} from './tls-form-defaults.constants';

/**
 * TLS 合約表單共用邏輯服務
 * 用於 TLS13010 (專櫃合約) 和 TLS12040 (專櫃要約書) 的共用功能
 *
 * 使用方式：
 * 1. 在 component constructor 注入此 service
 * 2. 呼叫 initializeFormByMode() 來初始化表單
 * 3. 呼叫 setupTermTypeListener() 來設定抽成別監聽
 * 4. 呼叫 setCurrentUserAsNegotiator() 來設定當前使用者為洽談者
 */
@Injectable({
  providedIn: 'root'
})
export class TlsContractBaseService {

  constructor(private authService: AuthService) { }

  /**
   * 根據模組類型和模式初始化表單
   * @param form 表單實例
   * @param moduleType 模組類型：'TLS13010' | 'TLS12040'
   * @param mode CRUD 狀態
   * @param existingData 既有資料（編輯/檢視模式使用）
   */
  initializeFormByMode(
    form: FormGroup,
    moduleType: 'TLS13010' | 'TLS12040',
    mode: CRUDStatus,
    existingData?: any
  ): void {
    console.log(`🔧 [TlsContractBaseService] 初始化 ${moduleType} 表單，模式：${mode}`);

    // 如果有既有資料，直接載入
    if (existingData && Object.keys(existingData).length > 0) {
      console.log('📦 使用既有資料，跳過預設值設定');
      form.patchValue(existingData, { emitEvent: false });
      return;
    }

    // 根據模式設定預設值
    switch (mode) {
      case CRUDStatus.Create:
        this.initializeEmptyForm(form, moduleType);
        break;

      case CRUDStatus.Edit:
        console.log('📝 編輯模式：等待載入既有資料');
        break;

      case CRUDStatus.Read:
        console.log('👁️ 檢視模式：等待載入既有資料');
        break;

      default:
        console.warn('⚠️ 未知模式，使用預設值');
        this.initializeEmptyForm(form, moduleType);
    }
  }

  /**
   * 初始化空白表單（新增模式）
   * @param form 表單實例
   * @param moduleType 模組類型
   */
  initializeEmptyForm(form: FormGroup, moduleType: 'TLS13010' | 'TLS12040'): void {
    console.log(`🔧 初始化 ${moduleType} 空白表單`);

    const defaultValues = moduleType === 'TLS13010'
      ? getTLS13010FormDefaults()
      : getTLS12040FormDefaults();

    form.patchValue(defaultValues);

    console.log('✅ 空白表單初始化完成', {
      抽成別: defaultValues.tlt_term_type,
      營運狀態: defaultValues.tlt_openflag,
      審核狀態: defaultValues.approve_status
    });
  }

  /**
   * 設定抽成別變更監聽器
   * 當抽成別改變時，自動更新相關欄位的預設值
   * @param form 表單實例
   * @returns Subscription（記得在 ngOnDestroy 取消訂閱）
   */
  setupTermTypeListener(form: FormGroup): any {
    const termTypeControl = form.get('tlt_term_type');

    if (!termTypeControl) {
      console.warn('⚠️ 找不到 tlt_term_type 欄位');
      return null;
    }

    return termTypeControl.valueChanges.subscribe(termType => {
      this.updateDefaultsByTermType(form, termType);
    });
  }

  /**
   * 設定契約日期與營運日期的同步監聽
   * 當契約起訖日變更時，自動同步到營運起訖日
   * @param form 表單實例
   * @returns Subscription 陣列（記得在 ngOnDestroy 取消訂閱）
   */
  setupContractDateSync(form: FormGroup): any[] {
    const subscriptions: any[] = [];

    // 監聽契約起始日 (tlt_bdate) -> 同步到營運起始日 (tlt_contract_bdate)
    const contractBdateControl = form.get('tlt_bdate');
    if (contractBdateControl) {
      const sub = contractBdateControl.valueChanges.subscribe(value => {
        const operationBdateControl = form.get('tlt_contract_bdate');
        if (operationBdateControl && value) {
          console.log('🔄 契約起始日變更，同步到營運起始日:', value);
          operationBdateControl.patchValue(value, { emitEvent: false });
        }
      });
      subscriptions.push(sub);
    }

    // 監聽契約迄日 (tlt_edate) -> 同步到營運迄日 (tlt_contract_edate)
    const contractEdateControl = form.get('tlt_edate');
    if (contractEdateControl) {
      const sub = contractEdateControl.valueChanges.subscribe(value => {
        const operationEdateControl = form.get('tlt_contract_edate');
        if (operationEdateControl && value) {
          console.log('🔄 契約迄日變更，同步到營運迄日:', value);
          operationEdateControl.patchValue(value, { emitEvent: false });
        }
      });
      subscriptions.push(sub);
    }

    return subscriptions;
  }

  /**
   * 根據抽成別更新相關欄位預設值
   * @param form 表單實例
   * @param termType 抽成別代碼
   */
  updateDefaultsByTermType(form: FormGroup, termType: string): void {
    const defaults = TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE[
      termType as keyof typeof TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE
    ];

    if (defaults) {
      console.log(`🔄 根據抽成別 ${termType} 更新預設值:`, defaults);
      form.patchValue(defaults, { emitEvent: false });
    }
  }

  /**
   * 設定當前使用者為洽談者
   * @param form 表單實例
   * @param forceUpdate 是否強制更新（即使已有值）
   */
  setCurrentUserAsNegotiator(form: FormGroup, forceUpdate: boolean = false): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      console.warn('⚠️ [TlsContractBaseService] 無法取得當前使用者資訊');
      return;
    }

    const contactUsrNoControl = form.get('contact_USR_No');

    // 只有當欄位為空或強制更新時才設定
    if (contactUsrNoControl && (!contactUsrNoControl.value || forceUpdate)) {
      console.log('👤 [TlsContractBaseService] 設定當前使用者為洽談者:', {
        編號: currentUser.user_No,
        姓名: currentUser.user_Name
      });

      form.patchValue({
        contact_USR_No: currentUser.user_No,
        contact_USR_Name: currentUser.user_Name
      }, { emitEvent: false });

      contactUsrNoControl.markAsTouched();
      form.get('contact_USR_Name')?.markAsTouched();
    }
  }

  /**
   * 重置表單為預設值（保留某些欄位）
   * @param form 表單實例
   * @param moduleType 模組類型
   * @param preserveFields 需要保留的欄位名稱
   */
  resetToDefaults(
    form: FormGroup,
    moduleType: 'TLS13010' | 'TLS12040',
    preserveFields: string[] = []
  ): void {
    console.log('🔄 重置表單為預設值');

    // 保存需要保留的欄位值
    const preservedValues: any = {};
    preserveFields.forEach(fieldName => {
      preservedValues[fieldName] = form.get(fieldName)?.value;
    });

    // 重置為預設值
    const defaultValues = moduleType === 'TLS13010'
      ? getTLS13010FormDefaults()
      : getTLS12040FormDefaults();

    form.patchValue(defaultValues);

    // 恢復保留的欄位
    if (Object.keys(preservedValues).length > 0) {
      form.patchValue(preservedValues);
      console.log('📌 已保留欄位:', preserveFields);
    }
  }

  /**
   * 取得欄位的預設值
   * @param fieldName 欄位名稱
   * @param moduleType 模組類型（可選，如果該欄位在兩個模組有不同預設值）
   */
  getFieldDefault(fieldName: keyof typeof TLS_COMMON_FORM_DEFAULTS, moduleType?: 'TLS13010' | 'TLS12040'): any {
    if (moduleType) {
      const defaults = moduleType === 'TLS13010'
        ? getTLS13010FormDefaults()
        : getTLS12040FormDefaults();
      return defaults[fieldName];
    }
    return TLS_COMMON_FORM_DEFAULTS[fieldName];
  }

  /**
   * 檢查表單是否使用預設值（用於判斷是否為空白新增）
   * @param form 表單實例
   */
  isUsingDefaults(form: FormGroup): boolean {
    const currentValues = form.getRawValue();
    const criticalFields = ['tlt_name', 'ven_uniform', 'bus_type', 'tlt_bdate'];

    return criticalFields.every(field =>
      !currentValues[field] || currentValues[field] === TLS_COMMON_FORM_DEFAULTS[field as keyof typeof TLS_COMMON_FORM_DEFAULTS]
    );
  }

  /**
   * 日期區間驗證
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 是否有效
   */
  validateDateRange(startDate: Date | null, endDate: Date | null): boolean {
    if (!startDate || !endDate) {
      return true; // 允許為空，由 required validator 處理
    }
    return startDate <= endDate;
  }

  /**
   * 取得欄位的顯示名稱（用於錯誤訊息）
   * @param fieldName 欄位名稱
   */
  getFieldDisplayName(fieldName: string): string {
    const fieldNameMap: { [key: string]: string } = {
      'tlt_name': '專櫃名稱',
      'ven_uniform': '廠商統一編號',
      'bus_type': '大分類',
      'bus_class': '中分類',
      'bus_sclass': '小分類',
      'tlt_bdate': '洽談起始日',
      'tlt_edate': '洽談迄日',
      'org_id': '組織代號',
      'tlt_contract_bdate': '合約起始日',
      'tlt_contract_edate': '合約迄日',
      'tlt_term_type': '抽成別',
      'comm_comp_type': '佣金計算',
      'invoice_type': '請款單據別',
      'contact_USR_No': '洽談者',
      'contact_Date': '洽談日期'
    };

    return fieldNameMap[fieldName] || fieldName;
  }
}
