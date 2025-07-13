import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-cpm25030',
  templateUrl: './cpm25030.component.html',
  styleUrls: ['./cpm25030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class CPM25030Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startYear: [],
    endYear: [],
    marketingCampaignCode: [],
  });

  // 下拉選單資料
  marketingCampaignOptions = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];

  data: any[] = [];
  columns: any[] = [
    { field: 'marketingFileCode', header: '行銷檔期代號', visible: true },
    { field: 'fileName', header: '檔期名稱', visible: true },
    { field: 'startDate', header: '開始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'activityDays', header: '活動天數', visible: true },
    { field: 'targetAmount', header: '營業目標金額', visible: true },
    { field: 'activityPeriodTotal', header: '活動期間營業總額', visible: true },
    { field: 'targetAchievement', header: '營業目標達成率%', visible: true },
    { field: 'totalBudgetAmount', header: '總預算金額', visible: true },
    { field: 'totalExpenseAmount', header: '總費用金額', visible: true },
    { field: 'budgetExecutionRate', header: '預算執行率%', visible: true },
    { field: 'subsidyBudgetAmount', header: '贊助預估金額', visible: true },
    { field: 'actualRevenueAmount', header: '實際收款金額', visible: true },
    { field: 'recoveryRate', header: '回收率%', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,

  ) {
    super(); // 呼叫父類別建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520023';


    this.authService.getUserPermissions(this.ProgNo);

  }

  onSubmit(frm: FormGroup): void {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onCreate(): void {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
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

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }

  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
  }
}
