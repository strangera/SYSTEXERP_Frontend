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
import { IssuanceTypeService } from '../../../service/basic/issuance-type.service';
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import {
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { TransferReasonService } from '../../../service/basic/transfer-reason.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tls56080-cru',
  templateUrl: './tls56080-cru.component.html',
  styleUrl: './tls56080-cru.component.scss',
})
export class TLS56080CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // ProgNo: string = '250039';
  // funInfo?: FunsrightInfo;
  // // Permissions
  // addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  // editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // loading: boolean = false;
  // submitted: boolean = false;
  // formTitle: string = '';   //CRU
  // showConfirm: boolean = false;//CRU
  // crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

  dataForm = this.formBuilder.group({
    issuanceNoteCode: [{ value: '自動編號', disabled: true }],
    generalCode: [],
    warehouseCode: [],
    brandCode: [],
    issuanceType: [],
    issuanceNoteStatus: [],
    applicantCode: [],
    approverCode: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    remark: [],
    organizationNumber: [],
    issuanceReturnCode: [{ value: '自動編號', disabled: true }],
    amount: [],
    quantity: [],
    vendorCode: [],
    transferReason: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });

  // Dropdown options
  outinoption: any[] = [
    { value: 1, label: '調出' },
    { value: 2, label: '調入' },
  ];
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  issuanceTypeOptions: any[] = [];
  issuanceNoteStatusOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  approverCodeOptions: any[] = [];
  organizationNumberOptions: any[] = []; // Updated dropdown for 部門編號
  vendorOptions: any[] = [];
  transferReasonOptions: any[] = [];
  // Table data

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private issuanceTypeService: IssuanceTypeService,
    private issuanceNoteStatusService: IssuanceNoteStatusService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
    private vendorService: VendorService,
    private transferReasonService: TransferReasonService,
    private organizationNumberService: OrganizationNumberService, // Updated this service
    private messageService: NotificationService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250039';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService
      .getWarehouseOptions()
      .subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService
      .getSystemTypes()
      .subscribe((data) => (this.brandCodeOptions = data));
    this.issuanceTypeService
      .getIssuanceTypes()
      .subscribe((data) => (this.issuanceTypeOptions = data));
    this.issuanceNoteStatusService
      .getIssuanceNoteStatuses()
      .subscribe((data) => (this.issuanceNoteStatusOptions = data));
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => (this.organizationNumberOptions = data)); // Updated dropdown initialization for 部門編號
    this.userCodeService.getUserCode().subscribe((data) => {
      this.applicantCodeOptions = data;
      this.approverCodeOptions = data;
    });
    this.vendorService
      .getVendors()
      .subscribe((data) => (this.vendorOptions = data));
    this.transferReasonService
      .getTransferReasons()
      .subscribe((data) => (this.transferReasonOptions = data));
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

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;

    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

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
      this.router.navigate(['TLS5000/TLS56080'], extras);
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

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  } //CRU

  onCancel() {
    this.router.navigate(['TLS5000/TLS56080']);
  } //CRU

  // 初始化CRU表單
  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]), // 項目列表
  });
  //
  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({
      mgname: [],
      munit: [{ value: '自動帶入', disabled: true }],
      packnum: [{ value: '自動帶入', disabled: true }],
      price: [{ value: '自動帶入', disabled: true }],
      nowstock: [{ value: '自動帶入', disabled: true }],
      num: [, Validators.required],
      sumprice: [{ value: '自動帶入', disabled: true }],
      outinoption: [1, Validators.required],
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
