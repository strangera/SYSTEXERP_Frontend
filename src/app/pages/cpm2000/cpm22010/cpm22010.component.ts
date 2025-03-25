
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';


@Component({
  selector: 'app-cpm22010',
  templateUrl: './cpm22010.component.html',
  styleUrl: './cpm22010.component.scss',
})
export class CPM22010Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startDateStart: [],
    startDateEnd: [],
    endDateStart: [],
    endDateEnd: [],
    marketingCampaignCode: [],
    campaignName: [],
    campaignDescription: [],
  });

  marketingCampaignOptions: any[] = [
    { value: '001', label: '001' },
    { value: '002', label: '002' },
  ];
  data: any[] = [];
  columns: any[] = [
    { field: 'marketingCampaignCode', header: '行銷檔期代號', visible: true },
    { field: 'campaignName', header: '檔期名稱', visible: true },
    { field: 'startDate', header: '開始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'campaignDescription', header: '檔期說明', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,

  ) {
    super();
    
  }

  ngOnInit(): void {
    this.ProgNo = '520007';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      console.log('Form submitted:', frm.value);
      // 提交邏輯
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
      this.router.navigate(['CPM2000/CPM22010CRU'], extras);
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
    this.queryForm.reset();
  }
}
