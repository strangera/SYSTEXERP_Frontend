import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-fin52070',
  templateUrl: './fin52070.component.html',
  styleUrl: './fin52070.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class FIN52070Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    systemYear: [], // 系統年結年度
    accountingStartMonth: [], // 系統開帳年月
    accountingEndMonth: [], // 系統關帳年月
    defaultVoucherDate: [], // 傳票日期預設
    defaultOrganization: [, Validators.required], // 預設組織
    accumulatedProfitLossAccount: [], // 累積盈虧科目
    currentProfitLossAccount: [], // 本期損益科目
    cashAccount: [], // 現金科目
    accountsReceivableAccount: [], // 應收帳款科目
    accountsPayableAccount: [], // 應付帳款科目
    inputTaxAccount: [], // 進項稅額科目
    outputTaxAccount: [], // 銷項稅額科目
    postAndTelecomFeeAccount: [], // 郵電費科目
    discountRate: [], // 貼現日利率
    discountFeeRevenueAccount: [], // 貼現手續費收入科目
    discountOutputTaxAccount: [], // 貼現銷項稅額科目
    startdate: [], // 貼現銷項稅額科目起始日
    enddate: [], // 貼現銷項稅額科目結束日
    bankTransferFeeAccount: [], // 銀行匯款手續費科目
    advanceExpenseAccount: [], // 預支費用科目
    billTransferCondition: [], // 應付票據是否需領用才拋轉傳票
    typecode: [],
    typename: [],
    Subpoenatype: [],
    threecodecategoryEname: [],
    threecodecategoryname: [],
    threecodecategorycode: [],
    mediumcategorycode: [],
  });


  // Dropdown options

  departmentOptions: any[] = [

  ];
  mediumcategorycodeOptions: any[] = [{ value: 11, label: '流動資產' },
  { value: 12, label: '其他流動資產' },
  { value: 14, label: '基金及投資' },
  { value: 15, label: '固定資產淨額' },
  { value: 16, label: '未完工程' },
  { value: 17, label: '無形資產' },
  { value: 18, label: '其他資產' },
  { value: 21, label: '流動負債' },
  { value: 22, label: '其他流動負債' },
  { value: 23, label: '其他流動負債' }];
  accountOptions: any[] = [
    { value: '1101', label: '1101_累積盈虧科目1' },
    { value: '1102', label: '1102_累積盈虧科目2' },
    { value: '1103', label: '1103_累積盈虧科目3' }
  ];

  accountingaccountOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' }
  ];

  statusOptions: any[] = [
    { value: 1, label: '未拋轉' },
    { value: 2, label: '已拋轉' },
    { value: 3, label: '已退回' }
  ];

  unitOptions: any[] = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' }
  ];

  typeOptions: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' }
  ];

  SubpoenatypeOptions: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];

  SubpoenastatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' }
  ];

  codeOptions: any[] = [
    { value: 1, label: '68919301_臺南紡織股份有限公司' },
    { value: 2, label: '73251209_統一企業股份有限公司' },
    { value: 3, label: '96978370_統正開發股份有限公司' }
  ];

  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'subCategoryCode', header: '三碼代碼', visible: true },
    { field: 'subCategoryName', header: '三碼名稱', visible: true },
    { field: 'subCategoryEnglishName', header: '三碼英文名稱', visible: true },
    { field: 'midCategoryCode', header: '中類代碼', visible: true }
  ];

  // TypeScript Options





  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService,
    private vendorService: VendorService,
    private flippingstateService: FlippingstateService,
    private organizationNumberService: OrganizationNumberService,
    private accountingaccountService: AccountingaccountService
  ) {
    super(); // 呼叫父類建構子
  }
  vendorOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  ngOnInit(): void {
    this.ProgNo = '150013';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => {
        this.departmentOptions = data;
      });
    // this.accountingaccountService.getOptions().subscribe((data) => {
    //   this.accountingaccountOptions = data;
    // });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN5000/FIN52070CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
