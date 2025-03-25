import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { VendorService } from '../../../service/basic/vendor.service';
import { PaperStatusService } from '../../../service/basic/paper-status.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { SystemTypeService } from '../../../service/basic/system-type.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-tls52040-cru',
  templateUrl: './tls52040-cru.component.html',
  styleUrl: './tls52040-cru.component.scss'
})
export class TLS52040CRUComponent extends BasicCrupageComponent implements OnInit {
  
  // ProgNo: string = '250017';
  // funInfo: FunsrightInfo = {};

  // // Permissions
  // addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  // editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  // loading: boolean = false;
  // submitted: boolean = false;


  dataForm = this.formBuilder.group({
    managementId: [{ value: '自動編號', disabled: true }],
    vendorId: [],
    paperStatus: [],
    warehouseId: [, Validators.required],
    brandId: [],
    vendorCode: [, Validators.required],
    applicantId: [],
    approverId: [],
    returnId: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    name: [], // Input Text
    systemtypemulti: [[] as number[], [Validators.required]], // MultiSelect
    returnAcceptanceNumber: [{ value: '自動編號', disabled: true }], // 退貨驗收單號
    returnAcceptanceAmount: [], // 退貨驗收金額
    taxAmount: [], // 稅額
    totalAmount: [], // 合計金額
    totalSaleAmount: [], // 售價總計   
        // ----------------------------------------------------------------
        items: this.formBuilder.array([
          this.createItem()
        ]),
  });

  // Dropdown options
  vendorOptions: any[] = [];
  paperStatusOptions: any[] = [];
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  userCodeOptions: any[] = [];
  managementIdOptions: any[] = [];
  // formTitle: string = '';   //CRU
  // showConfirm: boolean = false;//CRU
  // crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

// Table data
data: any[] = [
  {
    sequence: 1,
    isNew: true,
    aboveNew: true,
    productManagementCodeName: 'Product A',
    returnableQuantity: 100,
    returnQuantity: 10,
    productUnit: 'PCS',
    unitPrice: 20.0,
    tax: 5.0,
    untaxedAmount: 190.0,
    salePrice: 200.0,
    saleSubtotal: 4000.0,
    returnInvoiceNumber: 'INV12345',
    itemRemarks: 'Some remarks',
  },
  {
    sequence: 2,
    isNew: false,
    aboveNew: false,
    productManagementCodeName: 'Product B',
    returnableQuantity: 200,
    returnQuantity: 20,
    productUnit: 'PCS',
    unitPrice: 15.0,
    tax: 3.0,
    untaxedAmount: 297.0,
    salePrice: 300.0,
    saleSubtotal: 6000.0,
    returnInvoiceNumber: 'INV54321',
    itemRemarks: 'Other remarks',
  },
  // Add other data as needed
];

filteredData: any[] = [...this.data];
columns: any[] = [
  { field: 'sequence', header: '序號', visible: true },
  { field: 'isNew', header: '是否新貨', visible: true },
  { field: 'aboveNew', header: '以上新貨', visible: true },
  { field: 'productManagementCodeName', header: '商品管理編號/名稱', visible: true },
  { field: 'returnableQuantity', header: '可退回數量', visible: true },
  { field: 'returnQuantity', header: '退回數量', visible: true },
  { field: 'productUnit', header: '商品單位', visible: true },
  { field: 'unitPrice', header: '單價', visible: true },
  { field: 'tax', header: '稅額', visible: true },
  { field: 'untaxedAmount', header: '未稅金額', visible: true },
  { field: 'salePrice', header: '售價', visible: true },
  { field: 'saleSubtotal', header: '售價小計', visible: true },
  { field: 'returnInvoiceNumber', header: '退貨單號碼', visible: true },
  { field: 'itemRemarks', header: '單項備註', visible: true },
];

  systemTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private vendorService: VendorService,
    private paperStatusService: PaperStatusService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private userCodeService: UserCodeService,
    private managementIdService: ManagementIDService,
    private systemTypeService: SystemTypeService,
    private authService: AuthService,

  ) {super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250017';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.systemTypeService.getSystemTypes().subscribe(data => {
      this.systemTypeOptions = data;

      // 全選填入
      let allSystemValues = this.systemTypeOptions.map(system => system.value);
      this.dataForm.patchValue({
        systemtypemulti: allSystemValues
      });
    });
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.vendorService.getVendors().subscribe(data => this.vendorOptions = data);
    this.paperStatusService.getSystemTypes().subscribe(data => this.paperStatusOptions = data);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
    this.managementIdService.getSystemTypes().subscribe(data => this.managementIdOptions = data);
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
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  // canAdd(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  // }

  // canEdit(): boolean {
  //   return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  // }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }
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
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };
    this.router.navigate(['TLS5000/TLS52040'], extras);
  }

  // get isFormEditable(): boolean {
  //   return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  // }
  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }
  onCancel() {
    this.router.navigate(['TLS5000/TLS52040']);
  }
   // 初始化CRU表單
   cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]), // 項目列表
  });


  //


  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({

      mgname: [{ value: '自動帶入', disabled: true }],
      renum: [],
      arenum: [{ value: '自動帶入', disabled: true }],
      unit: [{ value: '自動帶入', disabled: true }],
      unitprice: [{ value: '自動帶入', disabled: true }],
      tax: [{ value: '自動帶入', disabled: true }],
      untax: [{ value: '自動帶入', disabled: true }],
      price: [],
      sumprice: [{ value: '自動帶入', disabled: true }],
      recode: [{ value: '自動帶入', disabled: true }],
      remark: [],

    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

}
