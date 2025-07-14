import { WhetherService } from './../../../service/basic/whether.service';
import { ContractStatusService } from './../../../service/basic/contract-status.service';
import { SalesTypeService } from './../../../service/basic/sales-type.service';
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
import { AnnouncementUserService } from '../../../service/basic/announcement-user.service';

//2.2.13.6 專櫃活動設定暨審核作業
@Component({
  selector: 'app-tls2d060',
  templateUrl: './tls2d060.component.html',
  styleUrl: './tls2d060.component.scss'
})
export class TLS2D060Component {
  ProgNo: string = '220068';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    department: [], // 部門
    reviewNumber: [, [Validators.maxLength(9), this.validationService.numberValidator]], // 審核單號
    salesType: [], // 銷售類型
    deductionItems: [], // 扣款項目
    startdateFrom: [], // 活動起始日期
    startdateTo: [], // 活動起始日期
    endDateFrom: [], // 活動結束日期
    endDateTo: [], // 活動結束日期
    overContract: [[] as number[]], // 是否已取過合約設定
    contractStatus: [[] as number[]], // 狀態
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
    { field: 'contactPerson', header: '洽談者', visible: true },
    { field: 'contactDate', header: '洽談日', visible: true },
    { field: 'UID', header: '統編/廠商', visible: true },
    { field: 'industryType', header: '大分類', visible: true },
    { field: 'category', header: '類型', visible: true },
    { field: 'version', header: '版本', visible: true },
    { field: 'rentNumber', header: '位置租賃數', visible: true },
    { field: 'progress', header: '進度', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  departmentOptions: any[] = [];
  salesTypeOptions: any[] = [];
  deductionItemsOptions: any[] = [];
  contractStatusOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private announcementUserService: AnnouncementUserService,
    private salesTypeService: SalesTypeService,
    private contractStatusService: ContractStatusService,
    private whetherService: WhetherService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.announcementUserService.getSystemTypes().subscribe(data => {
      this.departmentOptions = data;
    });
    //
    this.salesTypeService.getSystemTypes().subscribe(data => {
      this.salesTypeOptions = data;
      this.deductionItemsOptions = data;
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   overContract: allSystemValues
      // });
    });

    //
    this.contractStatusService.getContractStatuses().subscribe(data => {
      this.contractStatusOptions = data;

      // 全選填入
      // let allSystemValues = this.contractStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   contractStatus: allSystemValues
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
      this.router.navigate(['/TLS2000/TLS2D060CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2D060CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2D060CRU'], extras);
  }
}
