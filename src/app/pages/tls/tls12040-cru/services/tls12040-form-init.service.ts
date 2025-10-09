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

// ============================================================
// 📁 使用範例：在 tls12040-cru.component.ts 中整合
// ============================================================

/**
 * 在 TLS12040CRUComponent 中的使用方式
 */

/*
// 1. 注入服務
constructor(
  // ... 其他服務
  private formInitService: TLS12040FormInitService
) { }

// 2. 在 ngOnInit 中使用
ngOnInit() {
  this.initializePage('TLS12040', this.dataForm, { useReadonly: true });
  this.handleRouterState();

  // ✅ 關鍵：根據模式初始化預設值
  this.initializeFormDefaults();

  // ... 其他初始化
}

// 3. 初始化預設值的方法
private initializeFormDefaults(): void {
  const existingData = this.flowService.getCruData() as any;

  if (existingData && Object.keys(existingData).length > 0) {
    console.log('✅ 使用暫存資料，跳過預設值設定');
    this.loadCachedDataWithClassifications(existingData);
  } else {
    console.log('🆕 新增模式，設定預設值');
    this.formInitService.initializeByMode(this.dataForm, this.crudstatus);

    // 立即觸發驗證器
    this.triggerAllDynamicValidators();
  }
}

// 4. 監聽抽成別變更，自動更新相關預設值
private setupTermTypeListener(): void {
  this.dataForm.get('tlt_term_type')?.valueChanges.subscribe(termType => {
    if (termType && this.crudstatus === CRUDStatus.Create) {
      // 只在新增模式下自動更新
      this.formInitService.updateDefaultsByTermType(this.dataForm, termType);
    }
  });
}

// 5. 清除表單時使用（如果需要）
onClearForm(): void {
  if (confirm('確定要清除所有輸入的資料嗎?此操作無法復原。')) {
    // 保留某些系統欄位
    this.formInitService.resetToDefaults(this.dataForm, ['apply_no', 'tlt_no']);

    this.locationData = [];
    this.flowService.clearAll();
    this.messageService.infoBubble('表單已清除');
  }
}
*/
