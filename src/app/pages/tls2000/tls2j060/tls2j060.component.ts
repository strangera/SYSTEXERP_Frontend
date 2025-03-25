import { InvoiceManagementService } from './../../../service/basic/invoice-management.service';
import { TaxableService } from './../../../service/basic/taxable.service';
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
import { TransferTypeService } from '../../../service/basic/transfer-type.service';
import { InvoiceTypeService } from '../../../service/basic/invoice-type.service';

// 2.2.18.6 發票換開查詢作業
@Component({
  selector: 'app-tls2j060',
  templateUrl: './tls2j060.component.html',
  styleUrl: './tls2j060.component.scss'
})
export class TLS2J060Component {
  ProgNo: string = '220095';
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
    uID: ['', [Validators.maxLength(8)]], // 統一編號
    startserialinvoice2: [, [this.validationService.numberValidator]], // 二聯式發票號碼
    endserialinvoice2: [, [this.validationService.numberValidator]], // 二聯式發票號碼
    invoice3: ['', [Validators.maxLength(10)]], // 三聯式發票號碼
    startdate: [], // 換開日期
    enddate: [], // 換開日期
    items: ['', [Validators.maxLength(100)]], // 品項
    taxType: [], // 稅別
    salesAmountFrom: [, [this.validationService.numberValidator]], // 銷售淨額
    salesAmountTo: [, [this.validationService.numberValidator]], // 銷售淨額
    taxAmountFrom: [, [this.validationService.numberValidator]], // 稅額
    taxAmountTo: [, [this.validationService.numberValidator]], // 稅額
    transferType: [1, []], // 交易類型
    invoiceType: [1, []], // 發票類型
    invoiceManagement: [1, []], // 作廢/刪除
    systemtyperadio: [1, []], // 發票換開類別
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
  columns: any[]= [
    { field: 'contactPerson', header: '換開日期', visible: true },
    { field: 'contactDate', header: '三聯式發票號碼', visible: true },
    { field: 'UID', header: '收銀機號', visible: true },
    { field: 'industryType', header: '交易序號', visible: true },
    { field: 'category', header: '銷售日期', visible: true },
    { field: 'version', header: '二聯式發票起號', visible: true },
    { field: 'rentNumber', header: '二聯式發票迄號', visible: true },
    { field: 'progress', header: '稅別', visible: true },
    { field: 'col1', header: '銷售淨額', visible: true },
    { field: 'col2', header: '稅額', visible: true },
    { field: 'col3', header: '銷售金額', visible: true },
    { field: 'col4', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  taxTypeOptions: any[] = [];
  transferTypeOptions: any[] = [];
  invoiceTypeOptions: any[] = [];
  invoiceManagementOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private taxableService: TaxableService,
    private transferTypeService: TransferTypeService,
    private invoiceTypeService: InvoiceTypeService,
    private invoiceManagementService: InvoiceManagementService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.taxableService.getSystemTypes().subscribe(data => {
      this.taxTypeOptions = data;
    });
    // ----------------------------------------------------------------
    this.transferTypeService.getSystemTypes().subscribe(data => {
      this.transferTypeOptions = data;
    });
    // ----------------------------------------------------------------
    this.invoiceTypeService.getSystemTypes().subscribe(data => {
      this.invoiceTypeOptions = data;
    });
    // ----------------------------------------------------------------
    this.invoiceManagementService.getSystemTypes().subscribe(data => {
      this.invoiceManagementOptions = data;
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
      this.router.navigate(['/TLS2000/TLS2J060CRU'], extras);
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

      this.router.navigate(['/TLS2000/TLS2J060CRU'], extras);
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

    this.router.navigate(['/TLS2000/TLS2J060CRU'], extras);
  }
}
