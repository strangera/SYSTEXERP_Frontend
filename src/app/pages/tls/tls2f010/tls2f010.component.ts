import { FloorService } from './../../../service/basic/floor.service';
import { SubpoenaStatusService } from './../../../service/basic/subpoena-status.service';
import { TaxableService } from './../../../service/basic/taxable.service';
import { PaperTypeService } from './../../../service/basic/paper-type.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
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

// 2.2.15.1 廠商發票請款登入暨維護作業
@Component({
  selector: 'app-tls2f010',
  templateUrl: './tls2f010.component.html',
  styleUrl: './tls2f010.component.scss'
})
export class TLS2F010Component {
  ProgNo: string = '220080';
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
    checkoutoOnedatemm: [], // 結帳年月
    counterID: [], // 專櫃編號
    paperType: [[] as number[]], // 單據種類
    invoiceNumber: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 發票/收據號碼
    invoiceStartdate: [], // 單據日期
    invoiceEnddate: [], // 單據日期
    checkoutMethod: ['', [Validators.maxLength(2)]], // 結帳方式
    requestOnedatemm: [], // 請款付款年月
    bill: ['', [Validators.maxLength(1)]], // 帳次
    declareOnedatemm: [], // 申報年月
    uID: ['', [Validators.maxLength(8)]], // 廠商統一編號
    taxType: [[] as number[]], // 課稅別
    startserialinvoice: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總額
    endserialinvoice: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票總額
    startserialnonTax: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 未稅金額
    endserialnonTax: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 未稅金額
    startserialTax: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    endserialTax: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 稅額
    format: ['', [Validators.maxLength(2)]], // 格式
    status: [[] as number[]], // 狀況
    transferStartdate: [], // 傳送日期
    transferEnddate: [], // 傳送日期
    builder: ['', [Validators.maxLength(10)]], // 建立者
    usagec: [,], // 是否貼現
    buildStartdate: [], // 建立日期
    buildEnddate: [], // 建立日期
    floor: [], // 樓層
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
    { field: 'contactPerson', header: '專櫃編號', visible: true },
    { field: 'contactDate', header: '專櫃名稱', visible: true },
    { field: 'UID', header: '單據種類', visible: true },
    { field: 'industryType', header: '發票/收據號碼', visible: true },
    { field: 'category', header: '單據日期', visible: true },
    { field: 'version', header: '請款付款年月', visible: true },
    { field: 'rentNumber', header: '帳款年月', visible: true },
    { field: 'col1', header: '結帳方式', visible: true },
    { field: 'col2', header: '帳次', visible: true },
    { field: 'col3', header: '申報年月', visible: true },
    { field: 'col4', header: '廠商統一編號', visible: true },
    { field: 'col5', header: '課稅別', visible: true },
    { field: 'col6', header: '發票總額', visible: true },
    { field: 'col7', header: '未稅金額', visible: true },
    { field: 'col8', header: '稅額', visible: true },
    { field: 'col9', header: '格式', visible: true },
    { field: 'col10', header: '狀況', visible: true },
    { field: 'col11', header: '是否貼現', visible: true },
    { field: 'col12', header: '建立者', visible: true },
    { field: 'col13', header: '建立日期', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  checkoutMethodOptions: any[] = [];
  counterIDOptions: any[] = [];
  paperTypeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  statusOptions: any[] = [];
  floorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private counterCodeService: CounterCodeService,
    private paperTypeService: PaperTypeService,
    private taxableService: TaxableService,
    private subpoenaStatusService: SubpoenaStatusService,
    private floorService: FloorService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.counterIDOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.paperTypeService.getSystemTypes().subscribe(data => {
      this.paperTypeOptions = data;
      // 全選填入
      // let allSystemValues = this.paperTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   paperType: allSystemValues
      // });
    });
    //
    this.taxableService.getSystemTypes().subscribe(data => {
      this.taxTypeOptions = data;
      // 全選填入
      // let allSystemValues = this.taxTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   taxType: allSystemValues
      // });
    });
    //
    this.subpoenaStatusService.getSystemTypes().subscribe(data => {
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
      this.router.navigate(['/TLS2000/TLS2F010CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2F010CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2F010CRU'], extras);
  }
}
