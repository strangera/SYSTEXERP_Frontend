import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS14020Service } from '../../../service/api/tls/tls14020.service';
import { VendorCategoryOptionsService } from '../../../service/api/dropdownservice/vendor-category-options.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { forkJoin } from 'rxjs';
import { NegotiatorOptionsService } from '../../../service/api/dropdownservice/negotiator-options.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { AddButton, Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatApproveStatus, formatCheckType, formatDecoType, formatMoneyType, formatOpenflagStatus, formatStoreWay, formatTltTermType } from '../tls13010/tls13010.constants';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

interface ContractItem {
  id: string;
  talent_id: string;            // 合約id
  contract_no: string;          // 合約編號
  tlt_no: string;               // 專櫃編號
  tlt_name: string;             // 專櫃名稱
  // ven_no: string;            // 廠商編號 (DB漏開欄位)
  ven_uniform: string;          // 廠商統編
  VEN_Name: string;             // 廠商名稱
  contract_subno: number;       // 版本編號
  tlt_bdate: string;            // 契約起始日
  tlt_edate: string;            // 契約截止日
  tlt_contract_bdate: string;   // 營運起始日
  tlt_contract_edate: string;   // 營運截止日
  bus_type: string;             // 大分類代碼
  bus_type_name: string;        // 大分類名稱
  deco_type: string;            // 裝潢方式
  money_type: string;           // 結帳方式
  check_type: string;           // 對帳方式
  tlt_term_type: string;        // 抽成別
  store_way: string;            // 配合方式
  rece_yn: string;              // 開立業主發票
  pos_yn: string;               // 使用業主收銀機
  cash_yn: string;              // 業主收現
  contract_type: string;        // 合約種類
  approve_status: string;       // 合約狀態
  tlt_openflag: string;         // 營運狀態
}
interface DialogItem {
  id: string;
  talent_id: string;
  contract_no: string;
  contract_subno: string;
  contract_version: string;
  contract_filename: string;
}
//專櫃契約書列印
@Component({
  selector: 'app-tls14020',
  templateUrl: './tls14020.component.html',
  styleUrl: './tls14020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, InputNumberRangeComponent, CalendarRangeComponent, ButtonComponent, TranslateModule, TableComponent, MultiSelectComponent, DialogComponent]
})
export class TLS14020Component extends BasicQueryPageComponent<ContractItem> implements OnInit {
  // ProgNo: string = '210018';
  // 權限
  // funInfo?: FunsrightInfo;
  // 查詢
  // loading: boolean = false;
  // submitted: boolean = false;
  queryForm = this.formBuilder.group({
    contract_no: [, [Validators.maxLength(12)]], // 合約編號
    bus_typeList: [[]], // 大分類
    // businessTypeCode: [],
    tlt_no: [, [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: [, [Validators.maxLength(100)]], // 專櫃名稱
    ven_uniform_List: [[]], // 廠商統一編號
    locationList: [[]], // 位置
    contract_subno_Start: [, [Validators.maxLength(4)]], // 版本編號起
    contract_subno_End: [, [Validators.maxLength(4)]], // 版本編號迄
    approve_status_List: [[]],
    area_no_List: [[]],
    tlt_floor_List: [[]],
    contact_USR_No_List: [[]],
    org_id_List: [[]],
    tlt_openflag_List: [[]],
    comm_comp_type_List: [['2']],// 預設值為除稅
    feedback_date_Start: [],
    feedback_date_End: [],
    due_date_Start: [],
    due_date_End: [],
    contact_Date_Start: [],
    contact_Date_End: [],
    paper_type_List: [[]],
    tlt_bdate_Start: [],
    tlt_bdate_End: [],
    tlt_edate_Start: [],
    tlt_edate_End: [],
    tlt_contract_bdate_Start: [],
    tlt_contract_bdate_End: [],
    tlt_contract_edate_Start: [],
    tlt_contract_edate_End: [],
    tlt_kind_List: [[]],
    deco_type_List: [[]],
    tlt_term_type_List: [[]],
    money_type_List: [[]],
    paytype_List: [[]],
    store_way_List: [[]],
    rece_yn: [],
    pos_yn: [],
    cash_yn: [],
    ...createPaginationConfig([{ field: 'contract_no', order: 1 }]),
  });
  // 查詢的table參數
  data: ContractItem[] = [];
  filteredData: any[] = [...this.data];
  selectedItems: ContractItem[] = [];// 多選項目
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // 開窗的table參數
  dialogData: DialogItem[] = []; // 顯示合約的開窗table資料
  dialogTotalRecords = 0; // 分頁和排序參數 // 排序需要
  dialogLoading = false; // 開窗內table加載動畫
  dialogVisible = false; // 開窗顯示


  columns: Column[] = [
    { field: 'contract_no', header: '合約編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    // { field: 'ven_no', header: '廠商編號', visible: true }, DB漏開欄位
    { field: 'ven_uniform', header: '廠商統編', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'tlt_bdate', header: '契約起始日', visible: true, format: formatDate },
    { field: 'tlt_edate', header: '契約截止日', visible: true, format: formatDate },
    { field: 'tlt_contract_bdate', header: '營運起始日', visible: true, format: formatDate },
    { field: 'tlt_contract_edate', header: '營運截止日', visible: true, format: formatDate },
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'deco_type', header: '裝潢方式', visible: true, format: formatDecoType },
    { field: 'money_type', header: '結帳方式', visible: true, format: formatMoneyType },
    { field: 'check_type', header: '對帳方式', visible: true, format: formatCheckType },
    { field: 'tlt_term_type', header: '抽成別', visible: true, format: formatTltTermType },
    { field: 'store_way', header: '配合方式', visible: true, format: formatStoreWay },
    { field: 'rece_yn', header: '開立業主發票', visible: true, format: formatYN },
    { field: 'pos_yn', header: '使用業主收銀機', visible: true, format: formatYN },
    { field: 'cash_yn', header: '業主收現', visible: true, format: formatYN },
    { field: 'contract_type', header: '合約種類', visible: true },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'tlt_openflag', header: '營運狀態', visible: true, format: formatOpenflagStatus },
    { field: 'contract_subno', header: '合約版號', visible: true },
  ];
  dialogColumns: Column[] = [
    { field: 'contract_no', header: '合約編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'contract_subno', header: '版本編號', visible: true },
    { field: 'contract_version', header: '合約版號', visible: true },
    { field: 'contract_filename', header: '列印合約檔名', visible: true },
  ];
  // 下拉選單選項
  businessTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  businessType: any[] = [];
  tltKindOptions: any[] = [];
  decorationMethodOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  moneyTypeOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  storeWayMethodOptions: any[] = [];
  issueOwnerInvoiceOptions: any[] = [];
  useOwnerCashRegisterOptions: any[] = [];
  ownerCashCollectionOptions: any[] = [];
  whetherOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];

  addButton: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print text-green-500',
      action: (rowData: ContractItem) => {
        console.log('要列印的資料', rowData);
        this.onPrint(rowData);
      },
    },
    {
      label: '顯示合約',
      icon: 'pi pi-file-word text-orange-500',
      action: (rowData: ContractItem) => {
        console.log('這是該列資料嗎?2', rowData);
        this.dialogVisible = true;
        this.queryContractLog(rowData);
      },
    },
  ];

  constructor(
    private vendorCategoryService: VendorCategoryOptionsService,
    private contractStatusService: ContractStatusService,
    private counterCategoryService: CounterCategoryService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    // private negotiatorService: UserCodeService,
    private sysb800Service: Sysb800DropdownService,
    private tls14020Service: TLS14020Service,
    private locationService: LocationOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private apiService: TLS13010Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS14020', '/TLS/TLS13010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions(); // 載入下拉
  }

  private loadDropdownOptions(): void {
    console.log('進下拉');
    // 大分類下拉
    this.sysb800Service.getSystemTypes().subscribe({
      next: (response: any[]) => {
        this.businessTypeCodeOptions = response.map(item => ({
          value: item.value || item.code || item.id,
          label: item.label || item.name || item.description
        }));
        console.log('大分類選項載入完成:', this.businessTypeCodeOptions);
      },
      error: (error) => {
        console.error('載入大分類選項失敗:', error);
        this.businessTypeCodeOptions = [];
      }
    });
    // 廠商統編下拉
    this.vendorCategoryService.getVendorCategoryOptions("1").subscribe({
      next: (response: any[]) => {
        this.vendorOptions = response;
        console.log('POS2013選項載入完成:', this.vendorOptions);
      },
      error: (error) => {
        console.error('載入POS2013選項失敗:', error);
        this.vendorOptions = [];
      }
    });
    // 位置、區域、樓層、組織、營業型態下拉
    forkJoin({
      building: this.locationService.getBuildingOptions(),
      floor: this.locationService.getFloorOptions(),
      region: this.locationService.getRegionOptions(),
      org: this.locationService.getOrgOptions(),
      location: this.locationService.getLocationOptions(),
      paperType: this.locationService.getPaperTypeOptions('T101')
    }).subscribe({
      next: (results) => {
        this.locationOptions = results.location; // 位置
        this.regionOptions = results.region; // 區域
        this.floorOptions = results.floor; // 樓層
        this.organizationOptions = results.org; // 組織
        this.businessTypeOptions = results.paperType; // 營業型態
        console.log('位置', results.location);
      },
      error: (error) => {
        console.error('載入 Location 選項失敗:', error);
      }
    });
    //洽談者
    this.negotiatorService.getNegotiatorOptions().subscribe({
      next: (response: any[]) => {
        this.negotiatorOptions = response;
        console.log('洽談者選項載入完成:', this.negotiatorOptions.length);
      },
      error: (error) => {
        console.error('載入洽談者選項失敗:', error);
        this.negotiatorOptions = [];
      }
    });
    // 合約狀態
    this.contractStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions].filter(item => item.value !== '3');
    // 營運狀況
    this.operationStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
    // 抽成額計算方式
    this.commissionCalculationOptions = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
    // 櫃別
    this.tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind].filter(item => item.value !== '3' && item.value !== '4');
    // 裝潢方式
    this.decorationMethodOptions = [...TLS13010_DROPDOWN_OPTIONS.decorationType];
    // 抽成別
    this.commissionTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
    // 結帳方式
    this.moneyTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
    // 付款方式
    this.paymentMethodOptions = [...TLS13010_DROPDOWN_OPTIONS.paytype];
    // 配合方式
    this.storeWayMethodOptions = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
    // 是否開立業主發票、是否使用業主收銀機、是否為業主收現
    this.whetherOptions = [...TLS13010_DROPDOWN_OPTIONS.yesNo];
  }

  // 查詢提交
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls14020Service.queryTLS14020(frm.value).subscribe({
        next: (response: any) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            if (this.data.length === 0) {
              console.log('查詢結果為空');
            }
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  // 顯示合約開窗的table資料查詢
  queryContractLog(data: any): void {
    this.loading = true;
    this.tls14020Service.queryContractLog(data).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          console.log('開窗查詢結果', response.Data);
          this.dialogData = response.Data || [];
          this.dialogTotalRecords = response.TotalCount || response.Data.length;
          if (this.data.length === 0) {
            console.log('查詢結果為空');
          }
        } else {
          console.error('API error:', response.Status, response.Message);
        }
        this.loading = false;
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }

  // 合約列印
  onPrint(data: any): void {
    this.loading = true;
    this.messageService.blockUi();
    // 調後端來產生 Word 文檔
    this.tls14020Service.exportTLS14020(data).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          // 成功時下載檔案
          this.downloadFile(response.Data.FileData, response.Data.FileName);
          console.log('Word文檔生成成功', response);
        } else {
          console.error('生成Word文檔失敗:', response.Status, response.Message);
          this.messageService.errorBubble(response.Message || '生成文檔失敗');
        }
        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        console.error('生成Word文檔錯誤:', err);
        this.loading = false;
        this.messageService.unblockUi();
        this.messageService.errorBubble('生成文檔失敗，請稍後再試');
      }
    });
  }

  // 下載檔案的輔助函數
  private downloadFile(fileData: any, filename: string): void {
    try {
      // 如果後端回傳的是base64字串
      if (typeof fileData === 'string') {
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      // 如果後端直接回傳blob或其他格式，可以在這裡處理
    } catch (error) {
      console.error('下載檔案失敗:', error);
      this.messageService.errorBubble('下載檔案失敗');
    }
  }

  // 下載以往列印過的契約書
  downloadContractLog(data: any): void {
    this.tls14020Service.downloadContractLog(data).subscribe({
      next: (response: any) => {
        this.downloadFile(response.Data.FileData, response.Data.FileName);
      },
      error: (error) => {
        console.error('下載檔案失敗:', error);
        // 可選：顯示錯誤提示給用戶
        // alert('下載檔案失敗，請稍後再試');
        this.messageService.errorBubble('下載檔案失敗，請稍後再試');
      }
    });
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  override onDetail(data: any) {
    const item = {
      talent_id: data.talent_id.toString(),
      SortBy: [{ field: 'apply_no', order: 1 }],
    };
    this.apiService.queryTLS13010(item).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          const rowData = response.Data || [];
          console.log('查完資料', rowData);
          if (rowData.length !== 0) {
            this.navigateWithState(CRUDStatus.Read, rowData[0]);
          }
        } else {
          this.messageService.errorBubble(`查詢失敗: ${response.Message || '未知錯誤'}`);
        }
      },
      error: (err: any) => {
        this.messageService.errorBubble('查詢失敗，請檢查網路連線或聯繫管理員');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }
}
