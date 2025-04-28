import { FloorService } from './../../../service/basic/floor.service';
import { CahserTypeService } from './../../../service/basic/cahser-type.service';
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
import { RegionCodeService } from '../../../service/basic/region-code.service';

@Component({
  selector: 'app-tls2b030',
  templateUrl: './tls2b030.component.html',
  styleUrl: './tls2b030.component.scss'
})
export class TLS2B030Component {
  ProgNo: string = '220057';
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
    onedatemm: [], // 銷售年月-月報表
    startdate: [], // 銷售日期-日報表
    enddate: [], // 銷售日期-日報表
    cahserStart: [, [Validators.max(999999), this.validationService.numberValidator]], // 收銀機代號
    cahserEnd: [, [Validators.max(999999), this.validationService.numberValidator]], // 收銀機代號
    counterStart: [, [Validators.max(999999), this.validationService.numberValidator]], // 專櫃編號
    counterEnd: [, [Validators.max(999999), this.validationService.numberValidator]], // 專櫃編號
    regionCode: [[] as number[]], // 區域代號
    cahserType: [[] as number[]], // 收銀類別
    floor: [], // 樓層
    onlyShowOverflow: [,], // 僅顯示溢欠
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
    { field: 'contactPerson', header: '收銀機代號', visible: true },
    { field: 'contactDate', header: '專櫃編號', visible: true },
    { field: 'UID', header: '專櫃名稱', visible: true },
    { field: 'industryType', header: '現金', visible: true },
    { field: 'category', header: '信用卡', visible: true },
    { field: 'version', header: '一卡通', visible: true },
    { field: 'rentNumber', header: '禮券', visible: true },
    { field: 'col1', header: '商品提貨單', visible: true },
    { field: 'col2', header: '感熱紙抵用券', visible: true },
    { field: 'col3', header: '商品抵用券', visible: true },
    { field: 'col4', header: '貴賓提貨單(應收帳款)', visible: true },
    { field: 'col5', header: '外來禮券(抵用券)', visible: true },
    { field: 'col6', header: '外來提貨單(抵用券)', visible: true },
    { field: 'col7', header: '活動券(自營)', visible: true },
    { field: 'col8', header: '折價券', visible: true },
    { field: 'col9', header: '現抵', visible: true },
    { field: 'col10', header: '禮券餘代卡', visible: true },
    { field: 'col11', header: '提貨單餘代卡', visible: true },
    { field: 'col12', header: '會員折抵', visible: true },
    { field: 'col13', header: 'LINE PAY', visible: true },
    { field: 'col14', header: 'APP抵用券', visible: true },
    { field: 'col15', header: 'APP提貨單', visible: true },
    { field: 'col16', header: '總金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  cahserTypeOptions: any[] = [];
  areaCodeOptions: any[] = [];
  floorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private cahserTypeService: CahserTypeService,
    private regionCodeService: RegionCodeService,
    private floorService: FloorService,
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
    this.cahserTypeService.getSystemTypes().subscribe(data => {
      this.cahserTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.cahserTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   cahserType: allSystemValues
      // });
    });
    //
    this.regionCodeService.getRegionCodes().subscribe(data => {
      this.areaCodeOptions = data;

      // 全選填入
      // let allSystemValues = this.areaCodeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   regionCode: allSystemValues
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
      this.router.navigate(['/TLS2000/TLS2B030CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2B030CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2B030CRU'], extras);
  }
}
