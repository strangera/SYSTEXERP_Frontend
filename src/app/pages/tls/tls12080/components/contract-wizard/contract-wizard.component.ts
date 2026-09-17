/**
 * TLS12080 專櫃意向書維護 - 合約精靈主組件
 *
 * 單頁面架構，包含所有步驟：
 * - Step 1: 合約基本資料
 * - Step 2: 代扣款設定
 * - Step 3: 抽成設定
 * - Step 4: 租金設定
 *
 * 資料統一在此組件管理，不需要 Session Storage
 */
import { CommonModule, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { RenewalQueryResponse, TLS12080Service } from '@service/api/tls/tls12080.service';
import { SharedDropdownService } from '@others/services/shared-dropdown.service';
import { TlsContractBaseService } from '@others/services/tls/tls-contract-base.service';
import { CrudTrackingService } from '../../../tls13010-v2/core/services/crud-tracking.service';

// V2 服務
import { SubmitDataService } from '../../services/submit/submit-data.service';
import { ContractValidatorService } from '../../services/validation/contract-validator.service';

// V2 類型
import { CommissionItem as V2CommissionItem } from '../../../tls13010-v2/core/models/commission/commission-item.interface';
import {
  CommissionType,
  DataStatus
} from '../../core';
import { ConditionItem } from '../../core/models/condition';
import { ContractInfo, LocationItem } from '../../core/models/contract';
import { FareItem } from '../../core/models/deduction';

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
  commissionItems: V2CommissionItem[];

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
  selector: 'app-tls12080-contract-wizard',
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
    DialogComponent,
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
    { label: '租金設定' }
  ];

  /**
   * 根據抽成別動態計算應顯示的步驟
   * - 固定租金 (1): Step 0, 1, 3 (跳過 Step 2 抽成設定)
   * - 一般抽成 (3): Step 0, 1, 2 (跳過 Step 3 租金設定)
   * - 其他: 全部 4 個步驟
   */
  get steps(): MenuItem[] {
    // 意向書：只顯示 Step 1（合約基本資料）
    if (this.dataForm?.get('contract_type')?.value === '2') {
      return [this.allSteps[0]];
    }

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
    // 意向書：只有 Step 0
    if (this.dataForm?.get('contract_type')?.value === '2') {
      return [0];
    }

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

  // 成功確認對話框
  showSuccessDialog = false;
  successDialogItems: { label: string; value: string }[] = [];

  // 原始抽成別（編輯模式用）
  originalCommissionType?: string;

  // API 資料載入完成信號（通知 step1 載入依賴下拉）
  step1DataReady = false;

  // 折扣選項 (Step 3 專用)
  discountOptions: any[] = [];

  // 上次同步的契約日期（smart sync 用）
  private lastSyncedStartDate: unknown = null;
  private lastSyncedEndDate: unknown = null;

  // 子組件參考
  @ViewChild(Step1ContractInfoComponent) step1Component?: Step1ContractInfoComponent;
  @ViewChild(Step2DeductionComponent) step2Component?: Step2DeductionComponent;
  @ViewChild(Step3CommissionComponent) step3Component?: Step3CommissionComponent;
  @ViewChild(Step4ConditionComponent) step4Component?: Step4ConditionComponent;

  constructor(
    public override router: Router,
    private apiService: TLS12080Service,
    private tlsBaseService: TlsContractBaseService,
    public sharedDropdownService: SharedDropdownService,
    private validatorService: ContractValidatorService,
    private submitDataService: SubmitDataService
  ) {
    super();
    this.initializeForm();
  }

  // ========== 生命週期 ==========
  async ngOnInit(): Promise<void> {
    // 使用 BasicCruPageComponent 的 initializePage
    this.initializePage('TLS12080', this.dataForm, { useReadonly: true });

    // 載入 Step 3 所需的折扣選項（需在 handleRouterState 之前載入）
    await this.loadDiscountOptions();

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
      contract_type: ['2'],  // 意向書固定為 '2'
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
      vip_yn: ['Y'],
      credit_card: [null],

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
      email: ['', [Validators.maxLength(200)]],
      invoice_email: ['', [Validators.maxLength(200)]],
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
    // 監聽契約類型變更（意向書時只顯示 Step 1）
    this.dataForm.get('contract_type')?.valueChanges.subscribe(() => {
      this.currentStep = 0;
    });

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

    // 包底類別驗證 (抽成別 4, 6 需要)
    const baodiControl = this.dataForm.get('tlt_ctype_mtotal');
    if (baodiControl) {
      baodiControl.clearValidators();
      if (['4', '6'].includes(tltTermType)) {
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
    // 新增模式 - 初始化空表單 + 載入可用代扣款項目
    if (this.isFormCreateable) {
      this.tlsBaseService.initializeEmptyForm(this.dataForm, 'TLS12080');
      // 意向書固定 contract_type = '2'（initializeEmptyForm 會用共用預設值蓋掉）
      this.dataForm.patchValue({ contract_type: '2' });
      this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
      await this.loadFareData('');
      return;
    }

    // 編輯/檢視模式 - 載入資料
    if ((this.isFormEditable || this.isFormReadable) && this.rowdata) {
      await this.loadContractData(this.rowdata as any);
      // 意向書固定 contract_type = '2'
      this.dataForm.patchValue({ contract_type: '2' });
    }
  }

  // ========== 資料載入 ==========
  private async loadContractData(rowData: any): Promise<void> {
    try {
      const request = { apply_no: rowData.apply_no, id: rowData.id };
      const response = await this.apiService.queryTLS12080Detail(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const data = response.Data;

        // 處理字串欄位 trim（資料庫固定長度欄位會帶空白）
        if (data.tlt_term_type) {
          data.tlt_term_type = String(data.tlt_term_type).trim();
          this.originalCommissionType = data.tlt_term_type;
        }
        if (data.apply_type) {
          data.apply_type = String(data.apply_type).trim();
        }

        // 資料預處理（與 v1 CRU populateForm 一致）
        const processedData = this.preprocessApiData(data);

        // 填充表單（emitEvent:false 避免 valueChanges 監聽器在載入時連鎖觸發）
        this.dataForm.patchValue(processedData, { emitEvent: false });

        // apply_type 下拉在 emitEvent:false 時可能不會同步 UI，顯式重設強制更新
        if (processedData.apply_type) {
          this.dataForm.get('apply_type')?.setValue(processedData.apply_type);
        }

        // 更新驗證器
        this.updateDynamicValidators();
        this.updatePaymentValidators();

        // 同步 contractInfo
        this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

        // 載入位置資料（與 v1 loadLocationData 一致）
        const locationDetails = data.LocationDetails || [];
        const contractBdate = this.dataForm.get('tlt_bdate')?.value;
        const contractEdate = this.dataForm.get('tlt_edate')?.value;
        if (Array.isArray(locationDetails) && locationDetails.length > 0) {
          this.wizardState.locationData = locationDetails.map((item: any) => ({
            id: item.id,
            mid: item.mid || '',
            apply_no: item.apply_no || '',
            location_no: item.location_no || '',
            tlt_building: item.tlt_building || '',
            tlt_floor: item.tlt_floor || '',
            area_no: item.area_no || '',
            tlt_space: Number(item.tlt_space) || 0,
            sale_rate: item.sale_rate == null ? undefined : Number(item.sale_rate),
            building_desc: item.building_desc || '',
            floor_desc: item.floor_desc || '',
            area_desc: item.area_desc || '',
            tlt_bdate: item.tlt_bdate ? new Date(item.tlt_bdate.split('T')[0])
                     : (contractBdate ? new Date(contractBdate) : undefined),
            tlt_edate: item.tlt_edate ? new Date(item.tlt_edate.split('T')[0])
                     : (contractEdate ? new Date(contractEdate) : undefined),
            _status: 'original' as DataStatus
          }));
        }

        // 通知 step1：API 資料已就緒，觸發 ngOnChanges → loadDependentDropdowns
        this.step1DataReady = true;

        // 載入 Step 2 代扣款資料
        await this.loadFareData(rowData.apply_no);

        // 載入 Step 3 抽成資料
        await this.loadCommissionData(rowData.apply_no);

        // 載入 Step 4 條件資料
        await this.loadConditionData(rowData.apply_no, data.tlt_term_type);
      }
    } catch (error) {
      console.error('載入合約資料失敗:', error);
      this.messageService.errorBubble('載入合約資料失敗');
    }
  }

  /**
   * API 回傳資料預處理（與 v1 CRU populateForm 一致）
   * - 日期字串轉 Date 物件（Calendar 元件需要）
   * - vendor_ven_no 映射
   * - check_type CSV 轉 check_typeList 陣列
   */
  private preprocessApiData(data: any): any {
    const dateFields = [
      'apply_date', 'tlt_bdate', 'tlt_edate',
      'tlt_contract_bdate', 'tlt_contract_edate',
      'feedback_date', 'due_date', 'contact_Date'
    ];

    const processedData = {
      ...data,
      vendor_ven_no: data.ven_no || data.vendor_ven_no || '',
      check_typeList: data.check_type
        ? data.check_type.split(',').map((s: string) => s.trim())
        : []
    };

    // 日期字串轉 Date 物件（Calendar 元件需要）
    dateFields.forEach(field => {
      if (processedData[field]) {
        const dateValue = this.parseDateToDateObject(processedData[field]);
        if (dateValue) {
          processedData[field] = dateValue;
        }
      }
    });

    return processedData;
  }

  /**
   * 日期字串轉 Date 物件
   */
  private parseDateToDateObject(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value !== 'string') return null;

    const dateStr = value.trim();
    if (!dateStr) return null;

    const datePart = dateStr.split(/[T\s]/)[0];
    const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  private async loadFareData(applyNo: string): Promise<void> {
    try {
      const request = { apply_no: applyNo, showAll: true };
      const response = await this.apiService.queryTLS12080Fare(request).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const faresByType = response.Data.FaresByType || {};
        const allItems: FareItem[] = [];

        ['A', 'B', 'C', 'D', 'E'].forEach(type => {
          const items = faresByType[type] || [];
          items.forEach((item: any) => {
            // 判斷是否為契約既有項目
            const isExisting = item.data_source === 'CONTRACT_EXISTING' ||
              (item.is_selected && !item.is_new_item);

            // 確保 cap_type 和基本欄位
            item.cap_type = type;
            item.data_source = isExisting ? 'CONTRACT_EXISTING' : (item.data_source || '');

            // 使用 CrudTrackingService.initializeItem 設定 _originalData
            const initializedItem = CrudTrackingService.initializeItem(
              item,
              isExisting
            ) as unknown as FareItem;

            allItems.push(initializedItem);
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
      const response = await this.apiService.queryTLS12080Charge(applyNo).toPromise();

      if (response?.Status === '0000' && response.Data) {
        const chargeSettings = response.Data.ChargeSettings || [];

        // 將 API 資料映射為 TLS13010-v2 的 CommissionItem 格式
        this.wizardState.commissionItems = chargeSettings.map((item: any) => ({
          id: item.id,
          tlt_id: item.tlt_id || '',
          tlt_id_desc: item.tlt_id_desc || '',
          cag_taxtype: item.cag_taxtype ?? '',
          discountSummary: item.discountSummary || '',
          sst_amount: item.sst_amount || 0,
          sst_rate: item.sst_rate || 0,
          cap_saletype1: item.cap_saletype1 === 'Y' || item.cap_saletype1 === true,
          cap_saletype2: item.cap_saletype2 === 'Y' || item.cap_saletype2 === true,
          cap_saletype3: item.cap_saletype3 === 'Y' || item.cap_saletype3 === true,
          cap_saletype5: item.cap_saletype5 === 'Y' || item.cap_saletype5 === true,
          selectedSettingOption: item.selectedSettingOption || '',
          charge_rate: item.charge_rate || 0,
          cag_bdate: item.cag_bdate || '',
          cag_edate: item.cag_edate || '',
          cag_remark: item.cag_remark || '',
          remark: item.cag_remark || '',
          mainStartDate: this.dataForm.get('tlt_bdate')?.value || item.cag_bdate || '',
          mainEndDate: this.dataForm.get('tlt_edate')?.value || item.cag_edate || '',
          // 使用 buildCompleteDiscountItems 建立完整的折扣設定列表
          discountSettingItems: this.buildCompleteDiscountItems(item.ChargeDetails || []),
          // 明細映射：YearChargeDetails → annualPerformanceItems
          annualPerformanceItems: (item.YearChargeDetails || []).map((d: Record<string, unknown>) => ({
            ...d,
            extra_rate: this.convertRateToPercentage(Number(d['extra_rate'] || d['EXTRA_RATE'] || 0)),
            selected: (d['is_selected'] ?? d['selected'] ?? false) as boolean,
            _status: 'original' as DataStatus
          })),
          // 明細映射：LevelChargeDetails → discountLevelItems
          discountLevelItems: (item.LevelChargeDetails || []).map((d: Record<string, unknown>) => ({
            ...d,
            level_charge_rate: this.convertRateToPercentage(Number(d['level_charge_rate'] || d['LEVEL_CHARGE_RATE'] || 0)),
            selected: (d['is_selected'] ?? d['selected'] ?? d['is_enabled'] ?? false) as boolean,
            is_configured: (d['is_configured'] ?? true) as boolean,
            is_enabled: (d['is_enabled'] ?? true) as boolean,
            _status: 'original' as DataStatus
          })),
          detailItems: [],
          currentTab: 'discount',
          _status: 'original' as DataStatus
        } as V2CommissionItem));
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
      const response = await this.apiService.queryTLS12080Commission(request).toPromise();

      if (response?.Status === '0000' && response.Data?.ExistingData) {
        // ExistingData 是物件，需根據抽成類型取出對應陣列
        const items = this.extractConditionItems(response.Data.ExistingData, commissionType);

        this.wizardState.conditionItems = items.map((item: any) => ({
          ...item,
          cag_bdate: this.formatDateToString(item.cag_bdate),
          cag_edate: this.formatDateToString(item.cag_edate),
          _status: 'original' as DataStatus
        }));
      }
    } catch (error) {
      console.error('載入條件資料失敗:', error);
    }
  }

  /**
   * 從 ExistingData 物件中提取對應抽成類型的條件項目陣列
   */
  /**
   * 從 ExistingData 物件中提取對應抽成類型的條件項目陣列
   * 必須明確 map 每種類型所需的欄位，避免多餘欄位（如 limit_amt）
   * 導致 categorizeConditionItems 的類型判斷錯誤
   */
  private extractConditionItems(existingData: any, commissionType: string): any[] {
    switch (commissionType) {
      case '1': // 固定租金
        return (existingData.RentDetails || []).map((item: any) => ({
          id: item.id || item.ID,
          tlt_id: item.tlt_id || item.TLT_ID || '',
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          base_rent: Number(item.base_rent || item.BASE_RENT || 0)
        }));

      case '2': // 底租抽成取高者
        return (existingData.RentDetails || []).map((item: any, index: number) => ({
          id: item.id || item.ID,
          tlt_id: item.tlt_id || item.TLT_ID || '',
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          base_rent: Number(item.base_rent || item.BASE_RENT || 0),
          cag_charge_rate: Number(existingData.ChargedDetails?.[index]?.cag_charge_rate || item.cag_charge_rate || 0)
        }));

      case '4': // 包底抽成
        return (existingData.LimitDetails || []).map((item: any) => ({
          id: item.id || item.ID,
          tlt_id: item.tlt_id || item.TLT_ID || '',
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          limit_amt: Number(item.limit_amt || item.LIMIT_AMT || 0),
          limit_charge_rate: Number(item.limit_charge_rate || item.LIMIT_CHARGE_RATE || 0)
        }));

      case '5': // 層級抽成 — 不可包含 limit_amt，否則會被誤判為包底加層級
        return (existingData.LevelDetails || []).map((item: any) => ({
          id: item.id || item.ID,
          seq_no: Number(item.seq_no || item.SEQ_NO || 0),
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          start_number: Number(item.start_number || item.START_NUMBER || 0),
          end_number: Number(item.end_number || item.END_NUMBER || 0),
          charge_rate: Number(item.charge_rate || item.CHARGE_RATE || 0)
        }));

      case '6': // 包底加層級
        return (existingData.BottomTierDetails || existingData.LevelDetails || []).map((item: any) => ({
          id: item.id || item.ID,
          seq_no: Number(item.seq_no || item.SEQ_NO || 0),
          tlt_id: item.tlt_id || item.TLT_ID || '',
          cag_bdate: item.cag_bdate || item.CAG_BDATE,
          cag_edate: item.cag_edate || item.CAG_EDATE,
          limit_amt: Number(item.limit_amt || item.LIMIT_AMT || 0),
          start_number: Number(item.start_number || item.START_NUMBER || 0),
          end_number: Number(item.end_number || item.END_NUMBER || 0),
          charge_rate: Number(item.charge_rate || item.CHARGE_RATE || 0)
        }));

      default:
        return [];
    }
  }

  /**
   * 將日期值格式化為 YYYY-MM-DD 字串
   */
  private formatDateToString(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.split('T')[0].replace(/\//g, '-');
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(value);
  }

  private async loadDiscountOptions(): Promise<void> {
    try {
      const options = await this.sharedDropdownService.getPaperTypeOptions('T102').toPromise();
      this.discountOptions = options || [];
    } catch (error) {
      console.error('載入折扣選項失敗:', error);
      this.discountOptions = [];
    }
  }

  // ========== 續約資料處理 ==========

  /**
   * 處理續約代扣款資料 (Step 2)
   * 將 API 回傳的 FaresByType 映射為 FareItem[]，全部標記為 'new'
   */
  private processRenewalFareData(fareData: any): void {
    if (!fareData) {
      this.wizardState.fareItems = [];
      return;
    }

    const faresByType = fareData.FaresByType || {};
    const allItems: FareItem[] = [];

    // 續約模式：日期統一用 Step 1 填的契約起訖，讓 user 自行調整
    const formStartDate = this.dataForm.get('tlt_bdate')?.value || new Date();
    const formEndDate = this.dataForm.get('tlt_edate')?.value || new Date();

    ['A', 'B', 'C', 'D', 'E'].forEach(type => {
      const items = faresByType[type] || [];
      items.forEach((item: any) => {
        allItems.push({
          ...item,
          id: undefined,
          apply_no: undefined,
          talent_id: undefined,
          cap_type: type as any,
          tpy_bdate: formStartDate,
          tpy_edate: formEndDate,
          _status: 'new' as DataStatus
        });
      });
    });

    this.wizardState.fareItems = allItems;
  }

  /**
   * 處理續約抽成資料 (Step 3)
   * 將 API 回傳的 ChargeSettings 映射為 TLS13010-v2 CommissionItem 格式，全部標記為 'new'
   */
  private processRenewalChargeData(chargeData: any): void {
    if (!chargeData) {
      this.wizardState.commissionItems = [];
      return;
    }

    const chargeSettings = chargeData.ChargeSettings || [];

    // 續約模式：日期統一用 Step 1 填的契約起訖
    const formStartDate = this.dataForm.get('tlt_bdate')?.value || new Date();
    const formEndDate = this.dataForm.get('tlt_edate')?.value || new Date();

    this.wizardState.commissionItems = chargeSettings.map((item: Record<string, unknown>) => {
      // 1. 先建立折扣設定項目（此時仍保留 TLTTENT 的舊 ID）
      const discountItems = this.buildCompleteDiscountItems(
        (item['ChargeDetails'] as Record<string, unknown>[]) || [],
        true  // forRenewal = true
      );

      // 2. 續約模式：將 TLTTENT 舊 ID 替換為臨時 ID，建立 oldId → newTempId 映射
      //    這樣 levelSettings 的 charged_id 可以正確對應到新的折扣設定
      const idMapping = new Map<string, string | number>();
      discountItems.forEach(di => {
        const oldId = String(di.id || '');
        if (oldId && !oldId.startsWith('temp_') && !oldId.startsWith('new_')) {
          const newId = this.generateTempId();
          idMapping.set(oldId, newId);
          di.id = newId;
        }
      });

      return {
        id: '',
        tlt_id: (item['tlt_id'] as string) || '',
        tlt_id_desc: (item['tlt_id_desc'] as string) || '',
        cag_taxtype: item['cag_taxtype'] ?? '',
        discountSummary: (item['discountSummary'] as string) || '',
        sst_amount: (item['sst_amount'] as number) || 0,
        sst_rate: (item['sst_rate'] as number) || 0,
        cap_saletype1: item['cap_saletype1'] === 'Y' || item['cap_saletype1'] === true,
        cap_saletype2: item['cap_saletype2'] === 'Y' || item['cap_saletype2'] === true,
        cap_saletype3: item['cap_saletype3'] === 'Y' || item['cap_saletype3'] === true,
        cap_saletype5: item['cap_saletype5'] === 'Y' || item['cap_saletype5'] === true,
        selectedSettingOption: (item['selectedSettingOption'] as string) || '',
        charge_rate: (item['charge_rate'] as number) || 0,
        cag_bdate: formStartDate || item['cag_bdate'] || '',
        cag_edate: formEndDate || item['cag_edate'] || '',
        cag_remark: item['cag_remark'] || '',
        remark: item['cag_remark'] || '',
        mainStartDate: formStartDate || item['cag_bdate'] || '',
        mainEndDate: formEndDate || item['cag_edate'] || '',
        discountSettingItems: discountItems,
        annualPerformanceItems: ((item['YearChargeDetails'] as unknown[]) || []).map((d: unknown) => {
          const detail = d as Record<string, unknown>;
          // 續約模式：移除 TLTTENT 的 id，避免送出舊合約 ID 給 TLTAPPLY
          const { id: _id, ID: _ID, ...rest } = detail;
          return {
            ...rest,
            extra_rate: this.convertRateToPercentage(Number(detail['extra_rate'] || detail['EXTRA_RATE'] || 0)),
            selected: (detail['is_selected'] ?? detail['selected'] ?? false) as boolean,
            _status: 'new' as DataStatus
          };
        }),
        discountLevelItems: ((item['LevelChargeDetails'] as unknown[]) || []).map((d: unknown) => {
          const detail = d as Record<string, unknown>;
          // 續約模式：移除 TLTTENT 的 id，charged_id 映射為新的臨時 ID
          const { id: _id, ID: _ID, ...rest } = detail;
          const oldChargedId = String(detail['charged_id'] || '');
          return {
            ...rest,
            charged_id: idMapping.get(oldChargedId) || oldChargedId,
            level_charge_rate: this.convertRateToPercentage(Number(detail['level_charge_rate'] || detail['LEVEL_CHARGE_RATE'] || 0)),
            selected: (detail['is_selected'] ?? detail['selected'] ?? detail['is_enabled'] ?? false) as boolean,
            is_configured: (detail['is_configured'] ?? true) as boolean,
            is_enabled: (detail['is_enabled'] ?? true) as boolean,
            _status: 'new' as DataStatus
          };
        }),
        detailItems: [],
        currentTab: 'discount',
        _status: 'new' as DataStatus
      } as unknown as V2CommissionItem;
    });
  }

  /**
   * 處理續約條件資料 (Step 4)
   * 使用 extractConditionItems 正確映射不同抽成類型的條件資料
   */
  private processRenewalConditionData(commissionData: any): void {
    if (!commissionData?.ExistingData) {
      this.wizardState.conditionItems = [];
      return;
    }

    const commissionType = this.currentCommissionType;

    // 一般抽成不需要條件資料
    if (commissionType === '3') {
      this.wizardState.conditionItems = [];
      return;
    }

    // 使用與編輯模式相同的 extractConditionItems 正確映射
    const items = this.extractConditionItems(commissionData.ExistingData, commissionType);

    // 續約模式：日期統一用 Step 1 填的契約起訖
    const formStartDate = this.dataForm.get('tlt_bdate')?.value || new Date();
    const formEndDate = this.dataForm.get('tlt_edate')?.value || new Date();

    this.wizardState.conditionItems = items.map((item: any) => ({
      ...item,
      id: undefined,
      apply_no: undefined,
      talent_id: undefined,
      cag_bdate: this.formatDateToString(formStartDate),
      cag_edate: this.formatDateToString(formEndDate),
      _status: 'new' as DataStatus
    }));
  }

  // ========== 步驟導航 ==========
  goToStep(visualIndex: number): void {
    const actualStep = this.stepIndexMap[visualIndex];
    if (actualStep === undefined) return;

    // 往前跳需驗證；往回跳不需驗證
    if (actualStep > this.currentStep && !this.validateCurrentStep()) {
      // 強制重設 p-steps 的視覺狀態（避免 header 與實際步驟不同步）
      const saved = this.currentStep;
      this.currentStep = -1;
      Promise.resolve().then(() => { this.currentStep = saved; });
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
    try {
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
    } catch (error) {
      console.error('[Wizard] 驗證錯誤:', error);
      this.messageService.errorBubble('驗證程序發生錯誤，請聯繫系統管理員');
      return false;
    }
  }

  private validateStep1(): boolean {
    // 清除未填位置編號的空列
    this.step1Component?.removeEmptyNewRows();

    this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

    const result = this.validatorService.validateStep1(this.dataForm, this.wizardState.locationData);
    if (!result.isValid) {
      this.submitted = true;
      if (this.step1Component) {
        this.step1Component.submitted = true;
      }
      const firstErrors = result.errors.slice(0, 3).map(e => e.message);
      const suffix = result.errors.length > 3 ? `...等 ${result.errors.length} 項` : '';
      this.messageService.warnBubble(`請修正：${firstErrors.join('、')}${suffix}`);
      return false;
    }

    // 警告（不阻擋流程）
    if (result.warnings.length > 0) {
      this.messageService.warnBubble(result.warnings.map(w => w.message).join('、'));
    }

    // 離開 Step 1 時，同步契約起訖日到 Steps 2-4
    this.syncContractDatesToSteps();

    return true;
  }

  private validateStep2(): boolean {
    if (this.isViewMode) return true;

    const contractRange = {
      tlt_bdate: this.dataForm.get('tlt_bdate')?.value,
      tlt_edate: this.dataForm.get('tlt_edate')?.value
    };
    const result = this.validatorService.validateStep2(this.wizardState.fareItems, contractRange);

    if (!result.isValid) {
      // 觸發 Step2 重新渲染以顯示錯誤標記
      this.wizardState.fareItems = [...this.wizardState.fareItems];
      this.messageService.warnBubble(result.errorMessages.join('\n'));
      return false;
    }
    return true;
  }

  private validateStep3(): boolean {
    if (this.isViewMode) return true;

    const result = this.validatorService.validateStep3(
      this.wizardState.commissionItems,
      this.currentCommissionType,
      this.dataForm.get('tlt_bdate')?.value,
      this.dataForm.get('tlt_edate')?.value
    );

    if (!result.isValid) {
      this.wizardState.commissionItems = [...this.wizardState.commissionItems];
      this.messageService.warnBubble(result.errorMessages.join('\n'));
      return false;
    }
    return true;
  }

  private validateStep4(): boolean {
    if (this.isViewMode) return true;

    const result = this.validatorService.validateStep4(
      this.wizardState.conditionItems,
      this.currentCommissionType
    );

    if (!result.isValid) {
      this.wizardState.conditionItems = [...this.wizardState.conditionItems];
      this.messageService.warnBubble(result.errorMessages.join('\n'));
      return false;
    }
    return true;
  }

  /**
   * Smart Sync: 同步 Step 1 的契約起訖日到 Steps 2-4
   * - 日期沒變就跳過（避免無效覆蓋）
   * - 跳過 _status === 'original' 的項目（保護使用者手動調整的既有資料）
   */
  private syncContractDatesToSteps(): void {
    const startDate = this.dataForm.get('tlt_bdate')?.value;
    const endDate = this.dataForm.get('tlt_edate')?.value;
    if (!startDate || !endDate) return;

    // 日期沒有變更就跳過同步
    if (this.areDatesEqual(startDate, this.lastSyncedStartDate) &&
      this.areDatesEqual(endDate, this.lastSyncedEndDate)) {
      return;
    }

    // Step 2: 代扣款（跳過既有項目）
    this.wizardState.fareItems = this.wizardState.fareItems.map(item =>
      item._status === 'original' ? item : { ...item, tpy_bdate: startDate, tpy_edate: endDate }
    );

    // Step 3: 抽成設定
    // mainStartDate/mainEndDate 永遠同步（作為複製功能的合約日期上限參考）
    // 折扣/年度/層級子項目：跳過既有已勾選項目（保護使用者手動調整的資料）
    this.wizardState.commissionItems = this.wizardState.commissionItems.map(item => {
      const updatedItem = {
        ...item,
        mainStartDate: startDate,
        mainEndDate: endDate,
      } as typeof item;

      if (item._status !== 'original') {
        updatedItem.cag_bdate = startDate;
        updatedItem.cag_edate = endDate;
        updatedItem.discountSettingItems = (item.discountSettingItems || []).map(d =>
          d._status === 'original' ? d : { ...d, tlt_bdate: startDate, tlt_edate: endDate }
        );
      }

      return updatedItem;
    });

    // Step 4: 租金設定（跳過既有項目）
    this.wizardState.conditionItems = this.wizardState.conditionItems.map(item =>
      item._status === 'original' ? item : {
        ...item,
        cag_bdate: this.formatDateToString(startDate),
        cag_edate: this.formatDateToString(endDate)
      }
    );

    // 更新追蹤日期
    this.lastSyncedStartDate = startDate;
    this.lastSyncedEndDate = endDate;
  }

  private areDatesEqual(date1: unknown, date2: unknown): boolean {
    if (date1 === date2) return true;
    if (!date1 || !date2) return false;
    if (date1 instanceof Date && date2 instanceof Date) {
      return date1.getTime() === date2.getTime();
    }
    return String(date1) === String(date2);
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
      const response = await this.apiService.submitFinalTLS12080(submitData).toPromise();

      if (response?.success) {
        // 組合詳細成功訊息（與 TLS13010-v2 一致）
        const formData = this.dataForm.getRawValue();
        const isInsert = this.isFormCreateable || this.isRenewalMode;

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
        this.messageService.errorBubble(response?.message || '意向書資料提交失敗');
      }
    } catch (error: any) {
      console.error('意向書資料提交失敗:', error);
      this.messageService.errorBubble(error.message || '意向書資料提交失敗');
    } finally {
      this.isSaving = false;
      this.messageService.unblockUi();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private assembleSubmitData(): any {
    const isIntentionLetter = this.dataForm?.get('contract_type')?.value === '2';

    return this.submitDataService.assembleSubmitData(
      this.dataForm.getRawValue(),
      this.wizardState.locationData,
      isIntentionLetter ? [] : this.wizardState.fareItems,
      isIntentionLetter ? [] : this.wizardState.commissionItems,
      isIntentionLetter ? [] : this.wizardState.conditionItems,
      this.isFormCreateable || this.isRenewalMode,
      this.isRenewalMode,
      this.currentCommissionType
    );
  }

  // ========== 事件處理 ==========
  onStep1DataChange(data: { formValue: any; locationData: LocationItem[] }): void {
    this.wizardState.locationData = data.locationData;
    this.wizardState.contractInfo = data.formValue as ContractInfo;
  }

  /**
   * 續約資料載入完成事件處理
   * Step1 呼叫 API 後 emit 完整的續約回應，在此處理 Step 2/3/4 的資料載入
   * Step1 的 BasicInfo + Locations 已由 Step1 自行處理
   */
  onRenewalDataLoaded(renewalData: RenewalQueryResponse): void {
    this.isRenewalMode = true;

    // 1. 保存續約 metadata
    this.wizardState.renewalData = {
      sourceContractId: renewalData.source_talent_id,
      sourceApplyNo: renewalData.source_apply_no,
      sourceContractSubno: renewalData.source_contract_subno,
      nextContractSubno: renewalData.next_contract_subno
    };

    // 2. 同步 contractInfo（Step1 已 patch 完表單）
    this.wizardState.contractInfo = this.dataForm.getRawValue() as ContractInfo;

    // 3. 處理 Step 2: 代扣款資料
    this.processRenewalFareData(renewalData.FareData);

    // 4. 處理 Step 3: 抽成資料
    this.processRenewalChargeData(renewalData.ChargeData);

    // 5. 處理 Step 4: 條件資料
    this.processRenewalConditionData(renewalData.CommissionData);

    // 6. 觸發 step1DataReady（讓中/小分類下拉載入）
    this.step1DataReady = true;

    // 7. 更新驗證器
    this.updateDynamicValidators();
    this.updatePaymentValidators();
  }

  onStep2DataChange(fareItems: FareItem[]): void {
    this.wizardState.fareItems = fareItems;
  }

  onStep3DataChange(commissionItems: V2CommissionItem[]): void {
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

  /**
   * Step 4 用的專櫃契約書資訊陣列
   */
  get contractInfoDataForStep4(): Record<string, unknown>[] {
    const formData = this.dataForm.getRawValue();
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
   * 取得「下一步」按鈕的動態標籤
   * 依照下一步的步驟名稱顯示，例如「下一步(代扣款設定)」
   */
  get nextStepLabel(): string {
    const nextVisualIndex = this.visualStepIndex + 1;
    if (nextVisualIndex >= this.steps.length) return '下一步';
    const nextStepName = this.steps[nextVisualIndex]?.label || '';
    return `下一步(${nextStepName})`;
  }

  /**
   * 離開（回到列表頁）
   */
  onClearAndExit(): void {
    this.router.navigate(['account/tls/tls12080'], {
      state: { fromRoute: '/tls/tls12080cru' }
    });
  }

  /**
   * 上一步：第一步時回列表，其餘回上一步
   */
  override onCancel(): void {
    if (this.isFirstStep) {
      this.router.navigate(['account/tls/tls12080'], {
        state: { fromRoute: '/tls/tls12080cru' }
      });
    } else {
      this.goToPreviousStep();
    }
  }

  /**
   * 將 API 小數費率轉換為百分比顯示值
   * 例：0.165 → 16.5，若已大於 1 則視為已轉換直接回傳
   */
  private convertRateToPercentage(rate: number): number {
    if (rate === null || rate === undefined) return 0;
    if (rate > 1) return rate;
    return rate * 100;
  }

  /**
   * 生成臨時 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 建立完整的折扣設定列表（包含所有折扣選項）
   * API 資料中存在的會被標記為 selected，不存在的則為未選取狀態
   * @param existingDetails 既有的折扣設定資料
   * @param forRenewal 是否為續約模式（續約模式會將所有項目標記為 'new'）
   */
  private buildCompleteDiscountItems(
    existingDetails: Record<string, unknown>[],
    forRenewal = false
  ): V2CommissionItem['discountSettingItems'] {
    // 日期預設：表單有值用表單，否則用今天
    const contractStartDate = this.dataForm.get('tlt_bdate')?.value || new Date();
    const contractEndDate = this.dataForm.get('tlt_edate')?.value || new Date();
    const result: V2CommissionItem['discountSettingItems'] = [];

    // 輔助函數：取得字串值
    const getString = (obj: Record<string, unknown>, key1: string, key2: string, defaultVal = ''): string => {
      return (obj[key1] || obj[key2] || defaultVal) as string;
    };

    // 續約模式下的狀態
    const existingStatus: DataStatus = forRenewal ? 'new' : 'original';

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
            id: existingItem['id'] as number | string || this.generateTempId(),
            selected: (existingItem['is_selected'] ?? existingItem['selected'] ?? true) as boolean,
            cag_barcode: getString(existingItem, 'cag_barcode', 'CAG_BARCODE', ''),
            tlt_bdate: forRenewal ? contractStartDate : ((existingItem['tlt_bdate'] || existingItem['TLT_BDATE'] || contractStartDate) as Date | string),
            tlt_edate: forRenewal ? contractEndDate : ((existingItem['tlt_edate'] || existingItem['TLT_EDATE'] || contractEndDate) as Date | string),
            cag_charge_rate: this.convertRateToPercentage(Number(existingItem['cag_charge_rate'] || existingItem['CAG_CHARGE_RATE'] || 0)),
            _status: existingStatus,
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
          _status: 'new' as DataStatus,
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

  // ========== 成功對話框 ==========
  onSuccessConfirm(): void {
    this.showSuccessDialog = false;
    this.router.navigate(['account/tls/tls12080'], { state: { fromRoute: 'account/tls/tls12080cru' } });
  }

  onSuccessDialogClose(visible: boolean): void {
    if (!visible) this.onSuccessConfirm();
  }
}
