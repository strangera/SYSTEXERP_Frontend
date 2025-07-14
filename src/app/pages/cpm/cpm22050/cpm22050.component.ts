import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { FloorService } from '../../../service/basic/floor.service';
import { LocationCodeService } from '../../../service/basic/locationcode.service';

@Component({
  selector: 'app-cpm22050',
  templateUrl: './cpm22050.component.html',
  styleUrl: './cpm22050.component.scss',
})
export class CPM22050Component extends BasicQpageComponent implements OnInit {
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

  // 下拉選單選項
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];

  activityCategoryOptions: any[] = [
    { value: 1, label: 'DM發送活動' },
    { value: 2, label: '紅利積點活動' },
    { value: 3, label: '聯名超強卡友日' },
    { value: 4, label: '贈品兌換活動' },
  ];

  // 表格資料
  data: any[] = [];
  columns: any[] = [
    { field: 'projectPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
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
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520011';
    // 初始化下拉選單選項
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  }

  // 查詢表單提交
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  // 查詢按鈕的點擊事件
  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 創建按鈕的點擊事件
  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM22050CRU'], extras);
    }
  }

  // 編輯按鈕的點擊事件
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
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
    }
  }

  // 詳細資料按鈕的點擊事件
  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }

  // 清除表單資料
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
