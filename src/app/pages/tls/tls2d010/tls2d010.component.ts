import { ReleaseInvoiceService } from './../../../service/basic/release-invoice.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { FloorService } from './../../../service/basic/floor.service';
import { UserCodeService } from './../../../service/basic/user-code.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { DeductionCodeNameService } from './../../../service/basic/deduction-code-name.service';
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

@Component({
  selector: 'app-tls2d010',
  templateUrl: './tls2d010.component.html',
  styleUrl: './tls2d010.component.scss'
})
export class TLS2D010Component {
  ProgNo: string = '220063';
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
    counterID: [, [Validators.maxLength(6), this.validationService.numberValidator]], // 專櫃編號
    deductionItems: [[] as number[]], // 扣款項目
    accountingCode: [, [Validators.maxLength(8)]], // 會計科目代號
    organization: [[] as number[], [Validators.required]], // 組織
    onedatemm: [], // 扣款年月
    debitDay: [], // 扣款日期
    maintenanceDay: [], // 維護日
    builder: [], // 建立者
    floor: [], // 樓層
    eventCode: [], // 活動代碼/名稱
    establish: [], // 是否開立發票
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
    { field: 'contactDate', header: '扣款項目', visible: true },
    { field: 'UID', header: '會計科目代號', visible: true },
    { field: 'industryType', header: '組織代號', visible: true },
    { field: 'category', header: '活動代號', visible: true },
    { field: 'col0', header: '扣款年月', visible: true },
    { field: 'version', header: '是否開立發票', visible: true },
    { field: 'rentNumber', header: '扣款(未稅)', visible: true },
    { field: 'progress', header: '備註', visible: true },
    { field: 'col1', header: '維護日', visible: true },
    { field: 'col2', header: '建立者', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  deductionItemsOptions: any[] = [];
  organizationOptions: any[] = [];
  builderOptions: any[] = [];
  floorOptions: any[] = [];
  eventCodeOptions: any[] = [];
  establishOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private deductionCodeNameService: DeductionCodeNameService,
    private organizationNumberService: OrganizationNumberService,
    private userCodeService: UserCodeService,
    private floorService: FloorService,
    private counterCodeService: CounterCodeService,
    private releaseInvoiceService: ReleaseInvoiceService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.builderOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.eventCodeOptions = data;
    });
    //
    this.releaseInvoiceService.getSystemTypes().subscribe(data => {
      this.establishOptions = data;
    });
    //
    this.deductionCodeNameService.getDeductionCodeNames().subscribe(data => {
      this.deductionItemsOptions = data;

      // 全選填入
      // let allSystemValues = this.deductionItemsOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   deductionItems: allSystemValues
      // });
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;

      // 全選填入
      // let allSystemValues = this.organizationOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   organization: allSystemValues
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
      this.router.navigate(['/TLS2000/TLS2D010CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2D010CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2D010CRU'], extras);
  }
}
