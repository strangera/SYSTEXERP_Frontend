import { FloorService } from './../../../service/basic/floor.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';

// 2.2.15.3 專櫃進項發票未開立查詢作業
@Component({
  selector: 'app-tls2f030',
  templateUrl: './tls2f030.component.html',
  styleUrl: './tls2f030.component.scss'
})
export class TLS2F030Component {
  ProgNo: string = '220082';
  // 權限
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    onedatemm: [, [Validators.required]], // 結帳年月
    checkoutMethod: [[] as number[]], // 結帳方式
    floor: [[] as number[]], // 樓層
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    //{ contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '專櫃', visible: true },
    { field: 'contactDate', header: '結帳年月', visible: true },
    { field: 'UID', header: '結帳方式', visible: true },
    { field: 'industryType', header: '結帳方式', visible: true },
    { field: 'category', header: '未稅金額	', visible: true },
    { field: 'version', header: '稅額', visible: true },
    { field: 'rentNumber', header: '應開立發票金額', visible: true },
    { field: 'progress', header: '餘額', visible: true },
    { field: 'col1', header: '狀況', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  checkoutMethodOptions: any[] = [];
  floorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private settlementMethodService: SettlementMethodService,
    private floorService: FloorService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;

      // 全選填入
      // let allSystemValues = this.floorOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   floor: allSystemValues
      // });
    });
    //
    this.settlementMethodService.getSettlementMethods().subscribe(data => {
      this.checkoutMethodOptions = data;

      // 全選填入
      // let allSystemValues = this.checkoutMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   checkoutMethod: allSystemValues
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
      this.router.navigate(['/TLS2000/TLS2F030CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2F030CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2F030CRU'], extras);
  }
}
