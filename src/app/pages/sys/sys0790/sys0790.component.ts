import { SystemTypeService } from './../../../service/basic/system-type.service';
import { UserLevelService } from './../../../service/basic/user-level.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserTypeService } from '../../../service/basic/user-type.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { SystemTypeDetailService } from '../../../service/basic/system-type-detail.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

const now = new Date();

@Component({
  selector: 'app-sys0790',
  templateUrl: './sys0790.component.html',
  styleUrl: './sys0790.component.scss',
})
// 使用者作業按鈕歷程報表
export class SYS0790Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    lastLoginStartTime: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd HH:mm)
    lastLoginEndTime: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd HH:mm)
    UserCodeOptions: [], // DropDown
    systemTypeDetail: [], // DropDown
  });
  // 表格
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'logTime', header: 'LOG時間', visible: true },
    { field: 'user', header: '使用者', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'operationCode', header: '作業代碼', visible: true },
    { field: 'operationName', header: '作業名稱', visible: true },
    { field: 'buttonName', header: '按鈕名稱', visible: true },
    { field: 'linkLocation', header: '連結位置', visible: true },
  ];

  // Options
  organizationNumberOptions: any[] = [];
  userStatusOptions: any[] = [];
  userTypeOptions: any[] = [];
  UserCodeOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private organizationNumber: OrganizationNumberService,
    private userTypeService: UserTypeService,
    private userCodeService: UserCodeService,
    private systemTypeDetailService: SystemTypeDetailService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420018';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.organizationNumber.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
    });
    this.userTypeService.getUserTypes().subscribe((data) => {
      this.userTypeOptions = data;
    });
    this.userCodeService.getUserCode().subscribe((data) => {
      this.UserCodeOptions = data;
    });
    this.systemTypeDetailService.getSystemTypes().subscribe((data) => {
      this.systemTypeDetailOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
}
