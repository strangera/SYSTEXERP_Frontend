/**
 * TLS13010-V2 合約精靈主組件
 *
 * 單頁面架構，包含所有步驟：
 * - Step 1: 合約基本資料
 * - Step 2: 代扣款設定
 * - Step 3: 抽成設定
 * - Step 4: 租金設定
 *
 * 資料統一在此組件管理，不需要 Session Storage
 */
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';

// 基礎組件
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 共用組件
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';

// V2 服務
import { TLS13010DropdownService } from '@pages/tls/shared/constants/tls13010.dropdown';
import { FareValidationService } from '@pages/tls/shared/services/fare-validation.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { TlsContractBaseService } from '@others/services/tls/tls-contract-base.service';
import { CommissionCrudService } from '../../services/commission/commission-crud.service';
import { CommissionDataService } from '../../services/commission/commission-data.service';
import { SubmitDataService } from '../../services/submit/submit-data.service';

// V2 類型
import { CommissionType } from '../../core/constants';
import { CommissionItem, DiscountSettingItem } from '../../core/models/commission';
import { DropdownOption } from '../../core/models/common.interface';
import { ConditionItem } from '../../core/models/condition';
import { ContractInfo, LocationItem } from '../../core/models/contract';
import { FareItem } from '../../core/models/deduction';
// 子組件
import { Step1ContractInfoComponent } from './steps/step1-contract-info/step1-contract-info.component';
import { Step2DeductionComponent } from './steps/step2-deduction/step2-deduction.component';
import { Step3CommissionComponent } from './steps/step3-commission/step3-commission.component';
import { Step4ConditionComponent } from './steps/step4-condition/step4-condition.component';

interface CategoryItem {
  id: number;
}

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

  // 編輯模式時的原始資料
  queryRowData: any;
}

/**
 * Step 1 表單中的日期欄位
 */
const DATE_FIELDS = [
  'tlt_bdate',          // 契約起始日
  'tlt_edate',          // 契約截止日
  'tlt_contract_bdate', // 營運起始日
  'tlt_contract_edate', // 營運截止日
  'feedback_date',      // 回函日期
  'due_date',           // 回函截止日
  'contact_Date'        // 洽談日期
];

@Component({
  selector: 'app-tls13010-contract-wizard',
  templateUrl: './contract-wizard.component.html',
  styleUrls: ['./contract-wizard.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    ReactiveFormsModule,
    StepsModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    DialogComponent,
    Step1ContractInfoComponent,
    Step2DeductionComponent,
    Step3CommissionComponent,
    Step4ConditionComponent
  ]
})
export class ContractWizardComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;

  // ========== 步驟控制 ==========
  currentStep = 0;  // 這是實際的步驟索引 (0-3)

  // 所有步驟的完整定義
  private readonly allSteps: MenuItem[] = [
    { label: '合約基本資料' },  // Step 0
    { label: '代扣款設定' },    // Step 1
    { label: '抽成設定' },      // Step 2
    { label: '租金設定' }       // Step 3
  ];

  /**
   * 根據抽成別動態計算應顯示的步驟
   * - 固定租金 (1): Step 0, 1, 3 (跳過 Step 2 抽成設定)
   * - 一般抽成 (3): Step 0, 1, 2 (跳過 Step 3 租金設定)
   * - 其他 (2, 4, 5, 6): 全部 4 個步驟
   */
  get steps(): MenuItem[] {
    const commissionType = this.currentCommissionType;

    switch (commissionType) {
      case CommissionType.FIXED_RENT: // '1' 固定租金 - 不需要抽成設定
        return [
          this.allSteps[0],  // 合約基本資料
          this.allSteps[1],  // 代扣款設定
          this.allSteps[3]   // 租金設定 (跳過抽成設定)
        ];

      case CommissionType.GENERAL_COMMISSION: // '3' 一般抽成 - 不需要租金設定
        return [
          this.allSteps[0],  // 合約基本資料
          this.allSteps[1],  // 代扣款設定
          this.allSteps[2]   // 抽成設定 (跳過租金設定)
        ];

      default:
        // 其他類型 (2, 4, 5, 6) 顯示全部步驟
        return this.allSteps;
    }
  }

  /**
   * 取得實際步驟索引對應表
   * 將視覺步驟索引轉換為實際組件索引
   */
  get stepIndexMap(): number[] {
    const commissionType = this.currentCommissionType;

    switch (commissionType) {
      case CommissionType.FIXED_RENT: // '1' 固定租金
        return [0, 1, 3];  // 視覺 0->實際 0, 視覺 1->實際 1, 視覺 2->實際 3

      case CommissionType.GENERAL_COMMISSION: // '3' 一般抽成
        return [0, 1, 2];  // 視覺 0->實際 0, 視覺 1->實際 1, 視覺 2->實際 2

      default:
        return [0, 1, 2, 3];  // 全部對應
    }
  }

  /**
   * 取得當前視覺步驟索引
   */
  get visualStepIndex(): number {
    return this.stepIndexMap.indexOf(this.currentStep);
  }

  // ========== 資料狀態 (所有資料統一在這裡管理) ==========
  wizardState: WizardState = {
    contractInfo: null,
    locationData: [],
    fareItems: [],
    commissionItems: [],
    conditionItems: [],
    queryRowData: null
  };

  // Step 1 表單 (由父組件管理)
  step1Form!: FormGroup;

  // 儲存狀態
  isSaving = false;

  // 成功確認對話框
  showSuccessDialog = false;
  successDialogItems: { label: string; value: string }[] = [];

  // Step 3 專用：折扣選項
  discountOptions: DropdownOption[] = [];

  // 用於追蹤契約日期變更
  private lastContractStartDate: Date | null = null;
  private lastContractEndDate: Date | null = null;

  // 子組件參考
  @ViewChild(Step1ContractInfoComponent) step1Component?: Step1ContractInfoComponent;
  @ViewChild(Step3CommissionComponent) step3Component?: Step3CommissionComponent;
  @ViewChild(Step4ConditionComponent) step4Component?: Step4ConditionComponent;

  // 用於追蹤原始抽成別（編輯模式用，需要在模板中使用所以不能是 private）
  originalCommissionType?: string;

  constructor(
    public override router: Router,
    private route: ActivatedRoute,
    // private formBuilder: FormBuilder,
    private apiService: TLS13010Service,
    private tlsBaseService: TlsContractBaseService,
    public dropdownService: TLS13010DropdownService,
    private commissionDataService: CommissionDataService,
    private commissionCrudService: CommissionCrudService,
    private submitDataService: SubmitDataService,
    private fareValidationService: FareValidationService
  ) {
    super();
    this.initializeForm();
  }

  // ========== 生命週期 ==========
  async ngOnInit(): Promise<void> {
    this.ProgNo = 'TLS13010';
    this.loading = true;

    // 初始化下拉選單
    await this.dropdownService.initialize().toPromise();

    // 載入 Step 3 所需的折扣選項 - 必須在 initializeMode 之前載入
    // 因為 loadCommissionData 需要使用 discountOptions 來建立完整的折扣列表
    await this.loadDiscountOptions();

    // 設定動態驗證監聯器
    this.setupDynamicValidators();

    // 從路由參數判斷模式 (載入合約資料時需要 discountOptions)
    await this.initializeMode();

    // 所有初始化完成，渲染子組件
    this.loading = false;
  }

  /**
   * 設定動態驗證監聽器
   */
  private setupDynamicValidators(): void {
    // 監聽抽成別變更
    this.step1Form.get('tlt_term_type')?.valueChanges.subscribe((value) => {
      this.updateDynamicValidators();

      // 自動設定預收租金 (抽成別 1, 2 自動設為 Y，其他抽成別重設為 N)
      if (['1', '2'].includes(value)) {
        this.step1Form.patchValue({ rent_ahead: 'Y' }, { emitEvent: false });
      } else {
        this.step1Form.patchValue({ rent_ahead: 'N' }, { emitEvent: false });
      }
    });

    // 監聽付款方式變更
    this.step1Form.get('paytype')?.valueChanges.subscribe(() => {
      this.updatePaymentValidators();
    });

    // 監聯預收租金變更
    this.step1Form.get('rent_ahead')?.valueChanges.subscribe(() => {
      this.updateBaseRentValidators();
    });

    // 初始化驗證器
    this.updateDynamicValidators();
  }

  /**
   * 更新動態驗證器 (根據抽成別)
   * 注意：不使用 { emitEvent: false }，這樣 statusChanges 才會被觸發，
   * UI 組件才能偵測到驗證器變化並更新必填星號
   */
  private updateDynamicValidators(): void {
    const tltTermType = this.step1Form.get('tlt_term_type')?.value || '';

    // 包底類別驗證 (抽成別 4, 6 需要)
    const baodiControl = this.step1Form.get('tlt_ctype_mtotal');
    if (baodiControl) {
      baodiControl.clearValidators();
      if (['4', '6'].includes(tltTermType)) {
        baodiControl.setValidators([Validators.required]);
      }
      baodiControl.updateValueAndValidity();
    }

    // 超出部份處理方式驗證 (抽成別 4, 5, 6 需要)
    const overallStatusControl = this.step1Form.get('overall_status');
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

  /**
   * 更新付款方式相關驗證器
   * 注意：不使用 { emitEvent: false }，這樣 statusChanges 才會被觸發，
   * UI 組件才能偵測到驗證器變化並更新必填星號
   */
  private updatePaymentValidators(): void {
    const paytype = this.step1Form.get('paytype')?.value;
    const bankIdControl = this.step1Form.get('bank_id');
    const vendorAcctNameControl = this.step1Form.get('vendor_acct_name');
    const vendorAcctNoControl = this.step1Form.get('vendor_acct_no');
    const checkTitleControl = this.step1Form.get('CHECK_TITLE');

    // 清除現有驗證器
    [bankIdControl, vendorAcctNameControl, vendorAcctNoControl, checkTitleControl]
      .forEach(control => control?.clearValidators());

    if (paytype === '1') { // 匯款
      bankIdControl?.setValidators([Validators.required]);
      vendorAcctNameControl?.setValidators([Validators.required, Validators.maxLength(60)]);
      vendorAcctNoControl?.setValidators([Validators.required, Validators.maxLength(16)]);
    } else if (paytype === '2') { // 支票
      checkTitleControl?.setValidators([Validators.required, Validators.maxLength(100)]);
    }

    // 更新驗證狀態 (會觸發 statusChanges，讓 UI 更新必填星號)
    [bankIdControl, vendorAcctNameControl, vendorAcctNoControl, checkTitleControl]
      .forEach(control => control?.updateValueAndValidity());
  }

  /**
   * 更新固定租金驗證器
   * 注意：不使用 { emitEvent: false }，這樣 statusChanges 才會被觸發，
   * UI 組件才能偵測到驗證器變化並更新必填星號
   */
  private updateBaseRentValidators(): void {
    const baseRentControl = this.step1Form.get('base_rent');
    const rentAhead = this.step1Form.get('rent_ahead')?.value;
    const tltTermType = this.step1Form.get('tlt_term_type')?.value || '';

    if (!baseRentControl) return;

    baseRentControl.clearValidators();

    // 抽成別為固定租金 (1) 或 底租抽成取高者 (2) 時，固定租金必填
    // 或者預收租金為 Y 時，固定租金也必填
    if (['1', '2'].includes(tltTermType) || rentAhead === 'Y') {
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      baseRentControl.setValidators([Validators.min(0)]);
    }

    baseRentControl.updateValueAndValidity();
  }

  /**
   * 檢查抽成別是否已變更 (用於 UI 顯示警告)
   */
  hasCommissionTypeChanged(): boolean {
    if (!this.originalCommissionType) return false;
    const currentType = this.step1Form.get('tlt_term_type')?.value;
    return this.originalCommissionType !== currentType;
  }

  /**
   * 載入折扣選項 (Step 3 專用)
   */
  private async loadDiscountOptions(): Promise<void> {
    try {
      this.discountOptions = await this.commissionDataService.loadDiscountOptions();
      // 設定排序對照表，供 updateDetailItems 顯示 level 時排序
      this.commissionCrudService.setDiscountSortMap(this.discountOptions);
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      this.discountOptions = [];
    }
  }

  // ========== 初始化 ==========
  private initializeForm(): void {
    this.step1Form = this.formBuilder.group({
      // 基本資訊
      talent_id: [''],
      apply_no: [''],
      approve_status: ['1', [Validators.required]],
      tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
      tlt_no: [''],
      ven_no: ['', [Validators.required, Validators.maxLength(16)]],
      ven_uniform: ['', [Validators.maxLength(10)]],
      VEN_Name: ['', [Validators.maxLength(100)]],
      VEN_Address: [''],
      vendor_ven_no: [''],
      vendor_no: [''],
      paper_type: ['', [Validators.maxLength(2)]],
      bus_type: ['', [Validators.required, Validators.maxLength(2)]],
      bus_class: ['', [Validators.required, Validators.maxLength(2)]],
      bus_sclass: ['', [Validators.required, Validators.maxLength(2)]],
      contract_no: ['', [Validators.maxLength(12)]],
      contract_subno: ['', [Validators.required]],

      // 日期資訊
      tlt_bdate: ['', [Validators.required]],
      tlt_edate: ['', [Validators.required]],
      tlt_contract_bdate: ['', [Validators.required]],
      tlt_contract_edate: ['', [Validators.required]],
      contact_Date: [''],
      contact_USR_No: ['', [Validators.maxLength(16)]],
      contact_USR_Name: ['', [Validators.maxLength(20)]],
      crt_usr_name: [''],
      crt_date: [''],
      upd_usr_name: [''],
      upd_date: [''],
      app_usr_name: [''],
      app_date: [''],
      feedback_date: [''],
      due_date: [''],

      // 組織與營運資訊
      org_id: ['', [Validators.required, Validators.maxLength(20)]],
      tlt_openflag: [''],

      // 商務條件
      tlt_kind: [''],
      deco_type: [''],
      tlt_term_type: ['', [Validators.required, Validators.maxLength(2)]],
      comm_comp_type: ['2', [Validators.required]],
      overall_status: [''],
      rent_ahead: ['N'],
      rent_period: [0],
      base_rent: [0],
      deposit: [0],
      total_amt: [''],
      total_amt_vendor: [''],
      check_day: [0, [Validators.required]],

      // 業務設定
      comm_yn: ['N'],
      rece_yn: ['N'],
      pos_yn: ['N'],
      cash_yn: ['N'],
      money_type: ['', [Validators.maxLength(2)]],
      store_way: [''],
      check_type: [''],
      check_typeList: [[] as string[]],
      paytype: [''],
      vip_yn: ['Y'],
      credit_card: [null],
      invoice_type: ['', [Validators.required]],

      // 抄表設定
      water_flag: [''],
      electric_flag: [''],
      gas_flag: [''],

      // 保證金設定
      paymentMethods: [[]],
      open_deposit: [''],
      open_fees: [0],
      construct_deposit: [''],
      construct_fees: [0],
      expiration_deposit: [''],
      expiration_fees: [0],

      // 聯絡資訊
      email: ['', [Validators.maxLength(200)]],
      invoice_email: ['', [Validators.maxLength(200)]],
      CHECK_TITLE: ['', [Validators.maxLength(100)]],
      store_tel: ['', [Validators.maxLength(50)]],
      bank_id: ['', [Validators.maxLength(10)]],
      vendor_acct_name: ['', [Validators.maxLength(60)]],
      vendor_acct_no: ['', [Validators.maxLength(16)]],
      contact_tel: ['', [Validators.maxLength(20)]],
      contact_fax: ['', [Validators.maxLength(15)]],
      contact_addr: ['', [Validators.maxLength(100)]],
      tlt_remark: ['', [Validators.maxLength(2000)]],
      ticket_remarks: ['', [Validators.maxLength(1000)]],

      // 銷售類型
      cap_saletype1: ['N'],
      cap_saletype2: ['N'],
      cap_saletype3: ['N'],
      cap_saletype4: ['N'],
      cap_saletype5: ['N'],

      // 目標營業額單位
      total_amt_unit: [''],
      total_amt_vendor_unit: [''],

      // EDC
      edc_yn: [''],
      tlt_ctype_mtotal: [''],
      selectedBankInfo: [null]
    });
  }

  private async initializeMode(): Promise<void> {
    // 從 query params 或 state 取得模式與資料
    const state = history.state;
    const now = new Date();
    // 建立/修改時間統一呈現為 yyyymmddhhmm (24 時制)
    const nowStamp = this.formatDateTimeToMinute(now);
    const userName = this.user?.user_Name ?? '';

    if (state?.mode === 'view') {
      this.crudstatus = CRUDStatus.Read;
      this.wizardState.queryRowData = state.data;
      await this.loadContractData(state.data.talent_id);
    } else if (state?.mode === 'edit') {
      this.crudstatus = CRUDStatus.Edit;
      this.wizardState.queryRowData = state.data;
      await this.loadContractData(state.data.talent_id);
      // 編輯模式：覆蓋修改者與修改時間為當前登入者與現在時間
      this.step1Form.patchValue({ upd_usr_name: userName, upd_date: nowStamp }, { emitEvent: false });
    } else {
      // 新增模式
      this.crudstatus = CRUDStatus.Create;
      this.tlsBaseService.initializeEmptyForm(this.step1Form, 'TLS13010');
      this.tlsBaseService.setCurrentUserAsNegotiator(this.step1Form);
      // 新增模式：建立者與建立時間帶入當前登入者與現在時間
      this.step1Form.patchValue({ crt_usr_name: userName, crt_date: nowStamp }, { emitEvent: false });
    }
  }

  private async loadContractData(talentId: string): Promise<void> {
    try {
      const response = await this.apiService.queryTLS13010Detail(talentId).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const rawData = response.Data as unknown as Record<string, unknown>;

        // 處理日期欄位 (轉換為 Date 物件，移除時間部分)
        const data = this.processDateFields(rawData);

        // 處理抽成別 trim（後端可能有空白）
        if (data['tlt_term_type']) {
          data['tlt_term_type'] = String(data['tlt_term_type']).trim();
          // 保存原始抽成別（用於偵測變更）
          this.originalCommissionType = data['tlt_term_type'] as string;
        }

        // 處理對帳方式：check_type (字串) 轉換為 check_typeList (陣列)
        // 後端傳回 "1,2,3" 格式，前端 multi-select 需要 ['1', '2', '3'] 格式
        let checkTypeList = (data['check_typeList'] as string[]) || [];
        if ((!checkTypeList || checkTypeList.length === 0) && data['check_type']) {
          const checkTypeStr = String(data['check_type']);
          if (checkTypeStr && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
            checkTypeList = checkTypeStr.split(',').map(x => x.trim()).filter(x => x);
          }
        }
        data['check_typeList'] = checkTypeList;

        // 建立/修改/審核時間統一呈現為 yyyymmddhhmm (24 時制)
        for (const field of ['crt_date', 'upd_date', 'app_date']) {
          if (data[field]) {
            data[field] = this.formatDateTimeToMinute(data[field]);
          }
        }

        // 填充 Step 1 表單
        this.step1Form.patchValue(data, { emitEvent: false });

        // 映射廠商下拉選單值 (API 回傳 ven_no，下拉選單綁定 vendor_ven_no，兩者值相同)
        if (data['ven_no']) {
          this.step1Form.patchValue({ vendor_ven_no: data['ven_no'] }, { emitEvent: false });
        }

        // 手動觸發動態驗證器更新 (因為 patchValue 用了 emitEvent: false)
        // 這樣才能正確顯示必填星號
        this.updateDynamicValidators();
        this.updatePaymentValidators();

        // 載入中小分類下拉選項（必須在 patchValue 之後）
        await this.loadClassificationOptions(data);

        // 同步設定 contractInfo (供 Step 3 使用，放在所有 patchValue 之後確保完整)
        this.wizardState.contractInfo = this.step1Form.getRawValue() as ContractInfo;

        // 填充位置資料 (API 回傳欄位名稱為 Locations)
        if (data['Locations'] && Array.isArray(data['Locations'])) {
          const contractBdate = this.step1Form.get('tlt_bdate')?.value;
          const contractEdate = this.step1Form.get('tlt_edate')?.value;
          this.wizardState.locationData = (data['Locations'] as LocationItem[]).map(loc => ({
            ...loc,
            // 轉換 tlt_space 為數值
            tlt_space: typeof loc.tlt_space === 'string' ? parseFloat(loc.tlt_space) : loc.tlt_space,
            // 轉換 sale_rate 業績分攤(%) 為數值
            sale_rate: loc.sale_rate == null ? undefined
                     : (typeof loc.sale_rate === 'string' ? parseFloat(loc.sale_rate) : loc.sale_rate),
            // 轉換日期字串為 Date 物件；若地點本身無日期，fallback 到契約起訖日
            tlt_bdate: loc.tlt_bdate ? new Date(loc.tlt_bdate as string)
                     : (contractBdate ? new Date(contractBdate) : undefined),
            tlt_edate: loc.tlt_edate ? new Date(loc.tlt_edate as string)
                     : (contractEdate ? new Date(contractEdate) : undefined),
            // 標記為既有資料
            _status: 'original' as const
          }));
        }

        // 載入 Step 3 抽成資料 (使用 queryTLS13010Charge API)
        await this.loadCommissionData(talentId);

        // 載入 Step 4 條件資料 (使用 queryTLS13010Commission API)
        const commissionType = String(data['tlt_term_type'] || '').trim();
        await this.loadConditionData(talentId, commissionType);
      }
    } catch (error) {
      console.error('載入合約資料失敗:', error);
      this.messageService.errorBubble('載入合約資料失敗');
    }
  }

  /**
   * 載入 Step 3 抽成資料
   * API 回傳結構: { Data: { ChargeSettings: [...] } }
   * 每個 ChargeSetting 包含: ChargeDetails (折扣), YearChargeDetails (年度), LevelChargeDetails (層級)
   */
  private async loadCommissionData(talentId: string): Promise<void> {
    try {
      const response = await this.apiService.queryTLS13010Charge(talentId).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const data = response.Data;

        // API 回傳結構: ChargeSettings 陣列，每個項目包含其明細
        const chargeSettings = data.ChargeSettings || [];

        if (chargeSettings.length === 0) {
          this.wizardState.commissionItems = [];
          return;
        }

        // 輔助函數：安全取得字串值
        const getString = (obj: Record<string, unknown>, key1: string, key2: string, defaultVal = ''): string => {
          const val = obj[key1] ?? obj[key2];
          return val != null ? String(val) : defaultVal;
        };

        // 輔助函數：安全取得數值
        const getNumber = (obj: Record<string, unknown>, key1: string, key2: string, defaultVal = 0): number => {
          const val = obj[key1] ?? obj[key2];
          return val != null ? Number(val) : defaultVal;
        };

        // 轉換為前端 CommissionItem 格式
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.wizardState.commissionItems = chargeSettings.map((chargeSetting: any, index: number) => {
          // 明細資料已經在 chargeSetting 內
          const chargeDetails = chargeSetting.ChargeDetails || [];
          const yearChargeDetails = chargeSetting.YearChargeDetails || [];
          const levelChargeDetails = chargeSetting.LevelChargeDetails || [];

          const commissionItem: CommissionItem = {
            id: chargeSetting.id || (index + 1),
            tlt_id: getString(chargeSetting, 'tlt_id', 'TLT_ID', ''),
            tlt_id_desc: getString(chargeSetting, 'tlt_id_desc', 'TLT_ID_DESC', `抽成類別${index + 1}`),
            cag_taxtype: getString(chargeSetting, 'cag_taxtype', 'CAG_TAXTYPE', '1'),
            sst_amount: getNumber(chargeSetting, 'sst_amount', 'SST_AMOUNT', 0),
            sst_rate: getNumber(chargeSetting, 'sst_rate', 'SST_RATE', 0),
            cap_saletype1: getString(chargeSetting, 'cap_saletype1', 'CAP_SALETYPE1', 'N') === 'Y',
            cap_saletype2: getString(chargeSetting, 'cap_saletype2', 'CAP_SALETYPE2', 'N') === 'Y',
            cap_saletype3: getString(chargeSetting, 'cap_saletype3', 'CAP_SALETYPE3', 'N') === 'Y',
            cap_saletype5: getString(chargeSetting, 'cap_saletype5', 'CAP_SALETYPE5', 'N') === 'Y',
            mainStartDate: this.step1Form.get('tlt_bdate')?.value,
            mainEndDate: this.step1Form.get('tlt_edate')?.value,
            discountSummary: '',
            selectedSettingOption: 'discount',
            currentTab: 'discount',
            // 折扣設定 - 合併所有折扣選項與 API 資料
            discountSettingItems: this.buildCompleteDiscountItems(chargeDetails, getString),
            // 年度業績設定
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            annualPerformanceItems: yearChargeDetails.map((d: any) => ({
              id: d.id,
              selected: true,
              tlt_bdate: d.tlt_bdate || d.TLT_BDATE,
              tlt_edate: d.tlt_edate || d.TLT_EDATE,
              year_amount: getNumber(d, 'year_amount', 'YEAR_AMOUNT', 0),
              extra_rate: this.convertRateToPercentage(getNumber(d, 'extra_rate', 'EXTRA_RATE', 0)),
              _status: 'original' as const
            })),
            // 層級抽成設定 - 按照折扣選項的 Sort 順序排序
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            discountLevelItems: levelChargeDetails.map((d: any) => ({
              id: d.id,
              charged_id: d.charged_id || d.CHARGED_ID,
              selected: true,
              cag_barcode: getString(d, 'cag_barcode', 'CAG_BARCODE', ''),
              level_bmount: getNumber(d, 'level_bmount', 'LEVEL_BMOUNT', 0),
              level_eamount: getNumber(d, 'level_eamount', 'LEVEL_EAMOUNT', 0),
              level_charge_rate: this.convertRateToPercentage(getNumber(d, 'level_charge_rate', 'LEVEL_CHARGE_RATE', 0)),
              _status: 'original' as const,
              is_configured: true,
              is_enabled: true
            })),
            detailItems: [],
            _status: 'original' as const
          };

          return commissionItem;
        });

      }
    } catch (error) {
      console.error('載入抽成資料失敗:', error);
    }
  }

  /**
   * 將後端的小數抽成率轉換為前端的百分比顯示值
   * 例如: 0.05 → 5, 0.1 → 10
   */
  private convertRateToPercentage(rate: number): number {
    if (rate === null || rate === undefined) return 0;
    // 如果已經是百分比格式 (>1)，直接返回
    if (rate > 1) return rate;
    return rate * 100;
  }

  /**
   * 建立完整的折扣設定列表（包含所有折扣選項）
   * API 資料中存在的會被標記為 selected，不存在的則為未選取狀態
   */
  private buildCompleteDiscountItems(
    existingDetails: Record<string, unknown>[],
    getString: (obj: Record<string, unknown>, key1: string, key2: string, defaultVal?: string) => string
  ): CommissionItem['discountSettingItems'] {
    const contractStartDate = this.step1Form.get('tlt_bdate')?.value;
    const contractEndDate = this.step1Form.get('tlt_edate')?.value;
    const result: CommissionItem['discountSettingItems'] = [];

    // 為所有折扣選項建立項目
    this.discountOptions.forEach((option) => {
      // 找出此折扣別的既有資料
      const existingItems = existingDetails.filter(
        (detail) => getString(detail, 'cag_barcode', 'CAG_BARCODE', '') === option.value
      );

      if (existingItems.length > 0) {
        // 有既有資料：為每筆既有資料建立項目（已勾選）
        existingItems.forEach((existingItem) => {
          result.push({
            id: existingItem['id'] as number | string,
            selected: true,
            cag_barcode: getString(existingItem, 'cag_barcode', 'CAG_BARCODE', ''),
            tlt_bdate: (existingItem['tlt_bdate'] || existingItem['TLT_BDATE'] || contractStartDate) as Date | string,
            tlt_edate: (existingItem['tlt_edate'] || existingItem['TLT_EDATE'] || contractEndDate) as Date | string,
            cag_charge_rate: this.convertRateToPercentage(
              Number(existingItem['cag_charge_rate'] || existingItem['CAG_CHARGE_RATE'] || 0)
            ),
            _status: 'original' as const,
            is_configured: true,
            is_enabled: true
          });
        });
      } else {
        // 沒有既有資料：建立未勾選的項目（編輯模式不預設勾選）
        result.push({
          id: this.generateTempId(),
          selected: false,
          cag_barcode: option.value,
          tlt_bdate: contractStartDate,
          tlt_edate: contractEndDate,
          cag_charge_rate: 0,
          _status: 'new' as const,
          is_configured: false,
          is_enabled: false
        });
      }
    });

    // 排序：selected 為 true 的排在前面
    return result.sort((a, b) => {
      const aSelected = a.selected ? 1 : 0;
      const bSelected = b.selected ? 1 : 0;

      if (aSelected !== bSelected) {
        return bSelected - aSelected;
      }

      // 相同 selected 狀態，按照 discountOptions 順序
      const aIndex = this.discountOptions.findIndex(opt => opt.value === a.cag_barcode);
      const bIndex = this.discountOptions.findIndex(opt => opt.value === b.cag_barcode);
      return aIndex - bIndex;
    });
  }

  /**
   * 生成臨時 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 載入 Step 4 條件資料
   */
  private async loadConditionData(talentId: string, commissionType: string): Promise<void> {
    try {
      // 一般抽成 (type 3) 不需要載入條件資料
      if (commissionType === '3') {
        this.wizardState.conditionItems = [];
        return;
      }

      const request = {
        TalentId: talentId,
        CurrentTltTermType: commissionType
      };

      const response = await this.apiService.queryTLS13010Commission(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        // API 回傳結構: { Data: { ExistingData: { LimitDetails: [...], ... } } }
        // 資料可能在 ExistingData 內或直接在 Data 內
        const rawData = response.Data;
        const data = rawData.ExistingData || rawData;

        // 根據不同抽成別載入不同的條件資料
        let conditionItems: ConditionItem[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapConditionItem = (item: any, extraFields: Record<string, unknown> = {}) => ({
          id: item.id || item.ID,
          tlt_id: String(item.tlt_id || item.TLT_ID || ''),
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          _status: 'original' as const,
          ...extraFields
        });

        switch (commissionType) {
          case '1': { // 固定租金 - 只有 base_rent，不能有 cag_charge_rate
            const rentDetails1 = data.RentDetails || data.rentDetails || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conditionItems = rentDetails1.map((item: any) => mapConditionItem(item, {
              base_rent: Number(item.base_rent || item.BASE_RENT || 0)
              // 不設置 cag_charge_rate 以便正確分類
            }));
            break;
          }

          case '2': { // 底租抽成取高者 - 有 base_rent 和 cag_charge_rate
            const rentDetails2 = data.RentDetails || data.rentDetails || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conditionItems = rentDetails2.map((item: any) => mapConditionItem(item, {
              base_rent: Number(item.base_rent || item.BASE_RENT || 0),
              cag_charge_rate: Number(item.cag_charge_rate || item.CAG_CHARGE_RATE || 0)
            }));
            break;
          }

          case '4': { // 包底抽成 - 有 limit_amt，不能有 seq_no
            const limitDetails = data.LimitDetails || data.limitDetails || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conditionItems = limitDetails.map((item: any) => mapConditionItem(item, {
              limit_amt: Number(item.limit_amt || item.LIMIT_AMT || 0),
              limit_charge_rate: Number(item.limit_charge_rate || item.LIMIT_CHARGE_RATE || 0)
              // 不設置 seq_no 以便正確分類
            }));
            break;
          }

          case '5': { // 層級抽成 - 有 seq_no，不能有 limit_amt
            const levelDetails5 = data.LevelDetails || data.levelDetails || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conditionItems = levelDetails5.map((item: any) => ({
              id: item.id || item.ID,
              seq_no: Number(item.seq_no || item.SEQ_NO || 0),
              cag_bdate: item.cag_bdate || item.CAG_BDATE,
              cag_edate: item.cag_edate || item.CAG_EDATE,
              start_number: Number(item.start_number || item.START_NUMBER || 0),
              end_number: Number(item.end_number || item.END_NUMBER || 0),
              charge_rate: Number(item.charge_rate || item.CHARGE_RATE || 0),
              _status: 'original' as const
              // 不設置 limit_amt 以便正確分類為 Graduated
            }));
            break;
          }

          case '6': { // 包底加層級 - 有 limit_amt 和 seq_no
            // 優先從 BottomTierDetails 讀取，若無則從 LevelDetails 讀取
            const levelDetails6 = data.BottomTierDetails || data.bottomTierDetails || data.LevelDetails || data.levelDetails || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conditionItems = levelDetails6.map((item: any) => ({
              id: item.id || item.ID,
              seq_no: Number(item.seq_no || item.SEQ_NO || 0),
              cag_bdate: item.cag_bdate || item.CAG_BDATE,
              cag_edate: item.cag_edate || item.CAG_EDATE,
              limit_amt: Number(item.limit_amt || item.LIMIT_AMT || 0),
              start_number: Number(item.start_number || item.START_NUMBER || 0),
              end_number: Number(item.end_number || item.END_NUMBER || 0),
              charge_rate: Number(item.charge_rate || item.CHARGE_RATE || 0),
              _status: 'original' as const
            }));
            break;
          }
        }

        this.wizardState.conditionItems = conditionItems;
      }
    } catch (error) {
      console.error('載入條件資料失敗:', error);
    }
  }

  // ========== 步驟導航 ==========
  /**
   * 跳至指定視覺步驟
   * @param visualIndex 視覺上的步驟索引 (0, 1, 2...)
   */
  goToStep(visualIndex: number): void {
    const actualStep = this.stepIndexMap[visualIndex];
    if (actualStep === undefined) return;

    // 驗證當前步驟 (只在往前跳時驗證)
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

    // 檢查是否還有下一步
    if (nextVisualIndex < this.stepIndexMap.length) {
      this.currentStep = this.stepIndexMap[nextVisualIndex];
    }
  }

  goToPreviousStep(): void {
    const currentVisualIndex = this.visualStepIndex;
    const prevVisualIndex = currentVisualIndex - 1;

    // 檢查是否還有上一步
    if (prevVisualIndex >= 0) {
      this.currentStep = this.stepIndexMap[prevVisualIndex];
    }
  }

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
    // 清除未填位置編號的空列
    this.step1Component?.removeEmptyNewRows();

    // 儲存 Step 1 資料 (無論驗證是否通過都先儲存)
    this.wizardState.contractInfo = this.step1Form.getRawValue() as ContractInfo;

    // 同步契約日期到所有子項目
    this.syncContractDatesToAllItems();

    // 驗證必填欄位 (與舊版 CRU 一致的檢查清單)
    // 注意：ven_no, bus_sclass, check_day 雖然有 Validators.required，
    // 但舊版 CRU 不在此檢查清單中，所以這裡也不檢查以保持一致性
    const requiredFields: { field: string; label: string }[] = [
      { field: 'tlt_name', label: '專櫃名稱' },
      { field: 'bus_type', label: '大分類' },
      { field: 'bus_class', label: '中分類' },
      { field: 'tlt_bdate', label: '契約起始日' },
      { field: 'tlt_edate', label: '契約截止日' },
      { field: 'org_id', label: '營運單位' },
      { field: 'tlt_contract_bdate', label: '營運起始日' },
      { field: 'tlt_contract_edate', label: '營運截止日' },
      { field: 'tlt_term_type', label: '抽成別' },
      { field: 'comm_comp_type', label: '抽成額計算方式' },
      { field: 'invoice_type', label: '發票類型' }
    ];

    const missingFields: string[] = [];
    for (const { field, label } of requiredFields) {
      const control = this.step1Form.get(field);
      if (!control?.value || (typeof control.value === 'string' && !control.value.trim())) {
        missingFields.push(label);
        control?.markAsTouched();
      }
    }

    if (missingFields.length > 0) {
      // 標記表單為已提交狀態，觸發驗證錯誤顯示
      if (this.step1Component) {
        this.step1Component.submitted = true;
      }
      this.messageService.warnBubble(`請填寫必填欄位：${missingFields.slice(0, 3).join('、')}${missingFields.length > 3 ? ' 等' : ''}`);
      return false;
    }

    // 驗證日期邏輯
    const startDate = this.step1Form.get('tlt_bdate')?.value;
    const endDate = this.step1Form.get('tlt_edate')?.value;
    if (startDate && endDate) {
      const start = this.parseDate(startDate);
      const end = this.parseDate(endDate);
      if (start && end && start > end) {
        this.messageService.warnBubble('契約起始日不可大於契約截止日');
        return false;
      }
    }

    // 動態驗證：根據抽成別驗證相關欄位
    const tltTermType = this.step1Form.get('tlt_term_type')?.value || '';

    // 包底類別 (抽成別 4, 6 需要)
    if (['4', '6'].includes(tltTermType)) {
      const baodiValue = this.step1Form.get('tlt_ctype_mtotal')?.value;
      if (!baodiValue) {
        this.messageService.warnBubble('當前抽成別需要選擇包底類別');
        return false;
      }
    }

    // 超出部份處理方式 (抽成別 4, 5, 6 需要)
    if (['4', '5', '6'].includes(tltTermType)) {
      const overallStatus = this.step1Form.get('overall_status')?.value;
      if (!overallStatus) {
        this.messageService.warnBubble('當前抽成別需要選擇超出部份處理方式');
        return false;
      }
    }

    // 固定租金 (抽成別 1, 2 或 預收租金為 Y 時需要)
    const rentAhead = this.step1Form.get('rent_ahead')?.value;
    if (['1', '2'].includes(tltTermType) || rentAhead === 'Y') {
      const baseRent = this.step1Form.get('base_rent')?.value;
      if (!baseRent || Number(baseRent) <= 0) {
        this.messageService.warnBubble('固定租金必須大於 0');
        return false;
      }
    }

    // 動態驗證：根據付款方式驗證相關欄位
    const paytype = this.step1Form.get('paytype')?.value;

    if (paytype === '1') { // 匯款
      const bankId = this.step1Form.get('bank_id')?.value;
      const vendorAcctName = this.step1Form.get('vendor_acct_name')?.value;
      const vendorAcctNo = this.step1Form.get('vendor_acct_no')?.value;

      const missingPaymentFields: string[] = [];
      if (!bankId) missingPaymentFields.push('廠商匯款銀行代號');
      if (!vendorAcctName) missingPaymentFields.push('帳戶名稱');
      if (!vendorAcctNo) missingPaymentFields.push('銀行帳號');

      if (missingPaymentFields.length > 0) {
        this.messageService.warnBubble(`匯款付款時請填寫：${missingPaymentFields.join('、')}`);
        return false;
      }
    } else if (paytype === '2') { // 支票
      const checkTitle = this.step1Form.get('CHECK_TITLE')?.value;
      if (!checkTitle) {
        this.messageService.warnBubble('支票付款時請填寫票據抬頭');
        return false;
      }
    }

    // 地點資訊至少需要一筆
    const validLocationCount = this.wizardState.locationData.filter(
      loc => loc._status !== 'deleted' && loc.location_no?.trim()
    ).length;
    if (validLocationCount === 0) {
      this.messageService.warnBubble('櫃位地點資訊至少需要填寫一筆');
      return false;
    }

    // 地點起訖日必填卡控
    const locationsWithMissingDates = this.wizardState.locationData.filter(
      loc => loc._status !== 'deleted' && loc.location_no?.trim() && (!loc.tlt_bdate || !loc.tlt_edate)
    );
    if (locationsWithMissingDates.length > 0) {
      this.messageService.warnBubble('櫃位地點起訖日為必填');
      return false;
    }

    // 業績分攤合計必須等於 100%
    const activeLocations = this.wizardState.locationData.filter(
      loc => loc._status !== 'deleted' && loc.location_no?.trim()
    );
    if (activeLocations.length > 0) {
      const saleRateTotal = Math.round(activeLocations.reduce((s, r) => s + (Number(r.sale_rate) || 0), 0) * 100) / 100;
      if (saleRateTotal !== 100) {
        this.messageService.warnBubble(`業績分攤(%) 合計須等於 100%（目前：${saleRateTotal}%）`);
        return false;
      }
    }

    return true;
  }

  private validateStep2(): boolean {
    // Step 2 代扣款設定驗證
    // 檢視模式不需要驗證
    if (this.crudstatus === CRUDStatus.Read) {
      return true;
    }

    const allErrors: string[] = [];
    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    // 取得合約日期範圍
    const contractRange = this.getContractDateRange();

    // 將 fareItems 按類型分組
    const fareDataByType: Record<string, FareItem[]> = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': []
    };

    // 先清除所有項目的錯誤標記
    this.wizardState.fareItems.forEach(item => {
      delete item['_hasValidationError'];
      delete item['_validationErrors'];
      delete item['_hasDuplicateDateError'];
      delete item['_duplicateDateMessage'];
    });

    this.wizardState.fareItems.forEach(item => {
      const capType = item.cap_type;
      if (fareDataByType[capType]) {
        fareDataByType[capType].push(item);
      }
    });

    // 驗證每個類型的已選項目
    capTypes.forEach(capType => {
      const typeData = fareDataByType[capType] || [];
      const selectedItems = typeData.filter(item => item.is_selected);

      if (selectedItems.length > 0) {
        const validationResult = this.fareValidationService.validateFareTypeData(
          typeData,
          capType,
          contractRange
        );

        if (!validationResult.isValid) {
          const typeName = this.getCapTypeName(capType);
          allErrors.push(`【${typeName}】`);
          allErrors.push(...validationResult.errors.map(error => `  • ${error}`));

          // 標記有錯誤的項目 (FareValidationService 已標記 _hasDuplicateDateError)
          // 這裡額外標記 _hasValidationError 以便表格顯示紅色背景
          selectedItems.forEach(item => {
            // 驗證單一項目的必填欄位
            const singleItemErrors = this.validateSingleFareItem(item, capType);
            if (singleItemErrors.length > 0) {
              item['_hasValidationError'] = true;
              item['_validationErrors'] = singleItemErrors;
            }
          });
        }
      }
    });

    if (allErrors.length > 0) {
      // 強制觸發 Angular 變更檢測，讓子組件更新錯誤狀態顯示
      this.wizardState.fareItems = [...this.wizardState.fareItems];

      this.messageService.warnBubble(
        `代扣款資料驗證失敗：\n${allErrors.slice(0, 5).join('\n')}${allErrors.length > 5 ? '\n...' : ''}`
      );
      return false;
    }

    return true;
  }

  /**
   * 驗證單一代扣款項目的必填欄位
   */
  private validateSingleFareItem(item: FareItem, capType: string): string[] {
    const errors: string[] = [];

    // 各類型必填欄位定義
    const requiredFieldsMap: Record<string, { field: string; label: string }[]> = {
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

    const requiredFields = requiredFieldsMap[capType] || [];

    requiredFields.forEach(({ field, label }) => {
      const value = item[field];
      if (value === null || value === undefined || value === '') {
        errors.push(`${label}未填寫`);
      }
    });

    return errors;
  }

  /**
   * 取得合約日期範圍 (用於代扣款驗證)
   */
  private getContractDateRange(): { tlt_bdate: Date | string | null; tlt_edate: Date | string | null } | undefined {
    const startDate = this.step1Form.get('tlt_bdate')?.value;
    const endDate = this.step1Form.get('tlt_edate')?.value;

    if (!startDate || !endDate) {
      return undefined;
    }

    return {
      tlt_bdate: startDate,
      tlt_edate: endDate
    };
  }

  /**
   * 取得代扣款類型名稱
   */
  private getCapTypeName(capType: string): string {
    const typeNames: Record<string, string> = {
      'A': '代扣款A類(管銷費用)',
      'B': '代扣款B類(水電費)',
      'C': '代扣款C類(分期付款)',
      'D': '代扣款D類(業績抽成)',
      'E': '代扣款E類(其他)'
    };
    return typeNames[capType] || `代扣款${capType}類`;
  }

  private validateStep3(): boolean {
    // Step 3 抽成設定驗證

    // 同步契約日期到 Step 4 條件項目（只同步新增項目）
    this.syncStep4Dates();

    const commissionType = this.currentCommissionType;
    const contractStartDate = this.step1Form.get('tlt_bdate')?.value;
    const contractEndDate = this.step1Form.get('tlt_edate')?.value;

    // 取得所有非刪除的抽成項目
    const activeCommissions = this.wizardState.commissionItems.filter(c => c._status !== 'deleted');

    // 先清除所有錯誤標記
    this.clearStep3ErrorFlags(activeCommissions);

    if (activeCommissions.length === 0) {
      this.messageService.warnBubble('請至少設定一個抽成項目');
      return false;
    }

    // 一般抽成 (3) 必須有至少一個已勾選的折扣項目
    if (commissionType === CommissionType.GENERAL_COMMISSION) {
      const hasSelectedDiscount = activeCommissions.some(item =>
        item.discountSettingItems?.some(d => d.selected && d._status !== 'deleted')
      );

      if (!hasSelectedDiscount) {
        this.messageService.warnBubble('請至少勾選一個折扣項目');
        return false;
      }
    }

    let errorCount = 0;
    const errorTypes = new Set<string>();

    // 驗證折扣設定項目
    for (const commission of activeCommissions) {
      const activeDiscounts = commission.discountSettingItems?.filter(d => d.selected && d._status !== 'deleted') || [];

      for (const discount of activeDiscounts) {
        const errorFields: string[] = [];

        // 驗證折扣別必填
        if (!discount.cag_barcode) {
          errorCount++;
          errorTypes.add('必填欄位未填');
          errorFields.push('cag_barcode');
        }

        // 驗證日期必填
        if (!discount.tlt_bdate) {
          errorCount++;
          errorTypes.add('必填欄位未填');
          errorFields.push('tlt_bdate');
        }
        if (!discount.tlt_edate) {
          errorCount++;
          errorTypes.add('必填欄位未填');
          errorFields.push('tlt_edate');
        }

        // 驗證日期順序
        const discStart = this.parseDate(discount.tlt_bdate);
        const discEnd = this.parseDate(discount.tlt_edate);
        if (discStart && discEnd && discStart > discEnd) {
          errorCount++;
          errorTypes.add('日期順序錯誤');
          errorFields.push('tlt_bdate', 'tlt_edate');
        }

        // 驗證日期在合約期間內
        if (contractStartDate && contractEndDate) {
          const contractStart = this.parseDate(contractStartDate);
          const contractEnd = this.parseDate(contractEndDate);

          if (discStart && contractStart && discStart < contractStart) {
            errorCount++;
            errorTypes.add('日期超出契約期間');
            if (!errorFields.includes('tlt_bdate')) errorFields.push('tlt_bdate');
          }
          if (discEnd && contractEnd && discEnd > contractEnd) {
            errorCount++;
            errorTypes.add('日期超出契約期間');
            if (!errorFields.includes('tlt_edate')) errorFields.push('tlt_edate');
          }
        }

        // 驗證抽成率範圍
        const rate = discount.cag_charge_rate;
        if (rate !== undefined && rate !== null && (rate < 0 || rate > 100)) {
          errorCount++;
          errorTypes.add('抽成率超出範圍');
          errorFields.push('cag_charge_rate');
        }

        // 標記有錯誤的欄位（只標記欄位，不標記整行）
        if (errorFields.length > 0) {
          discount._errorFields = [...new Set(errorFields)];
        }
      }

      // 日期區間重疊驗證（同折扣別之間日期不能重疊）
      const discountGroups = new Map<string, DiscountSettingItem[]>();
      activeDiscounts.forEach(d => {
        if (!d.cag_barcode) return;
        const group = discountGroups.get(d.cag_barcode) || [];
        group.push(d);
        discountGroups.set(d.cag_barcode, group);
      });
      discountGroups.forEach((groupItems) => {
        if (groupItems.length < 2) return;
        const overlapCount = this.checkDateOverlap(
          groupItems as unknown as Record<string, unknown>[],
          'tlt_bdate',
          'tlt_edate'
        );
        if (overlapCount > 0) {
          errorCount += overlapCount;
          errorTypes.add('同折扣別日期區間重疊');
        }
      });
    }

    if (errorCount > 0) {
      // 重建 detailItems 以反映 _errorFields 變更
      activeCommissions.forEach(c => this.commissionCrudService.updateDetailItems(c));
      // 觸發變更檢測
      this.wizardState.commissionItems = [...this.wizardState.commissionItems];

      const typeList = [...errorTypes].join('、');
      this.messageService.warnBubble(
        `抽成設定共 ${errorCount} 項錯誤：${typeList}，請修正紅框欄位`
      );
      return false;
    }

    return true;
  }

  /**
   * 清除 Step 3 所有錯誤標記
   */
  private clearStep3ErrorFlags(commissions: CommissionItem[]): void {
    commissions.forEach(commission => {
      delete commission._hasValidationError;
      delete commission._errorFields;
      commission.discountSettingItems?.forEach(d => {
        delete d._hasValidationError;
        delete d._hasDateOverlapError;
        delete d._errorFields;
      });
      commission.annualPerformanceItems?.forEach(a => {
        delete a._hasValidationError;
        delete a._hasDateOverlapError;
        delete a._errorFields;
      });
      commission.discountLevelItems?.forEach(l => {
        delete l._hasValidationError;
        delete l._errorFields;
      });
      // 重建 detailItems 以清除顯示中的錯誤標記
      this.commissionCrudService.updateDetailItems(commission);
    });
  }

  /**
   * 檢查日期區間是否重疊
   * @returns 重疊錯誤數量
   */
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

        // 區間重疊：A.start <= B.end && B.start <= A.end
        if (startA <= endB && startB <= endA) {
          overlapCount++;
          const existingFieldsI = (validItems[i]['_errorFields'] as string[]) || [];
          validItems[i]['_errorFields'] = [...new Set([...existingFieldsI, startField, endField])];
          const existingFieldsJ = (validItems[j]['_errorFields'] as string[]) || [];
          validItems[j]['_errorFields'] = [...new Set([...existingFieldsJ, startField, endField])];
        }
      }
    }

    return overlapCount;
  }

  private validateStep4(): boolean {
    // Step 4 租金設定驗證
    const commissionType = this.currentCommissionType;

    // 一般抽成 (3) 不需要 Step 4
    if (commissionType === CommissionType.GENERAL_COMMISSION) {
      return true;
    }

    // 過濾未刪除的條件（commissionType 已明確知道類型，不需要 type guard）
    const activeItems = this.wizardState.conditionItems.filter(item => item._status !== 'deleted');

    // 清除所有錯誤標記
    this.clearStep4ErrorFlags(activeItems);

    if (activeItems.length === 0) {
      this.messageService.warnBubble('請至少設定一筆租金/條件資料');
      return false;
    }

    let errorCount = 0;
    const errorTypes = new Set<string>();

    // 驗證每筆資料的必填欄位
    for (const item of activeItems) {
      const errorFields: string[] = [];

      // [暫時註解] 通用驗證：帳務起迄日期必填
      // if (!item.cag_bdate) {
      //   errorCount++;
      //   errorTypes.add('必填欄位未填');
      //   errorFields.push('cag_bdate');
      // }
      // if (!item.cag_edate) {
      //   errorCount++;
      //   errorTypes.add('必填欄位未填');
      //   errorFields.push('cag_edate');
      // }

      // [暫時註解] 驗證日期順序
      // const condStart = this.parseDate(item.cag_bdate);
      // const condEnd = this.parseDate(item.cag_edate);
      // if (condStart && condEnd && condStart > condEnd) {
      //   errorCount++;
      //   errorTypes.add('日期順序錯誤');
      //   errorFields.push('cag_bdate', 'cag_edate');
      // }

      // [暫時註解] 驗證日期在契約期間內
      // const contractStartDate = this.step1Form.get('tlt_bdate')?.value;
      // const contractEndDate = this.step1Form.get('tlt_edate')?.value;
      // if (contractStartDate && contractEndDate) {
      //   const contractStart = this.parseDate(contractStartDate);
      //   const contractEnd = this.parseDate(contractEndDate);

      //   if (condStart && contractStart && condStart < contractStart) {
      //     errorCount++;
      //     errorTypes.add('日期超出契約期間');
      //     if (!errorFields.includes('cag_bdate')) errorFields.push('cag_bdate');
      //   }
      //   if (condEnd && contractEnd && condEnd > contractEnd) {
      //     errorCount++;
      //     errorTypes.add('日期超出契約期間');
      //     if (!errorFields.includes('cag_edate')) errorFields.push('cag_edate');
      //   }
      // }

      // 根據抽成別驗證特定欄位
      const data = item as unknown as Record<string, unknown>;
      switch (commissionType) {
        case CommissionType.FIXED_RENT: // 固定租金 (1)
          if (!data['base_rent'] || Number(data['base_rent']) <= 0) {
            errorCount++;
            errorTypes.add('金額必須大於 0');
            errorFields.push('base_rent');
          }
          break;

        case CommissionType.BASE_RENT_HIGHER: // 底租抽成取高者 (2)
          if (!data['base_rent'] || Number(data['base_rent']) <= 0) {
            errorCount++;
            errorTypes.add('金額必須大於 0');
            errorFields.push('base_rent');
          }
          break;

        case CommissionType.BASE_COMMISSION: // 包底抽成 (4)
          if (!data['limit_amt'] || Number(data['limit_amt']) <= 0) {
            errorCount++;
            errorTypes.add('金額必須大於 0');
            errorFields.push('limit_amt');
          }
          if (!data['limit_charge_rate'] || Number(data['limit_charge_rate']) <= 0) {
            errorCount++;
            errorTypes.add('抽成率必須大於 0');
            errorFields.push('limit_charge_rate');
          }
          break;

        case CommissionType.GRADUATED: // 層級抽成 (5)
          if (data['start_number'] !== undefined && data['end_number'] !== undefined) {
            const gradStart = Number(data['start_number']);
            const gradEnd = Number(data['end_number']);
            // end=0 視為無上限，不卡控；起始值允許為 0
            if (gradEnd !== 0 && gradStart >= gradEnd) {
              errorCount++;
              errorTypes.add('業績起迄值錯誤');
              errorFields.push('start_number', 'end_number');
            }
          }
          if (!data['charge_rate'] || Number(data['charge_rate']) <= 0) {
            errorCount++;
            errorTypes.add('抽成率必須大於 0');
            errorFields.push('charge_rate');
          }
          break;

        case CommissionType.BASE_TIER: // 包底加層級 (6)
          if (!data['limit_amt'] || Number(data['limit_amt']) <= 0) {
            errorCount++;
            errorTypes.add('金額必須大於 0');
            errorFields.push('limit_amt');
          }
          if (data['start_number'] !== undefined && data['end_number'] !== undefined) {
            const tierStart = Number(data['start_number']);
            const tierEnd = Number(data['end_number']);
            // end=0 視為無上限，不卡控；起始值允許為 0
            if (tierEnd !== 0 && tierStart >= tierEnd) {
              errorCount++;
              errorTypes.add('業績起迄值錯誤');
              errorFields.push('start_number', 'end_number');
            }
          }
          break;
      }

      // 標記有錯誤的欄位（只標記欄位，不標記整行）
      if (errorFields.length > 0) {
        item._errorFields = [...new Set(errorFields)];
      }
    }

    // [暫時註解] 日期區間重疊驗證
    // const overlapCount = this.checkDateOverlap(
    //   activeItems as unknown as Record<string, unknown>[],
    //   'cag_bdate',
    //   'cag_edate'
    // );
    // if (overlapCount > 0) {
    //   errorCount += overlapCount;
    //   errorTypes.add('日期區間重疊');
    // }

    if (errorCount > 0) {
      // 觸發變更檢測
      this.wizardState.conditionItems = [...this.wizardState.conditionItems];

      const typeList = [...errorTypes].join('、');
      this.messageService.warnBubble(
        `租金設定共 ${errorCount} 項錯誤：${typeList}，請修正紅框欄位`
      );
      return false;
    }

    return true;
  }

  /**
   * 清除 Step 4 所有錯誤標記
   */
  private clearStep4ErrorFlags(items: ConditionItem[]): void {
    items.forEach(item => {
      delete item._hasValidationError;
      delete item._hasDateOverlapError;
      delete item._errorFields;
    });
  }

  // ========== 資料更新回調 ==========
  onStep2DataChange(fareItems: FareItem[]): void {
    this.wizardState.fareItems = fareItems;
  }

  onStep3DataChange(commissionItems: CommissionItem[]): void {
    this.wizardState.commissionItems = commissionItems;
  }

  onStep4DataChange(conditionItems: ConditionItem[]): void {
    this.wizardState.conditionItems = conditionItems;
  }

  // ========== 儲存與取消 ==========
  async onSave(): Promise<void> {
    // 驗證最後一步
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isSaving = true;

    try {
      // 儲存前同步 Step 3 抽成資料（從 detailItems 同步到來源陣列）
      this.step3Component?.syncAllDataBeforeSave();

      // 儲存前確保 Step 4 條件資料已初始化（針對需要條件的抽成別）
      this.ensureConditionItemsInitialized();

      // 使用 SubmitDataService 組裝 CleanContractRequest
      const submitData = this.submitDataService.assembleSubmitData(
        this.step1Form,
        this.wizardState.locationData,
        this.wizardState.fareItems,
        this.wizardState.commissionItems,
        this.wizardState.conditionItems,
        this.crudstatus === CRUDStatus.Create,
        this.originalCommissionType
      );

      // 呼叫 API 儲存 (使用 as any 繞過舊版類型定義)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.apiService.submitFinalTLS13010(submitData as any).toPromise();

      // API service 已經把回應轉換成 { success, message, data, ... } 格式
      if (response?.success) {
        // 組合詳細成功訊息
        const formData = this.step1Form.getRawValue();
        const isInsert = this.crudstatus === CRUDStatus.Create;

        const successMessage = [
          `異動訊息:${isInsert ? '新增成功' : '修改成功'}`,
          `招商編號：${formData.apply_no || response.applyNo || ''}`,
          `版本編號：${formData.contract_subno || ''}`,
          `專櫃編號：${formData.tlt_no || response.tltNo || ''}`,
          `廠商編號：${formData.ven_uniform || ''}`,
          `品牌（專櫃名稱）：${formData.tlt_name || ''}`
        ].join('\n');

        // 新增契約時刷新使用者資料權限，否則看不到剛新增的資料
        if (isInsert) {
          try {
            await firstValueFrom(this.apiService.refreshUserDataPermissions());
          } catch {
            this.messageService.warnBubble('契約已成功建立，但權限更新失敗。請重新登入以查看新專櫃。');
          }
        }

        // 顯示成功確認對話框（讓使用者抄資料後再跳頁）
        this.successDialogItems = successMessage.split('\n').map(line => {
          const idx = line.indexOf(':');
          return idx !== -1
            ? { label: line.substring(0, idx), value: line.substring(idx + 1) }
            : { label: '', value: line };
        });
        this.showSuccessDialog = true;
      } else {
        // 業務邏輯失敗：直接顯示一次錯誤，不拋出例外（避免重複顯示）
        this.messageService.errorBubble(response?.message || '契約書資料提交失敗');
      }
    } catch (error: unknown) {
      // 此處只處理 HTTP 層例外（interceptor 已顯示通知，這裡僅記錄 log）
      console.error('契約書資料提交失敗:', error);
    } finally {
      this.isSaving = false;
    }
  }

  override onCancel(): void {
    this.router.navigate(['account/tls/tls13010'], {
      state: { fromRoute: '/tls/tls13010cru' }
    });
  }

  /**
   * 確保條件資料已初始化（針對需要條件的抽成別）
   * 如果 wizardState.conditionItems 為空且抽成別需要租金設定，
   * 自動建立一筆預設的條件項目
   */
  private ensureConditionItemsInitialized(): void {
    const commissionType = this.currentCommissionType;

    // 一般抽成 (3) 不需要租金設定
    if (commissionType === CommissionType.GENERAL_COMMISSION || commissionType === '') {
      return;
    }

    // 檢查是否已有條件資料
    if (this.wizardState.conditionItems && this.wizardState.conditionItems.length > 0) {
      return;
    }

    // Step 4 組件已渲染，不需額外處理
    if (this.step4Component) {
      return;
    }

    // Step 4 組件未渲染（使用者可能還沒導航到該步驟），手動建立預設條件項目
    const formData = this.step1Form.getRawValue();
    const talentId = formData.talent_id || '';
    const startDate = this.formatDateForCondition(formData.tlt_bdate);
    const endDate = this.formatDateForCondition(formData.tlt_edate);

    const newItem = this.createDefaultConditionItem(commissionType, talentId, startDate, endDate);
    if (newItem) {
      this.wizardState.conditionItems = [newItem];
    }
  }

  /**
   * 載入中小分類下拉選項
   * 在編輯/檢視模式下，patchValue 後需要手動載入對應的下拉選項
   */
  private async loadClassificationOptions(data: Record<string, unknown>): Promise<void> {
    const busType = data['bus_type'] as string;
    const busClass = data['bus_class'] as string;

    if (!busType) return;

    try {
      await this.dropdownService.loadBusClassOptions(busType).toPromise();

      if (busClass) {
        await this.dropdownService.loadBusSClassOptions(busType, busClass).toPromise();
      }
    } catch (error) {
      console.error('[loadClassificationOptions] 載入分類選項失敗:', error);
    }
  }

  /**
   * 建立預設條件項目
   */
  private createDefaultConditionItem(
    commissionType: string,
    talentId: string,
    startDate: string,
    endDate: string
  ): ConditionItem | null {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    switch (commissionType) {
      case CommissionType.FIXED_RENT: // 固定租金
        return {
          id: tempId,
          talent_id: talentId,
          tlt_id: '',
          cag_bdate: startDate,
          cag_edate: endDate,
          base_rent: 0,
          _status: 'new'
        };

      case CommissionType.BASE_RENT_HIGHER: // 底租抽成取高者
        return {
          id: tempId,
          talent_id: talentId,
          tlt_id: '',
          cag_bdate: startDate,
          cag_edate: endDate,
          base_rent: 0,
          cag_charge_rate: 0,
          _status: 'new'
        };

      case CommissionType.BASE_COMMISSION: // 包底抽成
        return {
          id: tempId,
          talent_id: talentId,
          tlt_id: '',
          cag_bdate: startDate,
          cag_edate: endDate,
          limit_amt: 0,
          limit_charge_rate: 0,
          _status: 'new'
        };

      case CommissionType.GRADUATED: // 層級抽成
        return {
          id: tempId,
          talent_id: talentId,
          seq_no: 1,
          cag_bdate: startDate,
          cag_edate: endDate,
          start_number: 0,
          end_number: 0,
          charge_rate: 0,
          _status: 'new'
        };

      case CommissionType.BASE_TIER: // 包底加層級
        return {
          id: tempId,
          talent_id: talentId,
          tlt_id: '',
          seq_no: 1,
          cag_bdate: startDate,
          cag_edate: endDate,
          limit_amt: 0,
          start_number: 0,
          end_number: 0,
          charge_rate: 0,
          _status: 'new'
        };

      default:
        return null;
    }
  }

  /**
   * 格式化日期為租金設定用的字串格式
   */
  private formatDateForCondition(date: unknown): string {
    if (!date) return '';
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(date);
  }

  // ========== 輔助方法 ==========
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isNewMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  get isLastStep(): boolean {
    return this.visualStepIndex === this.stepIndexMap.length - 1;
  }

  get isFirstStep(): boolean {
    return this.visualStepIndex === 0;
  }

  get currentCommissionType(): string {
    const value = this.step1Form.get('tlt_term_type')?.value;
    // 確保 trim 處理，因為後端回傳可能有空白
    return value ? String(value).trim() : '';
  }

  /**
   * Step 4 用的專櫃契約書資訊陣列
   */
  get contractInfoDataForStep4(): Record<string, unknown>[] {
    const formData = this.step1Form.getRawValue();
    return [{
      id: formData.talent_id || 'new',
      apply_no: formData.apply_no || '',
      tlt_no: formData.tlt_no || '',
      tlt_name: formData.tlt_name || '',
      ven_uniform: formData.ven_uniform || '',
      VEN_Name: formData.VEN_Name || '',
      contract_subno: formData.contract_subno || '',
      tlt_term_type: (formData.tlt_term_type || '').toString().trim(),
      tlt_ctype_mtotal: formData.tlt_ctype_mtotal || '',
      overall_status: formData.overall_status || '',
      tlt_bdate: formData.tlt_bdate || '',
      tlt_edate: formData.tlt_edate || '',
      tlt_contract_bdate: formData.tlt_contract_bdate || '',
      tlt_contract_edate: formData.tlt_contract_edate || ''
    }];
  }

  /**
   * 取得下一步按鈕的標籤
   * 根據實際要跳到的步驟決定標籤
   */
  get nextStepLabel(): string {
    const nextVisualIndex = this.visualStepIndex + 1;
    if (nextVisualIndex >= this.stepIndexMap.length) {
      return '下一步';
    }

    const nextActualStep = this.stepIndexMap[nextVisualIndex];
    const stepLabels: Record<number, string> = {
      1: '下一步(代扣款)',
      2: '下一步(抽成)',
      3: '下一步(租金)'
    };

    return stepLabels[nextActualStep] || '下一步';
  }

  // ========== 契約日期同步 ==========
  /**
   * 同步契約日期到所有子項目 (Step 2, Step 3)
   */
  private syncContractDatesToAllItems(): void {
    const currentStartDate = this.step1Form.get('tlt_bdate')?.value;
    const currentEndDate = this.step1Form.get('tlt_edate')?.value;

    // 如果日期沒有變更，不需要同步
    if (this.areDatesEqual(currentStartDate, this.lastContractStartDate) &&
      this.areDatesEqual(currentEndDate, this.lastContractEndDate)) {
      return;
    }

    // 更新記錄的日期
    this.lastContractStartDate = this.parseDate(currentStartDate);
    this.lastContractEndDate = this.parseDate(currentEndDate);

    // 同步 Step 2 代扣款項目日期
    this.syncStep2Dates(currentStartDate, currentEndDate);

    // 同步 Step 3 抽成項目日期
    this.syncStep3Dates(currentStartDate, currentEndDate);
  }

  /**
   * 同步 Step 2 代扣款項目日期
   * 契約已有的項目 (original + is_selected) 保留原始日期，其餘覆蓋契約日期
   */
  private syncStep2Dates(startDate: Date | string, endDate: Date | string): void {
    if (!this.wizardState.fareItems?.length) return;

    this.wizardState.fareItems.forEach(item => {
      // 契約已有的資料保留原始日期
      if (item._status === 'original' && item.is_selected) {
        return;
      }
      item.tpy_bdate = startDate as string;
      item.tpy_edate = endDate as string;
    });
  }

  /**
   * 同步 Step 3 抽成項目日期
   */
  private syncStep3Dates(startDate: Date | string, endDate: Date | string): void {
    if (!this.wizardState.commissionItems?.length) return;

    this.wizardState.commissionItems.forEach(commission => {
      // 更新主項目日期
      commission.mainStartDate = startDate;
      commission.mainEndDate = endDate;

      // 更新折扣設定日期（API 既有且已勾選的保留原始日期）
      commission.discountSettingItems?.forEach(discount => {
        if (discount._status === 'original' && discount.selected) return;
        discount.tlt_bdate = startDate;
        discount.tlt_edate = endDate;
      });

      // 更新年度業績日期（API 既有的保留原始日期）
      commission.annualPerformanceItems?.forEach(annual => {
        if (annual._status === 'original' && annual.selected) return;
        annual.tlt_bdate = startDate;
        annual.tlt_edate = endDate;
      });

      // 更新層級抽成日期（API 既有的保留原始日期）
      commission.discountLevelItems?.forEach(level => {
        if (level._status === 'original' && level.selected) return;
        level.tlt_bdate = startDate;
        level.tlt_edate = endDate;
      });
    });
  }

  /**
   * 同步 Step 4 條件項目日期
   * 只同步新增項目 (_status === 'new')，保留既有資料的日期
   */
  private syncStep4Dates(): void {
    const startDate = this.step1Form.get('tlt_bdate')?.value;
    const endDate = this.step1Form.get('tlt_edate')?.value;

    if (!startDate || !endDate) return;
    if (!this.wizardState.conditionItems?.length) return;

    this.wizardState.conditionItems.forEach(item => {
      // 只同步新增項目
      if (item._status === 'new') {
        item.cag_bdate = startDate;
        item.cag_edate = endDate;
      }
    });
  }

  /**
   * 比較兩個日期是否相等
   */
  private areDatesEqual(date1: Date | string | null | undefined, date2: Date | string | null | undefined): boolean {
    if (!date1 && !date2) return true;
    if (!date1 || !date2) return false;

    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);

    if (!d1 && !d2) return true;
    if (!d1 || !d2) return false;

    return d1.getTime() === d2.getTime();
  }

  // ========== 日期處理 ==========
  /**
   * 將日期字串轉換為 Date 物件（移除時間部分）
   * 支援格式:
   * - "2025-10-29", "2025/10/29" (YYYY-MM-DD)
   * - "10/29/2025", "10-29-2025" (MM/DD/YYYY)
   * - "2025-10-29T00:00:00", "10/29/2025 00:00:00" (含時間)
   */
  private parseDate(value: unknown): Date | null {
    if (!value) return null;

    // 如果已經是 Date 物件
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      // 移除時間部分
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    // 處理字串
    if (typeof value === 'string') {
      const dateStr = value.trim();
      if (!dateStr) return null;

      // 取得日期部分 (移除時間)
      const datePart = dateStr.split(/[T\s]/)[0];

      // 嘗試 YYYY-MM-DD 或 YYYY/MM/DD 格式
      let match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // 嘗試 MM/DD/YYYY 或 MM-DD-YYYY 格式
      match = datePart.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (match) {
        const month = parseInt(match[1], 10) - 1;
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  /**
   * 處理 API 回傳的資料，轉換日期欄位
   */
  /**
   * 將日期時間值格式化為 yyyy/MM/dd HH:mm (24 時制)，供建立/修改/審核時間顯示。
   * 無法解析時原值回傳（避免顯示空白），空值回傳空字串。
   */
  private formatDateTimeToMinute(value: unknown): string {
    if (!value) return '';
    let raw: Date;
    if (value instanceof Date) {
      raw = value;
    } else {
      const s = String(value);
      raw = new Date(s);
      // 後端可能回傳 "2026-05-13 09:30:00"（帶空白、非標準 ISO），補上 T 再試一次
      if (isNaN(raw.getTime())) raw = new Date(s.replace(' ', 'T'));
    }
    if (isNaN(raw.getTime())) return typeof value === 'string' ? value : '';
    const p = (n: number) => String(n).padStart(2, '0');
    return `${raw.getFullYear()}/${p(raw.getMonth() + 1)}/${p(raw.getDate())} ${p(raw.getHours())}:${p(raw.getMinutes())}`;
  }

  private processDateFields(data: Record<string, unknown>): Record<string, unknown> {
    const processed = { ...data };

    for (const field of DATE_FIELDS) {
      if (processed[field]) {
        const dateValue = this.parseDate(processed[field]);
        if (dateValue) {
          processed[field] = dateValue;
        }
      }
    }

    return processed;
  }

  // ========== 成功對話框 ==========
  onSuccessConfirm(): void {
    this.showSuccessDialog = false;
    this.router.navigate(['account/tls/tls13010'], { state: { fromRoute: '/tls/tls13010cru' } });
  }

  onSuccessDialogClose(visible: boolean): void {
    if (!visible) this.onSuccessConfirm();
  }
}
