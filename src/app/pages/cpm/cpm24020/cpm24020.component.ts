import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-cpm24020',
  templateUrl: './cpm24020.component.html',
  styleUrls: ['./cpm24020.component.scss'],
})
export class CPM24020Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startDateStart: [], // 開始日期
    startDateEnd: [], // 開始日期
    endDateStart: [], // 結束日期
    endDateEnd: [], // 結束日期
    marketingCampaignCode: [], // 行銷檔期代號
    campaignName: [], // 行銷檔期名稱
    campaignDescription: [], // 檔期說明
  });

  marketingCampaignOptions: any[] = [
    { value: 1, label: '春季活動' },
    { value: 2, label: '夏季促銷' },
  ];

  data: any[] = [];
  columns: any[] = [
    { field: 'itemManagementNumber', header: '用品管理單號', visible: true },
    { field: 'marketingPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'activityStartDate', header: '活動開始日期', visible: true },
    { field: 'activityEndDate', header: '活動結束日期', visible: true },
  ];
  filteredData: any[] = [...this.data];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '520018';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);


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
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
