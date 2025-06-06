import { ReleaseInvoiceService } from './../../../service/basic/release-invoice.service';
import { CalculateStatusService } from './../../../service/basic/calculate-status.service';
import { FloorService } from './../../../service/basic/floor.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { DistrictionByService } from './../../../service/basic/distriction-by.service';
import { EventCodeService } from './../../../service/basic/event-code.service';
import { CashSourceService } from './../../../service/basic/cash-source.service';
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
import { DeductionCodeNameService } from '../../../service/basic/deduction-code-name.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';

// 2.2.13.4 專櫃代扣款明細表
@Component({
  selector: 'app-tls2d040',
  templateUrl: './tls2d040.component.html',
  styleUrl: './tls2d040.component.scss'
})
export class TLS2D040Component {
  ProgNo: string = '220066';
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
    counterID: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 專櫃編號
    cashSource: [[] as number[]], // 來源系統別
    deductionCode: [], // 扣款代號
    startdate: [], // 扣款年月
    enddate: [], // 扣款年月
    venderID: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 廠商編號
    eventCode: [], // 活動代碼/名稱
    releaseInvoice: [[] as number[]], // 是否開立發票
    relyOn: [1, []], // 狀況(For匯總)
    orgCode: [], // 組織代碼
    floor: [], // DropDown
    category: [1, []], // 類型
    businessCode: [], // 大分類代碼/名稱
    operations: [[] as number[]], // 專櫃/自營櫃
    onlyNegative: [,], // 只顯示負值(只適用依專櫃統計)
    onlyMonthNegative: [,], // 只顯示當月應收為負值
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
    { field: 'contactPerson', header: '專櫃編號', visible: true },
    { field: 'contactDate', header: '櫃位名稱', visible: true },
    { field: 'UID', header: '來源系統別', visible: true },
    { field: 'industryType', header: '扣款代號', visible: true },
    { field: 'category', header: '扣款名稱', visible: true },
    { field: 'version', header: '組織代碼', visible: true },
    { field: 'rentNumber', header: '活動代號', visible: true },
    { field: 'col1', header: '會計科目代號', visible: true },
    { field: 'col2', header: '扣款年月', visible: true },
    { field: 'col3', header: '是否開立發票', visible: true },
    { field: 'col4', header: '扣款金額(未稅)', visible: true },
    { field: 'col5', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  cashSourceOptions: any[] = [];
  deductionCodeOptions: any[] = [];
  eventCodeOptions: any[] = [];
  relyOnOptions: any[] = [];
  releaseInvoiceOptions: any[] = [];
  orgCodeOptions: any[] = [];
  floorOptions: any[] = [];
  categoryOptions: any[] = [];
  businessCodeOptions: any[] = [];
  operationsOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private cashSourceService: CashSourceService,
    private deductionCodeNameService: DeductionCodeNameService,
    private eventCodeService: EventCodeService,
    private districtionByService: DistrictionByService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private cooperationMethodService: CooperationMethodService,
    private calculateStatusService: CalculateStatusService,
    private releaseInvoiceService: ReleaseInvoiceService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.cashSourceService.getSystemTypes().subscribe(data => {
      this.cashSourceOptions = data;

      // 全選填入
      // let allSystemValues = this.cashSourceOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   cashSource: allSystemValues
      // });
    });
    //
    this.releaseInvoiceService.getSystemTypes().subscribe(data => {
      this.releaseInvoiceOptions = data;

      // 全選填入
      // let allSystemValues = this.releaseInvoiceOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   releaseInvoice: allSystemValues
      // });
    });
    //
    this.deductionCodeNameService.getDeductionCodeNames().subscribe(data => {
      this.deductionCodeOptions = data;
    });
    //
    this.eventCodeService.getSystemTypes().subscribe(data => {
      this.eventCodeOptions = data;
    });
    //
    this.districtionByService.getSystemTypes().subscribe(data => {
      this.relyOnOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.orgCodeOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.businessCodeOptions = data;
    });
    //
    this.calculateStatusService.getSystemTypes().subscribe(data => {
      this.categoryOptions = data;
    });
    //
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.operationsOptions = data;

      // 全選填入
      // let allSystemValues = this.operationsOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   operations: allSystemValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return true;
  }
  canAdd(): boolean {
    return true;
  }
  canEdit(): boolean {
    return true;
  }
  // ----------------------------------------------------------------
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
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS2000/TLS2D040CRU'], extras);
  }
}
