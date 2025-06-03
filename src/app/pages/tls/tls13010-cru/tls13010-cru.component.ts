// tls13010-cru.component.ts (改善後版本)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 工作流程服務
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';

// 下拉選單服務和選項
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';

// API 服務（參考主頁面需要的服務）
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';

// 其他可能需要的服務（根據你的表單欄位）
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BankAccountCodeService } from '../../../service/basic/bank-account-code.service';
import { AutoCompleteOption } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { BankService } from '../../../service/basic/bank.service';
import { BankOptionsService } from '../../../service/API/dropdownservice/bank-option.service';

interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_class: string;
  bus_class_name: string;
  bus_sclass: string;
  bus_sclass_name: string;
  bus_sclass_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // 地點資訊表格資料
  data: any[] = [
    {
      isNew: false,
      locationCode: 'B123',
      floor: '2樓',
      area: 'B區',
      businessArea: '100坪',
      startDate: '2023/12/01',
      endDate: '2024/11/30',
      performanceShare: 100,
    },
  ];

  filteredData: any[] = [...this.data];

  // 表格欄位配置
  columns: any[] = [
    {
      field: 'locationCode', header: '位置編號', visible: true, type: 'dropdown',
      options: [], // 將從 API 載入
    },
    { field: 'tlt_building', header: '館別', visible: true, type: 'dropdown' },
    { field: 'area_no', header: '區域', visible: true, type: 'dropdown' },
    {
      field: 'tlt_floor', header: '樓層', visible: true,
      type: 'dropdown',
      options: [], // 將從 API 載入
    },

    { field: 'businessArea', header: '營業坪數', visible: true, type: 'input' },
    { field: 'startDate', header: '使用起始日', visible: true, type: 'date' },
    { field: 'endDate', header: '使用截止日', visible: true, type: 'date' },
    { field: 'performanceShare', header: '業績分攤(%)', visible: true, type: 'input' },
  ];

  // 主要表單定義（加上驗證規則）
  dataForm = this.formBuilder.group({
    /** @description 合約ID */
    talent_id: [''],
    /** @description 專櫃招募編號 */
    apply_no: ['', [Validators.required]],

    // ========== 基本資訊 ==========
    /** @description 專櫃名稱 */
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
    /** @description 專櫃編號 */
    tlt_no: [{ value: '契約書審核後才給號', disabled: true }],
    /** @description 廠商統一編號 */
    ven_uniform: ['', [Validators.required]],
    /** @description 廠商名稱 */
    VEN_Name: [''],
    /** @description 營業型態 */
    paper_type: ['', [Validators.required]],
    /** @description 大分類 */
    bus_type: [''],
    /** @description 中分類 */
    bus_class: [''],
    /** @description 小分類 */
    bus_sclass: [''],
    /** @description 版本編號 */
    contract_subno: [''],

    // ========== 洽談階段資訊 ==========
    /** @description 合約起始日 */
    tlt_bdate: [''],
    /** @description 合約終止日 */
    tlt_edate: [''],
    /** @description 洽談日期 */
    contact_Date: [''],
    /** @description 洽談人員姓名 */
    contact_USR_Name: [''],
    /** @description 回函日期 */
    feedback_date: [''],
    /** @description 回函截止日 */
    due_date: [''],

    // ========== 營運資訊 ==========
    /** @description 組織代號 */
    org_id: [''],
    /** @description 營運起始日 */
    tlt_contract_bdate: [''],
    /** @description 營運截止日 */
    tlt_contract_edate: [''],

    // ========== 商務條件 ==========
    /** @description 櫃別 */
    tlt_kind: [''],
    /** @description 裝潢方式 */
    deco_type: [''],
    /** @description 抽成別 */
    tlt_term_type: [''],
    /** @description 抽成額計算方式，預設為除稅 */
    comm_comp_type: ['2', [Validators.required]],
    /** @description 是否使用業主商店代號 */
    edc_yn: [''],
    /** @description 包底類別 */
    tlt_ctype_mtotal: [''],
    /** @description 超出部份處理方式 */
    overall_status: [''],
    /** @description 預收租金 */
    rent_ahead: [''],
    /** @description 預收租金期數 */
    rent_period: [''],
    /** @description 固定租金 */
    base_rent: [''],
    /** @description 押金 */
    deposit: [''],
    /** @description 年目標營業額(業主) */
    total_amt: [''],
    /** @description 年預估營業額(廠商) */
    total_amt_vendor: [''],
    /** @description 施工保證金 */
    construct_fees: [''],
    /** @description 付款期限(天數) */
    check_day: [''],

    // ========== 業務設定 ==========
    /** @description 是否為抽成 */
    comm_yn: [''],
    /** @description 是否開立業主發票 */
    rece_yn: [''],
    /** @description 是否使用業主收銀機 */
    pos_yn: [''],
    /** @description 是否為業主收現 */
    cash_yn: [''],
    /** @description 結帳方式 */
    money_type: [''],
    /** @description 配合方式 */
    store_way: [''],
    /** @description 對帳方式 */
    check_type: [''],
    /** @description 付款方式 */
    paytype: [''],
    /** @description 是否配合聯名卡 */
    vip_yn: [''],
    /** @description 聯名卡折數 */
    credit_card: [''],
    /** @description 請款單據別 */
    invoice_type: ['1'],

    // ========== 其他設定 ==========
    /** @description 抄表類型清單 */
    meter_typeList: [[]],
    /** @description 保證金付款方式 */
    paymentMethods: [[]],
    /** @description 保證金備註 */
    ticket_remarks: [''],

    // ========== 聯絡資訊 ==========
    /** @description 電子信箱 */
    email: ['', [Validators.email]],
    /** @description 發票電子郵件 */
    invoice_email: ['', [Validators.email]],
    /** @description 票據抬頭 */
    CHECK_TITLE: [''],
    /** @description 專櫃電話號碼 */
    store_tel: [''],
    /** @description 廠商匯款銀行代號 */
    bank_id: [''],
    /** @description 廠商帳戶名稱 */
    vendor_acct_name: [''],
    /** @description 廠商銀行帳號 */
    vendor_acct_no: [''],
    /** @description 公司電話號碼 */
    contact_tel: [''],
    /** @description 公司傳真號碼 */
    contact_fax: [''],
    /** @description 郵寄地址 */
    contact_addr: [''],
    /** @description 備註 */
    tlt_remark: [''],

    tlt_openflag: [''], // 預設為開啟
    activity1: [''],
    activity2: [''],
    activity3: [''],
    activity4: [''],

    // ========== 新增：銀行 AutoComplete 相關屬性 ==========
    /** @description 選中的銀行資訊 */
    selectedBankInfo: null
  });

  // ========== 固定下拉選單選項 (從 constants 來的) ==========
  decorationOptions = [...TLS13010_DROPDOWN_OPTIONS.decorationType];
  moneyTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  checkTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.checkType];
  yesNoOptions = [...TLS13010_DROPDOWN_OPTIONS.yesNo];
  meterTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.meterType];
  paytypeOptions = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  storeWayOptions = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  invoiceTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.invoiceType];
  tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind];
  openflagStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  depositPaymentOptions = [...TLS13010_DROPDOWN_OPTIONS.depositPayment];
  commissionCompTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.commissionCompType];
  businessTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.businessType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  // ========== API 載入的下拉選單選項 ==========
  vendorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  negotiatorOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  organizationOptions: any[] = [];
  bankOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  commissionCalculationOptions: any[] = [];

  // ========== 新增：中分類和小分類選項 ==========
  busClassOptions: any[] = []; // 中分類選項
  busSClassOptions: any[] = []; // 小分類選項

  // 訂閱管理
  private subscriptions: Subscription[] = [];
  selectedBankInfo: AutoCompleteOption | null = null;

  constructor(
    public override router: Router,
    private contractFlowService: ContractFlowService,
    public tls13010DropdownService: TLS13010DropdownService,

    // API 服務
    private vendorService: VendorService,
    private contractStatusService: ContractStatusService,
    private negotiatorService: UserCodeService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    private counterCategoryService: CounterCategoryService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private bankAccountCodeService: BankAccountCodeService,

    // ========== 新增：銀行 API 服務 ==========
    private bankService: BankOptionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入下拉選單選項
    this.loadDropdownOptions();

    // 載入工作流程資料
    this.loadWorkflowData();

    // 監聽表單變化並自動儲存
    this.setupAutoSave();

    // 監聽大分類變化
    this.setupBusTypeListener();
  }

  ngOnDestroy(): void {
    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 載入下拉選單選項（參考主頁面的做法）
   */
  private loadDropdownOptions(): void {
    // 廠商選項
    this.vendorService.getVendors().subscribe({
      next: (data) => {
        this.vendorOptions = data;
        console.log('廠商選項載入完成:', this.vendorOptions.length);
      },
      error: (err) => console.warn('載入廠商選項失敗:', err)
    });

    // 合約狀態選項
    this.contractStatusService.getContractStatuses().subscribe({
      next: (data) => {
        this.contractStatusOptions = data;
      },
      error: (err) => console.warn('載入合約狀態選項失敗:', err)
    });

    // // 洽談者選項
    // this.negotiatorService.getUsers().subscribe({
    //   next: (data: any[]) => {
    //     this.negotiatorOptions = data;
    //   },
    //   error: (err: any) => console.warn('載入洽談者選項失敗:', err)
    // });

    // 結帳方式選項
    this.settlementMethodService.getSettlementMethods().subscribe({
      next: (data) => {
        this.settlementMethodOptions = data;
      },
      error: (err) => console.warn('載入結帳方式選項失敗:', err)
    });

    // 付款方式選項
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (data) => {
        this.paymentMethodOptions = data;
      },
      error: (err) => console.warn('載入付款方式選項失敗:', err)
    });

    // 配合方式選項
    this.cooperationMethodService.getCooperationMethods().subscribe({
      next: (data) => {
        this.cooperationMethodOptions = data;
      },
      error: (err) => console.warn('載入配合方式選項失敗:', err)
    });

    // 櫃別選項
    this.counterCategoryService.getCounterCategories().subscribe({
      next: (data) => {
        this.counterCategoryOptions = data;
      },
      error: (err) => console.warn('載入櫃別選項失敗:', err)
    });

    // 大分類選項
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe({
      next: (data) => {
        this.businessTypeCodeOptions = data;
      },
      error: (err) => console.warn('載入大分類選項失敗:', err)
    });

    // 組織選項
    this.organizationNumberService.getOrganizationNumbers().subscribe({
      next: (data) => {
        this.organizationOptions = data;
      },
      error: (err) => console.warn('載入組織選項失敗:', err)
    });

    // 更新表格欄位的選項
    this.updateTableColumnOptions();
  }

  /**
   * 更新表格欄位的下拉選項
   */
  private updateTableColumnOptions(): void {
    // 位置編號選項
    const locationColumn = this.columns.find(col => col.field === 'locationCode');
    if (locationColumn) {
      locationColumn.options = this.tls13010DropdownService.locationOptions;
    }

    // 樓層選項
    const floorColumn = this.columns.find(col => col.field === 'floor');
    if (floorColumn) {
      floorColumn.options = this.tls13010DropdownService.floorOptions;
    }
  }

  /**
   * 載入工作流程資料
   */
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();
    console.log('載入工作流程資料:', workflowData);

    if (workflowData.contractId) {
      const savedFormData = this.contractFlowService.getStep1Data();
      console.log('載入表單資料:', savedFormData);

      if (savedFormData && Object.keys(savedFormData).length > 0) {
        this.dataForm.patchValue(savedFormData);

        // ========== 修正：載入對應的分類選項 ==========
        const busType = savedFormData.bus_type;
        const busClass = savedFormData.bus_class;

        if (busType) {
          console.log('載入已儲存資料中的大分類，開始載入中分類:', busType);
          this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
            next: (options) => {
              console.log('從已儲存資料載入中分類完成:', options.length);

              // 如果還有中分類，載入小分類
              if (busClass) {
                console.log('載入已儲存資料中的中分類，開始載入小分類:', busClass);
                this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
                  next: (sClassOptions) => {
                    console.log('從已儲存資料載入小分類完成:', sClassOptions.length);
                  },
                  error: (error) => {
                    console.warn('從已儲存資料載入小分類失敗:', error);
                  }
                });
              }
            },
            error: (error) => {
              console.warn('從已儲存資料載入中分類失敗:', error);
            }
          });
        }

        console.log('使用已儲存的表單資料');
      } else if (workflowData.queryRowData) {
        this.loadDataFromQueryResult(workflowData.queryRowData);
        console.log('使用查詢結果初始化表單');
      }

      if (workflowData.locationInfo && workflowData.locationInfo.length > 0) {
        this.data = workflowData.locationInfo;
        this.filteredData = [...this.data];
      }
    } else {
      console.warn('沒有工作流程資料，重導向到查詢頁面');
      this.router.navigate(['/TLS/TLS13010']);
    }
  }
  // 修正 loadDataFromQueryResult() 方法

  private loadDataFromQueryResult(queryData: any): void {
    console.log('從查詢結果載入資料:', queryData);

    this.dataForm.patchValue({
      // 隱藏的ID欄位
      talent_id: queryData.talent_id,
      apply_no: queryData.apply_no,

      // 基本資訊
      tlt_name: queryData.tlt_name,
      tlt_no: queryData.tlt_no,
      VEN_Name: queryData.VEN_Name,
      ven_uniform: queryData.ven_uniform,
      paper_type: queryData.paper_type,
      bus_type: queryData.bus_type,
      bus_class: queryData.bus_class,
      bus_sclass: queryData.bus_sclass,
      contract_subno: queryData.contract_subno,

      // 合約資訊
      feedback_date: queryData.feedback_date,
      due_date: queryData.due_date,
      tlt_bdate: queryData.tlt_bdate,
      tlt_edate: queryData.tlt_edate,
      contact_Date: queryData.contact_Date,
      tlt_contract_bdate: queryData.tlt_contract_bdate,
      tlt_contract_edate: queryData.tlt_contract_edate,

      // 其他欄位
      deco_type: queryData.deco_type,
      money_type: queryData.money_type,
      check_type: queryData.check_type,
      tlt_term_type: queryData.tlt_term_type,
      comm_comp_type: queryData.comm_comp_type || '2', // 預設為除稅
      store_way: queryData.store_way,
      rece_yn: queryData.rece_yn,
      pos_yn: queryData.pos_yn,
      cash_yn: queryData.cash_yn,
      org_id: queryData.org_id,
      overall_status: queryData.overall_status,
      paytype: queryData.paytype,
      invoice_type: queryData.invoice_type || '1', // 預設為發票
      email: queryData.email,
      invoice_email: queryData.invoice_email,
      CHECK_TITLE: queryData.CHECK_TITLE,
      store_tel: queryData.store_tel,
      bank_id: queryData.bank_id,
      vendor_acct_name: queryData.vendor_acct_name,
      vendor_acct_no: queryData.vendor_acct_no,
      contact_tel: queryData.contact_tel,
      contact_fax: queryData.contact_fax,
      contact_addr: queryData.contact_addr,
      tlt_remark: queryData.tlt_remark,
    });

    // ========== 修正：載入對應的分類選項 ==========
    const busType = queryData.bus_type;
    const busClass = queryData.bus_class;

    if (busType) {
      console.log('查詢結果有大分類，開始載入中分類:', busType);
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: (options) => {
          console.log('從查詢結果載入中分類完成:', options.length);

          // 如果還有中分類，載入小分類
          if (busClass) {
            console.log('查詢結果有中分類，開始載入小分類:', busClass);
            this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
              next: (sClassOptions) => {
                console.log('從查詢結果載入小分類完成:', sClassOptions.length);
              },
              error: (error) => {
                console.warn('從查詢結果載入小分類失敗:', error);
              }
            });
          }
        },
        error: (error) => {
          console.warn('從查詢結果載入中分類失敗:', error);
        }
      });
    }
  }

  /**
   * 設定自動儲存
   */
  private setupAutoSave(): void {
    // 監聽表單變化，延遲儲存（避免過於頻繁）
    const formSubscription = this.dataForm.valueChanges.pipe(
      // 可以加上 debounceTime(1000) 來延遲儲存
    ).subscribe(() => {
      this.saveToWorkflow();
    });

    this.subscriptions.push(formSubscription);
  }

  /**
   * 儲存到工作流程
   */
  private saveToWorkflow(): void {
    if (this.dataForm.dirty) {
      const formData = this.dataForm.getRawValue(); // 包含 disabled 欄位

      // 合併地點資訊
      const workflowData = {
        ...formData,
        locationInfo: this.data // 地點資訊
      };

      this.contractFlowService.saveStep1Data(workflowData);
      console.log('自動儲存表單資料到工作流程');
    }
  }

  /**
   * 手動儲存
   */
  onSave(): void {
    this.saveToWorkflow();
    this.messageService.successBubble('資料已儲存');
  }

  /**
   * 提交表單
   */
  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (!frm.valid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(frm);
      return;
    }

    // 儲存到工作流程
    this.saveToWorkflow();
    this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  /**
   * 標記所有欄位為已觸碰（顯示驗證錯誤）
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * 下一步
   */
  onSubmitNext(): void {
    if (this.dataForm.valid) {
      this.saveToWorkflow();
      this.router.navigate(['/TLS/TLS13010NEXT1']);
      this.messageService.infoBubble('進入下一步：代扣款設定');
    } else {
      this.submitted = true;
      this.markFormGroupTouched(this.dataForm);
      this.messageService.warnBubble('請完成必填欄位後再進入下一步');
    }
  }

  /**
   * 上一步 / 取消
   */
  override onCancel(): void {
    // 詢問是否要儲存草稿
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
        this.messageService.infoBubble('已儲存草稿');
      }
    }

    this.router.navigate(['/TLS/TLS13010']);
  }

  /**
   * 清除表單
   */
  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？此操作無法復原。')) {
      this.dataForm.reset();

      // 重新設定預設值
      this.dataForm.patchValue({
        comm_comp_type: '2', // 預設為除稅
        invoice_type: '1'    // 預設為發票
      });

      this.data = []; // 清除地點資訊
      this.filteredData = [];

      // 清除工作流程中的資料
      this.contractFlowService.clearTempData();

      this.messageService.infoBubble('表單已清除');
    }
  }

  /**
   * 計算業績分攤
   */
  calculatePerformanceShare(): void {
    console.log('計算業績分攤');

    // 根據營業坪數計算業績分攤比例
    const totalArea = this.data.reduce((sum, item) => {
      const area = parseFloat(item.businessArea) || 0;
      return sum + area;
    }, 0);

    if (totalArea > 0) {
      this.data.forEach(item => {
        const area = parseFloat(item.businessArea) || 0;
        item.performanceShare = Math.round((area / totalArea) * 100);
      });

      this.filteredData = [...this.data];
      this.saveToWorkflow(); // 自動儲存

      this.messageService.successBubble('業績分攤計算完成');
    } else {
      this.messageService.warnBubble('請先輸入營業坪數');
    }
  }

  /**
   * 表單驗證輔助方法
   */
  canQuery(): boolean {
    return true;
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  /**
   * 取得工作流程狀態 (用於 template 顯示)
   */
  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  /**
   * 取得進度百分比 (用於 template 顯示)
   */
  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }

  /**
   * 檢查欄位是否有錯誤
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  /**
   * 取得欄位錯誤訊息
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return '此欄位為必填';
      if (field.errors['email']) return '請輸入正確的 Email 格式';
      if (field.errors['maxlength']) return `最多可輸入 ${field.errors['maxlength'].requiredLength} 個字元`;
    }
    return '';
  }

  // ========== 以下保留您原有的 FormArray 相關方法 ==========

  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]),
  });

  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      systemTypeDetailOptions: [],
      organizationNumberOptions: [],
      LocationCodeOptions: [],
      useStartDate: [],
      useEndDate: [],
      Performancesharing: [],
      floor: [{ value: '選完位置編號自動帶入', disabled: true }],
      area: [{ value: '選完位置編號自動帶入', disabled: true }],
      squaremeters: [{ value: '選完位置編號自動帶入', disabled: true }],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  private setupBusTypeListener(): void {
    // 監聽大分類變化
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges.subscribe(busType => {
      console.log('大分類變化:', busType);

      if (busType) {
        // 載入中分類
        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: any[]) => {
            console.log('中分類載入完成:', options.length);

            // 檢查當前中分類是否還有效
            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find((option: { value: string | null | undefined; }) => option.value === currentBusClass);

            if (currentBusClass && !validBusClass) {
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => {
            console.error('載入中分類失敗:', error);
            this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類');
          }
        });
      } else {
        // 清空中分類和小分類
        this.tls13010DropdownService.clearBusClassOptions();
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_class')?.setValue('');
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    // 新增：監聽中分類變化
    const busClassSubscription = this.dataForm.get('bus_class')?.valueChanges.subscribe(busClass => {
      console.log('中分類變化:', busClass);

      const busType = this.dataForm.get('bus_type')?.value;

      if (busType && busClass) {
        // 載入小分類
        this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
          next: (options: any[]) => {
            console.log('小分類載入完成:', options.length);

            // 檢查當前小分類是否還有效
            const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
            const validBusSClass = options.find((option: { value: string | null | undefined; }) => option.value === currentBusSClass);

            if (currentBusSClass && !validBusSClass) {
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => {
            console.error('載入小分類失敗:', error);
            this.messageService.warnBubble('載入小分類選項失敗，請重新選擇中分類');
          }
        });
      } else {
        // 清空小分類
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    // 加入訂閱管理
    if (busTypeSubscription) {
      this.subscriptions.push(busTypeSubscription);
    }
    if (busClassSubscription) {
      this.subscriptions.push(busClassSubscription);
    }
  }
  /**
 * 新增：供 template 使用的輔助方法
 */
  onRefreshBusClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: () => this.messageService.infoBubble('中分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類');
    }
  }

  /**
   * 重新載入小分類選項
   */
  onRefreshBusSClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    const busClass = this.dataForm.get('bus_class')?.value;

    if (busType && busClass) {
      this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
        next: () => this.messageService.infoBubble('小分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類和中分類');
    }
  }

  /**
   * 銀行選擇事件處理
   */
  onBankSelect(selectedBank: AutoCompleteOption): void {
    console.log('選擇的銀行:', selectedBank);
    this.selectedBankInfo = selectedBank;

    // 更新表單中的銀行相關欄位
    this.dataForm.patchValue({
      bank_id: selectedBank.value
    });

    // 自動儲存
    this.saveToWorkflow();
  }

  /**
   * 銀行取消選擇事件處理
   */
  onBankUnselect(): void {
    console.log('取消選擇銀行');
    this.selectedBankInfo = null;

    // 清空表單中的銀行相關欄位
    this.dataForm.patchValue({
      bank_id: ''
    });

    // 自動儲存
    this.saveToWorkflow();
  }

  /**
 * 銀行搜尋方法
 */
  searchBankOptions(searchKeyword: string): Observable<string[]> {
    return this.bankService.getBankOptions(searchKeyword).pipe(
      map((data: any[]) => data.map(item => `${item.value}${item.label}`))
    );
  }
}
