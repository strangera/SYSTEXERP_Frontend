import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-fin62020',
  templateUrl: './fin62020.component.html',
  styleUrl: './fin62020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN62020Component extends BasicQpageComponent implements OnInit {
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
    Accountcode: [],
    code: [],
    Subpoenacode: [],
    whether: [],
    ifOptions: [],
    summary: [],
    reportingmethod: [],
    Printingmethod: [],
    Printingcolumn: [],
    display: [],
    Approvalcolumn: [],
    category: [],
    CSdate: [],
    Companybankcode: [],
    status: [],
    Salespersoncode: [],
    Employeenumber: [],
    Employeename: [],
    Organizationcode: [],
    dialnumber: [],
    ScreationDate: [],
    EcreationDate: [],
    Stransferdate: [],
    Etransferdate: [],
    TCBAC: [],
    TOCBAC: [],
  });

  // Dropdown options
  TCBACOptions: any[] = [
  ];
  TOCBACOptions: any[] = [
  ];
  statusOptions: any[] = [
    { value: 1, label: '停用' },
    { value: 2, label: '手開' },
    { value: 3, label: '電腦' },
  ];

  bankOptions: any[] = [
    { value: 110301, label: '銀行存款-兆豐銀行(活)' },
    { value: 110302, label: '銀行存款-台新銀行(活)' },
    { value: 110303, label: '銀行存款-中國信託(活)' },
    { value: 110304, label: '銀行存款-玉山銀行(活)' },
    { value: 110306, label: '銀行存款-玉山銀行(支)' },
    { value: 110307, label: '銀行存款-新竹銀行(活-EC)' },
    { value: 110308, label: '銀行存款-台灣銀行(活)' },
    { value: 110397, label: '銀行存款-定存-合庫' },
    { value: 110398, label: '銀行存款-定存-玉山' },
    { value: 110399, label: '銀行存款-定存-兆豐' },
  ];
  printtype: any[] = [
    { value: 1, label: 'A4(直印)' },
    { value: 2, label: 'A4(橫印)' },
    { value: 3, label: '一般' },
  ];
  category
    : any[] = [
      { value: 1, label: '統制' },
      { value: 2, label: '明細' },
      { value: 3, label: '彙總' },

    ];
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

  Reportingmethod: any[] = [
    { value: 1, label: '交易記錄之會計科目' },
    { value: 2, label: '含無交易記錄之會計科目' },
  ];
  Printingmethod
    : any[] = [
      { value: 1, label: '分開列印' },
      { value: 2, label: '合併列印' },
    ];
  Postingmethod: any[] = [
    { value: 1, label: '依明細勾選' },
    { value: 2, label: '依過帳年月' },
  ];
  Printingcolumn
    : any[] = [
      { value: 1, label: '狀態' },
      { value: 2, label: '活動' },
      { value: 2, label: '立沖代號' },
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
  Accountcode
    : any[] = [
      { value: 1, label: '資產' },
      { value: 2, label: '負債' },
      { value: 3, label: '股東權益' },
      { value: 4, label: '營業收入' },
    ];
  display
    : any[] = [
      { value: 1, label: '顯示' },
      { value: 2, label: '不顯示' },

    ]
  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'voucherNumber', header: '傳票號碼', visible: true },
    { field: 'transactionDate', header: '事槼日期', visible: true },
    { field: 'transferInBank', header: '調入銀行', visible: true },
    { field: 'transferInAccount', header: '調入帳號', visible: true },
    { field: 'transferOutBank', header: '調出銀行', visible: true },
    { field: 'transferOutAccount', header: '調出帳號', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'handlingFee', header: '手續費', visible: true },
    { field: 'total', header: '合計', visible: true }
  ];



  // TypeScript Options
  AccountcodeOptions: any[] = [];
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
    this.ProgNo = '160004';
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
    this.accountingaccountService.getOptions().subscribe((data) => {
      this.TCBACOptions = data;
    });
    this.accountingaccountService.getOptions().subscribe((data) => {
      this.TOCBACOptions = data;
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
