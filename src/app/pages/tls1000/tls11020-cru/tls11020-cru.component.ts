import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { TicketPaymentService } from './../../../service/basic/ticket-payment.service';
import { InstallmentPeriodService } from './../../../service/basic/installment-period.service';
import { SalesTypeService } from './../../../service/basic/sales-type.service';

@Component({
  selector: 'app-tls11020-cru',
  templateUrl: './tls11020-cru.component.html',
  styleUrl: './tls11020-cru.component.scss'
})
// 2.1.2.1 扣款項目維護作業 CRU
export class TLS11020CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  deductionCategoryOptions: any[] = [];
  salesTypeOptions: any[] = [];
  receiveBankOptions: any[] = [{ value: 1, label: '全部' },];
  payPeriodOptions: any[] = [];
  couponTypeOptions: any[] = [];
  couponCalculationOptions: any[] = [
    { value: 1, label: '單筆' },
    { value: 2, label: '單月累積營業額' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
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
    private deductionCategoryService: DeductionCategoryService,
    private salesTypeService: SalesTypeService,
    private installmentPeriodService: InstallmentPeriodService,
    private ticketPaymentService: TicketPaymentService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210002';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    //
    this.deductionCategoryService.getDeductionCategories().subscribe(data => {
      this.deductionCategoryOptions = data;
    });
    //
    this.salesTypeService.getSystemTypes().subscribe(data => {
      this.salesTypeOptions = data;
    });
    //
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => {
      this.payPeriodOptions = data;
    });
    //
    this.ticketPaymentService.getTicketPayments().subscribe(data => {
      this.couponTypeOptions = data;
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
      deductionItemNumber: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(3)]], // 扣款項目編號
      deductionItemName: ['', [Validators.required, Validators.maxLength(40)]], // 扣款項目名稱
      deductionCategory: [, [Validators.required]], // 扣款類別
      salesType: [, [Validators.required]], // 銷售類型
      receiveBank: [, [Validators.required]], // 收單行
      payPeriod: [, [Validators.required]], // 期數
      couponType: [[], [Validators.required]], // 券類支付工具類別
      couponCalculation: [, [Validators.required]], // 券類計算方式
      basicRate: [, [Validators.required, Validators.maxLength(40)]], // 基準 金額/比率
      defaultAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 預設金額
      remark: ['', [Validators.maxLength(50)]], // 備註
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
    this.router.navigate(['/TLS1000/TLS11020']);
  }
  //---------------------------------------------------------------------------------------------------------------
}
