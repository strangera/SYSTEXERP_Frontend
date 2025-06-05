import { LocationService } from './../../../service/basic/location.service';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { IndustryTypeService } from './../../../service/basic/industry-type.service';
import { VendorService } from './../../../service/basic/vendor.service';
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
import { ContractTypeService } from '../../../service/basic/contract-type.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';

// 2.1.2.6 招商進度監控
@Component({
  selector: 'app-tls12060',
  templateUrl: './tls12060.component.html',
  styleUrl: './tls12060.component.scss'
})
export class TLS12060Component {
  ProgNo: string = '210008';
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
    contractType: [[] as number[]], // 合約種類
    contractStatus: [[] as number[]], // 合約狀態
    startdate: [, [Validators.required]], // 接洽日期
    enddate: [, [Validators.required]], // 接洽日期
    contactPerson: [[] as number[]], // 接洽人員
    vendorUID: [[] as number[]], // 廠商統一編號
    industryCode: [[] as number[]], // 大分類代號
    region: [[] as number[]], // 區域
    floor: [[] as number[]], // 樓層
    locationNumber: [[] as number[]], // 位置編號
    rowNumbers: [, [Validators.maxLength(30)]], // 每行個數
    versionStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 版本編號
    versionEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 版本編號
    counterNumber: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 專櫃編號
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
  contractTypeOptions: any[] = [];
  contractStatusOptions: any[] = [];
  contactPersonOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  industryCodeOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  locationNumberOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private contractTypeService: ContractTypeService,
    private contractStatusService: ContractStatusService,
    private userCodeService: UserCodeService,
    private vendorService: VendorService,
    private industryTypeService: IndustryTypeService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private locationService: LocationService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.contractTypeService.getSystemTypes().subscribe(data => {
      this.contractTypeOptions = data;
    });
    //
    this.contractStatusService.getContractStatuses().subscribe(data => {
      this.contractStatusOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.contactPersonOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locationNumberOptions = data;
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
      this.router.navigate(['/TLS1000/TLS12060CRU'], extras);
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

      this.router.navigate(['/TLS1000/TLS12060CRU'], extras);
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

    this.router.navigate(['/TLS1000/TLS12060CRU'], extras);
  }
}
