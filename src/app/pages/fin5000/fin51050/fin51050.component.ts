import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';

@Component({
  selector: 'app-fin51050',
  templateUrl: './fin51050.component.html',
  styleUrl: './fin51050.component.scss',
})
export class FIN51050Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: [, Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
    type: [],
    compareyear: [],
    version1: [],
    version2: [],
    year1: [],
    year2: [],
    Subpoenatype: [],
    startdate: [],
    enddate: [],
    Subpoenastatus: [],
    Subpoenacode: [],
    SummonsSummary: [],
    accountingaccount: [],
    vendorCode: [],
    code: [],
    Summonscode: [],
    Summary: [],
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  departmentOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  statusOptions: any[] = [
    { value: 1, label: '未拋轉' },
    { value: 2, label: '已拋轉' },
    { value: 2, label: '已退回' },
  ];
  unitOptions: any[] = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' },
  ];
  typeOptions: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];

  SubpoenatypeOptions: any[] = [
    { value: 1, label: '自營日結傳票' },
    { value: 2, label: '自營月結傳票' },

  ];
  SubpoenastatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 2, label: '確認' },
    { value: 2, label: '過帳' },
    { value: 2, label: '刪除' },
  ];
  accountingaccountOptions: any[] = [];
  codeOptions: any[] = [
    { value: 1, label: '68919301_臺南紡織股份有限公司' },
    { value: 2, label: '73251209_統一企業股份有限公司' },
    { value: 3, label: '96978370_統正開發股份有限公司' },
  ];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'isTransfer', header: '是否挪轉', visible: true },
    { field: 'invoiceDate', header: '傳票日期', visible: true },
    { field: 'invoiceTransferStatus', header: '傳票挪轉狀態', visible: true },
    { field: 'invoiceStatus', header: '傳票狀態', visible: true },
    { field: 'invoiceSummary', header: '傳票摘要', visible: true },
    { field: 'debitEstimatePayment', header: '借方-暫估應付帳款-自營', visible: true },
    { field: 'debitAdvanceTax', header: '借方-進貨-自營應稅', visible: true },
    { field: 'debitTotal', header: '借方合計', visible: true },
    { field: 'creditEstimatePayment', header: '貸方-暫估應付帳款-自營', visible: true },
    { field: 'creditReturnTax', header: '貸方-進貨退回-自營應稅', visible: true },
    { field: 'creditTotal', header: '貸方合計', visible: true }
  ];
  

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

  ngOnInit(): void {
    this.ProgNo = '150005';
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
    this.accountingaccountService.getOptions().subscribe((data) => {
      this.accountingaccountOptions = data;
    });
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
    this.router.navigate(['FIN5000/FIN51050CRU']);
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
      this.router.navigate(['FIN5000/FIN51050CRU'], extras);
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
