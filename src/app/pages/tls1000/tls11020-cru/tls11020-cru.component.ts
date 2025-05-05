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
import { ConfirmationService } from 'primeng/api';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-tls11020-cru',
  templateUrl: './tls11020-cru.component.html',
  styleUrl: './tls11020-cru.component.scss'
})
// 2.1.2.1 扣款項目維護作業 CRU
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
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

    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private deductionCategoryService: DeductionCategoryService,
    private salesTypeService: SalesTypeService,
    private installmentPeriodService: InstallmentPeriodService,
    private ticketPaymentService: TicketPaymentService,
    private confirmationService: ConfirmationService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
   
this.initializePage
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
     
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
       
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
      deductionItemNumber: [{ value: '由系統帶入', disabled: true }, [Validators.required, this.validationService.numberValidator, Validators.maxLength(3)]],
      deductionItemName: ['', [Validators.required, Validators.maxLength(40)]],
      deductionCategory: [, [Validators.required]],
      accNo: ['', [Validators.maxLength(14)]],
      guiFlag: ['Y'],
      capTaxType: ['1'],
      isCommonlyUsed: ['N'],
      printArea: ['', [Validators.maxLength(5)]],
      remark: ['', [Validators.maxLength(50)]],
    });
  }

  onAddItem(): void {
    this.items.insert(0, this.createItem());
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
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

  confirmRemove(index: number): void {
    this.confirmationService.confirm({
      message: '確定要刪除此列資料嗎？',
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確認',
      rejectLabel: '取消',
      accept: () => {
        this.onRemoveItem(index);
      }
    });
  }
  
  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }
  inputForm = this.formBuilder.group({
    deductionItemNumber: [{ value: '由系統帶入', disabled: true }],
    deductionItemName: [''],
    deductionCategory: [''],
    accNo: [''],
    guiFlag: ['Y'],
    capTaxType: ['1'],
    isCommonlyUsed: ['Y'],
    printArea: [''],
    remark: [''],
  });
  
  itemList: any[] = [];
  
  addItem(): void {
    this.itemList.unshift(this.inputForm.getRawValue());
    this.inputForm.reset({ deductionItemNumber: '由系統帶入', guiFlag: 'Y', capTaxType: '1', isCommonlyUsed: 'N' });
  }
  
  removeItem(index: number): void {
    this.itemList.splice(index, 1);
  }
  
  getLabelByValue(options: any[], value: any): string {
    return options?.find(o => o.value === value)?.label || value;
  }
  //---------------------------------------------------------------------------------------------------------------
}
