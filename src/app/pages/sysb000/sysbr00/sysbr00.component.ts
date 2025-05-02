import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-sysbr00',
  templateUrl: './sysbr00.component.html',
  styleUrl: './sysbr00.component.scss'
})
// 縣市區域資料維護作業
export class SYSBR00Component {
  ProgNo: string = '410013';
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
    // SYS2000 地址/縣市主檔
    city_no: ['', [Validators.maxLength(2)]], // 縣市代碼
    city_name: ['', [Validators.maxLength(6)]], // 縣市名稱
    city_group: ['', [Validators.maxLength(2)]], // 區域
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      id: 1, city_no: 1, city_name: '臺北市', city_group: 12,
      children: [
        { id: 1, area_no: '63', post_no: '6301', area_name: '松山區' },
        { id: 2, area_no: '63', post_no: '6302', area_name: '信義區' },
        { id: 3, area_no: '63', post_no: '6303', area_name: '大安區' }
      ],
    },
    {
      id: 2, city_no: 9, city_name: '台中市', city_group: 29,
      children: [
        { id: 4, area_no: '66', post_no: '6601', area_name: '中區' },
      ]
    }
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'city_no', header: '縣市代碼', visible: true },
    { field: 'city_name', header: '縣市名稱', visible: true },
    { field: 'city_group', header: '區域', visible: true },
    // 其他欄位
  ];
  subColumns: any[] = [
    { field: 'area_no', header: '鄉鎮區代碼', visible: true },
    { field: 'post_no', header: '郵遞區號', visible: true },
    { field: 'area_name', header: '鄉鎮區名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
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
      this.router.navigate(['/SYSB000/SYSBR00CRU'], extras);
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

      this.router.navigate(['/SYSB000/SYSBR00CRU'], extras);
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

    this.router.navigate(['/SYSB000/SYSBR00CRU'], extras);
  }
}
