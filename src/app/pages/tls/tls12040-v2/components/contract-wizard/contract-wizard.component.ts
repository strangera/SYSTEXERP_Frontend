/**
 * TLS12040-V2 合約精靈主組件
 *
 * 單頁面架構，包含所有步驟：
 * - Step 1: 合約基本資料
 * - Step 2: 代扣款設定
 * - Step 3: 抽成設定
 * - Step 4: 條件設定
 *
 * 資料統一在此組件管理，不需要 Session Storage
 */
import { NgIf, NgSwitch, NgSwitchCase, CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';

// 基礎組件
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 共用組件
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';

// V2 服務
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';

// V2 類型
import {
  CommissionType,
  COMMISSION_TYPES_WITH_STEP3,
  COMMISSION_TYPES_WITH_STEP4,
  WizardMode,
  DataStatus
} from '../../core';
import { ContractInfo, LocationItem } from '../../core/models/contract';
import { FareItem } from '../../core/models/deduction';
import { CommissionItem } from '../../core/models/commission';
import { ConditionItem } from '../../core/models/condition';
import { SubmitData } from '../../core/models/submit';

// 子組件
import { Step1ContractInfoComponent } from './steps/step1-contract-info/step1-contract-info.component';
import { Step2DeductionComponent } from './steps/step2-deduction/step2-deduction.component';
import { Step3CommissionComponent } from './steps/step3-commission/step3-commission.component';
import { Step4ConditionComponent } from './steps/step4-condition/step4-condition.component';

/**
 * 合約精靈狀態
 */
interface WizardState {
  // Step 1 資料
  contractInfo: ContractInfo | null;
  locationData: LocationItem[];

  // Step 2 資料
  fareItems: FareItem[];

  // Step 3 資料
  commissionItems: CommissionItem[];

  // Step 4 資料
  conditionItems: ConditionItem[];

  // 續約資料
  renewalData: {
    sourceContractId: string;
    sourceApplyNo: string;
    sourceContractSubno: number;
    nextContractSubno: number;
  } | null;
}

@Component({
  selector: 'app-tls12040-v2-contract-wizard',
  templateUrl: './contract-wizard.component.html',
  styleUrls: ['./contract-wizard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    ReactiveFormsModule,
    StepsModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    Step1ContractInfoComponent,
    Step2DeductionComponent,
    Step3CommissionComponent,
    Step4ConditionComponent
  ]
})
export class ContractWizardComponent extends BasicCruPageComponent<any> implements OnInit {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;

  // ========== 步驟控制 ==========
  currentStep = 0;

  // 所有步驟的完整定義
  private readonly allSteps: MenuItem[] = [
    { label: '合約基本資料' },
    { label: '代扣款設定' },
    { label: '抽成設定' },
    { label: '條件設定' }
  ];

  /**
   * 根據抽成別動態計算應顯示的步驟
   * - 固定租金 (1): Step 0, 1, 3 (跳過 Step 2 抽成設定)
   * - 一般抽成 (3): Step 0, 1, 2 (跳過 Step 3 條件設定)
   * - 其他: 全部 4 個步驟
   */
  get steps(): MenuItem[] {
    const commissionType = this.currentCommissionType as CommissionType;

    switch (commissionType) {
      case CommissionType.FixedRent:
        return [this.allSteps[0], this.allSteps[1], this.allSteps[3]];

      case CommissionType.GeneralCommission:
        return [this.allSteps[0], this.allSteps[1], this.allSteps[2]];

      default:
        return this.allSteps;
    }
  }

  /**
   * 取得實際步驟索引對應表
   */
  get stepIndexMap(): number[] {
    const commissionType = this.currentCommissionType as CommissionType;

    switch (commissionType) {
      case CommissionType.FixedRent:
        return [0, 1, 3];
      case CommissionType.GeneralCommission:
        return [0, 1, 2];
      default:
        return [0, 1, 2, 3];
    }
  }

  /**
   * 取得當前視覺步驟索引
   */
  get visualStepIndex(): number {
    return this.stepIndexMap.indexOf(this.currentStep);
  }

  /**
   * 取得當前抽成別
   */
  get currentCommissionType(): string {
    return this.dataForm?.get('tlt_term_type')?.value || CommissionType.GeneralCommission;
  }

  // ========== 資料狀態 ==========
  wizardState: WizardState = {
    contractInfo: null,
    locationData: [],
    fareItems: [],
    commissionItems: [],
    conditionItems: [],
    renewalData: null
  };

  // 表單 (使用 dataForm 符合 BasicCruPageComponent 慣例)
  dataForm!: FormGroup;

  // 是否為續約模式
  isRenewalMode = false;

  // 儲存狀態
  isSaving = false;

  // 原始抽成別（編輯模式用）
  originalCommissionType?: string;

  // 子組件參考
  @ViewChild(Step1ContractInfoComponent) step1Component?: Step1ContractInfoComponent;
  @ViewChild(Step2DeductionComponent) step2Component?: Step2DeductionComponent;
  @ViewChild(Step3CommissionComponent) step3Component?: Step3CommissionComponent;
  @ViewChild(Step4ConditionComponent) step4Component?: Step4ConditionComponent;

  constructor(
    public override router: Router,
    private apiService: TLS12040Service,
    private tlsBaseService: TlsContractBaseService,
    public sharedDropdownService: SharedDropdownService
  ) {
    super();
    this.initializeForm();
  }

  // ========== 生命週期 ==========
  async ngOnInit(): Promise<void> {
    // 使用 BasicCruPageComponent 的 initializePage
    this.initializePage('TLS12040', this.dataForm, { useReadonly: true });

    // 設定動態驗證監聽器
    this.setupDynamicValidators();

    // 處理路由狀態（續約模式等特殊處理）
    await this.handleRouterState();
  }

  // ========== 表單初始化 ==========
  private initializeForm(): void {
    this.dataForm = this.formBuilder.group({
      // 識別資訊
      apply_no: [''],
      talent_id: [''],
      tlt_no: [''],
      contract_subno: [1, [Validators.required]],

      // 廠商資訊
      vendor_ven_no: [''],  // 廠商統一編號（下拉選單）
      ven_uniform: ['', [Validators.maxLength(10)]],
      ven_no: ['', [Validators.required, Validators.maxLength(16)]],
      VEN_Name: ['', [Validators.maxLength(100)]],
      VEN_Address: [''],

      // 專櫃資訊
      tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
      tlt_shortname: ['', [Validators.maxLength(20)]],
      store_tel: ['', [Validators.maxLength(50)]],

      // 申請資訊
      apply_type: ['1'],
      apply_date: [''],
      apply_status: ['1'],
      contract_type: [''],
      approve_status: ['1', [Validators.required]],

      // 日期資訊
      tlt_bdate: ['', [Validators.required]],
      tlt_edate: ['', [Validators.required]],
      tlt_contract_bdate: ['', [Validators.required]],
      tlt_contract_edate: ['', [Validators.required]],
      feedback_date: [''],
      due_date: [''],
      contact_Date: [''],

      // 分類資訊
      paper_type: ['', [Validators.maxLength(2)]],
      org_id: ['', [Validators.required, Validators.maxLength(20)]],
      bus_type: ['', [Validators.required, Validators.maxLength(2)]],
      bus_class: ['', [Validators.required, Validators.maxLength(2)]],
      bus_sclass: ['', [Validators.required, Validators.maxLength(2)]],
      tlt_kind: ['1'],

      // 抽成相關
      tlt_term_type: ['3', [Validators.required]],
      comm_comp_type: ['2', [Validators.required]],
      comm_yn: ['N'],
      tlt_ctype_mtotal: [''],
      overall_status: [''],

      // 營運設定
      deco_type: ['1'],
      money_type: ['30'],
      store_way: ['1'],
      check_type: ['3'],
      check_typeList: [[]],
      tlt_openflag: ['9'],
      edc_yn: ['N'],

      // 發票/付款
      rece_yn: ['N'],
      pos_yn: ['N'],
      cash_yn: ['N'],
      paytype: ['1'],
      invoice_type: ['0', [Validators.required]],
      check_day: [30, [Validators.required]],

      // 費用相關
      base_rent: [0],
      deposit: [0],
      rent_ahead: ['N'],
      rent_period: [0],

      // 會員卡
      vip_yn: ['N'],
      credit_card: [0],

      // 目標營業額
      total_amt: [null],
      total_amt_vendor: [null],
      total_amt_unit: ['萬'],
      total_amt_vendor_unit: ['萬'],

      // 保證金
      open_deposit: ['1'],
      open_fees: [0],
      construct_deposit: ['1'],
      construct_fees: [0],
      expiration_deposit: ['1'],
      expiration_fees: [0],
      ticket_remarks: ['', [Validators.maxLength(1000)]],

      // 銀行資訊
      bank_id: ['', [Validators.maxLength(10)]],
      vendor_acct_name: ['', [Validators.maxLength(60)]],
      vendor_acct_no: ['', [Validators.maxLength(16)]],

      // 聯絡資訊
      email: ['', [Validators.maxLength(100)]],
      invoice_email: ['', [Validators.maxLength(100)]],
      contact_tel: ['', [Validators.maxLength(20)]],
      contact_fax: ['', [Validators.maxLength(15)]],
      contact_addr: ['', [Validators.maxLength(100)]],
      CHECK_TITLE: ['', [Validators.maxLength(100)]],
      tlt_remark: ['', [Validators.maxLength(2000)]],

      // 水電瓦斯
      water_flag: ['N'],
      electric_flag: ['N'],
      gas_flag: ['N'],

      // 活動參與
      cap_saletype1: ['N'],
      cap_saletype2: ['N'],
      cap_saletype3: ['N'],
      cap_saletype4: ['N'],
      cap_saletype5: ['N'],

      // 洽談資訊
      contact_USR_No: ['', [Validators.maxLength(16)]],
      contact_USR_Name: ['', [Validators.maxLength(20)]]
    });
  }

  // ========== 動態驗證器 ==========
  private setupDynamicValidators(): void {
    // 監聽抽成別變更
    this.dataForm.get('tlt_term_type')?.valueChanges.subscribe((value) => {
      this.updateDynamicValidators();

      // 抽成別 1, 2 自動設定預收租金為 Y
      if (['1', '2'].includes(value)) {
        this.dataForm.patchValue({ rent_ahead: 'Y' }, { emitEvent: false });
      }
    });

    // 監聽付款方式變更
    this.dataForm.get('paytype')?.valueChanges.subscribe(() => {
      this.updatePaymentValidators();
    });

    // 初始化驗證器
    this.updateDynamicValidators();
  }

  private updateDynamicValidators(): void {
    const tltTermType = this.dataForm.get('tlt_term_type')?.value || '';

    // 包底類別驗證
    const baodiControl = this.dataForm.get('tlt_ctype_mtotal');
    if (baodiControl) {
      baodiControl.clearValidators();
      if (['2', '4', '6'].includes(tltTermType)) {
        baodiControl.setValidators([Validators.required]);
      }
      baodiControl.updateValueAndValidity();
    }

    // 超出部份處理方式驗證
    const overallStatusControl = this.dataForm.get('overall_status');
    if (overallStatusControl) {
      overallStatusControl.clearValidators();
      if (['4', '5', '6'].includes(tltTermType)) {
        overallStatusControl.setValidators([Validators.required]);
      }
      overallStatusControl.updateValueAndValidity();
    }

    // 固定租金驗證
    this.updateBaseRentValidators();
  }

  private updatePaymentValidators(): void {
    const paytype = this.dataForm.get('paytype')?.value;
    const bankIdControl = this.dataForm.get('bank_id');
    const vendorAcctNameControl = this.dataForm.get('vendor_acct_name');
    const vendorAcctNoControl = this.dataForm.get('vendor_acct_no');
    const checkTitleControl = this.dataForm.get('CHECK_TITLE');

    [bankIdControl, vendorAcctNameControl, vendorAcctNoControl, checkTitleControl]
      .forEach(control => control?.clearValidators());

    if (paytype === '1') { // 匯款
      bankIdControl?.setValidators([Validators.required]);
      vendorAcctNameControl?.setValidators([Validators.required, Validators.maxLength(60)]);
      vendorAcctNoControl?.setValidators([Validators.required, Validators.maxLength(16)]);
    } else if (paytype === '2') { // 支票
      checkTitleControl?.setValidators([Validators.required, Validators.maxLength(100)]);
    }

    [bankIdControl, vendorAcctNameControl, vendorAcctNoControl, checkTitleControl]
      .forEach(control => control?.updateValueAndValidity());
  }

  private updateBaseRentValidators(): void {
    const baseRentControl = this.dataForm.get('base_rent');
    const rentAhead = this.dataForm.get('rent_ahead')?.value;
    const tltTermType = this.dataForm.get('tlt_term_type')?.value || '';

    if (!baseRentControl) return;

    baseRentControl.clearValidators();

    if (['1', '2'].includes(tltTermType) || rentAhead === 'Y') {
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      baseRentControl.setValidators([Validators.min(0)]);
    }

    baseRentControl.updateValueAndValidity();
  }

  // ========== 路由狀態處理 ==========
  private async handleRouterState(): Promise<void> {
    const state = history.state;

    // 處理續約模式
    if (state?.mode === 'renewal' && state?.rowData) {
      this.isRenewalMode = true;
      await this.loadRenewalData(state.rowData.ven_no);
      return;
    }

    // 新增模式 - 初始化空表單
    if (this.isFormCreateable) {
      this.tlsBaseService.initializeEmptyForm(this.dataForm, 'TLS12040');
      this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
      return;
    }

    // 編輯/檢視模式 - 載入資料
    if ((this.isFormEditable || this.isFormReadable) && this.rowdata) {
      const applyNo = (this.rowdata as any).apply_no;
      if (applyNo) {
        await this.loadContractData(applyNo);
      }
    }
  }

  // ========== 資料載入 ==========
  private async loadContractData(applyNo: string): Promise<void> {
    try {
      const request = { apply_no: applyNo, id: null as any };
      const response = await this.apiService.queryTLS12040Detail(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const data = response.Data;

        // 處理抽成別 trim
        if (data.tlt_term_type) {
          data.tlt_term_type = String(data.tlt_term_type).trim();
          this.originalCommissionType = data.tlt_term_type;
        }

        // 填充表單
        this.dataForm.patchValue(data, { emitEvent: false });

        // 更新驗證器
        this.updateDynamicValidators();
        this.updatePaymentValidators();

        // 同步 contractInfo
        this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

        // 載入位置資料
        if (data.Locations && Array.isArray(data.Locations)) {
          this.wizardState.locationData = data.Locations.map((loc: any) => ({
            ...loc,
            tlt_space: typeof loc.tlt_space === 'string' ? parseFloat(loc.tlt_space) : loc.tlt_space,
            _status: 'original' as DataStatus
          }));
        }

        // 載入 Step 2 代扣款資料
        await this.loadFareData(applyNo);

        // 載入 Step 3 抽成資料
        await this.loadCommissionData(applyNo);

        // 載入 Step 4 條件資料
        await this.loadConditionData(applyNo, data.tlt_term_type);
      }
    } catch (error) {
      console.error('載入合約資料失敗:', error);
      this.messageService.errorBubble('載入合約資料失敗');
    }
  }

  private async loadFareData(applyNo: string): Promise<void> {
    try {
      const request = { apply_no: applyNo, showAll: false };
      const response = await this.apiService.queryTLS12040Fare(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const faresByType = response.Data.FaresByType || {};
        const allItems: FareItem[] = [];

        ['A', 'B', 'C', 'D', 'E'].forEach(type => {
          const items = faresByType[type] || [];
          items.forEach((item: any) => {
            allItems.push({
              ...item,
              cap_type: type as any,
              _status: 'original' as DataStatus
            });
          });
        });

        this.wizardState.fareItems = allItems;
      }
    } catch (error) {
      console.error('載入代扣款資料失敗:', error);
    }
  }

  private async loadCommissionData(applyNo: string): Promise<void> {
    try {
      const response = await this.apiService.queryTLS12040Charge(applyNo).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const chargeSettings = response.Data.ChargeSettings || [];

        this.wizardState.commissionItems = chargeSettings.map((item: any) => ({
          ...item,
          _status: 'original' as DataStatus
        }));
      }
    } catch (error) {
      console.error('載入抽成資料失敗:', error);
    }
  }

  private async loadConditionData(applyNo: string, commissionType: string): Promise<void> {
    try {
      // 一般抽成不需要條件資料
      if (commissionType === '3') {
        this.wizardState.conditionItems = [];
        return;
      }

      const request = { apply_no: applyNo, CurrentTltTermType: commissionType };
      const response = await this.apiService.queryTLS12040Commission(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const existingData = response.Data.ExistingData || [];

        this.wizardState.conditionItems = existingData.map((item: any) => ({
          ...item,
          _status: 'original' as DataStatus
        }));
      }
    } catch (error) {
      console.error('載入條件資料失敗:', error);
    }
  }

  private async loadRenewalData(venNo: string): Promise<void> {
    try {
      const response = await this.apiService.queryContractForRenewal(venNo).toPromise();

      if (response) {
        // 保存續約資訊
        this.wizardState.renewalData = {
          sourceContractId: response.source_talent_id,
          sourceApplyNo: response.source_apply_no,
          sourceContractSubno: response.source_contract_subno,
          nextContractSubno: response.next_contract_subno
        };

        // 填充基本資料
        if (response.BasicInfo) {
          // 清除 ID 相關欄位
          const basicInfo = { ...response.BasicInfo };
          this.dataForm.patchValue({
            ...basicInfo,
            apply_no: '',  // 清除，由後端產生
            talent_id: '',  // 清除
            contract_subno: response.next_contract_subno,
            apply_type: '2'  // 續約
          });
        }

        // 載入位置資料
        if (response.Locations && Array.isArray(response.Locations)) {
          this.wizardState.locationData = response.Locations.map((loc: any) => ({
            ...loc,
            id: undefined,  // 清除 ID
            _status: 'new' as DataStatus
          }));
        }

        // 載入代扣款資料
        if (response.FareData) {
          const faresByType = response.FareData.FaresByType || {};
          const allItems: FareItem[] = [];

          ['A', 'B', 'C', 'D', 'E'].forEach(type => {
            const items = faresByType[type] || [];
            items.forEach((item: any) => {
              allItems.push({
                ...item,
                id: undefined,
                apply_no: undefined,
                talent_id: undefined,
                cap_type: type as any,
                _status: 'new' as DataStatus
              });
            });
          });

          this.wizardState.fareItems = allItems;
        }

        // 載入抽成資料
        if (response.ChargeData) {
          const chargeSettings = response.ChargeData.ChargeSettings || [];

          this.wizardState.commissionItems = chargeSettings.map((item: any) => ({
            ...item,
            id: undefined,
            apply_no: undefined,
            talent_id: undefined,
            _status: 'new' as DataStatus
          }));
        }

        // 載入條件資料
        if (response.CommissionData) {
          const existingData = response.CommissionData.ExistingData || [];

          this.wizardState.conditionItems = existingData.map((item: any) => ({
            ...item,
            id: undefined,
            apply_no: undefined,
            talent_id: undefined,
            _status: 'new' as DataStatus
          }));
        }

        // 更新驗證器
        this.updateDynamicValidators();
        this.updatePaymentValidators();

        // 同步 contractInfo
        this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

        this.messageService.successBubble('續約資料載入成功');
      }
    } catch (error) {
      console.error('載入續約資料失敗:', error);
      this.messageService.errorBubble('載入續約資料失敗');
    }
  }

  // ========== 步驟導航 ==========
  goToStep(visualIndex: number): void {
    const actualStep = this.stepIndexMap[visualIndex];
    if (actualStep === undefined) return;

    if (actualStep > this.currentStep && !this.validateCurrentStep()) {
      return;
    }

    this.currentStep = actualStep;
  }

  goToNextStep(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    const currentVisualIndex = this.visualStepIndex;
    const nextVisualIndex = currentVisualIndex + 1;

    if (nextVisualIndex < this.stepIndexMap.length) {
      this.currentStep = this.stepIndexMap[nextVisualIndex];
    }
  }

  goToPreviousStep(): void {
    const currentVisualIndex = this.visualStepIndex;
    const prevVisualIndex = currentVisualIndex - 1;

    if (prevVisualIndex >= 0) {
      this.currentStep = this.stepIndexMap[prevVisualIndex];
    }
  }

  // ========== 驗證 ==========
  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.validateStep1();
      case 1:
        return this.validateStep2();
      case 2:
        return this.validateStep3();
      case 3:
        return this.validateStep4();
      default:
        return true;
    }
  }

  private validateStep1(): boolean {
    this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

    const requiredFields = [
      { field: 'tlt_name', label: '專櫃名稱' },
      { field: 'bus_type', label: '大分類' },
      { field: 'bus_class', label: '中分類' },
      { field: 'tlt_bdate', label: '契約起始日' },
      { field: 'tlt_edate', label: '契約截止日' },
      { field: 'org_id', label: '營運單位' },
      { field: 'tlt_contract_bdate', label: '營運起始日' },
      { field: 'tlt_contract_edate', label: '營運截止日' },
      { field: 'tlt_term_type', label: '抽成別' }
    ];

    const missingFields: string[] = [];
    for (const { field, label } of requiredFields) {
      const control = this.dataForm.get(field);
      if (!control?.value || (typeof control.value === 'string' && !control.value.trim())) {
        missingFields.push(label);
        control?.markAsTouched();
      }
    }

    if (missingFields.length > 0) {
      if (this.step1Component) {
        this.step1Component.submitted = true;
      }
      this.messageService.warnBubble(`請填寫必填欄位：${missingFields.slice(0, 3).join('、')}${missingFields.length > 3 ? ' 等' : ''}`);
      return false;
    }

    return true;
  }

  private validateStep2(): boolean {
    // 代扣款驗證邏輯
    return true;
  }

  private validateStep3(): boolean {
    // 抽成設定驗證邏輯
    return true;
  }

  private validateStep4(): boolean {
    // 條件設定驗證邏輯
    return true;
  }

  // ========== 儲存 ==========
  async onSave(): Promise<void> {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isSaving = true;
    this.messageService.blockUi();

    try {
      // 組裝提交資料
      const submitData = this.assembleSubmitData();

      // 呼叫 API
      const response = await this.apiService.submitFinalTLS12040(submitData).toPromise();

      if (response?.success) {
        this.messageService.successBubble('儲存成功');
        this.router.navigate(['/tls/tls12040v2']);
      } else {
        this.messageService.errorBubble(response?.message || '儲存失敗');
      }
    } catch (error: any) {
      console.error('儲存失敗:', error);
      this.messageService.errorBubble(error.message || '儲存失敗');
    } finally {
      this.isSaving = false;
      this.messageService.unblockUi();
    }
  }

  private assembleSubmitData(): any {
    const formValue = this.dataForm.getRawValue();
    const isNewContract = this.isFormCreateable || this.isRenewalMode;

    return {
      contractInfo: {
        operation: isNewContract ? 'INSERT' : 'UPDATE',
        data: {
          ...formValue,
          locationInfo: this.wizardState.locationData
        }
      },
      deductions: this.categorizeItems(this.wizardState.fareItems),
      commissions: {
        masters: this.categorizeItems(this.wizardState.commissionItems),
        discountSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        annualSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        levelSettings: { toInsert: [], toUpdate: [], toDelete: [] }
      },
      conditions: {
        fixedRents: { toInsert: [], toUpdate: [], toDelete: [] },
        baseRentHigher: { toInsert: [], toUpdate: [], toDelete: [] },
        baseCommissions: { toInsert: [], toUpdate: [], toDelete: [] },
        graduated: { toInsert: [], toUpdate: [], toDelete: [] },
        baseTier: { toInsert: [], toUpdate: [], toDelete: [] }
      },
      metadata: {
        apply_no: formValue.apply_no || '',
        contractId: formValue.talent_id || '',
        commissionType: formValue.tlt_term_type,
        isNewContract,
        submittedAt: new Date().toISOString(),
        totalOperations: 0
      }
    };
  }

  private categorizeItems(items: any[]): { toInsert: any[]; toUpdate: any[]; toDelete: any[] } {
    return {
      toInsert: items.filter(i => i._status === 'new'),
      toUpdate: items.filter(i => i._status === 'modified'),
      toDelete: items.filter(i => i._status === 'deleted')
    };
  }

  // ========== 事件處理 ==========
  onStep1DataChange(data: { formValue: any; locationData: LocationItem[] }): void {
    this.wizardState.locationData = data.locationData;
    this.wizardState.contractInfo = data.formValue as ContractInfo;
  }

  onStep2DataChange(fareItems: FareItem[]): void {
    this.wizardState.fareItems = fareItems;
  }

  onStep3DataChange(commissionItems: CommissionItem[]): void {
    this.wizardState.commissionItems = commissionItems;
  }

  onStep4DataChange(conditionItems: ConditionItem[]): void {
    this.wizardState.conditionItems = conditionItems;
  }

  // ========== 輔助方法 ==========
  get isViewMode(): boolean {
    return this.isFormReadable;
  }

  get isLastStep(): boolean {
    return this.visualStepIndex === this.steps.length - 1;
  }

  get isFirstStep(): boolean {
    return this.visualStepIndex === 0;
  }

  hasCommissionTypeChanged(): boolean {
    if (!this.originalCommissionType) return false;
    return this.originalCommissionType !== this.currentCommissionType;
  }

  override onCancel(): void {
    this.router.navigate(['/tls/tls12040v2']);
  }
}
