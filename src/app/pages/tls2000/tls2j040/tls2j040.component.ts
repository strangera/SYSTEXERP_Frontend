import { ValidationService } from './../../../shared/service/validation.service';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/service/notification.service';

// 2.2.18.4 發票換開作業
@Component({
  selector: 'app-tls2j040',
  templateUrl: './tls2j040.component.html',
  styleUrl: './tls2j040.component.scss'
})
export class TLS2J040Component {
  ProgNo: string = '220093';
  submitted = false;

  cruForm = this.formBuilder.group({
    uID: ['', [Validators.required, Validators.maxLength(8)]], // 統一編號
    buyer: ['', [Validators.maxLength(60)]], // 買受人
    address: ['', [Validators.maxLength(50)]], // 地址
    // ----------------------------------------------------------------
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
        startdate: [, [Validators.required, Validators.required]], // 銷售日期
        enddate: [, [Validators.required, Validators.required]], // 銷售日期
        registerID: [, [Validators.required, Validators.maxLength(6), ]], // 收銀機代號
        transferID: [, [Validators.required, Validators.maxLength(6), ]], // 交易流水號
        counterID: [, [Validators.required, Validators.maxLength(6), ]], // 專櫃編號
        startserialticket: [, [Validators.required, this.validationService.numberValidator]], // 二聯發票號碼
        endserialticket: [, [Validators.required, this.validationService.numberValidator]], // 二聯發票號碼
        taxPrice: [, [Validators.required, this.validationService.numberValidator]], // 應稅金額
        notaxPrice: [0, [Validators.required, this.validationService.numberValidator]], // 免稅金額
      });
    }

    onAddItem(): void {
      this.items.push(this.createItem());
    }

    onRemoveItem(index: number) {
      this.items.removeAt(index);
    }

    onSubmit(frm: FormGroup){
      this.messageService.blockUi();
      this.submitted = true;

      console.log(frm.value); // 取得表frm的值

      if (this.cruForm.invalid){
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
