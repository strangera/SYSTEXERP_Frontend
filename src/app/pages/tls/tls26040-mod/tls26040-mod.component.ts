import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FloorService } from '../../../service/basic/floor.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

const now = new Date();

@Component({
  selector: 'app-tls26040-mod',
  templateUrl: './tls26040-mod.component.html',
  styleUrls: ['./tls26040-mod.component.scss']
})
export class TLS26040ModComponent implements OnInit {

  ProgNo: string = '220038';

  // 權限變數
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

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    startRecognitionDate: [now, [Validators.required]], // 認列日期
    batchNumber: [],  // 批號
  });

  // 下拉選單選項
  floorOptions: any[] = [];

  // 表格資料
  data: any[] = [
    { preSaleDate: '2024-10-01', accountDate: '2024-10-02', cashRegisterCode: '001', categoryCode: 'A1', batchNumber: 'B001', transactionSerial: 'T001', amount: 1000, 'isdelete': true, },
    { preSaleDate: '2024-10-02', accountDate: '2024-10-03', cashRegisterCode: '002', categoryCode: 'A2', batchNumber: 'B002', transactionSerial: 'T002', amount: 2000, 'isdelete': true, },
    // 其他測試資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'preSaleDate', header: '預售日期', visible: true },
    { field: 'accountDate', header: '結帳日期', visible: true },
    { field: 'cashRegisterCode', header: '收銀機號', visible: true },
    { field: 'transactionSerial', header: '交易序號', visible: true },
    { field: 'categoryCode', header: '部別編號', visible: true },
    { field: 'batchNumber', header: '批號', visible: true },
    { field: 'amount', header: '金額', visible: true }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,  // 樓層 service
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
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
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS26040CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS26040CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS2000/TLS26040CRU'], extras);
  }
  onRefresh() { }
}
