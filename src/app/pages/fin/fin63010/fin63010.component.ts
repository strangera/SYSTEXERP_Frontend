
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
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-fin63010',
  templateUrl: './fin63010.component.html',
  styleUrl: './fin63010.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, CalendarRangeComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN63010Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    SExpirationDate: [],
    EExpirationDate: [],
    display: [],
    Approvalcolumn: [],
    category: [],
    CSdate: [],
    Companybankcode: [],
    status: [],
    SsearchDate: [],
    EsearchDate: [],
    STicketnumber: [],
    ETicketnumber: [],
    Manufacturercode: [],
    Billingordernumber: [],
    SInvoicingday: [],
    EInvoicingday: [],


  });

  // Dropdown options
  Billingordernumber: any[] = [];
  statusOptions: any[] = [
    { value: 1, label: '停用' },
    { value: 2, label: '手開' },
    { value: 3, label: '電腦' },
  ];


  departmentOptions: any[] = [];

  ifOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
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
  typeOptions: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];

  Subpoenastatus: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' },
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
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'invoiceNumber', header: '開票單號', visible: true },
    { field: 'ticketNumber', header: '票據號碼', visible: true },
    { field: 'issueDate', header: '開票日', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'faceAmount', header: '票面金額', visible: true },
    { field: 'payingBank', header: '付款銀行', visible: true }
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
    this.ProgNo = '160008';
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
