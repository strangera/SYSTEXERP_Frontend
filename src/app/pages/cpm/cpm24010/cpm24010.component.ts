import { UserCodeService } from './../../../service/basic/user-code.service';
import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm24010',
  templateUrl: './cpm24010.component.html',
  styleUrls: ['./cpm24010.component.scss']
})
export class CPM24010Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    startDateStart: [], // 開始日期
    startDateEnd: [], // 開始日期
    endDateStart: [], // 結束日期
    endDateEnd: [], // 結束日期
    marketingCampaignCode: [],
    campaignName: [],
    campaignDescription: []
  });

  // 下拉選單選項
  campaignDescription: any[] = [
    { value: 1, label: '新年促銷' },
    { value: 2, label: '夏季特賣' },
    { value: 3, label: '周年慶活動' }
  ];
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
    { value: 3, label: '003' }
  ];

  data: any[] = [];
  columns: any[] = [
    { field: 'campaignPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'startDate', header: '開始日期', visible: true },
    { field: 'endDate', header: '結束日期', visible: true },
    { field: 'phaseDescription', header: '檔期說明', visible: true },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private locationCodeService: LocationCodeService,
    private userCodeService: UserCodeService
  ) {
    super();

  }

  ngOnInit(): void {
    this.ProgNo = '520017';
    // 初始化下拉選單選項
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.loadDropdownOptions();
  }

  // 加載下拉選單選項的方法
  loadDropdownOptions() {
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => (this.marketingCampaignOptions = data));
    this.floorService.getFloors().subscribe();
    this.locationCodeService.getSystemTypes().subscribe();
    this.userCodeService.getUserCode().subscribe();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 查詢邏輯
      console.log('Querying with: ', frm.value);
      // 例如，可以使用服務來發送查詢條件並接收結果
      // this.someService.query(frm.value).subscribe((data) => {
      //   this.data = data;
      //   this.loading = false;
      //   this.notificationService.unblockUi();
      // });
    } else {
      this.loading = false;
      this.notificationService.unblockUi();
    }
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM24010CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
    }
  }

  onDetail(data: any) {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
