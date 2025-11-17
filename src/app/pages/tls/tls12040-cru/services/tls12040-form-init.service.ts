import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TLS12040_FORM_DEFAULTS, TLS12040_MODE_DEFAULTS, TLS12040_CONDITIONAL_DEFAULTS } from '../constants/tls12040-defaults.constants';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

/**
 * TLS12040 表單初始化服務
 * 負責根據不同情境設定表單預設值
 */
@Injectable({
  providedIn: 'root'
})
export class TLS12040FormInitService {

  /**
   * 初始化空白表單（新增模式）
   * @param form 表單實例
   */
  initializeEmptyForm(form: FormGroup): void {
    console.log('🔧 初始化空白表單');

    // 設定基本預設值
    const defaultValues = {
      ...TLS12040_FORM_DEFAULTS,
      ...TLS12040_MODE_DEFAULTS.CREATE
    };

    form.patchValue(defaultValues);

    console.log('✅ 空白表單初始化完成', {
      抽成別: defaultValues.tlt_term_type,
      營運狀態: defaultValues.tlt_openflag,
      審核狀態: defaultValues.approve_status
    });
  }

  /**
   * 根據模式初始化表單
   * @param form 表單實例
   * @param mode CRUD 狀態
   */
  initializeByMode(form: FormGroup, mode: CRUDStatus): void {
    console.log(`🔧 根據模式初始化表單: ${mode}`);

    switch (mode) {
      case CRUDStatus.Create:
        this.initializeEmptyForm(form);
        break;

      case CRUDStatus.Edit:
        // 編輯模式通常載入既有資料，不設定預設值
        console.log('📝 編輯模式：等待載入既有資料');
        break;

      case CRUDStatus.Read:
        // 檢視模式通常載入既有資料，不設定預設值
        console.log('👁️ 檢視模式：等待載入既有資料');
        break;

      default:
        console.warn('⚠️ 未知模式，使用預設值');
        this.initializeEmptyForm(form);
    }
  }

  /**
   * 根據抽成別更新相關欄位預設值
   * @param form 表單實例
   * @param termType 抽成別代碼
   */
  updateDefaultsByTermType(form: FormGroup, termType: string): void {
    const defaults = TLS12040_CONDITIONAL_DEFAULTS.byTermType[termType as keyof typeof TLS12040_CONDITIONAL_DEFAULTS.byTermType];

    if (defaults) {
      console.log(`🔄 根據抽成別 ${termType} 更新預設值:`, defaults);
      form.patchValue(defaults);
    }
  }

  /**
   * 重置表單為預設值（保留某些欄位）
   * @param form 表單實例
   * @param preserveFields 需要保留的欄位名稱
   */
  resetToDefaults(form: FormGroup, preserveFields: string[] = []): void {
    console.log('🔄 重置表單為預設值');

    // 保存需要保留的欄位值
    const preservedValues: any = {};
    preserveFields.forEach(fieldName => {
      preservedValues[fieldName] = form.get(fieldName)?.value;
    });

    // 重置為預設值
    form.patchValue(TLS12040_FORM_DEFAULTS);

    // 恢復保留的欄位
    if (Object.keys(preservedValues).length > 0) {
      form.patchValue(preservedValues);
      console.log('📌 已保留欄位:', preserveFields);
    }
  }

  /**
   * 取得單一欄位的預設值
   * @param fieldName 欄位名稱
   */
  getFieldDefault(fieldName: keyof typeof TLS12040_FORM_DEFAULTS): any {
    return TLS12040_FORM_DEFAULTS[fieldName];
  }

  /**
   * 檢查表單是否使用預設值（用於判斷是否為空白新增）
   * @param form 表單實例
   */
  isUsingDefaults(form: FormGroup): boolean {
    const currentValues = form.getRawValue();
    const criticalFields = ['tlt_name', 'ven_uniform', 'bus_type', 'tlt_bdate'];

    return criticalFields.every(field =>
      !currentValues[field] || currentValues[field] === TLS12040_FORM_DEFAULTS[field as keyof typeof TLS12040_FORM_DEFAULTS]
    );
  }
}
