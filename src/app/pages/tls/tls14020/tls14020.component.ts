/* eslint-disable no-sparse-arrays */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ContractItem } from '@service/api/tls/tls14020.service';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { forkJoin } from 'rxjs';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { NegotiatorOptionsService } from '../../../service/api/dropdownservice/negotiator-options.service';
import { VendorCategoryOptionsService } from '../../../service/api/dropdownservice/vendor-category-options.service';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { DialogItem, TLS14020Service } from '../../../service/api/tls/tls14020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig, formatDate, formatYN } from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { formatApproveStatus, formatCheckType, formatDecoType, formatMoneyType, formatOpenflagStatus, formatStoreWay, formatTltTermType } from '../tls13010/tls13010.constants';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

//專櫃契約書列印
@Component({
  selector: 'app-tls14020',
  templateUrl: './tls14020.component.html',
  styleUrl: './tls14020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputNumberRangeComponent, CalendarRangeComponent, ButtonComponent, TranslateModule, TableComponent, MultiSelectComponent, DialogComponent, RadiobuttonYNComponent, CheckboxModule]
})
export class TLS14020Component extends BasicQueryPageComponent<ContractItem> implements OnInit {

  constructor(
    private vendorCategoryService: VendorCategoryOptionsService,
    private sysb800Service: Sysb800DropdownService,
    private tls14020Service: TLS14020Service,
    private locationService: LocationOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private apiService: TLS13010Service,

  ) {
    super();
  }

  // 查詢的table參數
  data: ContractItem[] = [];
  selectedItems: ContractItem[] = [];// 多選項目
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // 開窗的table參數
  dialogData: DialogItem[] = []; // 顯示合約的開窗table資料
  dialogTotalRecords = 0; // 分頁和排序參數 // 排序需要
  dialogLoading = false; // 開窗內table加載動畫
  dialogVisible_log = false; // 列印記錄開窗顯示
  dialogVisible_print = false; // 列印開窗顯示


  columns: Column[] = [
    { field: 'contract_no', header: '合約編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'ven_uniform', header: '廠商統編', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'contract_subno', header: '版次', visible: true },
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
    { field: 'template_name', header: '合約書版號', visible: true },
  ];
  dialogColumns: Column[] = [
    { field: 'contract_no', header: '合約編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'contract_subno', header: '版次', visible: true },
    { field: 'contract_version', header: '合約書版號', visible: true },
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
  selectedRowData: ContractItem | null = null;
  addButton: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print text-green-500',
      action: (rowData: ContractItem) => {
        this.selectedRowData = rowData;
        this.dialogVisible_print = true;
        // this.onPrint(rowData);
      },
    },
    {
      label: '顯示合約',
      icon: 'pi pi-file-word text-orange-500',
      action: (rowData: ContractItem) => {
        this.dialogVisible_log = true;
        this.queryContractLog(rowData);
      },
    },
  ];

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
    tlt_bdate_Start: [yesterday],
    tlt_bdate_End: [yesterday],
    tlt_edate_Start: [yesterday],
    tlt_edate_End: [yesterday],
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

  dialogQueryForm = this.formBuilder.group({
    exportContract: [true], // 是否列印契約書
    exportRules: [true], // 是否列印進駐廠商營運管理規範
  })

  ngOnInit(): void {
    this.initializePage('TLS14020', '/TLS/TLS13010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions(); // 載入下拉
  }

  private loadDropdownOptions(): void {
    // 大分類下拉
    this.sysb800Service.getSystemTypes().subscribe({
      next: (response: any[]) => {
        this.businessTypeCodeOptions = response.map(item => ({
          value: item.value || item.code || item.id,
          label: item.label || item.name || item.description
        }));
      },
      error: (error) => {
        this.businessTypeCodeOptions = [];
      }
    });
    // 廠商統編下拉
    this.vendorCategoryService.getVendorCategoryOptions("1").subscribe({
      next: (response: any[]) => {
        this.vendorOptions = response;
      },
      error: (error) => {
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
      }
    });
    //洽談者
    this.negotiatorService.getNegotiatorOptions().subscribe({
      next: (response: any[]) => {
        this.negotiatorOptions = response;
      },
      error: (error) => {
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
    this.tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind];
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
            this.totalRecords = response.TotalCount || response.Data.length;
            // 儲存查詢條件（成功查詢後）
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          }
          this.loading = false;
        },
        error: (err: string) => {
          this.loading = false;
        }
      });
    });
  }

  // 顯示合約開窗的table資料查詢
  queryContractLog(data: any): void {
    this.loading = true;
    this.tls14020Service.queryContractLog(data).subscribe({
      next: (response: any) => {
        this.dialogData = response.Data || [];
        this.dialogTotalRecords = response.TotalCount || response.Data.length;
        this.loading = false;
      },
      error: (err: string) => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }

  // 下載以往列印過的契約書
  downloadContractLog(data: any): void {
    this.tls14020Service.downloadContractLog(data).subscribe(response => {
      this.downloadFile(response.Data.FileData, response.Data.FileName);
    });
  }

  // 匯出檔案
  async onDialogSubmit(frm: FormGroup) {
    if (frm.getRawValue().exportContract && this.selectedRowData) {
      await this.onPrint(this.selectedRowData); // 契約書下載
    }
    if (frm.getRawValue().exportRules) {
      await this.downloadRule();  // 管理規範下載
    }
    this.selectedRowData = null;
    this.dialogVisible_print = false;
  }

  // 管理規範下載
  async downloadRule() {
    this.tls14020Service.downloadRule().subscribe(response => {
      this.downloadFile(response.Data.FileData, '進駐廠商營運管理規範.docx');
    });
  }

  // 列印契約書
  onPrint(data: ContractItem): void {
    this.loading = true;
    this.messageService.blockUi();
    // 調後端來產生 Word 文檔
    this.tls14020Service.exportTLS14020(data).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          // 成功時下載檔案
          this.downloadFile(response.Data.FileData, response.Data.FileName);
        }
        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        this.loading = false;
      }
    });
  }

  // 下載檔案的輔助函數
  private downloadFile(fileData: string, filename: string): void {
    if (!fileData) return;

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

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  override onDetail(data: any) {
    const item = {
      talent_id: data.talent_id.toString(),
      SortBy: [{ field: 'apply_no', order: 1 }],
    };
    this.apiService.queryTLS13010Detail(item).subscribe(response => {
      const rowData = response.Data || [];
      if (rowData.length !== 0) {
        this.navigateWithState(CRUDStatus.Read, rowData[0]);
      }
    });
  }
}
