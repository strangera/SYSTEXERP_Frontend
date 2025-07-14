import { CardStatusService } from './../../../service/basic/card-status.service';
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

// 2.2.19.4 餘代卡交易補登作業
@Component({
  selector: 'app-tls2k040',
  templateUrl: './tls2k040.component.html',
  styleUrl: './tls2k040.component.scss'
})
export class TLS2K040Component {
  ProgNo: string = '220100';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    shop: ['', [Validators.maxLength(10)]], // Input Text
    cardID: [, [Validators.maxLength(14), this.validationService.numberValidator]], // 餘代卡卡號
    status: [[] as number[]], // 餘代卡狀態
    backupStartdate: [], // 補登日期
    backupEnddate: [], // 補登日期
    releaseStartdate: [], // 卡片發行日
    releaseEnddate: [], // 卡片發行日
    machineStart: [, [this.validationService.numberValidator]], // 機號
    machineEnd: [, [this.validationService.numberValidator]], // 機號
    transferStart: [, [this.validationService.numberValidator]], // 交易序號
    transferEnd: [, [this.validationService.numberValidator]], // 交易序號
    serialnumber: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 專櫃編號/櫃號
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
    { field: 'contactPerson', header: '餘代卡卡號', visible: true },
    { field: 'contactDate', header: '補登日期', visible: true },
    { field: 'UID', header: '機號', visible: true },
    { field: 'industryType', header: '交易序號', visible: true },
    { field: 'category', header: '專櫃編號', visible: true },
    { field: 'version', header: '櫃位名稱', visible: true },
    { field: 'rentNumber', header: '已開金額', visible: true },
    { field: 'progress', header: '未開金額', visible: true },
    { field: 'progress', header: '備註', visible: true },
    { field: 'progress', header: '發行/使用', visible: true },
    { field: 'progress', header: '狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  statusOptions: any[] = [];
  cardOptions: any[] = [
    { label: '餘代卡', value: 1 },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private cardStatusService: CardStatusService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.cardStatusService.getSystemTypes().subscribe(data => {
      this.statusOptions = data;

      // 全選填入
      // let allSystemValues = this.statusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   status: allSystemValues
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
      this.router.navigate(['/TLS2000/TLS2K040CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2K040CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2K040CRU'], extras);
  }
}
