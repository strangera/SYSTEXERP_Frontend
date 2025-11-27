import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-fin34040',
  templateUrl: './fin34040.component.html',
  styleUrl: './fin34040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
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
  ) {
    super(); // Call parent constructor
  }

  ngOnInit(): void {
    this.ProgNo = '130010';
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
    this.queryForm.reset(); // Reset form
  }
}
