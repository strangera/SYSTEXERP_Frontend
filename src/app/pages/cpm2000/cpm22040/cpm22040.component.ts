import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm22040',
  templateUrl: './cpm22040.component.html',
  styleUrl: './cpm22040.component.scss'
})
export class CPM22040Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startDateStart: [],
    startDateEnd: [],
    endDateStart: [],
    endDateEnd: [],
    marketingCampaignCode: [],
    campaignName: [],
    campaignDescription: [],
    activityCategoryName: [],
  });

  // Dropdown options
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  data: any[] = [];
  columns: any[] = [
    { field: 'marketingCampaignCode', header: '行銷檔期代號', visible: true },
    { field: 'campaignName', header: '檔期名稱', visible: true },
    { field: 'activityCategoryName', header: '活動類別名稱', visible: true },
    { field: 'startDate', header: '開始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'activityCode', header: '活動代號', visible: true },
    { field: 'activityDescription', header: '活動說明', visible: true },
    { field: 'activityOwner', header: '活動負責人', visible: true },
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
    this.ProgNo = '520010';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Perform query logic here
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
      this.router.navigate(['CPM2000/CPM22040CRU'], extras);
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
    this.queryForm.reset(); // Reset the form
  }
}
