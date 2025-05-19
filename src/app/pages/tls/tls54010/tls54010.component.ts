import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { SaleslistStatusService } from '../../../service/basic/saleslist-status.service';
import { SalesLocationService } from '../../../service/basic/sales-location.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { UserCodeService } from '../../../service/basic/user-code.service';

@Component({
  selector: 'app-tls54010',
  templateUrl: './tls54010.component.html',
  styleUrls: ['./tls54010.component.scss']
})
export class TLS54010Component {

  ProgNo: string = '250025';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    salesCode: [],
    machineCode: [],
    transactionCodeFrom: [],
    transactionCodeTo: [],
    invoiceNumberFrom: [],
    invoiceNumberTo: [],
    brandCode: [],
    warehouseCode: [],
    salesLocation: [],
    salesPerson: [],
    salesStatus: [],
    transactionType: [],
    salesDateFrom: [],
    salesDateTo: [],
    barcodeNumber: [],
    counterCode: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  salesStatusOptions: any[] = [];
  salesLocationOptions: any[] = [];
  salesPersonOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  userCodeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'salesOrder', header: '銷售單號', visible: true },
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'posMachine', header: 'POS機號', visible: true },
    { field: 'transactionSerialNumber', header: '交易序號', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'salesAmount', header: '銷售金額', visible: true },
    { field: 'orderPerson', header: '開單人員', visible: true },
    { field: 'salesOrderStatus', header: '銷售單狀態', visible: true },
    { field: 'salesLocation', header: '銷售位置', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private saleslistStatusService: SaleslistStatusService,
    private salesLocationService: SalesLocationService,
    private counterCodeService: CounterCodeService,
    private transactionTypeService: TransactionTypeService,
    private authService: AuthService,
    private userCodeService: UserCodeService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.saleslistStatusService.getSalesStatusOptions().subscribe(data => this.salesStatusOptions = data);
    this.salesLocationService.getSalesLocationOptions().subscribe(data => this.salesLocationOptions = data);
    this.counterCodeService.getCounterCodes().subscribe(data => this.salesPersonOptions = data);
    this.transactionTypeService.getTransactionTypes().subscribe(data => this.transactionTypeOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
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
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
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
        skipLocationChange: true,
      };
      this.router.navigate(['TLS5000/TLS54010CRU'], extras);
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
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
