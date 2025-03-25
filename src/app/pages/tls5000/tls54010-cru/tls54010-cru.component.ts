import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { SaleslistStatusService } from '../../../service/basic/saleslist-status.service';
import { SalesLocationService } from '../../../service/basic/sales-location.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { TransactionTypeService } from '../../../service/basic/transaction-type.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-tls54010-cru',
  templateUrl: './tls54010-cru.component.html',
  styleUrl: './tls54010-cru.component.scss',
})
export class TLS54010CRUComponent
  extends BasicCrupageComponent
  implements OnInit
{
  // ProgNo: string = '250025';
  // funInfo: FunsrightInfo = {};
  // // Permissions
  // addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  // editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // loading: boolean = false;
  // submitted: boolean = false;

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
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
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
  // formTitle: string = '';   //CRU
  // showConfirm: boolean = false;//CRU
  // crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

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
    private translate: TranslateService,
    private messageService: NotificationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250025';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService
      .getWarehouseOptions()
      .subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService
      .getSystemTypes()
      .subscribe((data) => (this.brandCodeOptions = data));
    this.saleslistStatusService
      .getSalesStatusOptions()
      .subscribe((data) => (this.salesStatusOptions = data));
    this.salesLocationService
      .getSalesLocationOptions()
      .subscribe((data) => (this.salesLocationOptions = data));
    this.counterCodeService
      .getCounterCodes()
      .subscribe((data) => (this.counterCodeOptions = data));
    this.transactionTypeService
      .getTransactionTypes()
      .subscribe((data) => (this.transactionTypeOptions = data));
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.userCodeOptions = data));
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    }; //CRU

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
    } //CRU
  }
  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      mgname: [],
      price: [],
      quantity: [],
      unit: [{ value: '自動帶入', disabled: true }],
      sumprice: [{ value: '自動帶入', disabled: true }],
      discountrate: [],
      discount: [],
      discount2: [],
      barcode: [{ value: '自動帶入', disabled: true }],
      vendorCode: [{ value: '自動帶入', disabled: true }],
      remark: [],
    });
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/TLS5000/TLS54010']);
  }
}
