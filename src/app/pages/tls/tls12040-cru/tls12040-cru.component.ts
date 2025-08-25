
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
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

// 2.1.2.4 專櫃要約書維護CRU
@Component({
  selector: 'app-tls12040-cru',
  templateUrl: './tls12040-cru.component.html',
  styleUrl: './tls12040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, CheckboxModule, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, CalendarRangeComponent, ButtonDynamicallyaddComponent, NgIf, TranslateModule, InputTextareaComponent, AccordionModule, ExpandableEditTableComponent, RadiobuttonComponent, MultiSelectComponent]
})
export class TLS12040CRUComponent extends BasicCrupageComponent implements OnInit {
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
  loading = false;

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
    total_amt: [''],
    total_amt_vendor: [''],
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
    credit_card: [''],
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
    construct_deposit: [''],
    construct_fees: [0], //施工保證金額
    expiration_deposit: [''],
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

  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit() {
    this.initializeDropdownOptions();
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
