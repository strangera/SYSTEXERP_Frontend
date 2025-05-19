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
import { VendorService } from '../../../service/basic/vendor.service';

@Component({
  selector: 'app-tls55030-cru',
  templateUrl: './tls55030-cru.component.html',
  styleUrl: './tls55030-cru.component.scss'
})
export class TLS55030CRUComponent {

  ProgNo: string = '250028';
  funInfo?: FunsrightInfo;
  // Permissions
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  loading: boolean = false;
  submitted: boolean = false;

  dataForm = this.formBuilder.group({
    salesCode: [{ value: '自動編號', disabled: true }],
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
    Description: [],
    vendorCode: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  salesStatusOptions: any[] = [];
  salesLocationOptions: any[] = [];
  salesPersonOptions: any[] = [];
  transactionTypeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  userCodeOptions: any[] = [];
  formTitle: string = '';   //CRU
  showConfirm: boolean = false;//CRU
  crudstatus: CRUDStatus = CRUDStatus.Read;//CRU
  vendorOptions: any[] = [];
  // 表格資料2
  data2: any[] = [
    {
      sequenceNumber: 1,
      isNew: '是',
      transactionType: '單據別1',
      documentNumber: 'DOC123456',
      vendorCode: 'VND001',
      warehouseCode: 'WHS01',
      amountBeforeTax: 900,
      taxAmount: 100,
      totalAmount: 1000
    },
    {
      sequenceNumber: 2,
      isNew: '否',
      transactionType: '單據別2',
      documentNumber: 'DOC654321',
      vendorCode: 'VND002',
      warehouseCode: 'WHS02',
      amountBeforeTax: 1800,
      taxAmount: 200,
      totalAmount: 2000
    },
    // 其他資料
  ];

  filteredData2: any[] = [...this.data2];

  columns2: any[] = [
    { field: 'sequenceNumber', header: '序號', visible: true },
    { field: 'isNew', header: '新舊', visible: true },
    { field: 'transactionType', header: '單據別', visible: true },
    { field: 'documentNumber', header: '單號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'warehouseCode', header: '倉別', visible: true },
    { field: 'amountBeforeTax', header: '未稅金額', visible: true },
    { field: 'taxAmount', header: '稅額', visible: true },
    { field: 'totalAmount', header: '應稅金額', visible: true }
  ];


  // 表格資料
  data: any[] = [
    {
      sequenceNumber: 1,
      isNew: '是',
      transactionType: '單據別1',
      invoiceNumber: 'INV123456',
      invoiceDate: '2023-08-01',
      taxType: '課稅別1',
      invoicePurpose: '用途1',
      invoiceAmount: 1000,
      invoiceFormat: '格式1',
      discountAmount: 100,
      totalDiscountAmount: 200,
      amountBeforeTax: 900,
      taxAmount: 100
    },
    {
      sequenceNumber: 2,
      isNew: '否',
      transactionType: '單據別2',
      invoiceNumber: 'INV654321',
      invoiceDate: '2023-08-02',
      taxType: '課稅別2',
      invoicePurpose: '用途2',
      invoiceAmount: 2000,
      invoiceFormat: '格式2',
      discountAmount: 200,
      totalDiscountAmount: 300,
      amountBeforeTax: 1800,
      taxAmount: 200
    },
    // 其他資料
  ];



  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'sequenceNumber', header: '序號', visible: true },
    { field: 'isNew', header: '新舊', visible: true },
    { field: 'transactionType', header: '單據別', visible: true },
    { field: 'invoiceNumber', header: '發票/收據編號', visible: true },
    { field: 'invoiceDate', header: '發票/收據日期', visible: true },
    { field: 'taxType', header: '課稅別', visible: true },
    { field: 'invoicePurpose', header: '發票用途', visible: true },
    { field: 'invoiceAmount', header: '發票金額', visible: true },
    { field: 'invoiceFormat', header: '發票格式', visible: true },
    { field: 'discountAmount', header: '已折扣金額', visible: true },
    { field: 'totalDiscountAmount', header: '折扣金額', visible: true },
    { field: 'amountBeforeTax', header: '未稅金額', visible: true },
    { field: 'taxAmount', header: '稅額', visible: true }
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
    private vendorService: VendorService,

  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.saleslistStatusService.getSalesStatusOptions().subscribe(data => this.salesStatusOptions = data);
    this.salesLocationService.getSalesLocationOptions().subscribe(data => this.salesLocationOptions = data);
    this.counterCodeService.getCounterCodes().subscribe(data => this.counterCodeOptions = data);
    this.transactionTypeService.getTransactionTypes().subscribe(data => this.transactionTypeOptions = data);
    this.vendorService.getVendors().subscribe((data) => (this.vendorOptions = data));
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };//CRU

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }//CRU
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
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
    this.dataForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS5000/TLS55030'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          dataForm: this.dataForm,
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
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }//CRU

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['TLS5000/TLS55030']);
  }//CRU
}
