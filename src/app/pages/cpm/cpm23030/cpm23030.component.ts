import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-cpm23030',
  templateUrl: './cpm23030.component.html',
  styleUrls: ['./cpm23030.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM23030Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    activityStartDate: [],
    activityEndDate: [],
    issueDate: [],
    marketingCampaignCode: [],
    campaignName: [],
    issueNumber: [],
    remarks: [],
    applicant: []
  });


  // 下拉選單選項
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  applicantOptions: any[] = [];

  // 表格資料
  data: any[] = [];
  columns: any[] = [
    { field: 'documentNumber', header: '單號', visible: true },
    { field: 'marketingPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'returnDate', header: '領用日期', visible: true },
    { field: 'returnPerson', header: '領用人員', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userCodeService: UserCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520014';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 初始化下拉選單
    this.userCodeService.getUserCode().subscribe((data) => (this.applicantOptions = data));
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      console.log(frm.value);
      // 提交查詢邏輯
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
      this.router.navigate(['CPM2000/CPM23030CRU'], extras);
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
