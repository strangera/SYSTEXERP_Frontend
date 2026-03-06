import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ValidationService } from '@shared/service/validation.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

//3.1.3.1 資產維護作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass13010-cru',
  templateUrl: './ass13010-cru.component.html',
  styleUrl: './ass13010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS13010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  private validationService = inject(ValidationService);
  private translate = inject(TranslateService);
  private dropdownApiService = inject(DropdownApiService);
  accordionTabCss = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    assetsCode: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 資產代號
    itemCode: [, [Validators.required]], // 品項編號
    assetsStatus: [, [Validators.required]], // 資產狀態
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
    warrantyDays: [, [Validators.maxLength(8)]], // 保固年限(日)
    amortizationYearMonth: [, [Validators.maxLength(6)]], // 攤提年月 YYYYMM
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
  // 下拉選單（來源同 ass13010，見註解）
  itemCodeOptions: Option[] = []; // 待確認
  assetsStatusOptions: Option[] = [
    { value: '1', label: '使用中' },
    { value: '3', label: '維修中' },
    { value: '4', label: '報廢' },
    { value: '5', label: '變賣' },
    { value: '7', label: '庫存中未使用' }
  ];
  assetsTypeOptions: Option[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' }
  ];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];
  supplierCodeOptions: Option[] = []; // queryPOS2013_DropDownList
  depreciationOptions: Option[] = []; // queryGLS1005_ledgerMD_DropDownList
  /** 所有人員（含 Org_ID），供依單位篩選 */
  allUserOptionsWithOrg: Option[] = [];
  /** 保管人下拉：依 保管單位 篩選該單位人員 */
  keepingPersonOptions: Option[] = [];
  /** 使用人下拉：依 使用單位 篩選該單位人員 */
  userOptions: Option[] = [];
  orgUnitOptions: Option[] = []; // querySYS3100_DropDownList
  locationCodeOptions: Option[] = []; // queryPOS2002_DropDownList

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13010', this.dataForm);
    this.accordionTabCss = this.crudstatus === CRUDStatus.Create ? 'create-accordionTab' : 'edit-accordionTab';
    this.loadDropdownOptions();
    this.dataForm.controls.keepingUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateKeepingPersonOptions();
      const unitVal = this.dataForm.controls.keepingUnit.value;
      const allowed = this.keepingPersonOptions.some(o => o.value === this.dataForm.controls.keepingPerson.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ keepingPerson: undefined }, { emitEvent: false });
        this.dataForm.controls.keepingPerson.markAsPristine({ onlySelf: true });
      }
    });
    this.dataForm.controls.userUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateUserOptions();
      const unitVal = this.dataForm.controls.userUnit.value;
      const allowed = this.userOptions.some(o => o.value === this.dataForm.controls.user.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ user: undefined }, { emitEvent: false });
        this.dataForm.controls.user.markAsPristine({ onlySelf: true });
      }
    });
  }

  private updateKeepingPersonOptions(): void {
    const unitVal = this.dataForm.controls.keepingUnit.value;
    if (unitVal == null || unitVal === '') {
      this.keepingPersonOptions = [...this.allUserOptionsWithOrg];
    } else {
      this.keepingPersonOptions = this.allUserOptionsWithOrg.filter(
        (o: Option) => (o as Option & { Org_ID?: string }).Org_ID === unitVal
      );
    }
  }

  private updateUserOptions(): void {
    const unitVal = this.dataForm.controls.userUnit.value;
    if (unitVal == null || unitVal === '') {
      this.userOptions = [...this.allUserOptionsWithOrg];
    } else {
      this.userOptions = this.allUserOptionsWithOrg.filter(
        (o: Option) => (o as Option & { Org_ID?: string }).Org_ID === unitVal
      );
    }
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.supplierCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryGls1005_ledgerMD().pipe(untilDestroyed(this)).subscribe(res => {
      this.depreciationOptions = res ?? [];
    });
    this.dropdownApiService.queryTblUserOrgid().pipe(untilDestroyed(this)).subscribe(res => {
      this.allUserOptionsWithOrg = res ?? [];
      this.updateKeepingPersonOptions();
      this.updateUserOptions();
    });
    this.dropdownApiService.querySys3100().pipe(untilDestroyed(this)).subscribe(res => {
      this.orgUnitOptions = res ?? [];
    });
    this.dropdownApiService.queryPos2002().pipe(untilDestroyed(this)).subscribe(res => {
      this.locationCodeOptions = res ?? [];
    });
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
  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // TODO: this.storeService.addMachine(frm.value).subscribe(...)
            this.messageService.successBubble(this.translate.instant('success_message'));
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // TODO: this.storeService.updateMachine(frm.value).subscribe(...)
            this.messageService.successBubble(this.translate.instant('updated-successfully'));
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  override onCancel(): void {
    this.router.navigate(['/ASS1000/ASS13010']);
  }
}
