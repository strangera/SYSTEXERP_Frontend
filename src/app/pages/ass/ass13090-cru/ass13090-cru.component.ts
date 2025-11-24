import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ValidationService } from '../../../shared/service/validation.service';

//3.1.3.9  資產攤提作業 CRU
@Component({
  selector: 'app-ass13090-cru',
  templateUrl: './ass13090-cru.component.html',
  styleUrl: './ass13090-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS13090CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  itemCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  assetTypeOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];
  filterOptions: any[] = [
    { value: 1, label: '已設定攤提' },
    { value: 2, label: '未設定攤提' },
  ];
  supplierCodeOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  locationCodeOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    //
    assetsCode: [, [Validators.maxLength(20)]], // 財產代號
    itemCode: [], // 	品項編號
    assetStatus: [, [Validators.maxLength(13)]], // 資產狀態
    assetType: [, [Validators.maxLength(13)]], // 資產類型
    // 採購資訊
    purchaseNumber: [], // 採購單號
    purchaseDate: [], // 	購入日期
    purchaseAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 購入金額
    alteredAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 異動金額
    supplierCode: [, [Validators.maxLength(10)]], // 	供應商編號

    accounting_Borrow: [, [Validators.maxLength(8)]], // 會計科目代號(借)
    accounting_Credit: [, [Validators.maxLength(8)]], // 會計科目代號(貸)
    entryDate: [], // 入賬日期
    amortizedDate: [], // 攤提起始日
    // 折舊資訊
    depreciation: [], // 折舊會計科目
    totalDepreciation: [], // 累計折舊科目
    depreciationLife: [, [Validators.maxLength(8)]], // 折舊年限
    alteredLife: [, Validators.maxLength(8)], // 異動年限
    depreciationLifeMM: [, [Validators.required, Validators.maxLength(8)]], // 原折舊年限(月)
    residual: [, [Validators.maxLength(8)]], // 預留殘值
    amortizedAmount: [, [Validators.maxLength(8)]], // 已攤提金額
    amortizedMonth: [, [Validators.maxLength(8)]], // 已攤提月數
    // 保管資訊
    keepingPerson: [, [Validators.required]], // 保管人
    keepingUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    locationCode: [], // 位置編號
    // 續提資訊
    renewalNumber: [, [Validators.maxLength(25)]], // 續提號
    renewalAmount: [, [Validators.required, Validators.maxLength(8)]], // 續提攤入金額
    remark: [,], // 續提註記
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
    private translate: TranslateService,
    private validationService: ValidationService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310024';
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
      // services: ['', [Validators.required, Validators.maxLength(120)]], // 服務項目
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
    this.router.navigate(['/ASS1000/ASS13090']);
  }
}
