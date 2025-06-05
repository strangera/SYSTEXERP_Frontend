import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-fin34040',
  templateUrl: './fin34040.component.html',
  styleUrl: './fin34040.component.scss',
})
export class FIN34040Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    SanalysisDate: [], // Start date for analysis
    EanalysisDate: [], // End date for analysis
    analysisInterval: [], // Analysis interval
    analysisPeriod: [], // Analysis period
    analysisDateType: [], // Analysis date type (dropdown)
    clientCode: [], // Client code (dropdown)
    SaccountDate: [], // Start date for account
    EaccountDate: [], // End date for account
    receiptDate: [], // Receipt date
    accountCode: [], // Account code (dropdown)
    dueStatus: [], // Due/Not due (dropdown)
    displayAmount: [], // Display amount (radio button)
  });

  // Dropdown options
  clientCodeOptions: any[] = [];
  accountCodeOptions: any[] = [];
  displayAmountOptions: any[2] = [];
  dueStatusOptions: any[] = [
    { value: 1, label: '已到期' },
    { value: 2, label: '未到期' },
  ];
  analysisDateTypeOptions: any[] = [];

  // Table data
  data: any[] = [
    // Add more table data here
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'expiredOneDayPlus', header: '已到期 1天以上', visible: true },
    { field: 'expiredSeptOnePlus', header: '未到期 1天以上', visible: true },
    { field: 'total', header: '總計', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService
  ) {
    super(); // Call parent constructor
  }

  ngOnInit(): void {
    this.ProgNo = '130010';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayAmountOptions = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.analysisDateTypeOptions = data)
    );
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
    this.queryForm.reset(); // Reset form
  }
}
