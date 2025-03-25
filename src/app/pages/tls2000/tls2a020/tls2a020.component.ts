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
import { FloorService } from '../../../service/basic/floor.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

const now = new Date();

@Component({
  selector: 'app-tls2a020',
  templateUrl: './tls2a020.component.html',
  styleUrls: ['./tls2a020.component.scss']
})
export class TLS2A020Component {

  // 程式編號
  ProgNo: string = '220051';

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

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    salesDate: [now, [Validators.required]],  // 銷售日期
    cashRegisterNumber: [],  // 收銀機代號
    floor: [],  // 樓層
    sort: []  // 排序
  });
  // 表格数据
  data: any[] = [

    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'pendingApprovalRegisterCode', header: '未審核收銀機號', visible: true },
    { field: 'pendingApprovalPaymentTool', header: '未審核支付工具', visible: true },
    { field: 'systemAmount', header: '系統金額', visible: true },
    { field: 'receiptAmount', header: '貨收金額', visible: true },
  ];
  
  // 下拉選單選項
  floorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,
    private validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入樓層選項
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
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

  onSubmit(form: FormGroup) {
    console.log(form.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (form.valid && this.canQuery()) {
      // 提交查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(form: FormGroup) {
    this.onSubmit(form);
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
