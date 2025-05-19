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

@Component({
  selector: 'app-fin63030',
  templateUrl: './fin63030.component.html',
  styleUrl: './fin63030.component.scss'
})
export class FIN63030Component extends BasicQpageComponent implements OnInit {



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
  });

  // Dropdown options
  statusOptions: any[] = [
    { value: 1, label: '未異動' },
    { value: 2, label: '到期' },
    { value: 3, label: '兌現' },
  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ticketNumber', header: '票據號碼', visible: true },
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'payingBankCode', header: '付款銀行代碼', visible: true },
    { field: 'issueDate', header: '開票日', visible: true },
    { field: 'dueDate', header: '到期日', visible: true },
    { field: 'cashDate', header: '兌現日', visible: true },
    { field: 'faceAmount', header: '票面金額', visible: true },
    { field: 'ticketHead', header: '票期抬頭', visible: true },
    { field: 'remark', header: '備註', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'ticketStatus', header: '票據狀態', visible: true },
    { field: 'arrivalInvoiceNumber', header: '到期應票單號', visible: true }
  ];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '160010';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe((data) => (this.displayOptions = data));
    this.IfdisplayService.getOptions().subscribe((data) => (this.displayOptions2 = data));

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
    this.router.navigate(['FIN6000/FIN63030CRU']);

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
    this.queryForm.reset();  // 重置表單
  }
}
