import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-fin35020',
  templateUrl: './fin35020.component.html',
  styleUrl: './fin35020.component.scss'
})
export class FIN35020Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startdate: [],
    enddate: [],
    SMarginserialnumber: [],
    EMarginserialnumber: [],
    vendorCode: [],
    Flippingstate: [1, Validators.required],
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'depositSequence', header: '保證金序號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'franchiseCode', header: '專櫃編號', visible: true },
    { field: 'category', header: '習慣類別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'receiptDate', header: '收款日期', visible: true },
    { field: 'checkNumber', header: '支票號碼', visible: true },
    { field: 'bank', header: '開票銀行', visible: true },
    { field: 'remarks', header: '摘要', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'receiptAccountSubject', header: '收款會計科目(借)', visible: true },
    { field: 'depositAccountSubject', header: '保證金會計科目(貸)', visible: true },
    { field: 'sourceSystem', header: '來源系統別', visible: true },
    { field: 'franchiseRegistration', header: '專櫃登錄編號', visible: true },
    { field: 'depositType', header: '保證金類型', visible: true },
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
    private messageService: MessageModule
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '130012';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions = data)
    );
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
      this.router.navigate(['FIN3000/FIN35020CRU'], extras);
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
  onNext(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;


    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      this.router.navigate(['FIN3000/FIN35020CRU']);
    }

    this.loading = false;

  }

  onSubmitNext(frm: FormGroup) {
    // 查詢邏輯
    this.onNext(frm);
  }
}
