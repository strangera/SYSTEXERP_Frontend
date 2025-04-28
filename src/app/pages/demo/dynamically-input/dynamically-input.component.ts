import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

@Component({
  selector: 'app-dynamically-input',
  templateUrl: './dynamically-input.component.html',
  styleUrl: './dynamically-input.component.scss'
})

export class DynamicallyInputComponent {
  ProgNo: string = '900001';
  submitted = false;
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];

  cruForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  constructor(
    private formBuilder: FormBuilder,
    private messageService: NotificationService,) {
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
      name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
      CashRegisterType: ['1', Validators.required], // 收銀機型態
      SalesDate: ['', Validators.required], // 銷售日期
      CashRegisterCode: ['', Validators.required], // 收銀機代號
      TransactionSerialNumber: ['', Validators.required], // 交易流水號
      CounterNumber: ['', Validators.required], // 專櫃編號
      TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      TaxableAmount: ['', Validators.required], // 應稅金額
      TaxFreeAmount: ['', Validators.required], // 免稅金額
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
