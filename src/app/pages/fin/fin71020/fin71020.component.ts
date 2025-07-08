import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';

@Component({
  selector: 'app-fin71020',
  templateUrl: './fin71020.component.html',
  styleUrl: './fin71020.component.scss'
})
export class FIN71020Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startdate: [],
    enddate: [],
    FNCCode: [],
    Accountcode: [],
    display: [],
    display2: [],
    Ticketnumber: [],
    Duesummonsnumber: [],
    status: [],
    vander: [],
    STicketnumber: [],
    ETicketnumber: [],
    Billingordernumber: [],
    Ssubpoenanumber: [],
    Esubpoenanumber: [],
    Feespayable: [],
    Inputtax: [],
    usercode: [],
    SPettyamount: [],
    EPettyamount: [],
    description: [],
  });

  // Dropdown options
  usercode: any[] = [];
  Feespayable: any[] = [
    { value: 210101, label: '銀行短期借款' },
    { value: 210201, label: '應付商業本票-中華' },
    { value: 210202, label: '應付商業本票-合庫' },
    { value: 210203, label: '應付商業本票-聯邦' },
    { value: 210301, label: '應付商業本票折價' },
    { value: 210401, label: '一年或一年營業週期內到期長期負債' },
    { value: 2111, label: '應付票據' },
    { value: 211101, label: '應付票據-專櫃' },
    { value: 211102, label: '應付票據-自營' },
    { value: 211103, label: '應付票據-固資及費用' },
  ];
  Inputtax: any[] = [
    { value: 1, label: '1101_庫存現金' },
    { value: 2, label: '110101_庫存現金-營收及正負差' },
    { value: 3, label: '110102_庫存現金-其他收入' },
    { value: 4, label: '110103_庫存現金-財務部' },
    { value: 5, label: '110111_庫存現金-外幣' },
    { value: 6, label: '110112_庫存現金-人民幣' },
    { value: 7, label: '110199_庫存現金-其他' },
    { value: 8, label: '1102_零用金' },
    { value: 9, label: '110200_零用金-總經理室' },
    { value: 10, label: '110201_零用金-採購組' }
  ];
  statusOptions: any[] = [
    { value: 1, label: '未異動' },
    { value: 2, label: '到期' },
    { value: 3, label: '兌現' },
  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  Billingordernumber: any[] = [
    { value: 1, label: 'B20150208001' },
    { value: 2, label: 'B20150208002' },
    { value: 3, label: 'B20150410001' },
  ];
  // Table data
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'custodianCode', header: '保管人代碼', visible: true },
    { field: 'pettyCashAmount', header: '零用金額度', visible: true },
    { field: 'description', header: '說明', visible: true }
  ];


  vendorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '170002';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions = data)
    );
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.usercode = data));
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
      this.router.navigate(['FIN7000/FIN71020CRU'], extras);
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
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
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
