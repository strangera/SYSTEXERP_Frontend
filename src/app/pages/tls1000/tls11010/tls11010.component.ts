import { UsageService } from './../../../service/basic/usage.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { FloorService } from './../../../service/basic/floor.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-tls11010',
  templateUrl: './tls11010.component.html',
  styleUrl: './tls11010.component.scss'
})
// 2.1.1.1 專櫃位置資料維護
export class TLS11010Component {
  ProgNo: string = '210001';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    // POS2002_店位基本資料檔

    // id                  numeric(19,0) identity(1,1) not null,

    LOCATION_No: ['', [Validators.maxLength(10)]], // 店位代碼
    LOCATION_Name: ['', [Validators.maxLength(30)]], // 店位說明
    BUILDING_NO: [, [Validators.maxLength(2)]], // 館別(sys3800)
    FLOOR_NO: ['', [Validators.maxLength(2)]], // 樓層代碼(sys3900)
    AREA_NO: ['', [Validators.maxLength(2)]], // 區域代碼(sys3a00)
    GROSS_SPACE: ['', [Validators.maxLength(3), Validators.maxLength(7)]], // 毛坪(營業坪數)
    NET_SPACE: ['', [Validators.maxLength(3), Validators.maxLength(7)]], // 淨坪(簽約坪數)
    LOCATION_Status: [[] as number[]], // 使用狀態 0=空位 1=使用中 2=保留(不使用) 3=停用
    ORG_No: ['', [Validators.maxLength(6)]], // 組織代碼
    
    Location_Purpose: ['', [Validators.maxLength(2)]], // 用途別(SYS1000.T117)
    X_coordinate: [, [Validators.maxLength(10)]], // X座標
    Y_coordinate: [, [Validators.maxLength(10)]], // X座標
    Location_Remark: [,], // 備註

    // 以下可以不用顯示於查詢頁
    CRT_Date: [], // 建立日期
    CRT_USR_No: [, [Validators.maxLength(8)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [], // 變更日期
    UPD_USR_No: [, [Validators.maxLength(8)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { LOCATION_No: 'B1A01', LOCATION_Name: 'B1A01',
      BUILDING_NO: 1 ,FLOOR_NO: 'B1', AREA_NO: 'A', GROSS_SPACE: 100, NET_SPACE: 50,
      LOCATION_Status: 1 ,Location_Purpose: '專門店', X_coordinate: 10,Y_coordinate: 10, Location_Remark: '備註',
    },
    { LOCATION_No: 'B1A02', LOCATION_Name: 'B1A02',
      BUILDING_NO: 1 ,FLOOR_NO: 'B1', AREA_NO: 'A',GROSS_SPACE: 100, NET_SPACE: 50,
      LOCATION_Status: 2 ,Location_Purpose: 1, X_coordinate: 142.80,Y_coordinate: 42.5, Location_Remark: '備註',
    },
    { LOCATION_No: 'B1A03', LOCATION_Name: 'B1A03',
      BUILDING_NO: 1 ,FLOOR_NO: 'B1', AREA_NO: 'A',GROSS_SPACE: 100, NET_SPACE: 50,
      LOCATION_Status: 1 ,Location_Purpose: 1, X_coordinate: 42.9,Y_coordinate: 42.5, Location_Remark: '備註',
    },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'BUILDING_NO', header: '館別', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'LOCATION_No', header: '位置代碼', visible: true },
//    { field: 'LOCATION_Name', header: '位置說明', visible: true },

    { field: 'GROSS_SPACE', header: '營業坪數', visible: true },
    { field: 'NET_SPACE', header: '簽約坪數', visible: true },

    { field: 'Location_Purpose', header: '用途', visible: true },
    { field: 'LOCATION_Status', header: '狀態', visible: true },

    { field: 'X_coordinate', header: '平面圖X座標', visible: true },
    { field: 'Y_coordinate', header: '平面圖Y座標', visible: true },
    { field: 'Location_Remark', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  userStatusOptions: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '保留(不使用)' },
    { value: 3, label: '停用' },
  ];
  BUILDING_NO_Options: any[] = [
    { value: 1, label: '1館' },
    { value: 2, label: '2館' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private floorService: FloorService,
    private regionCodeService: RegionCodeService,
    private organizationNumberService: OrganizationNumberService,
    private usageService: UsageService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.regionCodeService.getRegionCodes().subscribe(data => {
      this.RegionCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.OrganizationCodeOptions = data;
    });
    //
    this.usageService.getUsageCodes().subscribe(data => {
      this.usageOptions = data;

      // let usageValues = this.usageOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   usage: usageValues
      // });
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
      this.router.navigate(['/TLS1000/TLS11010CRU'], extras);
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

      this.router.navigate(['/TLS1000/TLS11010CRU'], extras);
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

    this.router.navigate(['/TLS1000/TLS11010CRU'], extras);
  }
}
