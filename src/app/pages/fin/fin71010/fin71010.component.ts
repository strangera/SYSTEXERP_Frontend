import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-fin71010',
  templateUrl: './fin71010.component.html',
  styleUrl: './fin71010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class FIN71010Component extends BasicQpageComponent implements OnInit {
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
  data: any[] = [
    { code: '216104', name: '應付費用-現金' },
    { code: '123203', name: '進項稅額-固定資產及費用' },
    { code: '110101', name: '庫存現金-營收及正負差' },
    { code: '110102', name: '庫存現金-其他收入' },
    { code: '110103', name: '庫存現金-財務部' },
    { code: '110111', name: '庫存現金-外幣' },
    { code: '110112', name: '庫存現金-人民幣' },
    { code: '110199', name: '庫存現金-其他' },
    { code: '110200', name: '零用金-樂經理室' },
    { code: '110201', name: '零用金-採購組' },
    { code: '110210', name: '零用金-技術服務部' },
    { code: '110220', name: '零用金-財務部' },
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'code', header: '科目代號', visible: true },
    { field: 'name', header: '科目名稱', visible: true },
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
    this.ProgNo = '170001';
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
  searchFields = [

    { field: 'code', placeholder: '科目代號' },
    { field: 'name', placeholder: '科目名稱' },
  ];
  // 處理選中行的事件
  handleRowSelect(selectedItem: any): void {
    console.log('選中的項目:', selectedItem);
  }
}
