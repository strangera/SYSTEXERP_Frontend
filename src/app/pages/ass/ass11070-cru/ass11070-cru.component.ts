import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { NgFor, NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

//3.1.1.7 備用供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11070-cru',
  templateUrl: './ass11070-cru.component.html',
  styleUrl: './ass11070-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, InputTextComponent, InputNumberComponent, InputNumberRangeComponent, NgFor, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11070CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  receptionPersonOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  bussinessOptions: any[] = [
    { value: 1, label: '工廠直銷' },
    { value: 2, label: '代理商' },
    { value: 3, label: '經銷商' },
    { value: 4, label: '零售連鎖' },
    { value: 5, label: '零售一般' },
  ];
  paymentMethodOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    buildDate: [, [Validators.required]], // 建檔日期
    receptionPerson: [[] as number[], [Validators.required]], // 接洽人員
    vendorUID: [[] as number[], [Validators.required]], // 廠商統一編號
    bussinessModel: [1, []], // 營運模式
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    //
    contactPerson: ['', [Validators.required, Validators.maxLength(60)]], // 聯絡人
    contactPhone: [, [Validators.required, Validators.maxLength(15)]], // 聯絡人電話(O)
    contactTitle: ['', [Validators.maxLength(60)]], // 聯絡人職稱
    contactFax: [, [Validators.maxLength(60)]], // 聯絡人傳真
    contactCellphone: [, [Validators.maxLength(10)]], // 聯絡人行動電話
    contactEmail: ['', [Validators.required, Validators.maxLength(100)]], // 聯絡人電子郵件
    //
    companyAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司地址
    companyResponsibility: ['', [Validators.maxLength(60)]], // 公司負責人
    //
    paymentMethod: [1, []], // 付款方式
    startserialticket: [, [this.validationService.numberValidator]], // 票期
    endserialticket: [, [this.validationService.numberValidator]], // 票期
    //
    remark: [,], // 備註
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
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
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
      services: ['', [Validators.required, Validators.maxLength(120)]], // 服務項目
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
  }//CRU

  onCancel() {
    this.router.navigate(['/ASS1000/ASS11070']);
  }
  //----------------------------------------------------------------------------------------------------------------------------------
}
