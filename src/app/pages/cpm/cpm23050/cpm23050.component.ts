import { UserCodeService } from './../../../service/basic/user-code.service';
import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services

// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm23050',
  templateUrl: './cpm23050.component.html',
  styleUrl: './cpm23050.component.scss'
})
export class CPM23050Component extends BasicQpageComponent implements OnInit {
  ngOnInit(): void {
    this.ProgNo = '520016';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.returnPersonnelOptions = data));
  }

  queryForm = this.formBuilder.group({
    activityStartDate: [],
    activityEndDate: [],
    finalReturnDate: [],
    marketingCampaignCode: [],
    campaignName: [],
    itemManagementNumber: [],
    manufacturerCode: [],
    finalReturnPersonnel: [],
    itemCondition: [],
    returnStatus: [],
  });

  // Table data
  returnStatusOptions: any[] = [
    { value: 1, label: '未歸還' },
    { value: 2, label: '全部歸還' },
    { value: 3, label: '部分歸還' },
  ];
  itemConditionOptions: any[] = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' },
  ];
  returnPersonnelOptions: any[] = [];
  manufacturerOptions: any[] = [
    { value: 1, label: '53472035-23' },
  ];
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];

  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'itemManagementNumber', header: '用品管理單號', visible: true },
    { field: 'marketingCampaignCode', header: '行銷檔期代號', visible: true },
    { field: 'campaignName', header: '檔期名稱', visible: true },
    { field: 'activityStartDate', header: '活動開始日期', visible: true },
    { field: 'activityEndDate', header: '活動結束日期', visible: true },
    { field: 'manufacturerCode', header: '廠商編號', visible: true },
    { field: 'itemCondition', header: '用品狀況', visible: true },
    { field: 'finalReturnDate', header: '最後歸還日期', visible: true },
    { field: 'finalReturnPersonnel', header: '最後歸還人員', visible: true },
    { field: 'returnStatus', header: '歸還狀況', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService,
    private userCodeService: UserCodeService,
  ) {
    super(); // 呼叫父類建構子
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
      this.router.navigate(['CPM2000/CPM23050CRU'], extras);
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
