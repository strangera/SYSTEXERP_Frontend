
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { UserCodeService } from '../../../service/basic/user-code.service';
@Component({
  selector: 'app-fin55020',
  templateUrl: './fin55020.component.html',
  styleUrl: './fin55020.component.scss'
})
export class FIN55020Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    startserialticket: [],
    endserialticket: [],
    Subpoenatype: [],
    SSubpoenadate: [],
    ESubpoenadate: [],
    Subpoenastatus: [],
    Subpoenasummary: [],
    builder: [],
    Residualvalueyears: [],
    Depreciation: [],
    accountsummary: [],
    Subpoenatype2: [],
    Postingmethod: [],
    year: [],
    buildnumber: [],
    confirmationnumber: [],
    postingnumber: [],
    yearmm: [],
    Sbuilddate: [],
    Ebuilddate: [],
    printtype: [],
    department: [],
    activity: [],
    vander: [],
  });

  // Dropdown options
  printtype: any[] = [
    { value: 1, label: 'A4(直印)' },
    { value: 2, label: 'A4(橫印)' },
    { value: 3, label: '一般' },
  ]
  Subpoenatype2: any[] = [
    { value: 1, label: '贊助金傳票' },
    { value: 2, label: '電匯EDI傳票' },
    { value: 3, label: '年結傳票' },
    { value: 4, label: '銀行資金調撥傳票' },
    { value: 5, label: '零用金拋轉傳票' },
    { value: 6, label: '票據兌現傳票' },
    { value: 7, label: '支票沖轉傳票' },
    { value: 8, label: '退票沖轉票據傳票' },
    { value: 9, label: '開票傳票' },
    { value: 10, label: '撤票沖轉票據傳票' },
  ];
  Postingmethod: any[] = [
    { value: 1, label: '依明細勾選' },
    { value: 2, label: '依過帳年月' },
  ];
  activity: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '會員紅利活動' },
  ];
  departmentOptions: any[] = [];
  ifOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  detail: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];
  Subpoenaformatl: any[] = [
    { value: 1, label: '無特定' },
    { value: 2, label: '應付票據' },
    { value: 3, label: '應收票據' },
  ];
  Subpoenatype: any[] = [
    { value: 1101, label: '現金收入傳票' },
    { value: 110101, label: '現金支出傳票' },
    { value: 110102, label: '轉帳傳票' },
  ];
  borrowloanOptions: any[] = [
    { value: 1, label: '借' },
    { value: 2, label: '貸' },
  ];

  accountingaccountOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];

  statusOptions: any[] = [
    { value: 1, label: '未拋轉' },
    { value: 2, label: '已拋轉' },
    { value: 3, label: '已退回' },
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
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];

  Subpoenastatus: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' },
  ];

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
    { field: 'invoiceDate', header: '傳票日期', visible: true },
    { field: 'invoiceNumber', header: '傳票號碼', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'departmentCode', header: '部門', visible: true },
    { field: 'departmentName', header: '部門名稱', visible: true },
    { field: 'activity', header: '活動', visible: true },
    { field: 'summary', header: '摘要', visible: true },
    { field: 'debitAmount', header: '借方金額', visible: true },
    { field: 'creditAmount', header: '貸方金額', visible: true },
    { field: 'voucherCode', header: '立沖代號', visible: true }
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
    private accountingaccountService: AccountingaccountService,
    private userCodeService: UserCodeService

  ) {
    super(); // 呼叫父類建構子
  }
  vendorOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  usercode: any[] = [];
  ngOnInit(): void {
    this.ProgNo = '150026';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.usercode = data));
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
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
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
