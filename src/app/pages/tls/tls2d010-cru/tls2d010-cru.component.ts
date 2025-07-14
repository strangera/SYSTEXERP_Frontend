import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { DeductionCodeNameService } from './../../../service/basic/deduction-code-name.service';
import { ReleaseInvoiceService } from './../../../service/basic/release-invoice.service';
import { EventCodeService } from '../../../service/basic/event-code.service';

@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  styleUrl: './tls2d010-cru.component.scss'
})
export class TLS2D010CRUComponent extends BasicCrupageComponent implements OnInit {
  deductionItemsOptions: any[] = [];
  organizationOptions: any[] = [];
  eventCodeOptions: any[] = [];
  establishOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    counterInfo: [], // 專櫃編號/名稱 招募編號/營運起始日/營運截止日
    totalCash: [, [this.validationService.numberValidator, Validators.maxLength(15)]], // 總金額
    eventCode: [], // 活動代碼/名稱
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private deductionCodeNameService: DeductionCodeNameService,
    private organizationNumberService: OrganizationNumberService,
    private eventCodeService: EventCodeService,
    private releaseInvoiceService: ReleaseInvoiceService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '220063';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.eventCodeService.getSystemTypes().subscribe(data => {
      this.eventCodeOptions = data;
    });
    //
    this.deductionCodeNameService.getDeductionCodeNames().subscribe(data => {
      this.deductionItemsOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.releaseInvoiceService.getSystemTypes().subscribe(data => {
      this.establishOptions = data;
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
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
      deductionItems: [, [Validators.required]], // 扣款項目
      accountingCode: ['', [Validators.maxLength(8)]], // 會計科目
      organization: [], // 組織代號
      debitDay: [, [Validators.required]], // 扣款日期
      establish: [, [Validators.required]], // 是否開立發票
      noTaxPrice: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(8)]], // 金額(未稅)
      remark: ['', [Validators.maxLength(30)]], // 備註
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
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS2000/TLS2D010']);
  }
  //-------------------------------------------------------------------------------------------------------------
}

