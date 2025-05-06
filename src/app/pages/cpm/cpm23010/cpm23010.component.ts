import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';


@Component({
  selector: 'app-cpm23010',
  templateUrl: './cpm23010.component.html',
  styleUrls: ['./cpm23010.component.scss'],
})
export class CPM23010Component extends BasicQpageComponent implements OnInit {
  ngOnInit(): void {
    this.ProgNo = '520012';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.applicantOptions = data));
  }

  queryForm = this.formBuilder.group({
    activityStartDate: [],
    activityEndDate: [],
    applicationDate: [],
    marketingCampaignCode: [],
    campaignName: [],
    supplyManagementNumber: [],
    manufacturerCode: [],
    applicant: [],
    supplyCondition: [],
  });

  // Dropdown options
  applicantOptions: any[] = [];
  supplyConditionOptions: any[] = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' },
  ];
  Applicants: any[] = [];
  manufacturerOptions: any[] = [
    { value: 1, label: '53472035-23' },
  ];
  marketingCampaignOptions: any[] = [
    { value: 1, label: 'DM發送活動' },
    { value: 2, label: '紅利積點活動' },
    { value: 3, label: '聯名超強卡友日' },
    { value: 4, label: '贈品兌換活動' },
  ];
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'itemManagementNumber', header: '用品管理單號', visible: true },
    { field: 'marketingPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'eventStartDate', header: '活動開始日期', visible: true },
    { field: 'eventEndDate', header: '活動結束日期', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'itemStatus', header: '用品狀況', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'applicant', header: '申請人員', visible: true },
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

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
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
      this.router.navigate(['CPM2000/CPM23010CRU'], extras);
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
