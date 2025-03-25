import { UserLevelService } from './../../../service/basic/user-level.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserTypeService } from '../../../service/basic/user-type.service';
import { UserStatusService } from '../../../service/basic/user-status.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

// 4-2-1-1使用者基本資料維護
@Component({
  selector: 'app-sys0110',
  templateUrl: './sys0110.component.html',
  styleUrls: ['./sys0110.component.scss'],
})

export class SYS0110Component extends BasicQpageComponent implements OnInit {
  // 表單控制
  queryForm = this.formBuilder.group({
    userCode: [], // 使用者編號
    userAlias: [''], // 使用者名稱
    userLevel: [''], // 使用者等級
    organizationNumber: [''], // 組織編號
    startDate: [''], // 帳號有效開始日期
    endDate: [''], // 帳號有效結束日期
    lastLoginStartTime: [''], // 上次登入開始時間
    lastLoginEndTime: [''], // 上次登入結束時間
    userStatus: [''], // 使用者狀態
    userType: [''], // 使用者型態
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'userId', header: '使用者編號', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'organizationId', header: '組織編號', visible: true },
    { field: 'accountExpiryDate', header: '帳號有效截止日', visible: true },
    { field: 'accountLockDate', header: '帳號終止日', visible: true },
    { field: 'lastLoginTime', header: '上次登入時間', visible: true },
    { field: 'userStatus', header: '使用者狀態', visible: true },
    { field: 'userType', header: '使用者型態', visible: true },
    { field: 'userLevel', header: '使用者等級', visible: true },
    { field: 'remark', header: '備註', visible: true },
  ];

  // 下拉選單選項
  userLevelOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  userStatusOptions: any[] = [];
  userTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private userLevelService: UserLevelService,
    private organizationNumberService: OrganizationNumberService,
    private userTypeService: UserTypeService,
    private userStatusService: UserStatusService
  ) {
    super(); // 呼叫父類別建構子
  }

  ngOnInit(): void {
    this.ProgNo = '420001';
    // 權限資訊
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 初始化下拉選單選項
    this.userLevelService.getUserlevel().subscribe((data) => {
      this.userLevelOptions = data;
    });

    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
    });

    this.userTypeService.getUserTypes().subscribe((data) => {
      this.userTypeOptions = data;
    });

    this.userStatusService.getUserStatus().subscribe((data) => {
      this.userStatusOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 執行查詢邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm); // 呼叫查詢邏輯
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
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
      this.router.navigate(['SYS0000/SYS0110CRU'], extras);
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
      this.router.navigate(['SYS0000/SYS0110CRU'], extras);
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
    this.router.navigate(['SYS0000/SYS0110CRU'], extras);
  }
}
