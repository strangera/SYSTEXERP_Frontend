import { SubpoenaStatusService } from './../../../service/basic/subpoena-status.service';
import { SubpoenaTypeService } from './../../../service/basic/subpoena-type.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-tls2c040',
  templateUrl: './tls2c040.component.html',
  styleUrl: './tls2c040.component.scss'
})
export class TLS2C040Component {
  ProgNo: string = '220061';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    subpoenaType: [[] as number[]], // 傳票總類
    startdate: [], // 傳票日期
    enddate: [], // 傳票日期
    subpoenaStatus: [[] as number[]], // 傳票狀態
    serialnumber: [, [Validators.maxLength(12), this.validationService.numberValidator]], // 結帳單號
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    // { contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    // { contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '應收(付)明細暫存資料', visible: true },
    { field: 'contactDate', header: '傳票編號', visible: true },
    { field: 'UID', header: '傳票種類', visible: true },
    { field: 'industryType', header: '傳票日期', visible: true },
    { field: 'category', header: '傳票狀態', visible: true },
    { field: 'version', header: '傳票摘要', visible: true },
    { field: 'rentNumber', header: '結帳單號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  subpoenaTypeOptions: any[] = [];
  subpoenaStatusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private subpoenaTypeService: SubpoenaTypeService,
    private SubpoenaStatusService: SubpoenaStatusService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.subpoenaTypeService.getSystemTypes().subscribe(data => {
      this.subpoenaTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.subpoenaTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   subpoenaType: allSystemValues
      // });
    });
    //
    this.SubpoenaStatusService.getSystemTypes().subscribe(data => {
      this.subpoenaStatusOptions = data;

      // 全選填入
      // let allSystemValues = this.subpoenaStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   subpoenaStatus: allSystemValues
      // });
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
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
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/TLS2000/TLS2C040CRU'], extras);
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
        skipLocationChange: true
      };

      this.router.navigate(['/TLS2000/TLS2C040CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/TLS2000/TLS2C040CRU'], extras);
  }
}
