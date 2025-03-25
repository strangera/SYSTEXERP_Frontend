import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { IssuanceTypeService } from '../../../service/basic/issuance-type.service';
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-tls56020-cru',
  templateUrl: './tls56020-cru.component.html',
  styleUrl: './tls56020-cru.component.scss'
})
export class TLS56020CRUComponent extends BasicCrupageComponent
implements OnInit{
  // ProgNo: string = '250033';
  // funInfo: FunsrightInfo = {};
  // // Permissions
  // addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  // queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  // editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // loading: boolean = false;
  // submitted: boolean = false;

  dataForm = this.formBuilder.group({
    issuanceNoteCode: [{ value: '自動編號', disabled: true }],
    generalCode: [],
    warehouseCode: [,Validators.required],
    brandCode: [,Validators.required],
    issuanceType: [],
    issuanceNoteStatus: [],
    applicantCode: [,Validators.required],
    approverCode: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [,Validators.required],
    approvalDateTo: [],
    remark: [],
    organizationNumber: [,Validators.required],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  issuanceTypeOptions: any[] = [];
  issuanceNoteStatusOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  approverCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];  // Updated dropdown for 部門編號
  // formTitle: string = '';   //CRU
  // showConfirm: boolean = false;//CRU
  // crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

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
    private organizationNumberService: OrganizationNumberService,  // Updated this service
    private translate: TranslateService,
    private messageService: NotificationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '250033';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.issuanceTypeService.getIssuanceTypes().subscribe((data) => (this.issuanceTypeOptions = data));
    this.issuanceNoteStatusService.getIssuanceNoteStatuses().subscribe((data) => (this.issuanceNoteStatusOptions = data));
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.organizationNumberOptions = data));  // Updated dropdown initialization for 部門編號
    this.userCodeService.getUserCode().subscribe((data) => {
      this.applicantCodeOptions = data;
      this.approverCodeOptions = data;
    });
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
      price: [{ value: '自動帶入', disabled: true }],
           stocknum: [{ value: '自動帶入', disabled: true }],
      Receivequantity: [],
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
    this.router.navigate(['/TLS5000/TLS56020']);
  }
}
