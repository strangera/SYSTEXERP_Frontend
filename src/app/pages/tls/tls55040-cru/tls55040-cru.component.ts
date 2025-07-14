import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { PaperTypeService } from '../../../service/basic/paper-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tls55040-cru',
  templateUrl: './tls55040-cru.component.html',
  styleUrl: './tls55040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, NgIf]
})
export class TLS55040CRUComponent {

  ProgNo: string = '250029';
  funInfo?: FunsrightInfo;



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
    paperType: [],
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
  paperTypeOptions: any[] = [];

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
    private paperTypeService: PaperTypeService,

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
    this.paperTypeService.getSystemTypes().subscribe(data => this.paperTypeOptions = data);
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
      this.router.navigate(['TLS5000/TLS55040'], extras);
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
      this.router.navigate(['/demoCRU'], extras);
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
    this.router.navigate(['/demoCRU'], extras);
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
