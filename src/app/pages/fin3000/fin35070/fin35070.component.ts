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
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';

@Component({
  selector: 'app-fin35070',
  templateUrl: './fin35070.component.html',
  styleUrl: './fin35070.component.scss'
})
export class FIN35070Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startdate: [],
    enddate: [],
    SMarginserialnumber: [],
    EMarginserialnumber: [],
    vendorCode: [],
    Flippingstate: [, Validators.required],
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

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'guaranteeSequence', header: '保證金序號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'franchiseCode', header: '專櫃編號', visible: true },
    { field: 'documentType', header: '單據別', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'paymentDate', header: '付款日期', visible: true },
    { field: 'guaranteeDueDate', header: '保證金到期日', visible: true },
    { field: 'checkNumber', header: '支票號碼', visible: true },
    { field: 'financialInstitution', header: '金融機構', visible: true },
    { field: 'billDueDate', header: '票據到期日', visible: true },
    { field: 'summary', header: '摘要', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'statusChangeDate', header: '狀態變更日期', visible: true },
    { field: 'creditAccountingSubject', header: '付款會計科目(貸)', visible: true },
    { field: 'debitAccountingSubject', header: '保證金會計科目(借)', visible: true },
    { field: 'projectCode', header: '立沖代號', visible: true },
    { field: 'sourceSystem', header: '來源系統別', visible: true },
    { field: 'counterFileNumber', header: '專櫃檔編號', visible: true },
    { field: 'organizationCode', header: '組織代號', visible: true },
    { field: 'guaranteeType', header: '保證金類型', visible: true },
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '130017';
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
    this.router.navigate(['FIN3000/FIN35070CRU']);
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
