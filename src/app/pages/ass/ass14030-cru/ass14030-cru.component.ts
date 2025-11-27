import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';


import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

//3.1.4.3  傳票審核傳送作業 CRU
@Component({
  selector: 'app-ass14030-cru',
  templateUrl: './ass14030-cru.component.html',
  styleUrl: './ass14030-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, NgFor, ButtonComponent, NgIf, TranslateModule]
})
export class ASS14030CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    subpoenaNumber: [], // 傳票編號
    subpoenaType: [], // 傳票種類
    type: [''], // 傳票型態
    subpoenaSummary: ['', [Validators.maxLength(50)]], // 傳票摘要
    subpoenaDate: [], // 傳票日期
    subpoenaStatus: [[] as number[]], // 傳票狀態
    checkoutNumber: [, [Validators.maxLength(12), this.validationService.numberValidator]], // 結帳單號
    builder: ['', [Validators.maxLength(10)]], // 建立者
    buildDate: [], // 建立日
    modifier: ['', [Validators.maxLength(10)]], // 修改者
    modifyDate: [], // 修改日

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  subpoenaTypeOptions: any[] = [
    { value: 1, label: '資材報廢' },
    { value: 2, label: '折舊' },
    { value: 3, label: '月結庫存' },
    { value: 4, label: '資材變賣' },
    { value: 5, label: '資材進貨' },
  ];

  subpoenaStatusOptions: any[] = [
    { value: 0, label: '未拋轉' },
    { value: 1, label: '已拋轉' },
    { value: 2, label: '已退回' },
  ];
  objectCodeOptions: any[] = [
    { value: 0, label: '698919301/台南紡織股份有限公司' },
    { value: 1, label: '698919302/統一企業股份有限公司' },
    { value: 2, label: '698919303/統正開發股份有限公司' },
  ];

  subjectCodeOptions: any[] = [];
  organizationOptions: any[] = [];
  //
  constructor(
    private formBuilder: FormBuilder,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310030';
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
      subjectCode: [, [Validators.required]], // 科目代號
      vendorCode: [''], // 廠商代號
      summary: [''], // 摘要
      debitAmount: [, [Validators.required, Validators.maxLength(15)]], // 借方金額
      creditAmount: [, [Validators.required, Validators.maxLength(15)]], // 貸方金額
      organizationCode: [, [Validators.required, Validators.maxLength(6)]], // 組織代號
      eventCode: [], // 活動代號
      flushCode: [, [Validators.maxLength(20)]], // 立沖代號
      objectCode: [, [Validators.maxLength(30)]], // 對像別編號
      objectKey: [, [Validators.maxLength(30)]], // 對帳KEY值
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

  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
  }
}
