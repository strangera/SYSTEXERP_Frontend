import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared

import { ValidationService } from '../../../shared/service/validation.service';

// 使用共用服務和常數
import { SharedDropdownService } from '../../../shared/services/shared-dropdown.service';
import {
  formatDecoType,
  formatMoneyType,
  formatApproveStatus,
  formatOpenflagStatus,
  formatTltTermType,
  formatStoreWay,
  formatPaytype,
  formatTltKind
} from '../../../shared/constants/business.constants';

// UI Components
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TLS12040QueryRequest } from './models/tls12040.model';

// 2.1.2.4 專櫃要約書維護
export interface ContractItem {
  id: number;
  mid: number;

  /** 專櫃招募編號 (YYYYMMDD+3碼流水號) */
  apply_no: string;

  /** 專櫃編號 */
  tlt_no: string;

  /** 專櫃名稱 */
  tlt_name: string;

  /** 合約狀態 */
  apply_type: string;

  /** 營業狀態: 0=已撤櫃, 1=營運中, 9=核准時合約尚未開始 */
  tlt_openflag: string;

  /** 是否可編輯 (當 approve_status = 1 時為 true) */
  CanEdit: boolean;
}

@Component({
  selector: 'app-tls12040',
  templateUrl: './tls12040.component.html',
  styleUrl: './tls12040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    CheckboxModule,
    TableComponent,
    TranslateModule
  ]
})
export class TLS12040Component extends BasicQueryPageComponent<ContractItem> implements OnInit {

  // 查詢表單
  queryForm = this.formBuilder.group({
    apply_no: [, [Validators.maxLength(8)]], // 專櫃招募編號
    bus_type: [], // 大分類代號
    tlt_no: [, []], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(50)]], // 櫃位名稱
    ven_uniform: [], // 廠商統一編號
    location_no: [], // 位置編號
    contract_subno_from: [, [Validators.max(12)]], // 版本編號
    contract_subno_to: [, [Validators.max(12)]], // 版本編號
    approve_status: [], // 合約狀態
    area_no: [], // 區域
    tlt_floor: [], // 樓層
    contact_USR_No: [], // 洽談者
    org_id: [], // 組織代碼
    tlt_openflagList: [[]], // 營運狀況
    comm_comp_type: [[]], // 抽成計算方式
    feedback_date_from: [], // 回函日期
    feedback_date_to: [], // 回函日期
    due_date_from: [], // 回函截止日
    due_date_to: [], // 回函截止日
    contact_Date_from: [], // 洽談日期
    contact_Date_to: [], // 洽談日期
    paper_typeList: [[]], // 營業型態
    tlt_bdate_start_from: [], // 契約起始日
    tlt_bdate_end_to: [], // 契約起始日
    tlt_edate_start_from: [], // 契約截止日
    tlt_edate_end_to: [], // 契約截止日
    tlt_contract_bdate_from: [], // 營運起始日
    tlt_contract_bdate_to: [], // 營運起始日
    tlt_contract_edate_from: [], // 營運截止日
    tlt_contract_edate_to: [], // 營運截止日
    tlt_kindList: [[]], // 櫃別
    deco_typeList: [[]], // 裝潢方式
    tlt_term_typeList: [[]], // 抽成別
    money_typeList: [[]], // 結帳方式
    paytypeList: [[]], // 付款方式
    store_wayList: [[]], // 配合方式
    rece_yn: [false], // 是否開立業主發票
    pos_yn: [false], // 是否使用業主收銀機
    cash_yn: [false], // 是否為業主收現
  });

  // 表格資料
  data: ContractItem[] = [];
  filteredData: ContractItem[] = [...this.data];
  totalRecords: number = 0;
  columns: Column[] = [
    { field: 'apply_no', header: '專櫃招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'apply_type', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'tlt_openflag', header: '營運狀況', visible: true, format: formatOpenflagStatus }
  ];

  // ========== 下拉選單選項 ==========
  // 從 API 載入的選項
  industryCodeOptions: any[] = [];      // 大分類
  vendorUIDOptions: any[] = [];         // 廠商
  locationNumberOptions: any[] = [];    // 位置
  regionOptions: any[] = [];            // 區域
  floorOptions: any[] = [];             // 樓層
  negotiatorOptions: any[] = [];        // 洽談者
  organizationCodeOptions: any[] = [];  // 組織
  operatingStatusOptions: any[] = [];   // 營運狀態
  businessTypeOptions: any[] = [];      // 營業型態

  bankDropdownOptions: any[] = [];      // 銀行

  // 從共用服務取得的固定選項 (不需要 API)
  get decorationStyleOptions() { return this.sharedDropdownService.decorationOptions; }  // 裝潢方式
  get checkoutOptions() { return this.sharedDropdownService.moneyTypeOptions; }          // 結帳方式
  get paymentOptions() { return this.sharedDropdownService.paytypeOptions; }             // 付款方式
  get cooerationTypeOptions() { return this.sharedDropdownService.storeWayOptions; }     // 配合方式
  get counterTypeOptions() { return this.sharedDropdownService.tltKindOptions; }         // 櫃別
  get chargeTypeOptions() { return this.sharedDropdownService.tltTermTypeOptions; }      // 抽成別
  get calculationMethodOptions() { return this.sharedDropdownService.commCompTypeOptions; } // 抽成計算方式
  get approvalStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }   // 合約狀態
  // get depositPaymentOptions() { return this.sharedDropdownService.depositPaymentOptions; }   // 保證金
  // get overallStatusOptions() { return this.sharedDropdownService.overallStatusOptions; }

  constructor(
    private validationService: ValidationService,
    private apiService: TLS12040Service,
    public sharedDropdownService: SharedDropdownService, // 注入共用服務
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12040', '/tls/tls12040cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入下拉選單選項
    this.loadDropdownOptions();
  }

  /**
   * 載入下拉選單選項 - 單個載入方式
   */
  private loadDropdownOptions(): void {
    console.log('🚀 開始載入 TLS12040 下拉選單選項');

    // 載入大分類
    this.sharedDropdownService.getBustypeOptions().subscribe({
      next: (options) => {
        this.industryCodeOptions = options;
        console.log('✅ 大分類選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 大分類載入失敗:', error);
        this.industryCodeOptions = [];
      }
    });

    // 載入廠商選項
    this.sharedDropdownService.getVendorOptions('1').subscribe({
      next: (options) => {
        this.vendorUIDOptions = options;
        console.log('✅ 廠商選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 廠商選項載入失敗:', error);
        this.vendorUIDOptions = [];
      }
    });

    // 載入位置選項
    this.sharedDropdownService.getLocationOptions().subscribe({
      next: (options) => {
        this.locationNumberOptions = options;
        console.log('✅ 位置選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 位置選項載入失敗:', error);
        this.locationNumberOptions = [];
      }
    });

    // 載入區域選項
    this.sharedDropdownService.getRegionOptions().subscribe({
      next: (options) => {
        this.regionOptions = options;
        console.log('✅ 區域選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 區域選項載入失敗:', error);
        this.regionOptions = [];
      }
    });

    // 載入樓層選項
    this.sharedDropdownService.getFloorOptions().subscribe({
      next: (options) => {
        this.floorOptions = options;
        console.log('✅ 樓層選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 樓層選項載入失敗:', error);
        this.floorOptions = [];
      }
    });

    // 載入洽談者選項
    this.sharedDropdownService.getNegotiatorOptions().subscribe({
      next: (options) => {
        this.negotiatorOptions = options;
        console.log('✅ 洽談者選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 洽談者選項載入失敗:', error);
        this.negotiatorOptions = [];
      }
    });

    // 載入組織選項
    this.sharedDropdownService.getOrgOptions().subscribe({
      next: (options) => {
        this.organizationCodeOptions = options;
        console.log('✅ 組織選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 組織選項載入失敗:', error);
        this.organizationCodeOptions = [];
      }
    });

    // 載入營業型態
    this.sharedDropdownService.getPaperTypeOptions('T101').subscribe({
      next: (options) => {
        this.businessTypeOptions = options;
        console.log('✅ 營業型態選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 營業型態載入失敗:', error);
        this.businessTypeOptions = [];
      }
    });

    // 載入銀行選項
    this.sharedDropdownService.getBankOptions().subscribe({
      next: (options) => {
        this.bankDropdownOptions = options;
        console.log('✅ 銀行選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 銀行選項載入失敗:', error);
        this.bankDropdownOptions = [];
      }
    });
  }

  /**
   * 大分類改變時載入中分類 - 示範依賴關係的載入
   */
  onBusTypeChange(selectedBusType: string): void {
    if (!selectedBusType) {
      // 清空中分類選項 (如果有的話)
      return;
    }

    console.log('🔄 大分類改變，載入對應中分類:', selectedBusType);

    this.sharedDropdownService.getBusClassOptions(selectedBusType).subscribe({
      next: (options) => {
        // 如果有中分類欄位的話，在這裡設定
        console.log('✅ 中分類選項已載入:', options.length);
      },
      error: (error) => {
        console.error('❌ 中分類載入失敗:', error);
      }
    });
  }

  /**
   * 查詢功能
   */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const queryRequest: TLS12040QueryRequest = {
        ...formValue,
        // 營運狀況轉換為陣列
        tlt_openflagList: formValue.operatingStatus ? [formValue.operatingStatus] : [],

        // Y/N 欄位轉換 - 只有勾選才傳值
        rece_yn: formValue.rece_yn ? "Y" : undefined,
        pos_yn: formValue.pos_yn ? "Y" : undefined,
        cash_yn: formValue.cash_yn ? "Y" : undefined,

        // 移除不需要的欄位
        contract_no: undefined,
        endcontract_no: undefined,
        operatingStatus: undefined
      };
      this.apiService.queryTLS12040(queryRequest).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);

            if (this.data.length === 0) {
              this.messageService.infoBubble('查詢無資料');
            }
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
          }
        },
        error: (err: any) => {
          console.error('API error:', err);
          this.messageService.errorBubble('查詢失敗，請檢查網路連線或聯繫管理員');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
  }

  /**
   * 手動重新載入特定選項 - 給使用者重新整理功能
   */
  refreshVendorOptions(): void {
    console.log('🔄 手動重新載入廠商選項');

    this.sharedDropdownService.getVendorOptions('1').subscribe({
      next: (options) => {
        this.vendorUIDOptions = options;
        console.log('✅ 廠商選項重新載入完成:', options.length);
        this.messageService.successBubble('廠商選項已更新');
      },
      error: (error) => {
        console.error('❌ 廠商選項重新載入失敗:', error);
        this.messageService.errorBubble('廠商選項更新失敗');
      }
    });
  }
}
