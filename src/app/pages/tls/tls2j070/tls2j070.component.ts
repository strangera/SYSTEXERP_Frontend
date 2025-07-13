import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { InvoiceTypeService } from '../../../service/basic/invoice-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor } from '@angular/common';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { Button } from 'primeng/button';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { TranslateModule } from '@ngx-translate/core';

// 2.2.18.7 發票換開補登作業
@Component({
    selector: 'app-tls2j070',
    templateUrl: './tls2j070.component.html',
    styleUrl: './tls2j070.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, InputTextComponent, NgFor, CalendarComponent, InputNumberComponent, Button, ButtonDynamicallyaddComponent, TranslateModule]
})
export class TLS2J070Component {
  ProgNo: string = '220096';
  submitted = false;
  //
  invoiceTypeOptions: any[] = [];


  cruForm = this.formBuilder.group({
    invoiceType: [1, []], // 發票類別
    uID: ['', [Validators.maxLength(8)]], // 統一編號
    buyer: ['', [Validators.maxLength(30)]], // 買受人
    address: ['', [Validators.maxLength(50)]], // 地址
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  constructor(
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    //
    private validationService: ValidationService,
    private invoiceTypeService: InvoiceTypeService,
  ) {
  }

  ngOnInit(): void {
    // ----------------------------------------------------------------
    this.invoiceTypeService.getSystemTypes().subscribe(data => {
      this.invoiceTypeOptions = data;
    });
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
      salesDate: [, [Validators.required]], // 單選日限制 (datetime yyyy/mm/dd)
      registerID: [, [Validators.required, Validators.maxLength(6),]], // Input serial number: this.validationService.exactLengthValidator(8)
      transferID: [, [Validators.required, Validators.maxLength(6),]], // Input serial number: this.validationService.exactLengthValidator(8)
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
