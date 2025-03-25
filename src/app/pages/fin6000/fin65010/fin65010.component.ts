

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';


@Component({
  selector: 'app-fin65010',
  templateUrl: './fin65010.component.html',
  styleUrl: './fin65010.component.scss'
})
export class FIN65010Component extends BasicQpageComponent implements OnInit  {

  

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
  });

  // Dropdown options
  statusOptions: any[] = [
    { value: 1, label: '未異動'},
    { value: 2, label: '到期'},
    { value: 3, label: '兌現'},
  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  Billingordernumber: any[] = [
    { value: 1, label: 'B20150208001'},
    { value: 2, label: 'B20150208002'},
    { value: 3, label: 'B20150410001'},
  ];
  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'signColumn', header: '簽收欄', visible: true }, // 新增簽收欄
    { field: 'ticketDetails', header: '票據明細', visible: true } // 新增票據明細
  ];
  
  
  vendorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService:IfdisplayService,
    private vendorService: VendorService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '160019';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe((data) => (this.displayOptions = data));
    this.IfdisplayService.getOptions().subscribe((data) => (this.displayOptions2 = data));
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
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
