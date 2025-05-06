import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-cpm23040-cru',
  templateUrl: './cpm23040-cru.component.html',
  styleUrl: './cpm23040-cru.component.scss',
})
export class CPM23040CRUComponent
  extends BasicCrupageComponent
  implements OnInit {


  ngOnInit(): void {
    this.ProgNo = '520015';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.loadDropdownOptions();

    // 根據CRUD狀態初始化表單
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    this.initializeForm();

    switch (state?.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  dataForm = this.formBuilder.group({
    returnDate: [, Validators.required],
    returnNumber: [, Validators.required],
    marketingCampaignCode: [, Validators.required],
    campaignName: [],
    returnPersonnel: [, Validators.required],
    remarks: [],
    items: this.formBuilder.array([this.createItem()]),
  });

  // 下拉選單資料
  marketingCampaignOptions: any[] = [];
  returnPersonnelOptions: any[] = [];
  activityItemOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService
  ) {
    super();
  }

  // 動態新增表單項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      activityItemCode: [, Validators.required],
      activityItemName: [],
      itemNature: [],
      currentStock: [],
      returnableQuantity: [],
      returnedQuantity: [, Validators.required],
      remainingQuantity: [],
    });
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 初始化表單
  private initializeForm() {

  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.messageService.blockUi();

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
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
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
    this.router.navigate(['CPM2000/CPM23040']);
  }

  loadDropdownOptions(): void {
    this.userCodeService.getUserCode().subscribe((data) => (this.returnPersonnelOptions = data));
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.marketingCampaignOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.activityItemOptions = data));
  }

  handleCrudStatus(status: CRUDStatus, rowdata: any) {
    switch (status) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(rowdata);
        break;
    }
  }


  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }
}
