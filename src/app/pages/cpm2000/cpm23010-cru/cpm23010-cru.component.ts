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
  selector: 'app-cpm23010-cru',
  templateUrl: './cpm23010-cru.component.html',
  styleUrl: './cpm23010-cru.component.scss',
})
export class CPM23010CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  // 表單
  dataForm = this.formBuilder.nonNullable.group({
    applicationDate: [, Validators.required],
    supplyManagementNumber: [, Validators.required],
    supplyCondition: [, Validators.required],
    marketingCampaignCode: [, Validators.required],
    campaignName: [],
    vendorCode: [, Validators.required],
    applicant: [, Validators.required],
    remarks: [],
    items: this.formBuilder.array([this.createItem()]),
  });

  // 下拉選單選項
  applicantOptions: any[] = [];
  supplyConditionOptions: any[] = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' },
  ];
  marketingCampaignOptions: any[] = [
    { value: 1, label: '000001' },
    { value: 2, label: '000002' },
  ];
  vendorOptions: any[] = [
    { value: 1, label: '53472035-23' },
  ];

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
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520012';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 取得選項資料
    this.userCodeService.getUserCode().subscribe((data) => (this.applicantOptions = data));
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.vendorOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.marketingCampaignOptions = data));

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);
  }

  // 動態新增項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      itemCodeOptions: [],
      unit: [],
      returnQty: [],
      desc: [],
      cCat: [],
      locationCode: [],
    });
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
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
  trsData() { }
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
    this.router.navigate(['CPM2000/CPM23010']);
  }
}
