import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';



//3.1.2.3 採購申請作業 CRU
@Component({
  selector: 'app-ass12030-cru',
  templateUrl: './ass12030-cru.component.html',
  styleUrl: './ass12030-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, EditorTextComponent, DropdownComponent, CalendarComponent, InputNumberComponent, NgFor, NgIf, TranslateModule]
})
export class ASS12030CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    caseDescription: [,], // 採購案說明 *
    applicantCode: [, [Validators.required]], // 申請人編號
    organizationNumber: [, [Validators.required]], // 部門代號
    applicationDate: [, [Validators.required]], // 申請日期
    supplierCode: [, [Validators.required]], // 	供應商編號
    expendType: [], // 支出類型 *
    taxAmount: [, [Validators.maxLength(8)]], // 稅額
    noTaxAmount: [, [Validators.maxLength(8)]], // 未稅總金額
    totalTaxAmount: [, [Validators.maxLength(8)]], // 含稅總金額
    // paperStatus: [[] as number[]], // 採購單狀態
    // reviewerCode: [], // 審核人編號
    // reviewDateFrom: [], // 審核日期
    // reviewDateTo: [], // 審核日期
    // checkoutDateFrom: [], // 結帳日期
    // checkoutDateTo: [], // 結帳日期

    // printNumber: [, [Validators.required, Validators.maxLength(3)]], // 項次列印筆數

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  applicantCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  supplierCodeOptions: any[] = [];
  paperStatusOptions: any[] = [];
  storageOptions: any[] = [
    { value: 1, label: '總公司' },
    { value: 2, label: '測試' },
  ];
  expendTypeOptions: any[] = [
    { value: 1, label: '事務性支出(有合約)' },
    { value: 2, label: '事務性支出(無合約)' },
    { value: 3, label: '資本支出' },
  ];
  taxTypeOptions: any[] = [];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310013';
    //
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;

        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

    console.log(this.accordionTabCss);
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
      itemCode: [, [Validators.required]], // 品項編號
      queryCode: [, [Validators.required]], // 詢價單號
      taxType: [, [Validators.required]], // 稅別

      queryNumber: [, [, Validators.required, Validators.maxLength(5)]], // 詢價數量
      number: [, [, Validators.required, Validators.maxLength(5)]], // 數量
      singlePrice: [, [, Validators.required]], // 單價(未稅)
      purchasePrice: [, [, Validators.required]], // 最近採購單價
      totalPrice: [, [, Validators.required]], // 總金額

      storage: [, [Validators.required]], // 倉別
      department: [, [Validators.required]], // 委託部門
      singleRemark: [,], // 說明
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
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
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
    this.router.navigate(['/ASS1000/ASS12030']);
  }
}
