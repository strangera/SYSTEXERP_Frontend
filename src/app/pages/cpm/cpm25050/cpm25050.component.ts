import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';

// Services
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
;

@Component({
  selector: 'app-cpm25050',
  templateUrl: './cpm25050.component.html',
  styleUrls: ['./cpm25050.component.scss'],
})
export class CPM25050Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startYear: [],
    endYear: [],
    startQuarter: [],
    endQuarter: [],
    activityCategoryCode: [],
    marketingCampaignCode: [],
    campaignName: [],
    activityCategoryName: [],
  });

  // Dropdown options
  season = [
    { value: 1, label: '第一季' },
    { value: 2, label: '第二季' },
    { value: 3, label: '第三季' },
    { value: 4, label: '第四季' },
  ];

  activityCategoryOptions = [
    { value: 1, label: '000001' },
    { value: 2, label: '000002' },
  ];

  marketingCampaignOptions = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520025';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);




  }

  onSubmit(frm: FormGroup): void {
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

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset(); // 重置表單
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
