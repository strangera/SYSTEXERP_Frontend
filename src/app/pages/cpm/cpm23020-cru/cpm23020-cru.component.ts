import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-cpm23020-cru',
  templateUrl: './cpm23020-cru.component.html',
  styleUrl: './cpm23020-cru.component.scss',
})
export class CPM23020CRUComponent
  extends BasicCrupageComponent
  implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    eventStartDate: [, Validators.required], // 活動開始日期
    eventEndDate: [, Validators.required], // 活動結束日期
    lastStorageDate: [, Validators.required], // 最後入庫日期
    marketingCampaignCode: [, Validators.required], // 行銷檔期代號
    campaignName: [], // 檔期名稱
    suppliesManagementNumber: [, Validators.required], // 用品管理單號
    manufacturerCode: [, Validators.required], // 廠商編號
    lastStoragePerson: [, Validators.required], // 最後入庫人員
    suppliesCondition: [, Validators.required], // 用品狀況
    storageStatus: [, Validators.required], // 入庫狀況
    remarks: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService,
  ) {
    super(); // 呼叫父類建構子
  }
  // Dropdown options
  marketingCampaignCodeOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  lastStoragePersonOptions: any[] = [];
  manufacturerCodeOptions: any[] = [{ value: 1, label: '53472035-23' }];



  suppliesConditionOptions: any[] = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' },
  ];

  storageStatusOptions: any[] = [
    { value: 1, label: '未入庫' },
    { value: 2, label: '全部入庫' },
    { value: 3, label: '部分入庫' },
  ];
  ngOnInit(): void {
    // 初始化
    this.ProgNo = '520013';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.userCodeService.getUserCode().subscribe((data) => {
      this.lastStoragePersonOptions = data;
    });
    //
    // ----------------------------------------------------------------
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

    console.log(this.accordionTabCss);
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // 初始化表單
  private initializeForm() {

  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      activityCode: [''],
      suppliesCode: [''],
      suppliesName: [''],
      requiredQuantity: [''],
      storedQuantity: [''],
      notStoredQuantity: [''],
      thisStorageQuantity: ['', Validators.required],
      unitPrice: ['', Validators.required],
      totalPrice: ['', Validators.required],
      totalStorageAmount: ['', Validators.required],
      remarks: [''],

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
  } //CRU

  onCancel() {
    this.router.navigate(['CPM2000/CPM23020']);
  }
}
