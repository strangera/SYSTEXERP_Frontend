import { NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
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
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { DetailASS13010Response, InsertASS13010Request } from '@pages/ass/ass13010/ass13010.model';
import { finalize } from 'rxjs';

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
  private dropdownApiService = inject(DropdownApiService);
  private ass13010Service = inject(ASS13010Service);
  accordionTabCss = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    assetsCode: [, [Validators.required, Validators.maxLength(10)]], // 資產代號
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
  itemCodeOptions: Option[] = []; // queryASS11040_DropDownList
  assetsStatusOptions: Option[] = []; // querySYS1000_DropDownList SYS_Type='ASSET_STATUS'
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
  /** 編輯模式下先暫存人員欄位，待下拉資料就緒後再回填 */
  private pendingEmployeeSelection: { keepingPerson: string | null; user: string | null } | null = null;
  orgUnitOptions: Option[] = []; // querySYS3100_DropDownList
  locationCodeOptions: Option[] = []; // queryPOS2002_DropDownList

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13010', this.dataForm);
    this.accordionTabCss = this.crudstatus === CRUDStatus.Create ? 'create-accordionTab' : 'edit-accordionTab';
    // 新增時 insert 不帶入 items，預設一筆空明細會讓整份 form 因 required 永遠 invalid，故清空以僅驗證主表
    if (this.crudstatus === CRUDStatus.Create) {
      while (this.items.length) {
        this.items.removeAt(0);
      }
    }
    this.loadDropdownOptions();
    this.dataForm.controls.keepingUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateKeepingPersonOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.keepingUnit.value;
      const allowed = this.keepingPersonOptions.some(o => o.value === this.dataForm.controls.keepingPerson.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ keepingPerson: undefined }, { emitEvent: false });
        this.dataForm.controls.keepingPerson.markAsPristine({ onlySelf: true });
      }
    });
    this.dataForm.controls.userUnit.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateUserOptions();
      if (!this.allUserOptionsWithOrg.length) {
        return;
      }
      const unitVal = this.dataForm.controls.userUnit.value;
      const allowed = this.userOptions.some(o => o.value === this.dataForm.controls.user.value);
      if (unitVal != null && unitVal !== '' && !allowed) {
        this.dataForm.patchValue({ user: undefined }, { emitEvent: false });
        this.dataForm.controls.user.markAsPristine({ onlySelf: true });
      }
    });

    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      const id = this.rowdata?.ID != null ? String(this.rowdata.ID) : '';
      if (id) {
        this.loading = true;
        this.ass13010Service
          .detailASS13010({ ID: id })
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              const rawData: any = res?.Data;
              const data: DetailASS13010Response | null | undefined = Array.isArray(rawData)
                ? (rawData[0] as DetailASS13010Response | undefined)
                : (rawData as DetailASS13010Response | null | undefined);

              if (!data) {
                return;
              }

              const soldAmount =
                data.ONSALE_AMT != null
                  ? data.ONSALE_AMT
                  : data.ONSALE_NORATE_AMT != null
                    ? data.ONSALE_NORATE_AMT
                    : null;

              const patch: any = {
                assetsCode: data.ASSET_ID ?? null,
                itemCode: data.GOODS_ID ?? null,
                assetsStatus: data.ASSET_STATUS ?? null,
                assetsType: data.DEPRE_YN ?? null,
                original_assetsCode: data.ORI_ASSET_ID ?? null,
                purchaseNumber: data.SUBPOENA_ID ?? null,
                purchaseDate: data.GET_DATE ?? null,
                purchasePrice: data.GET_COST ?? null,
                supplierCode: data.SUPPLIER_ID ?? null,
                accounting_Borrow: data.STYPE_D ?? null,
                accounting_Credit: data.STYPE_C ?? null,
                entryDate: data.BILL_DATE ?? null,
                deviceCode: data.EQUIP_ID ?? null,
                depreciation: data.STYPE_ID ?? null,
                totalDepreciation: data.STYPE_ID2 ?? null,
                depreciationLife: data.EXP_YEAR ?? null,
                residual: data.RESI_VALUE ?? null,
                depreciationLifeMM: data.FIR_EXP_YEAR ?? data.EXP_MONTH ?? null,
                amortizedAmount: data.TAL_DEPRE_AMT ?? null,
                amortizedMonth: data.TAL_DEPRE_MON ?? null,
                keepingUnit: data.HOLD_ORG_ID ?? null,
                userUnit: data.USE_ORG_ID ?? null,
                locationCode: data.LOCATION_ID ?? null,
                maintenanceCode: data.FIX_N ?? null,
                disposalDate: data.HANDLE_DATE ?? null,
                dispose_Manufacturers: data.HANDLE_VENDOR ?? null,
                dispose_Manufacturers_Summons: data.HANDLE_VID ?? null,
                soldAmount,
                warrantyDays: data.Warranty_YEAR ?? null,
                disposeRemark: data.HANDLE_NOTE ?? null,
                remark: data.PURCHASE_NOTES ?? null,
                amortizationYearMonth: data.TAL_DEPRE_MON != null ? String(data.TAL_DEPRE_MON) : null,
              };

              // detail 初始化帶值時不觸發 valueChanges，避免保管人/使用人被清空
              this.dataForm.patchValue(patch, { emitEvent: false });
              this.pendingEmployeeSelection = {
                keepingPerson: data.HOLD_EMP_ID ?? null,
                user: data.USE_EMP_ID ?? null,
              };
              this.applyPendingEmployeeSelection();

              if (this.crudstatus === CRUDStatus.Read) {
                this.dataForm.disable();
              }
            },
            error: () => {
              // 交給共用的 error interceptor / notification 處理，這裡不另外彈錯
            },
          });
      }
    }
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

  private applyPendingEmployeeSelection(): void {
    if (!this.pendingEmployeeSelection || !this.allUserOptionsWithOrg.length) {
      return;
    }

    this.updateKeepingPersonOptions();
    this.updateUserOptions();

    const nextPatch: Record<string, string | null> = {};
    const { keepingPerson, user } = this.pendingEmployeeSelection;

    // 不補臨時選項；直接回填值，讓 dropdown 以「找不到項目」樣式顯示文字
    nextPatch['keepingPerson'] = keepingPerson;
    nextPatch['user'] = user;

    if (Object.keys(nextPatch).length > 0) {
      this.dataForm.patchValue(nextPatch, { emitEvent: false });
      this.pendingEmployeeSelection = null;
    }
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService.queryASS11040_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.itemCodeOptions = res ?? [];
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'ASSET_STATUS' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.assetsStatusOptions = (res ?? []).map(item => ({ value: item.No, label: item.Name }));
    });
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
      this.applyPendingEmployeeSelection();
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

  /** 將表單日期欄位轉成 API 接受的 date-time 字串 */
  private toDateString(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return null;
  }

  private buildInsertPayload(raw: Record<string, unknown>): InsertASS13010Request {
    // 表單欄位名稱 => API request 欄位（InsertASS13010Request）
    return {
      ASSET_ID: raw['assetsCode'] != null && raw['assetsCode'] !== '' ? String(raw['assetsCode']) : null,
      GOODS_ID: raw['itemCode'] != null && raw['itemCode'] !== '' ? String(raw['itemCode']) : null,
      ASSET_STATUS: raw['assetsStatus'] != null && raw['assetsStatus'] !== '' ? String(raw['assetsStatus']) : null,
      DEPRE_YN: raw['assetsType'] != null && raw['assetsType'] !== '' ? String(raw['assetsType']) : null,
      ORI_ASSET_ID:
        raw['original_assetsCode'] != null && raw['original_assetsCode'] !== ''
          ? String(raw['original_assetsCode'])
          : null,
      SUBPOENA_ID:
        raw['purchaseNumber'] != null && raw['purchaseNumber'] !== '' ? String(raw['purchaseNumber']) : null,
      GET_DATE: this.toDateString(raw['purchaseDate'] as Date | string | null),
      GET_COST: raw['purchasePrice'] != null && raw['purchasePrice'] !== '' ? Number(raw['purchasePrice']) : null,
      SUPPLIER_ID: raw['supplierCode'] != null && raw['supplierCode'] !== '' ? String(raw['supplierCode']) : null,
      STYPE_D: raw['accounting_Borrow'] != null && raw['accounting_Borrow'] !== '' ? String(raw['accounting_Borrow']) : null,
      STYPE_C: raw['accounting_Credit'] != null && raw['accounting_Credit'] !== '' ? String(raw['accounting_Credit']) : null,
      BILL_DATE: this.toDateString(raw['entryDate'] as Date | string | null),
      EQUIP_ID: raw['deviceCode'] != null && raw['deviceCode'] !== '' ? String(raw['deviceCode']) : null,
      STYPE_ID: raw['depreciation'] != null && raw['depreciation'] !== '' ? String(raw['depreciation']) : null,
      STYPE_ID2:
        raw['totalDepreciation'] != null && raw['totalDepreciation'] !== '' ? String(raw['totalDepreciation']) : null,
      EXP_YEAR: raw['depreciationLife'] != null && raw['depreciationLife'] !== '' ? Number(raw['depreciationLife']) : null,
      RESI_VALUE: raw['residual'] != null && raw['residual'] !== '' ? Number(raw['residual']) : null,
      EXP_MONTH:
        raw['depreciationLifeMM'] != null && raw['depreciationLifeMM'] !== '' ? Number(raw['depreciationLifeMM']) : null,
      ORI_IMPORT_DEPRE_MON:
        raw['amortizedMonth'] != null && raw['amortizedMonth'] !== '' ? Number(raw['amortizedMonth']) : null,
      ORI_IMPORT_DEPRE_AMT:
        raw['amortizedAmount'] != null && raw['amortizedAmount'] !== '' ? Number(raw['amortizedAmount']) : null,
      HOLD_EMP_ID: raw['keepingPerson'] != null && raw['keepingPerson'] !== '' ? String(raw['keepingPerson']) : null,
      HOLD_ORG_ID: raw['keepingUnit'] != null && raw['keepingUnit'] !== '' ? String(raw['keepingUnit']) : null,
      USE_EMP_ID: raw['user'] != null && raw['user'] !== '' ? String(raw['user']) : null,
      USE_ORG_ID: raw['userUnit'] != null && raw['userUnit'] !== '' ? String(raw['userUnit']) : null,
      LOCATION_ID: raw['locationCode'] != null && raw['locationCode'] !== '' ? String(raw['locationCode']) : null,
      FIX_N: raw['maintenanceCode'] != null && raw['maintenanceCode'] !== '' ? String(raw['maintenanceCode']) : null,
      HANDLE_DATE: this.toDateString(raw['disposalDate'] as Date | string | null),
      HANDLE_VENDOR:
        raw['dispose_Manufacturers'] != null && raw['dispose_Manufacturers'] !== ''
          ? String(raw['dispose_Manufacturers'])
          : null,
      HANDLE_VID:
        raw['dispose_Manufacturers_Summons'] != null && raw['dispose_Manufacturers_Summons'] !== ''
          ? String(raw['dispose_Manufacturers_Summons'])
          : null,
      ONSALE_AMT: raw['soldAmount'] != null && raw['soldAmount'] !== '' ? Number(raw['soldAmount']) : null,
      Warranty_YEAR: raw['warrantyDays'] != null && raw['warrantyDays'] !== '' ? Number(raw['warrantyDays']) : null,
      DEPRE_SDATE:
        raw['amortizationYearMonth'] != null && raw['amortizationYearMonth'] !== '' ? String(raw['amortizationYearMonth']) : null,
      HANDLE_NOTE: raw['disposeRemark'] != null && raw['disposeRemark'] !== '' ? String(raw['disposeRemark']) : null,
      PURCHASE_NOTES: raw['remark'] != null && raw['remark'] !== '' ? String(raw['remark']) : null,
      CRT_USR_No: this.user?.user_No ?? null,
      CRT_USR_Name: this.user?.user_Name ?? null,
    };
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const raw = frm.getRawValue() as Record<string, unknown>;
            // 表單→API 對應見計畫；表單無欄位不送出：MID, STO_NO, NOTES, FORG_ID, HANDLE_VKEY, DEPRE_ID, GET_COST_TAX, USE_STATUS, DEPRE_AMT, ORI_ORG_ID, ORI_EMP_ID, ASSET_INS_ID, FIX_AMT, SOURCE_STATUS, SUBCHECK_ID, FIR_GET_COST, FIR_EXP_YEAR, LEND_TYPE, REDU_CODE, ONSALE_RATE, ONSALE_NORATE_AMT, EXTEND_EXP_YEAR, DAMAGEM_ID。remark→PURCHASE_NOTES；amortizedMonth→ORI_IMPORT_DEPRE_MON、amortizedAmount→ORI_IMPORT_DEPRE_AMT。
            const payload: InsertASS13010Request = this.buildInsertPayload(raw);
            this.ass13010Service
              .insertASS13010(payload)
              .pipe(
                finalize(() => {
                  this.loading = false;
                }),
                untilDestroyed(this),
              )
              .subscribe({
                next: res => {
                  if (res.Status !== '0000') {
                    this.messageService.errorBubble(res.Message ?? res.Error?.Message ?? '新增失敗');
                    return;
                  }
                  this.messageService.successBubble(res.Data?.Message ?? res.Message ?? '新增成功');
                  this.onCancel();
                },
                error: err => {
                  this.messageService.errorBubble(err?.message ?? '新增失敗');
                },
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const raw = frm.getRawValue() as Record<string, unknown>;
            // 表單→API 對應見計畫；表單無欄位不送出同 Create 分支。
            const payload: InsertASS13010Request = this.buildInsertPayload(raw);
            this.ass13010Service
              .insertASS13010(payload)
              .pipe(
                finalize(() => {
                  this.loading = false;
                }),
                untilDestroyed(this),
              )
              .subscribe({
                next: res => {
                  if (res.Status !== '0000') {
                    this.messageService.errorBubble(res.Message ?? res.Error?.Message ?? '新增失敗');
                    return;
                  }
                  this.messageService.successBubble(res.Data?.Message ?? res.Message ?? '新增成功');
                  this.onCancel();
                },
                error: err => {
                  this.messageService.errorBubble(err?.message ?? '新增失敗');
                },
              });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  override onCancel(): void {
    super.onCancel();
  }
}
