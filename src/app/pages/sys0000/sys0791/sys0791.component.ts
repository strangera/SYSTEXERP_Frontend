import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { QueryAngleService } from '../../../service/basic/query-angle.service';
import { RoleCodeService } from '../../../service/basic/role-code.service';
import { SystemTypeDetailService } from '../../../service/basic/system-type-detail.service';
import { SubsystemService } from '../../../service/basic/subsystem.service';
import { JobNumberService } from '../../../service/basic/jobnumber.service';

const nowDate = new Date();

@Component({
  selector: 'app-sys0791',
  templateUrl: './sys0791.component.html',
  styleUrl: './sys0791.component.scss',
})
// 作業使用率查詢
export class SYS0791Component {
  ProgNo: string = '420016';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };
  // 查詢
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    organizationNumber: [], // DropDown
    startdate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [, [Validators.required]], // 日期限制 (start-end datetime yyyy/mm/dd)
    queryAngleOptions: [, [Validators.required]], // DropDown
    UserCodeOptions: [], // DropDown
    roleCodeOptions: [], // DropDown
    systemTypeDetail: [], // DropDown
    subsystemOptions: [], // DropDown
    jobNumberOptions: [], // DropDown
  });
  // 表格
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'userCode', header: '使用者編號', visible: true },
    { field: 'userName', header: '使用者名稱', visible: true },
    { field: 'orgCode', header: '組織編號', visible: true },
    { field: 'orgName', header: '組織名稱', visible: true },
    { field: 'mainSystemCode', header: '主系統編號', visible: true },
    { field: 'mainSystemName', header: '主系統名稱', visible: true },
    { field: 'subSystemCode', header: '子系統編號', visible: true },
    { field: 'subSystemName', header: '子系統名稱', visible: true },
    { field: 'operationCode', header: '作業編號', visible: true },
    { field: 'operationName', header: '作業名稱', visible: true },
    { field: 'failureCount', header: '使用次數', visible: true },
    { field: 'usageRate', header: '使用率', visible: true },
  ];
  
  // Options

  organizationNumberOptions: any[] = [];
  queryAngleOptions: any[] = [];
  UserCodeOptions: any[] = [];
  roleCodeOptions: any[] = [];
  subsystemOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];
  jobNumberOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private organizationNumber: OrganizationNumberService,
    private queryAngleService: QueryAngleService,
    private userCodeService: UserCodeService,
    private roleCodeService: RoleCodeService,
    private systemTypeDetailService: SystemTypeDetailService,
    private subsystemService: SubsystemService,
    private jobNumberService: JobNumberService
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.organizationNumber.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
    });
    this.queryAngleService.getQueryAngle().subscribe((data) => {
      this.queryAngleOptions = data;
    });
    this.userCodeService.getUserCode().subscribe((data) => {
      this.UserCodeOptions = data;
    });
    this.roleCodeService.getRoleCodes().subscribe((data) => {
      this.roleCodeOptions = data;
    });
    this.systemTypeDetailService.getSystemTypes().subscribe((data) => {
      this.systemTypeDetailOptions = data;
    });
    this.subsystemService.getSubsystems().subscribe((data) => {
      this.subsystemOptions = data;
    });
    this.jobNumberService.getJobNumbers().subscribe((data) => {
      this.jobNumberOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
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
    this.queryForm.reset();  // 重置表單
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
