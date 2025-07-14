import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { IndustryTypeService } from './../../../service/basic/industry-type.service';
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

// 2.2.16.4 預算日報表
@Component({
  selector: 'app-tls2g040',
  templateUrl: './tls2g040.component.html',
  styleUrl: './tls2g040.component.scss'
})
export class TLS2G040Component {
  ProgNo: string = '220086';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    onedatemm: [], // 年月
    industryCode: [], // 大分類
    productCategory: [], // 中分類
    smallCategory: [], // 小分類
    counter: [], // DropDown
    OrganizationType: [], // 組織
    serialnumber: [, [Validators.maxLength(6), this.validationService.numberValidator]], // 專櫃編號
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
    { field: 'contactPerson', header: '大分類/大分類名稱', visible: true },
    { field: 'contactDate', header: '月預算', visible: true },
    { field: 'UID', header: '1(三)', visible: true },
    { field: 'industryType', header: '2(四)', visible: true },
    { field: 'category', header: '3(五)', visible: true },
    { field: 'version', header: '4(六)', visible: true },
    { field: 'rentNumber', header: '5(日)', visible: true },
    { field: 'progress', header: '6(一)', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  industryCodeOptions: any[] = [];
  OrganizationTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private industryTypeService: IndustryTypeService,
    private organizationNumberService: OrganizationNumberService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.OrganizationTypeOptions = data;
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
      this.router.navigate(['/TLS2000/TLS2G040CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2G040CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2G040CRU'], extras);
  }
  demo() { this.router.navigate(['/TLS2000/TLS2G040CRU']); }
}
