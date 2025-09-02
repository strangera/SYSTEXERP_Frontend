
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CheckboxModule } from 'primeng/checkbox';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { AccordionModule } from "primeng/accordion";
import { ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { forkJoin } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TLS12040DetailModel, TLS12040RequestModel } from './models/tls12040-cru.model';
import { TLS12040Response } from '../tls12040/tls12040.component';

// 2.1.2.4 專櫃要約書維護CRU
@Component({
  selector: 'app-tls12040-cru',
  templateUrl: './tls12040-cru.component.html',
  styleUrl: './tls12040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, CheckboxModule, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, CalendarRangeComponent, ButtonDynamicallyaddComponent, NgIf, TranslateModule, InputTextareaComponent, AccordionModule, ExpandableEditTableComponent, RadiobuttonComponent, MultiSelectComponent]
})
export class TLS12040CRUComponent implements OnInit {
  ProgNo = 'TLS12040';
  formTitle = '';
  submitted = false;
  loading = false;
  crudstatus = CRUDStatus.Edit; // 固定為 Edit，避免表單被 disable

  // 用戶和權限
  user: any;
  funInfo: any;


  //寫死用getter API 用附值
  get decorationOptions() { return this.sharedDropdownService.decorationOptions; }  // 裝潢方式

  get moneyTypeOptions() { return this.sharedDropdownService.moneyTypeOptions; }  // 結帳方式

  get checkTypeOptions() { return this.sharedDropdownService.checkTypeOptions; }  // 對帳方式

  get storeWayOptions() { return this.sharedDropdownService.storeWayOptions; }  // 抽成別

  get paytypeOptions() { return this.sharedDropdownService.paytypeOptions; }  // 抽成別

  get invoiceTypeOptions() { return this.sharedDropdownService.invoiceTypeOptions; }  // 抽成別

  get tltKindOptions() { return this.sharedDropdownService.tltKindOptions; }  // 抽成別

  get tltopenflagOption() { return this.sharedDropdownService.openflagOptions; }  // 抽成別

  get commCompTypeDropdown() { return this.sharedDropdownService.commCompTypeOptions; }  // 抽成別

  get approveStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }  // 抽成別

  get yesNoOptions() { return this.sharedDropdownService.yesNoOptions; }  // 抽成別

  get tltTermTypeOptions() { return this.sharedDropdownService.tltTermTypeOptions; }  // 抽成別

  get tltctypemtotalOptions() { return this.sharedDropdownService.tltctypemtotalOptions; }  // 包底類別

  get totalAmtOptions() { return this.sharedDropdownService.totalAmtOptions; }  // 目標營業額單位(廠商)

  get totalAmtVendorOptions() { return this.sharedDropdownService.totalAmtVendorOptions; }  // 目標營業額單位(業主)

  get depositPaymentOptions() { return this.sharedDropdownService.depositPaymentOptions; }  // 保證金

  get overallStatusOptions() { return this.sharedDropdownService.overallStatusOptions; }

  // API 選項
  bustypeOptions: any[] = [];
  busClassOptions: any[] = [];
  busSClassOptions: any[] = [];
  buildingOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  orgOptions: any[] = [];
  locationOptions: any[] = [];
  paperTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  pos2013Options: any[] = [];
  negotiatorOptions: any[] = [];

  bankDropdownOptions: any[] = [];
  total_amt_unitOptions: any[] = [];
  total_amt_vendor_unit_options: any[] = [];

  // meterReadingOptions: any[] = [];

  tltctypemtotalOption: any[] = [];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    talent_id: [''], // 必填但系統自動給號
    apply_no: [''], // 必填但系統自動給號
    approve_status: ['1', [Validators.required]], // 必填，預設未審核
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]], // 必填
    tlt_no: [''], // 必填但系統自動給號
    ven_no: ['', [Validators.required, Validators.maxLength(16)]],
    ven_uniform: ['', [Validators.required, Validators.maxLength(10)]], // 必填
    VEN_Name: [''], // 必填但自動帶入
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_sclass: ['', [Validators.maxLength(2)]],
    contract_no: ['', [Validators.maxLength(12)]], // 必填
    contract_subno: ['', [Validators.required]], // 必填

    // 洽談階段資訊
    tlt_bdate: ['', [Validators.required]], // 必填
    tlt_edate: ['', [Validators.required]], // 必填
    contact_Date: [''],
    contact_USR_No: ['', [Validators.maxLength(16)]],
    contact_USR_Name: ['', [Validators.maxLength(20)]],
    feedback_date: [''],
    due_date: [''],
    // 營運資訊
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 必填
    tlt_contract_bdate: ['', [Validators.required]], // 必填
    tlt_contract_edate: ['', [Validators.required]], // 必填

    // 商務條件
    tlt_kind: [''],
    deco_type: [''],
    tlt_term_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    comm_comp_type: ['2', [Validators.required]], // 必填，預設值 '2'
    edc_yn: [''],
    tlt_ctype_mtotal: [''],
    overall_status: [''],
    rent_ahead: ['N'],
    rent_period: [0],
    base_rent: [0],
    deposit: [0],
    total_amt: [0],
    total_amt_vendor: [0],
    check_day: [0, [Validators.required]], // 必填，預設值 0
    // 業務設定
    comm_yn: ['N'],
    rece_yn: ['N'],
    pos_yn: ['N'],
    cash_yn: ['N'],
    money_type: ['', [Validators.maxLength(2)]],
    store_way: [''],
    check_typeList: [[] as string[]],
    paytype: [''],
    vip_yn: [''],
    credit_card: [0],
    invoice_type: ['', [Validators.required]], // 必填

    // 其他設定
    water_flag: [''],
    electric_flag: [''],
    gas_flag: [''],

    paymentMethods: [[]],
    ticket_remarks: ['', [Validators.maxLength(1000)]],

    // 聯絡資訊
    email: ['', [Validators.maxLength(100)]],
    invoice_email: ['', [Validators.maxLength(100)]],
    CHECK_TITLE: ['', [Validators.maxLength(100)]],
    store_tel: ['', [Validators.maxLength(50)]],
    bank_id: ['', [Validators.maxLength(10)]],
    vendor_acct_name: ['', [Validators.maxLength(60)]],
    vendor_acct_no: ['', [Validators.maxLength(16)]],
    contact_tel: ['', [Validators.maxLength(20)]],
    contact_fax: ['', [Validators.maxLength(15)]],
    contact_addr: ['', [Validators.maxLength(100)]],
    tlt_remark: ['', [Validators.maxLength(2000)]],

    // 狀態欄位
    tlt_openflag: [''],
    cap_saletype1: [''],
    cap_saletype2: [''],
    cap_saletype3: [''],
    cap_saletype4: [''],
    open_deposit: [''],
    open_fees: [0], //準時開業保證金
    construct_deposit: [0],
    construct_fees: [0], //施工保證金額
    expiration_deposit: [0],
    expiration_fees: [0], //契約屆滿保證金金額
    total_amt_unit: [''],
    total_amt_vendor_unit: [''],
    company_register_address: [''],
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    private sharedDropdownService: SharedDropdownService,
    private route: ActivatedRoute, // 新增
    private tls12040Service: TLS12040Service, // 新增
  ) { }

  ngOnInit() {
    this.initializeDropdownOptions();
    this.handleRouterState(); // 處理路由狀態
  }

  private handleRouterState(): void {
    console.log('🔍 開始處理路由狀態');

    const state = this.router.lastSuccessfulNavigation?.extras?.state;
    console.log('🔍 路由狀態:', state);

    if (state) {
      const rowdata = state['rowdata'] as TLS12040Response;
      const crudstatus = state['crudstatus'] as CRUDStatus;

      console.log('📋 rowdata:', rowdata);
      console.log('🔧 crudstatus:', crudstatus);

      if (rowdata && (rowdata.id || rowdata.apply_no)) {
        this.crudstatus = crudstatus;

        switch (crudstatus) {
          case CRUDStatus.Create:
            this.formTitle = '新增專櫃要約書';
            break;
          case CRUDStatus.Edit:
            this.formTitle = '編輯專櫃要約書';
            break;
          case CRUDStatus.Read:
            this.formTitle = '查看專櫃要約書';
            break;
          default:
            this.formTitle = '專櫃要約書維護';
            break;
        }

        console.log('✅ 準備調用 API 載入詳細資料');
        this.loadContractDetail(rowdata);
        return;
      }
    }

    // 沒有路由狀態，直接跳轉回列表頁
    console.warn('⚠️ 沒有找到路由狀態，返回列表頁面');
    this.messageService.warnBubble('無法載入資料，將返回列表頁面');
    setTimeout(() => {
      this.router.navigate(['account/tls/tls12040']);
    }, 2000);
  }
  /**
   * 處理載入錯誤的情況
   */
  private handleLoadError(): void {
    console.log('⚠️ 處理載入錯誤');

    // 3秒後返回列表頁面
    setTimeout(() => {
      this.router.navigate(['account/tls/tls12040']);
    }, 3000);
  }

  private loadContractDetail(rowData: TLS12040Response): void {
    console.log('🔄 開始載入合約詳細資料:', rowData);

    this.loading = true;

    // 構建 TLS12040RequestModel - 增加更多除錯資訊
    const request: TLS12040RequestModel = {
      id: rowData.id,
      apply_no: rowData.apply_no
    };
    // 檢查 tls12040Service 是否正確注入
    if (!this.tls12040Service) {
      console.error('❌ tls12040Service 未正確注入!');
      this.messageService.errorBubble('服務未正確初始化');
      this.loading = false;
      return;
    }
    this.tls12040Service.queryTLS12040Detail(request).subscribe({
      next: (response: any) => {
        if (response && response.Status === '0000' && response.Data) {
          console.log('✅ API 成功返回資料，開始填充表單');
          // 填充表單
          this.populateForm(response.Data);
          // 載入相依的下拉選單
          this.loadDependentDropdowns(response.Data);
          console.log('✅ 合約資料載入完成');
        } else {
          const errorMessage = response?.Message || '未知錯誤';
          console.error('❌ API 返回錯誤狀態:', {
            status: response?.Status,
            message: errorMessage,
            hasData: !!response?.Data
          });
          this.messageService.errorBubble(`載入資料失敗：${errorMessage}`);
          this.handleLoadError();
        }
      },
      error: (error) => {
        console.error('❌ API 請求發生錯誤:');
        console.error('- error object:', error);
        console.error('- error.status:', error.status);
        console.error('- error.statusText:', error.statusText);
        console.error('- error.message:', error.message);
        console.error('- error.error:', error.error);
        this.handleLoadError();
      },
      complete: () => {
        this.loading = false;
        console.log('🏁 API 請求流程完成');
      }
    });
  }



  private loadDependentDropdowns(data: TLS12040DetailModel): void {
    // 如果有大分類，載入對應的中分類
    if (data.bus_type) {
      this.onBusTypeChange(data.bus_type);
    }
    // 其他相依的下拉選單載入邏輯可以在這裡添加
    // 例如：根據組織載入對應的位置選項等
  }

  private populateForm(data: TLS12040DetailModel): void {
    // 基本資訊
    this.dataForm.patchValue({
      talent_id: data.talent_id,
      apply_no: data.apply_no,
      tlt_no: data.tlt_no,
      tlt_name: data.tlt_name,
      ven_uniform: data.ven_uniform,
      ven_no: data.ven_no,
      VEN_Name: data.VEN_Name,
      contract_subno: data.contract_subno,
      approve_status: data.approve_status,

      // 日期欄位
      tlt_bdate: data.tlt_bdate,
      tlt_edate: data.tlt_edate,
      tlt_contract_bdate: data.tlt_contract_bdate,
      tlt_contract_edate: data.tlt_contract_edate,
      feedback_date: data.feedback_date,
      due_date: data.due_date,
      contact_Date: data.contact_Date,

      // 分類與商務條件
      tlt_term_type: data.tlt_term_type,
      comm_comp_type: data.comm_comp_type,
      paper_type: data.paper_type,
      bus_type: data.bus_type,
      bus_class: data.bus_class,
      bus_sclass: data.bus_sclass,

      // 組織與人員
      org_id: data.org_id,
      contact_USR_No: data.contact_USR_No,
      contact_USR_Name: data.contact_USR_Name,

      // 其他條件
      deco_type: data.deco_type,
      money_type: data.money_type,
      check_typeList: data.check_typeList || [],
      edc_yn: data.edc_yn,
      tlt_openflag: data.tlt_openflag,
      comm_yn: data.comm_yn,
      rece_yn: data.rece_yn,
      pos_yn: data.pos_yn,
      cash_yn: data.cash_yn,
      store_way: data.store_way,
      paytype: data.paytype,
      vip_yn: data.vip_yn,

      // 費用相關
      base_rent: data.base_rent,
      deposit: data.deposit,
      credit_card: data.credit_card,
      check_day: data.check_day,
      open_fees: data.open_fees,
      total_amt: data.total_amt,
      total_amt_vendor: data.total_amt_vendor,
      construct_deposit: data.construct_deposit,
      construct_fees: data.construct_fees,
      expiration_deposit: data.expiration_deposit,
      expiration_fees: data.expiration_fees,
      open_deposit: data.open_deposit,

      // 其他設定
      invoice_type: data.invoice_type,
      tlt_kind: data.tlt_kind,
      tlt_ctype_mtotal: data.tlt_ctype_mtotal,
      overall_status: data.overall_status,
      rent_ahead: data.rent_ahead,
      rent_period: data.rent_period,
      water_flag: data.water_flag,
      electric_flag: data.electric_flag,
      gas_flag: data.gas_flag,

      // 聯絡資訊
      email: data.email,
      invoice_email: data.invoice_email,
      CHECK_TITLE: data.CHECK_TITLE,
      store_tel: data.store_tel,
      bank_id: data.bank_id,
      vendor_acct_name: data.vendor_acct_name,
      vendor_acct_no: data.vendor_acct_no,
      contact_tel: data.contact_tel,
      contact_fax: data.contact_fax,
      contact_addr: data.contact_addr,
      tlt_remark: data.tlt_remark,
      ticket_remarks: data.ticket_remarks,
      total_amt_unit: data.total_amt_unit,
      total_amt_vendor_unit: data.total_amt_vendor_unit,
      company_register_address: data.company_addr,

      // 狀態欄位
      cap_saletype1: data.cap_saletype1,
      cap_saletype2: data.cap_saletype2,
      cap_saletype3: data.cap_saletype3,
      cap_saletype4: data.cap_saletype4,
    });

    // // 載入分類資料（如果有 bus_type）
    // if (data.bus_type) {
    //   this.loadBusinessClassifications(data.bus_type, data.bus_class, data.bus_sclass);
    // }

    // 處理位置資訊（如果需要的話）
    // this.loadLocationData(data.locationInfo);
  }

  private initializeDropdownOptions() {
    // 固定選項不需要任何處理，直接通過 getter 使用

    // API 選項需要載入
    this.loadApiOptions();
  }

  private loadApiOptions() {
    this.loading = true;

    // 使用 Promise.all 或 forkJoin 同時載入多個選項
    const loadTasks = [
      this.sharedDropdownService.getBustypeOptions(),
      this.sharedDropdownService.getNegotiatorOptions(),
      this.sharedDropdownService.getBuildingOptions(),
      this.sharedDropdownService.getOrgOptions(),
      this.sharedDropdownService.getLocationOptions(),
      this.sharedDropdownService.getPaperTypeOptions(),
      this.sharedDropdownService.getVendorOptions(),
      this.sharedDropdownService.getBankOptions(),
    ];

    // 使用 forkJoin 等待所有載入完成
    forkJoin(loadTasks).subscribe({
      next: ([busTypes, negotiators, buildings, orgs, locations, paperTypes, vendors, banks]) => {
        this.bustypeOptions = busTypes;
        this.negotiatorOptions = negotiators;
        this.buildingOptions = buildings;
        this.orgOptions = orgs;
        this.locationOptions = locations;
        this.paperTypeOptions = paperTypes;
        this.vendorOptions = vendors;
        this.bankDropdownOptions = banks;
        this.loading = false;
      },
      error: (error) => {
        console.error('載入選項失敗:', error);
        // 確保即使失敗也有預設值
        this.bustypeOptions = [];
        this.negotiatorOptions = [];
        this.loading = false;
      }
    });
  }

  // 大分類變更時載入中分類（需要屬性方式）
  onBusTypeChange(busType: string) {
    this.busClassOptions = []; // 立即清空

    if (!busType) return;

    this.sharedDropdownService.getBusClassOptions(busType).subscribe({
      next: (options) => {
        this.busClassOptions = options;
      },
      error: (error) => {
        console.error('載入中分類失敗:', error);
        this.busClassOptions = [];
      }
    });
  }

  onCancel(): void {
    // const extras: NavigationExtras = {
    //   state: { fromRoute: this.router.url },
    // };
    // if (this.isViewMode) {
    //   this.contractFlowService.clearViewMode();
    //   this.router.navigate(['account/tls/tls13010'], extras);
    //   this.messageService.infoBubble('已退出檢視模式');
    //   return;
    // }

    // // 編輯模式：使用父類邏輯或自訂
    // if (this.dataForm.dirty) {
    //   // if (confirm('是否要儲存目前的編輯內容？')) {
    //   this.saveToWorkflow();
    //   // }
    // }
    // this.router.navigate(['account/tls/tls13010'], extras);
    this.router.navigate(['account/tls/tls12040']);
  }

  onSubmitNext(): void {
    // // 🔍 加入除錯代碼來找出問題
    // console.log('🚀 點擊下一步按鈕');
    // console.log('📋 表單狀態:', {
    //   valid: this.dataForm.valid,
    //   invalid: this.dataForm.invalid,
    //   errors: this.dataForm.errors
    // });

    // if (this.isViewMode) {
    //   // 檢視模式：直接導航，不帶參數
    //   this.router.navigate(['account/tls/tls13010next1']);
    //   return;
    // }

    // // 🔍 找出所有無效的欄位
    // const invalidControls: string[] = [];
    // Object.keys(this.dataForm.controls).forEach(key => {
    //   const control = this.dataForm.get(key);
    //   if (control && control.invalid && control.enabled) { // 只檢查啟用的控件
    //     invalidControls.push(key);
    //   }
    // });

    // if (invalidControls.length > 0) {
    //   // this.messageService.warnBubble(`請檢查以下欄位: ${invalidControls.join(', ')}`);
    //   this.messageService.warnBubble(`請檢查必填`);
    //   this.markFormGroupTouched(this.dataForm);
    //   return;
    // }

    // // 編輯模式的原有邏輯
    // if (this.dataForm.valid) {
    //   this.saveToWorkflow();
    //   this.router.navigate(['account/tls/tls13010next1']);
    // } else {
    //   this.saveToWorkflow();
    this.router.navigate(['account/tls/tls12040next1']);
  }

  onSubmit(frm: FormGroup): void {
    // this.submitted = true;
    // if (!frm.valid) {
    //   this.messageService.warnBubble('請檢查必填欄位');
    //   this.markFormGroupTouched(frm);
    //   return;
    // }
    // this.saveToWorkflow();
    // this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  hasCommissionTypeChanged(): boolean {
    // if (this.contractFlowService.isNewContractMode()) {
    //   return false;
    // }

    // const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
    // const originalCommissionType = originalData?.tlt_term_type?.toString().trim();
    // const currentCommissionType = this.dataForm.get('tlt_term_type')?.value?.toString().trim();

    // return originalCommissionType !== currentCommissionType;
    return false;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return this.getRequiredErrorMessage(fieldName);
      }
      if (field.errors['email']) return '請輸入正確的 Email 格式';
      if (field.errors['maxlength']) {
        return `最多可輸入 ${field.errors['maxlength'].requiredLength} 個字元`;
      }
      if (field.errors['min']) {
        return `最小值為 ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `最大值為 ${field.errors['max'].max}`;
      }
      if (field.errors['depositRequired']) {
        return '付款方式有值時此欄位為必填';
      }
    }
    return '';
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const requiredMessages: { [key: string]: string } = {
      'tlt_ctype_mtotal': '當前抽成別需要選擇包底類別',
      'base_rent': '預收租金為是時固定租金為必填',
      'CHECK_TITLE': '支票付款時票據抬頭為必填',
      'bank_id': '匯款付款時銀行代號為必填',
      'vendor_acct_name': '匯款付款時帳戶名稱為必填',
      'vendor_acct_no': '匯款付款時銀行帳號為必填',
      'credit_card': '配合聯名卡時聯名卡折數為必填',
      'open_fees': '履約保證金付款方式有值時此欄位為必填',
      'construct_fees': '施工保證金付款方式有值時此欄位為必填',
      'expiration_fees': '契約屆滿保證金付款方式有值時此欄位為必填'
    };

    return requiredMessages[fieldName] || '此欄位為必填';
  }

  canCopyAddress(): boolean {
    // 🎯 只要有公司登記地址且不是檢視模式就可以複製
    const hasAddress = !!this.getCompanyAddress();
    // const canEdit = !this.isViewMode;

    // console.log('🔍 檢查複製按鈕狀態:', {
    //   hasAddress,
    //   canEdit,
    //   isViewMode: this.isViewMode,
    //   address: this.getCompanyAddress()
    // });

    // return hasAddress && canEdit;
    return hasAddress;
  }

  getCompanyAddress(): string {
    const address = this.dataForm.get('company_register_address')?.value;
    const trimmedAddress = address?.trim() || '';

    return trimmedAddress;
  }

  copyCompanyAddressToContact(): void {
    const companyAddress = this.getCompanyAddress();

    if (!companyAddress) {
      this.messageService.warnBubble('公司登記地址為空，無法複製');
      return;
    }

    // // 檢查是否為檢視模式
    // if (this.isViewMode) {
    //   this.messageService.warnBubble('檢視模式下無法修改資料');
    //   return;
    // }

    // // 檢查郵寄地址是否已有值
    // const currentContactAddr = this.dataForm.get('contact_addr')?.value?.trim();
    // if (currentContactAddr) {
    //   if (!confirm('郵寄地址已有內容，確定要覆蓋嗎？')) {
    //     return;
    //   }
    // }

    // 複製地址
    this.dataForm.patchValue({
      contact_addr: companyAddress
    });

    // 標記欄位為已修改（觸發驗證樣式）
    this.dataForm.get('contact_addr')?.markAsTouched();
    this.dataForm.get('contact_addr')?.markAsDirty();

    // 自動儲存
    // this.saveToWorkflow();

    this.messageService.successBubble('已複製公司登記地址到郵寄地址');

    console.log('📋 地址複製完成:', {
      from: companyAddress,
      to: this.dataForm.get('contact_addr')?.value
    });
  }
}
