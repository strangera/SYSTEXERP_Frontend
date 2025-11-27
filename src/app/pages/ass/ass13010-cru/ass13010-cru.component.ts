import { NgIf } from '@angular/common';
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
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

//3.1.3.1 資產維護作業 CRU
@Component({
  selector: 'app-ass13010-cru',
  templateUrl: './ass13010-cru.component.html',
  styleUrl: './ass13010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS13010CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    assetsCode: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 資產代號
    itemCode: [, [Validators.required]], // 品項編號
    assetsStatus: [[Validators.required]], // 品項編號
    assetsType: ['', [Validators.required, Validators.maxLength(10)]], // 資產類型
    original_assetsCode: [, [this.validationService.numberValidator, Validators.maxLength(20)]], // 原資產編號

    //---
    //採購資訊
    //---
    purchaseNumber: [, [Validators.maxLength(11)]], // 採購單號
    purchaseDate: [], // 購入日期
    purchasePrice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 購入金額
    supplierCode: [], // 供應商編號
    accounting_Borrow: [, [Validators.required]], // 會計科目(借)
    accounting_Credit: [, [Validators.required]], // 會計科目(貸)
    entryDate: [, [Validators.required]], // 入帳日期
    deviceCode: [, [Validators.maxLength(10)]], // 設備編號
    //---
    //折舊資訊
    //---
    depreciation: [, [Validators.required]], // 折舊會計科目
    totalDepreciation: [, [Validators.required]], // 累計折舊科目
    depreciationLife: [, [Validators.required, Validators.maxLength(8)]], // 折舊年限(年)
    residual: [, [Validators.required, Validators.maxLength(8)]], // 預留殘值
    depreciationLifeMM: [, [Validators.required, Validators.maxLength(8)]], // 原折舊年限(月)
    amortizedAmount: [, [Validators.maxLength(8)]], // 已攤提金額
    amortizedMonth: [, [Validators.maxLength(8)]], // 已攤提月數
    //---
    //保管資訊
    //---
    keepingPerson: [, [Validators.required]], // 保管人
    keepingUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    locationCode: [], // 位置編號
    maintenanceCode: [, [Validators.maxLength(11)]], // 維修合約編號
    //---
    //處分資訊
    //---
    disposalDate: [], // 處份日期(變賣或報廢)
    dispose_Manufacturers: [], // 處份廠商
    dispose_Manufacturers_Summons: [, [Validators.maxLength(12)]], // 處份傳票編號
    soldAmount: [, [Validators.maxLength(8)]], // 變賣金額
    //---
    //其他
    //---
    disposeRemark: [,], // 處份說明(變賣或報廢)
    remark: [,], // 說明

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  itemCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  assetsTypeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];
  supplierCodeOptions: any[] = [];

  depreciationOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  locationCodeOptions: any[] = [];

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
    this.ProgNo = '310016';
    //

    // ----------------------------------------------------------------
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

      queryNumber: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(5)]], // 詢價數量
      number: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(5)]], // 數量
      singlePrice: [, [this.validationService.numberValidator, Validators.required]], // 單價(未稅)
      purchasePrice: [, [this.validationService.numberValidator, Validators.required]], // 最近採購單價
      totalPrice: [, [this.validationService.numberValidator, Validators.required]], // 總金額

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
    this.router.navigate(['/ASS1000/ASS13010']);
  }
}
