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
import { RoleCodeService } from '../../../service/basic/role-code.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sys0710',
  templateUrl: './sys0710.component.html',
  styleUrl: './sys0710.component.scss',
})
// 使用者系統權限列表
export class SYS0710Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    userCode: [], // DropDown
    roleCode: [], // DropDown
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    // { field: 'serialNumber', header: '序號', visible: true },
    { field: 'userCode', header: '使用者代碼', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'mainSystemCode', header: '主系統代碼', visible: true },
    { field: 'mainSystemName', header: '主系統名稱', visible: true },
    { field: 'subSystemCode', header: '子系統代碼', visible: true },
    { field: 'subSystemName', header: '子系統名稱', visible: true },
    { field: 'operationCode', header: '作業代碼', visible: true },
    { field: 'operationName', header: '作業名稱', visible: true },
    { field: 'authorization', header: '具有權限之功能按鍵', visible: true },
  ];
  // ----------------------------------------------------------------
  userCodeOptions: any[] = [];
  roleCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private roleCodeService: RoleCodeService,
    private organizationNumberService: OrganizationNumberService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420011';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.roleCodeService.getRoleCodes().subscribe((data) => {
      this.roleCodeOptions = data;
    });
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => {
        this.userCodeOptions = data;
      });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
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

      //console.log("extra", extras);
      this.router.navigate(['/SYSB000/SYS0310CRU'], extras);
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

      this.router.navigate(['/SYSB000/SYS0310CRU'], extras);
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

    this.router.navigate(['/SYSB000/SYS0310CRU'], extras);
  }
}
