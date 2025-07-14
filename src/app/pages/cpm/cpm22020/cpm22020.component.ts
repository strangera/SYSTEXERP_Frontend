import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm22020',
  templateUrl: './cpm22020.component.html',
  styleUrls: ['./cpm22020.component.scss'],
})
export class CPM22020Component extends BasicQpageComponent implements OnInit {
  // 表單組
  queryForm = this.formBuilder.group({
    startDateStart: [],
    startDateEnd: [],
    endDateStart: [],
    endDateEnd: [],
    marketingCampaignCode: [],
    campaignName: [],
    campaignDescription: [],
  });

  // 下拉選單資料
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'projectPhaseCode', header: '行銷檔期代號', visible: true },
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

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520008';
    // 初始化權限與下拉選單資料
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

  }

  // 查詢提交
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 實際查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  // 查詢提交封裝
  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 新增功能
  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM22020CRU'], extras);
    }
  }

  // 編輯功能
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

  // 詳細資料功能
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

  // 清除表單
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
