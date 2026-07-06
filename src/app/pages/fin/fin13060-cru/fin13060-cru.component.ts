/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PanelModule } from 'primeng/panel';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { untilDestroyed } from '@ngneat/until-destroy';
import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { ValidationService } from '@shared/service/validation.service';
import { finalize } from 'rxjs';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

/** 依 updateFIN13060Request（後端為主）的 Typed Form */
interface Fin13060CruForm {
  ID: FormControl<number | null>;
  mid: FormControl<number | null>;
  SYS_StoreNo: FormControl<string | null>;

  ECR_No: FormControl<string | null>;
  TXN_No: FormControl<string | null>;
  TXN_GUIPaper: FormControl<string | null>;

  INV_NoneTax: FormControl<string | null>;
  INV_Cancel: FormControl<'N' | 'Y' | null>;

  INV_GUIType: FormControl<string | null>;
  INV_GUITrack: FormControl<string | null>;
  INV_GUINumber: FormControl<string | null>;

  TXN_Date: FormControl<Date | string | null>;

  /** 真正送後端的值 */
  INV_YM: FormControl<string | null>;
  /** 只給畫面顯示 */
  INV_YM_Display: FormControl<string | null>;

  INV_DeclareYM: FormControl<string | null>;

  TXN_SaleAmt: FormControl<number | null>;
  TXN_Net: FormControl<number | null>;
  TXN_Tax: FormControl<number | null>;

  PLU_TaxType: FormControl<string | null>;

  Source_Doc_No: FormControl<string | null>;
  Voucher_No: FormControl<string | null>;
  SYS_ORIGIN: FormControl<string | null>;
  AssetType: FormControl<string | null>;
  INV_Remark: FormControl<string | null>;
  Tlt_No: FormControl<string | null>;
  Ven_No: FormControl<string | null>;
  STO_Uniform: FormControl<string | null>;
  TXN_Uniform: FormControl<string | null>;
}

@Component({
  selector: 'app-fin13060-cru',
  standalone: true,
  templateUrl: './fin13060-cru.component.html',
  styleUrls: ['./fin13060-cru.component.scss'],
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
    YearMonthComponent,
  ],
})
export class FIN13060CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @Output() fieldChange = new EventEmitter<any>();

  taxTypeOptions: any[] = [];
  SAL_TypeOptions: any[] = [];
  AssetNoteOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  INV_NoneTaxOptions: any[] = [];
  INV_CancelOptions: any[] = [
    { label: '否', value: 'N' },
    { label: '是', value: 'Y' },
  ];
  System_IDOptions: any[] = [];
  TXN_GUIPaperOptions: any[] = [];
  INV_GUITypeOptions: any[] = [];
  venNoOptions: any[] = [];

  private readonly GUI_TYPE_TO_PAPER: Record<string, string> = {
    '31': '3',
    '32': '2',
  };

  dataForm: FormGroup<Fin13060CruForm> = new FormGroup<Fin13060CruForm>({
    ID: new FormControl<number | null>(null),

    mid: new FormControl<number | null>(
      { value: null, disabled: true },
      { validators: [Validators.required] }
    ),
    SYS_StoreNo: new FormControl<string | null>(
      { value: null, disabled: true },
      { validators: [Validators.required] }
    ),

    ECR_No: new FormControl<string | null>('', { validators: [Validators.required] }),
    TXN_No: new FormControl<string | null>(null, { validators: [Validators.required] }),
    TXN_GUIPaper: new FormControl<string | null>('', { validators: [Validators.required] }),

    INV_NoneTax: new FormControl<string | null>('0', { validators: [Validators.required] }),
    INV_Cancel: new FormControl<'N' | 'Y' | null>('N', { validators: [Validators.required] }),

    INV_GUIType: new FormControl<string | null>(null, {
      validators: [Validators.required, Validators.pattern(/^(31|32)$/)],
    }),
    INV_GUITrack: new FormControl<string | null>('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        Validators.pattern(/^[A-Z]{2}$/),
      ],
    }),
    INV_GUINumber: new FormControl<string | null>('', {
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
        Validators.pattern(/^\d{8}$/),
      ],
    }),

    TXN_Date: new FormControl<Date | string | null>(null, { validators: [Validators.required] }),

    INV_YM: new FormControl<string | null>(null, [Validators.required]),
    INV_YM_Display: new FormControl<string | null>(null),
    INV_DeclareYM: new FormControl<string | null>(null, [Validators.required, this.declareYMValidator()]),

    TXN_SaleAmt: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.maxLength(10)],
    }),
    TXN_Net: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.maxLength(10)],
    }),
    TXN_Tax: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.maxLength(10)],
    }),

    PLU_TaxType: new FormControl<string | null>(null, { validators: [Validators.required] }),

    Source_Doc_No: new FormControl<string | null>(null, {
      validators: [
        Validators.minLength(16),
        Validators.maxLength(16),
        Validators.pattern(/^[A-Z0-9]{16}$/),
      ],
    }),
    Voucher_No: new FormControl<string | null>(null),
    SYS_ORIGIN: new FormControl<string | null>(null),
    AssetType: new FormControl<string | null>(null),
    INV_Remark: new FormControl<string | null>(null),
    Tlt_No: new FormControl<string | null>(null),
    Ven_No: new FormControl<string | null>(null),
    STO_Uniform: new FormControl<string | null>(null),
    TXN_Uniform: new FormControl<string | null>({ value: null, disabled: true }, [this.uniformNumberValidator()]),
  });

  constructor(
    private readonly fin13060Service: FIN13060Service,
    private readonly fin13050Service: FIN13050Service,
    private readonly validationService: ValidationService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13060', this.dataForm);
    this.hydrateStoreInfoFromLocalStorage();

    //後續新增的下拉選項
    this.loadOptions();

    // 若 Edit / Read 有 rowdata，補顯示用 INV_YM_Display
    const row: any = (this as any).rowdata;
    if (row) {
      this.dataForm.patchValue(
        {
          INV_YM: this.toYYYYMM(row.INV_YM),
          INV_YM_Display: this.fixInvYmForYearMonthDisplay(row.INV_YM),
          INV_DeclareYM: this.toYYYYMM(row.INV_DeclareYM),
          TXN_Uniform: row.TXN_Uniform ?? null,
        },
        { emitEvent: false }
      );
    }

    this.updateDisabledState();

    if (this.crudstatus === CRUDStatus.Create) {
      const curEcr = this.dataForm.controls.ECR_No.value;
      const curTxn = this.dataForm.controls.TXN_No.value;

      if (!curEcr) this.dataForm.controls.ECR_No.setValue('ZZZ', { emitEvent: false });
      if (!curTxn) this.dataForm.controls.TXN_No.setValue('1', { emitEvent: false });
    }

    this.dataForm.controls.INV_GUIType.valueChanges.subscribe((v) => {
      this.applyGuiTypeToPaper(v);
    });

    this.fin13050Service.querySYS1000DropDownList('SAL_Type').subscribe((res) => {
      const list = res?.Data ?? [];
      this.SAL_TypeOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));

      if (this.crudstatus === CRUDStatus.Create && !this.dataForm.controls.SYS_ORIGIN.value) {
        const hasG = this.SAL_TypeOptions.some((o) => o.value === 'G');
        if (hasG) this.dataForm.controls.SYS_ORIGIN.setValue('G', { emitEvent: false });
      }
    });

    const sys1000 = (type: string) => this.fin13050Service.querySYS1000DropDownList(type as any);

    sys1000('SYS_ORIGIN').subscribe((res: any) => {
      const list = res?.Data ?? [];
      const allowedOrigins = new Set(['2', 'E', 'G', 'T', 'V']);

      this.System_IDOptions = list
        .filter((x: any) => allowedOrigins.has(String(x.No)))
        .map((x: any) => ({
          value: String(x.No ?? ''),
          label: `${x.No ?? ''}-${x.Name ?? ''}`,
        }));

      if (this.crudstatus === CRUDStatus.Create) {
        const ctrl = this.dataForm.controls.SYS_ORIGIN;
        const cur = String(ctrl.value ?? '').trim();

        const hasG = this.System_IDOptions.some((o) => o.value === 'G');

        if (!cur && hasG) {
          ctrl.setValue('G', { emitEvent: false });
        }
      }
    });

    this.fin13050Service.querySYS1000DropDownList('AssetType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.AssetNoteOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    this.fin13050Service.querySYS1000DropDownList('INV_NoneTax').subscribe((res) => {
      const list = res?.Data ?? [];
      this.INV_NoneTaxOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));

      if (this.crudstatus === CRUDStatus.Create && !this.dataForm.controls.INV_NoneTax.value) {
        const defaultNo =
          this.INV_NoneTaxOptions.find((o) => o.label?.includes('否'))?.value ??
          this.INV_NoneTaxOptions.find((o) => o.value === '0')?.value ??
          null;

        if (defaultNo !== null) {
          this.dataForm.controls.INV_NoneTax.setValue(defaultNo, { emitEvent: false });
        }
      }
    });

    this.fin13060Service.queryAPS2002DropDownList().subscribe((res) => {
      const list = res?.Data ?? [];
      const allow = new Set(['31', '32']);

      this.INV_GUITypeOptions = list
        .map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }))
        .filter((o) => allow.has(o.value));

      const cur = this.dataForm.controls.INV_GUIType.value;
      if (this.crudstatus === CRUDStatus.Create && (!cur || !allow.has(String(cur)))) {
        const defaultValue = this.INV_GUITypeOptions.some((o) => o.value === '31')
          ? '31'
          : this.INV_GUITypeOptions[0]?.value ?? null;

        this.dataForm.controls.INV_GUIType.setValue(defaultValue, { emitEvent: true });
      }

      this.applyGuiTypeToPaper(this.dataForm.controls.INV_GUIType.value);
    });

    this.dropdownApiService.queryPos1002().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      }));
    });

    this.fin13050Service.querySYS1000DropDownList('PLU_TaxType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    this.fin13050Service.querySYS1000DropDownList('TXN_GUIPaper').subscribe((res) => {
      const list = res?.Data ?? [];
      this.TXN_GUIPaperOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
      this.applyGuiTypeToPaper(this.dataForm.controls.INV_GUIType.value);
    });

    this.setupInputMasks();
    this.setupTaxCalculation();
    this.setupInvoiceDateToYM();
    this.setupTltNoToVenNo();
    this.setupVenNoToTxnUniform();

    if (this.crudstatus === CRUDStatus.Create) {
      this.setDefaultDeclareYM();
    }
  }

  onSubmit(form: FormGroup<Fin13060CruForm>): void {
    const LABELS: Record<string, string> = {
      ECR_No: '收銀機號',
      TXN_No: '交易序號',
      TXN_GUIPaper: '發票種類',
      INV_GUITrack: '發票字軌',
      INV_GUINumber: '發票號碼',
      TXN_Date: '發票日期',
      INV_YM: '發票年月',
      INV_DeclareYM: '申報年月',
      TXN_SaleAmt: '發票總金額',
      TXN_Net: '發票未稅金額',
      TXN_Tax: '稅額',
      PLU_TaxType: '稅別',
      Source_Doc_No: '憑證單號',
      Voucher_No: '傳票號碼',
      AssetType: '資產註記',
      INV_Remark: '備註',
      Tlt_No: '專櫃編號',
      Ven_No: '廠商編號',
      TXN_Uniform: '買受人統一編號',
      INV_NoneTax: '零稅銷售註記',
      INV_Cancel: '是否作廢',
      INV_GUIType: '格式代號',
      SYS_ORIGIN: '系統別',
    };

    if (this.showErrorsIfInvalid(form, LABELS)) return;

    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      let txnUniform: string | null = null;
      if (raw.Ven_No) {
        const selectedVendor = this.venNoOptions.find(o => o.value === raw.Ven_No);
        txnUniform = selectedVendor ? this.normalize(selectedVendor.No) : null;
      }
      const payload = {
        ID: raw.ID != null ? Number(raw.ID) : 0,
        mid: Number(raw.mid ?? 0),
        SYS_StoreNo: this.normalize(raw.SYS_StoreNo),

        ECR_No: this.normalize(raw.ECR_No),
        TXN_No: this.normalize(raw.TXN_No),

        TXN_GUIPaper: this.normalize(raw.TXN_GUIPaper),
        INV_NoneTax: this.normalize(raw.INV_NoneTax),
        INV_Cancel: this.normalize(raw.INV_Cancel),
        INV_GUIType: this.normalize(raw.INV_GUIType),
        INV_GUITrack: this.normalize(raw.INV_GUITrack),
        INV_GUINumber: this.normalize(raw.INV_GUINumber),

        TXN_Date: this.toDateOnlyString(raw.TXN_Date) ?? '',
        /** ✅ 真正送後端的仍然是 INV_YM，不是 INV_YM_Display */
        INV_YM: this.toYYYYMM(raw.INV_YM) ?? '',
        INV_DeclareYM: this.toYYYYMM(raw.INV_DeclareYM) ?? '',

        TXN_SaleAmt: raw.TXN_SaleAmt != null ? Number(raw.TXN_SaleAmt) : 0,
        TXN_Net: raw.TXN_Net != null ? Number(raw.TXN_Net) : 0,
        TXN_Tax: raw.TXN_Tax != null ? Number(raw.TXN_Tax) : 0,

        PLU_TaxType: this.normalize(raw.PLU_TaxType),
        Source_Doc_No: this.normalize(raw.Source_Doc_No),
        Voucher_No: this.normalize(raw.Voucher_No),
        SYS_ORIGIN: this.normalize(raw.SYS_ORIGIN),
        AssetType: this.normalize(raw.AssetType),
        INV_TXNType: 1,
        INV_Remark: this.normalize(raw.INV_Remark),
        Tlt_No: this.normalize(raw.Tlt_No),
        Ven_No: this.normalize(raw.Ven_No),
        TXN_Uniform: this.normalize(raw.TXN_Uniform),
      } as const;

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        const { ID, ...insertPayload } = payload;

        this.fin13060Service.insertFIN13060(insertPayload).pipe(finalize(() => { this.loading = false; this.messageService.unblockUi(); })).subscribe(() => {
          this.messageService.successBubble('新增成功');

          this.dataForm.reset();
          this.hydrateStoreInfoFromLocalStorage();
          this.updateDisabledState();

          this.dataForm.patchValue(
            {
              ECR_No: 'ZZZ',
              TXN_No: '1',
              INV_YM: null,
              INV_YM_Display: null,
            },
            { emitEvent: false }
          );
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.fin13060Service.updateFIN13060(payload).pipe(finalize(() => { this.loading = false; this.messageService.unblockUi(); })).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13060'], { state: { fromCru: true } });
  }

  private applyGuiTypeToPaper(guiType: any): void {
    const type = String(guiType ?? '').trim();
    const paper = this.GUI_TYPE_TO_PAPER[type];
    if (!paper) return;

    const ctrl = this.dataForm.controls.TXN_GUIPaper;
    if (String(ctrl.value ?? '') !== paper) {
      ctrl.setValue(paper, { emitEvent: false });
    }
  }

  private uniformNumberValidator(): ValidatorFn {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      if (!ctrl.value) return null;
      return this.validationService.companyIdValidator({ value: String(ctrl.value) });
    };
  }

  private declareYMValidator(): ValidatorFn {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const v = ctrl.value;
      if (v == null || v === '') return null;

      let m: number;
      if (v instanceof Date && !isNaN(v.getTime())) {
        m = v.getMonth() + 1;
      } else {
        const s = String(v).trim();
        if (!/^\d{6}$/.test(s)) return { invalidDate2: true };
        m = Number(s.slice(4, 6));
      }

      if (m < 1 || m > 12) return { invalidDate2: true };
      if (m % 2 !== 0) return { invalidEvenMonth: true };
      return null;
    };
  }

  private toYYYYMM(v: any): string | null {
    if (!v) return null;

    if (typeof v === 'string' && /^\d{6}$/.test(v)) return v;

    const asDate = v instanceof Date ? v : new Date(v);
    if (!isNaN(asDate.getTime())) {
      const y = asDate.getFullYear();
      const m = String(asDate.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const digits = String(v).replace(/\D/g, '');
    return digits.length >= 6 ? digits.slice(0, 6) : null;
  }

  private setDefaultDeclareYM(): void {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    if (month % 2 !== 0) {
      month += 1;
      if (month > 12) {
        month = 2;
        year += 1;
      }
    }

    const yyyymm = `${year}${String(month).padStart(2, '0')}`;
    this.dataForm.controls.INV_DeclareYM.setValue(yyyymm, { emitEvent: false });
  }

  private updatingFromNet = false;
  private updatingFromSaleAmt = false;

  private setupTaxCalculation(): void {
    const netCtrl = this.dataForm.controls.TXN_Net;
    const saleAmtCtrl = this.dataForm.controls.TXN_SaleAmt;
    const taxCtrl = this.dataForm.controls.TXN_Tax;

    this.dataForm.controls.PLU_TaxType.valueChanges.subscribe(() => {
      this.recalculateTax();
    });

    netCtrl.valueChanges.subscribe((value) => {
      if (this.updatingFromSaleAmt) return;
      this.updatingFromNet = true;

      const taxType = this.dataForm.controls.PLU_TaxType.value;

      if (value === null || value === undefined || String(value) === '') {
        taxCtrl.setValue(null, { emitEvent: false });
        saleAmtCtrl.setValue(null, { emitEvent: false });
        this.updatingFromNet = false;
        return;
      }

      const netVal = Math.round(Number(value) || 0);

      if (taxType === '1') {
        const currentSaleAmt = saleAmtCtrl.value;
        if (currentSaleAmt !== null && currentSaleAmt !== undefined && String(currentSaleAmt) !== '') {
          taxCtrl.setValue(Math.round(Number(currentSaleAmt)) - netVal, { emitEvent: false });
        } else {
          const taxVal = Math.round(netVal * 0.05);
          taxCtrl.setValue(taxVal, { emitEvent: false });
          saleAmtCtrl.setValue(netVal + taxVal, { emitEvent: false });
        }
      } else if (taxType === '0') {
        taxCtrl.setValue(0, { emitEvent: false });
        saleAmtCtrl.setValue(netVal, { emitEvent: false });
      }

      this.updatingFromNet = false;
    });

    saleAmtCtrl.valueChanges.subscribe((value) => {
      if (this.updatingFromNet) return;
      this.updatingFromSaleAmt = true;

      const taxType = this.dataForm.controls.PLU_TaxType.value;

      if (value === null || value === undefined || String(value) === '') {
        netCtrl.setValue(null, { emitEvent: false });
        taxCtrl.setValue(null, { emitEvent: false });
        this.updatingFromSaleAmt = false;
        return;
      }

      const totalVal = Math.round(Number(value) || 0);

      if (taxType === '1') {
        const netVal = Math.round(totalVal / 1.05);
        const taxVal = totalVal - netVal;
        netCtrl.setValue(netVal, { emitEvent: false });
        taxCtrl.setValue(taxVal, { emitEvent: false });
      } else if (taxType === '0') {
        netCtrl.setValue(totalVal, { emitEvent: false });
        taxCtrl.setValue(0, { emitEvent: false });
      }

      this.updatingFromSaleAmt = false;
    });
  }

  private recalculateTax(): void {
    const taxType = this.dataForm.controls.PLU_TaxType.value;
    const netCtrl = this.dataForm.controls.TXN_Net;
    const saleAmtCtrl = this.dataForm.controls.TXN_SaleAmt;
    const taxCtrl = this.dataForm.controls.TXN_Tax;

    const isTaxable = taxType === '1';
    const isTaxFree = taxType === '0';

    if (isTaxFree) {
      taxCtrl.setValue(0, { emitEvent: false });
      taxCtrl.disable({ emitEvent: false });

      const saleAmt = saleAmtCtrl.value ?? 0;
      if (saleAmt) netCtrl.setValue(saleAmt, { emitEvent: false });
    } else if (isTaxable) {
      taxCtrl.disable({ emitEvent: false });

      const netVal = Number(netCtrl.value) || 0;
      if (netVal > 0) {
        const taxVal = Math.round(netVal * 0.05);
        const totalVal = netVal + taxVal;
        taxCtrl.setValue(taxVal, { emitEvent: false });
        saleAmtCtrl.setValue(totalVal, { emitEvent: false });
      }
    } else {
      taxCtrl.enable({ emitEvent: false });
    }
  }

  private setupInvoiceDateToYM(): void {
    this.dataForm.controls.TXN_Date.valueChanges.subscribe((dateValue) => {
      if (!dateValue) {
        this.dataForm.patchValue({
          INV_YM: null,
          INV_YM_Display: null
        });
        return;
      }

      const realYM = this.toInvoiceRealYM(dateValue);
      const displayYM = this.toInvoiceDisplayYM(dateValue);

      this.dataForm.patchValue({
        INV_YM: realYM,
        INV_YM_Display: displayYM
      });
    });
  }
  private checkVendorDisableState(isInitialLoad = false): void {
    if (this.crudstatus === CRUDStatus.Read) return; // Read 模式本來就會全鎖定，不處理

    const tltCtrl = this.dataForm.controls.Tlt_No;
    const venCtrl = this.dataForm.controls.Ven_No;
    const txnUniformCtrl = this.dataForm.controls.TXN_Uniform;
    const selectedTltNo = tltCtrl.value;

    if (!selectedTltNo) {
      venCtrl.enable({ emitEvent: false });
      return;
    }

    // 在下拉選單資料中尋找目前選中的專櫃
    const selectedCounter = this.CounterOptions.find(c => c.value === selectedTltNo);

    if (selectedCounter && selectedCounter.ven_no) {
      venCtrl.setValue(selectedCounter.ven_no, { emitEvent: false });
      venCtrl.disable({ emitEvent: false });

      // 初始帶入 Edit 資料時不覆蓋原始統編；Create 或使用者主動異動才更新
      if (!isInitialLoad || this.crudstatus === CRUDStatus.Create) {
        const vendor = this.venNoOptions.find(o => o.value === selectedCounter.ven_no);
        txnUniformCtrl.setValue(vendor?.No ?? null, { emitEvent: false });
      }
    } else {
      venCtrl.enable({ emitEvent: false });
    }
  }

  private setupTltNoToVenNo(): void {
    this.dataForm.controls.Tlt_No.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.checkVendorDisableState();
    });
  }

  private setupVenNoToTxnUniform(): void {
    this.dataForm.controls.Ven_No.valueChanges.pipe(untilDestroyed(this)).subscribe((venNo) => {
      const txnUniformCtrl = this.dataForm.controls.TXN_Uniform;
      if (!venNo) {
        txnUniformCtrl.setValue(null, { emitEvent: false });
        return;
      }
      const vendor = this.venNoOptions.find(o => o.value === venNo);
      txnUniformCtrl.setValue(vendor?.No ?? null, { emitEvent: false });
    });
  }

  /** 真正送後端的發票年月：保留原始月份，例如 202202 */
  private toInvoiceRealYM(v: any): string | null {
    return this.toYYYYMM(v);
  }

  /** 顯示用發票年月：若是雙數月，顯示成對應奇數起始月，例如 202202 -> 202201 */
  private toInvoiceDisplayYM(v: any): string | null {
    const yyyymm = this.toYYYYMM(v);
    if (!yyyymm) return null;

    const year = yyyymm.substring(0, 4);
    let month = parseInt(yyyymm.substring(4, 6), 10);

    if (month % 2 === 0) month -= 1;
    return `${year}${String(month).padStart(2, '0')}`;
  }

  private setupInputMasks(): void {
    const guiTrack = this.dataForm.controls.INV_GUITrack;
    guiTrack.valueChanges.subscribe((v) => {
      const inStr = (v ?? '').toString();
      const fixed = inStr.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      if (fixed !== inStr) guiTrack.setValue(fixed, { emitEvent: false });
    });

    const guiNumber = this.dataForm.controls.INV_GUINumber;
    guiNumber.valueChanges.subscribe((v) => {
      const inStr = (v ?? '').toString();
      const fixed = inStr.replace(/\D/g, '').slice(0, 8);
      if (fixed !== inStr) guiNumber.setValue(fixed, { emitEvent: false });
    });

    const srcDoc = this.dataForm.controls.Source_Doc_No;
    srcDoc.valueChanges.subscribe((v) => {
      if (v == null) return;
      const inStr = v.toString();
      const fixed = inStr.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
      if (fixed !== inStr) srcDoc.setValue(fixed, { emitEvent: false });
    });
  }

  private hydrateStoreInfoFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem('UserInfo');
      if (!raw) return;
      const obj = JSON.parse(raw);
      const mid = Number(obj?.mid ?? obj?.Mid ?? 0);
      const store = String(obj?.SYS_StoreNo ?? obj?.STR_StoreNo ?? obj?.StoreNo ?? '');
      const stoUniform = String(obj?.STO_Uniform ?? obj?.STR_Uniform ?? '');
      this.dataForm.patchValue({
        mid: isNaN(mid) ? 0 : mid,
        SYS_StoreNo: store || null,
        STO_Uniform: stoUniform || null,
      });
    } catch {
      // ignore
    }
  }

  private toDateOnlyString(d: any): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN((date as any)?.getTime?.())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private normalize(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  /**
   * - Read：全表單唯讀
   * - Create / Edit：ECR_No / TXN_No / TXN_GUIPaper 唯讀
   */
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable({ emitEvent: false });
      return;
    }

    this.dataForm.enable({ emitEvent: false });
    this.dataForm.controls.mid.disable({ emitEvent: false });
    this.dataForm.controls.SYS_StoreNo.disable({ emitEvent: false });
    this.dataForm.controls.ECR_No.disable({ emitEvent: false });
    this.dataForm.controls.TXN_No.disable({ emitEvent: false });
    this.dataForm.controls.TXN_GUIPaper.disable({ emitEvent: false });

    // 顯示用欄位永遠唯讀
    this.dataForm.controls.INV_YM_Display.disable({ emitEvent: false });
  }

  private showErrorsIfInvalid(form: FormGroup, labelMap: Record<string, string>): boolean {
    if (form.valid) return false;

    this.submitted = true;

    Object.entries(form.controls).forEach(([key, ctrl]) => {
      const errors = ctrl.errors;
      if (!errors) return;

      const firstKey = Object.keys(errors)[0];
      const firstErr = (errors as any)[firstKey];

      const label = labelMap[key] ?? key;
      const msg = this.validationService.getValidatorErrorMessage(firstKey, firstErr) ?? '驗證失敗';

      this.messageService.errorBubble(`「${label}」${msg}（此欄位必填，請檢查輸入資料）`);
    });

    return true;
  }

  /** 後端若回偶數月(02/04/06/...)，顯示要往前推一個月 */
  private fixInvYmForYearMonthDisplay(invYm: any): string | null {
    const yyyymm = this.toYYYYMM(invYm);
    if (!yyyymm) return null;

    const year = yyyymm.substring(0, 4);
    let month = parseInt(yyyymm.substring(4, 6), 10);
    if (isNaN(month) || month < 1 || month > 12) return null;

    if (month % 2 === 0) month -= 1;

    return `${year}${String(month).padStart(2, '0')}`;
  }

  //下拉
  loadOptions() {
    // 專櫃
    this.fin13060Service.queryFIN13060TalentDropDown().subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.CounterOptions =
        list.map((x: any) => ({
          label: x.tlt_name,
          formLabel: `${x.tlt_no} - ${x.tlt_name}`,
          value: x.tlt_no,
          ven_no: x.ven_no,
          ven_uniform: x.ven_uniform,
        }));
      this.checkVendorDisableState(true);
    });
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe((res: any) => {
      this.venNoOptions = (res?.Data ?? []).map((x: any) => ({
        label: `${x.VEN_No} - ${x.Name}`,
        value: x.VEN_No,
        ...x,
      }));
    });
  }
}
