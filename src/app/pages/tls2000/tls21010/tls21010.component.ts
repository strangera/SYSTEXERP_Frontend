import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls21010',
  templateUrl: './tls21010.component.html',
  styleUrl: './tls21010.component.scss'
})
export class TLS21010Component {

  ProgNo: string = '220001';
  // 权限
  funInfo?: FunsrightInfo;
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

  // 查询表单
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    deductionCode: [],
    itemName: [],
    accountSubject: [],
    organizationCode: [],
  });

  // 表格数据
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'identifier', header: '識別碼', visible: true },
    { field: 'deductionCode', header: '扣款代碼', visible: true },
    { field: 'itemName', header: '項目名稱', visible: true },
    { field: 'accountingSubject', header: '會計科目', visible: true },
    { field: 'organizationCode', header: '組織代碼', visible: true },
    { field: 'isContractualDeduction', header: '是否依合約拆立組織', visible: true },
    { field: 'isSelfPaidDeduction', header: '是否區分關系人', visible: true },
    { field: 'description', header: '摘要', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
  }

  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交逻辑
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
