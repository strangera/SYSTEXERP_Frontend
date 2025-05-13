import { FloorService } from './../../../service/basic/floor.service';
import { RegionCodeService } from './../../../service/basic/region-code.service';
import { LocationService } from './../../../service/basic/location.service';
import { BusinessTypeCodeService } from './../../../service/basic/business-type-code-service.service';
import { VendorService } from './../../../service/basic/vendor.service';
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
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';

// 2.1.2.3 專櫃意向書維護
@Component({
  selector: 'app-tls12030',
  templateUrl: './tls12030.component.html',
  styleUrl: './tls12030.component.scss'
})
export class TLS12030Component {
  ProgNo: string = '210005';
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
    recruitmentNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 專櫃招募編號
    brandName: ['', [Validators.maxLength(50)]], // 品牌(專櫃名稱)
    vendorUID: [[] as number[]], // 廠商統一編號
    versionNumber: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 版本編號
    negotiator: [[] as number[]], // 洽談者
    industryCode: [[] as number[]], // 業種代號
    locationNumber: [[] as number[]], // 位置編號
    region: [[] as number[]], // 區域
    floor: [[] as number[]], // 樓層
    contractStatus: [[] as number[]], // 合約狀態
    negotiationDateFrom: [], // 洽談日期
    negotiationDateTo: [], // 洽談日期
    businessType: [[] as number[]], // 營業型態
    replyStartDateFrom: [], // 回函日期
    replyStartDateTo: [], // 回函日期
    replyEndDateFrom: [], // 回函截止日
    replyEndDateTo: [], // 回函截止日
    contractStartDateFrom: [], // 合約起始日
    contractStartDateTo: [], // 合約起始日
    contractEndDateFrom: [], // 合約截止日
    contractEndDateTo: [], // 合約截止日
    cooperationMethod: [[] as number[]], // 專櫃配合方式
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { recruitmentNumber: '00003584', brandCName: 'xx', vendorUID: '0000/停車管理', versionNumber: 1,
    //   contactor: 'A小姐', industryCode: '業種代號', replyDate: '', replyEndDate: '2024-09-09',
    //   contractType: '意向書', contractStatus: '未審核',rentNumber: 1},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'recruitmentNumber', header: '專櫃招募編號', visible: true },
    { field: 'brandCName', header: '品牌', visible: true },
    { field: 'vendorUID', header: '廠商統一編號', visible: true },
    { field: 'versionNumber', header: '版本編號', visible: true },
    { field: 'contactor', header: '洽談者', visible: true },
    { field: 'industryCode', header: '業種代號', visible: true },
    { field: 'replyDate', header: '回函日期', visible: true },
    { field: 'replyEndDate', header: '回函截止日', visible: true },
    { field: 'contractType', header: '合約種類', visible: true },
    { field: 'contractStatus', header: '合約狀態', visible: true },
    { field: 'rentNumber', header: '承租數', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  vendorUIDOptions: any[] = [];
  negotiatorOptions: any[] = [];
  industryCodeOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  approvalStatusOptions: any[] = [];
  businessTypeOptions: any[] = [];
  cooperateOptions: any[] = [{ value: 1, label: '專櫃' }];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private locationService: LocationService,
    private regionCodeService: RegionCodeService,
    private floorService: FloorService,
    private contractStatusService: ContractStatusService,
    private businessTypeService: BusinessTypeService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.negotiatorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locationNumberOptions = data;
    });
    //
    this.regionCodeService.getRegionCodes().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.contractStatusService.getContractStatuses().subscribe(data => {
      this.approvalStatusOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.businessTypeService.getBusinessTypes().subscribe(data => {
      this.businessTypeOptions = data;

      // // 全選填入
      // let allValues = this.businessTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   businessType: allValues
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
      this.router.navigate(['/TLS1000/TLS12030CRU'], extras);
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

      this.router.navigate(['/TLS1000/TLS12030CRU'], extras);
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

    this.router.navigate(['/TLS1000/TLS12030CRU'], extras);
  }
}
