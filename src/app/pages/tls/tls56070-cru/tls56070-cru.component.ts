
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { IssuanceTypeService } from '../../../service/basic/issuance-type.service';
import { IssuanceNoteStatusService } from '../../../service/basic/issuance-note-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { TransferReasonService } from '../../../service/basic/transfer-reason.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
@Component({
  selector: 'app-tls56070-cru',
  templateUrl: './tls56070-cru.component.html',
  styleUrl: './tls56070-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, EditorTextComponent, CalendarComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf]
})
export class TLS56070CRUComponent extends BasicCrupageComponent implements OnInit {


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
    issuanceReturnCode: [],
    amount: [],
    quantity: [],
    vendorCode: [],
    transferReason: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  issuanceTypeOptions: any[] = [];
  issuanceNoteStatusOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  approverCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];  // Updated dropdown for 部門編號
  transferReasonOptions: any[] = [];
  vendorOptions: any[] = [];
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
    private organizationNumberService: OrganizationNumberService,  // Updated this service
    private messageService: NotificationService,
    private translate: TranslateService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // Initialize dropdown options
    this.ProgNo = '250038';
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
    this.vendorService.getVendors().subscribe((data) => (this.vendorOptions = data));
    this.transferReasonService.getTransferReasons().subscribe((data) => (this.transferReasonOptions = data));
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };


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
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      mgname: [],
      stocknum: [{ value: '自動帶入', disabled: true }],
      nowstock: [{ value: '自動帶入', disabled: true }],
      num: [],
      unit: [{ value: '自動帶入', disabled: true }],
      remark: [],
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
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
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/demo']);
  }
}
