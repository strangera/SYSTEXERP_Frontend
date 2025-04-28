import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';


// 2.2.18.3 後台發票換開補登作業
@Component({
  selector: 'app-tls2j030',
  templateUrl: './tls2j030.component.html',
  styleUrl: './tls2j030.component.scss'
})
export class TLS2J030Component {
  ProgNo: string = '220092';
  submitted = false;
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];

  cruForm: FormGroup = this.formBuilder.group({
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  constructor(
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private validationService: ValidationService,) {
  }

  ngOnInit(): void {
  }
  //
  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({
      CashRegisterType: ['1', Validators.required], // 收銀機型態
      onedatedd: [, [Validators.required]], // 銷售日期
      registerID: [, [Validators.required, this.validationService.exactLengthValidator(6),]], // 收銀機代號
      transactionID: [, [Validators.required, this.validationService.exactLengthValidator(6),]], // 交易流水號
      counterID: [, [Validators.required, this.validationService.exactLengthValidator(6),]], // 專櫃編號
      twoInvoiceStart: [, [Validators.required, this.validationService.numberValidator]], // 二聯發票號碼
      twoInvoiceEnd: [, [Validators.required, this.validationService.numberValidator]], // 二聯發票號碼
      taxMoney: [, [Validators.required, this.validationService.numberValidator]], // 應稅金額
      noTaxMoney: [0, [Validators.required, this.validationService.numberValidator]], // 免稅金額
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    console.log(frm.value); // 取得表frm的值

    if (this.cruForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }
}
