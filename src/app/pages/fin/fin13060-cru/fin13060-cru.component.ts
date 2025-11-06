/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';
import { ValidationService } from '@shared/service/validation.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

/** Typed Forms：每個欄位都給明確的 FormControl 型別 */
interface Fin13060CruForm {
  mid: FormControl<number | null>;
  SYS_StoreNo: FormControl<string | null>;

  ECR_No: FormControl<string | null>;
  TXN_No: FormControl<number | null>;
  TXN_GUIPaper: FormControl<string | null>;

  INV_NoneTax: FormControl<string | null>;
  INV_Cancel: FormControl<'N' | 'Y' | null>;

  INV_GUIType: FormControl<string | null>;
  INV_GUITrack: FormControl<string | null>;
  INV_GUINumber: FormControl<string | null>;

  TXN_Date: FormControl<Date | string | null>;
  INV_DeclareYM: FormControl<Date | null>;   // 月份控件一律用 Date

  TXN_SaleAmt: FormControl<number | null>;
  TXN_Net: FormControl<number | null>;
  TXN_Tax: FormControl<number | null>;

  PLU_TaxType: FormControl<string | null>;

  Source_Doc_No: FormControl<string | null>;
  Voucher_No: FormControl<string | null>;
  SAL_Type: FormControl<string | null>;
  SYS_ORIGIN: FormControl<string | null>;
  AssetType: FormControl<string | null>;
  INV_Remark: FormControl<string | null>;
  Tlt_No: FormControl<string | null>;
  Ven_No: FormControl<string | null>;

  ID: FormControl<number | null>;
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
    DropdownComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
    CalenderoneComponent,
  ],
})
export class FIN13060CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉選項
  PUR_VoucherTypeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  SAL_TypeOptions: any[] = [];
  AssetNoteOptions: any[] = [];
  SYS_ORIGINOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = []; // 專櫃
  INV_NoneTaxOptions: any[] = [];
  INV_CancelOptions: any[] = [
    { label: '否', value: 'N' },
    { label: '是', value: 'Y' },
  ];
  TXN_GUIPaperOptions: any[] = [];
  INV_GUITypeOptions: any[] = [];

  /** 轉成 'YYYYMM'（可吃 Date 或字串 'YYYY/MM'、'YYYYMM'）*/
  private toYYYYMM(v: any): string | null {
    if (!v) return null;
    const asDate = v instanceof Date ? v : new Date(v);
    if (!isNaN(asDate.getTime())) {
      const y = asDate.getFullYear();
      const m = String(asDate.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    const digits = String(v).replace(/\D/g, '');
    return digits.length >= 6 ? digits.slice(0, 6) : null;
  }

  /** 202508 → Date(2025-08-01)（備用） */
  private ymToDate(v: any): Date | null {
    if (!v) return null;
    const s = String(v).replace(/[^0-9]/g, '');
    if (s.length < 6) return null;
    const y = Number(s.slice(0, 4));
    const m = Number(s.slice(4, 6));
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
    return new Date(y, m - 1, 1);
  }

  /** 完整 Typed FormGroup —— 讓 template 可用 dataForm.controls.欄位 直接取用 */
  dataForm: FormGroup<Fin13060CruForm> = new FormGroup<Fin13060CruForm>({
    mid: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
    SYS_StoreNo: new FormControl<string | null>({ value: null, disabled: true }, { validators: [Validators.required] }),

    ECR_No: new FormControl<string | null>('', { validators: [Validators.required] }),
    TXN_No: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_GUIPaper: new FormControl<string | null>('', { validators: [Validators.required] }),

    INV_NoneTax: new FormControl<string | null>('0', { validators: [Validators.required] }),
    INV_Cancel: new FormControl<'N' | 'Y' | null>('N', { validators: [Validators.required] }),

    INV_GUIType: new FormControl<string | null>(null, { validators: [Validators.required] }),
    INV_GUITrack: new FormControl<string | null>('', {
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern(/^[A-Z]{2}$/)],
    }),
    INV_GUINumber: new FormControl<string | null>('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^\d{8}$/)],
    }),

    TXN_Date: new FormControl<Date | string | null>(null, { validators: [Validators.required] }),
    INV_DeclareYM: new FormControl<Date | null>(null, [
      Validators.required,
      this.validationService.evenMonthValidator,
      this.validationService.minMonthValidator,
    ]),

    TXN_SaleAmt: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_Net: new FormControl<number | null>(null, { validators: [Validators.required] }),
    TXN_Tax: new FormControl<number | null>(null, { validators: [Validators.required] }),

    PLU_TaxType: new FormControl<string | null>(null, { validators: [Validators.required] }),

    Source_Doc_No: new FormControl<string | null>(null, {
      validators: [Validators.minLength(16), Validators.maxLength(16), Validators.pattern(/^[A-Z0-9]{16}$/)],
    }),
    Voucher_No: new FormControl<string | null>(null),
    SAL_Type: new FormControl<string | null>(null),
    AssetType: new FormControl<string | null>(null),
    INV_Remark: new FormControl<string | null>(null),
    Tlt_No: new FormControl<string | null>(null),
    Ven_No: new FormControl<string | null>(null),
    SYS_ORIGIN: new FormControl<string | null>(null),

    ID: new FormControl<number | null>(null),
  });

  constructor(
    private fin13060Service: FIN13060Service,
    private counterNameService: CounterNameService,
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
    private ECRNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13060', this.dataForm);
    this.hydrateStoreInfoFromLocalStorage(); // mid、SYS_StoreNo 由 localStorage 帶入

    // 專櫃清單
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) ?? [];
    });

    this.fin13050Service.querySYS1000DropDownList('AssetType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.AssetNoteOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('INV_NoneTax').subscribe((res) => {
      const list = res?.Data ?? [];
      this.INV_NoneTaxOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
      // 新增預設「否」
      if (this.crudstatus === CRUDStatus.Create && !this.dataForm.controls.INV_NoneTax.value) {
        const defaultNo =
          this.INV_NoneTaxOptions.find(o => o.label?.includes('否'))?.value ??
          this.INV_NoneTaxOptions.find(o => o.value === '0')?.value ??
          null;
        if (defaultNo !== null) {
          this.dataForm.controls.INV_NoneTax.setValue(defaultNo, { emitEvent: false });
        }
      }
    });

    this.fin13060Service.queryAPS2002DropDownList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.INV_GUITypeOptions = list.map(x => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value }));
    });

    this.fin13050Service.querySYS1000DropDownList('SYS_ORIGIN').subscribe((res) => {
      const list = res?.Data ?? [];
      this.SYS_ORIGINOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('T205').subscribe((res) => {
      const list = res?.Data ?? [];
      this.SAL_TypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('PLU_TaxType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('TXN_GUIPaper').subscribe((res) => {
      const list = res?.Data ?? [];
      this.TXN_GUIPaperOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    // 即時輸入限制
    this.setupInputMasks();

    this.updateDisabledState();
  }

  private setupInputMasks(): void {
    const guiTrack = this.dataForm.controls.INV_GUITrack;
    guiTrack.valueChanges.subscribe(v => {
      const inStr = (v ?? '').toString();
      const fixed = inStr.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      if (fixed !== inStr) guiTrack.setValue(fixed, { emitEvent: false });
    });

    const guiNumber = this.dataForm.controls.INV_GUINumber;
    guiNumber.valueChanges.subscribe(v => {
      const inStr = (v ?? '').toString();
      const fixed = inStr.replace(/\D/g, '').slice(0, 8);
      if (fixed !== inStr) guiNumber.setValue(fixed, { emitEvent: false });
    });

    const srcDoc = this.dataForm.controls.Source_Doc_No;
    srcDoc.valueChanges.subscribe(v => {
      if (v == null) return;
      const inStr = v.toString();
      const fixed = inStr.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
      if (fixed !== inStr) srcDoc.setValue(fixed, { emitEvent: false });
    });
  }

  /** 從 localStorage.UserInfo 取 mid、SYS_StoreNo */
  private hydrateStoreInfoFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem('UserInfo');
      if (!raw) return;
      const obj = JSON.parse(raw);
      const mid = Number(obj?.mid ?? obj?.Mid ?? 0);
      const store = String(obj?.SYS_StoreNo ?? obj?.STR_StoreNo ?? obj?.StoreNo ?? '');
      this.dataForm.patchValue({
        mid: isNaN(mid) ? 0 : mid,
        SYS_StoreNo: store || null,
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

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
      return;
    }
    this.dataForm.enable();
    this.dataForm.controls.mid.disable();
    this.dataForm.controls.SYS_StoreNo.disable();
  }

  // 送出（新增/修改統一在這裡依 crudstatus 分流）
  onSubmit(form: FormGroup<Fin13060CruForm>): void {
    // 欄位中文名稱（集中錯誤訊息顯示用）
    const LABELS: Record<string, string> = {
      ECR_No: '收銀機號',
      TXN_No: '交易序號',
      TXN_GUIPaper: '發票種類',
      INV_GUITrack: '字軌',
      INV_GUINumber: '發票號碼',
      TXN_Date: '發票日期',
      INV_DeclareYM: '申報年月',
      TXN_SaleAmt: '發票總金額',
      TXN_Net: '發票未稅金額',
      TXN_Tax: '稅額',
      PLU_TaxType: '課稅別',
      Source_Doc_No: '憑證單號',
      Voucher_No: '傳票號碼',
      AssetType: '資產註記',
      INV_Remark: '備註',
      Tlt_No: '專櫃編號',
      Ven_No: '廠客代號',
      SYS_ORIGIN: '系統別',
      INV_NoneTax: '零稅銷售註記',
      INV_Cancel: '是否作廢',
      INV_GUIType: '發票格式',
    };

    // 有錯先全部用中文吐出，並阻擋送出
    if (this.showErrorsIfInvalid(form, LABELS)) return;

    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      // ★ 組裝後端需要的 payload（insert 與 update 通用；update 另外帶 ID）
      const payload = {
        mid: Number(raw.mid ?? 0),
        SYS_StoreNo: this.normalize(raw.SYS_StoreNo),
        ECR_No: this.normalize(raw.ECR_No),
        TXN_No: raw.TXN_No != null ? Number(raw.TXN_No) : 0,
        TXN_GUIPaper: this.normalize(raw.TXN_GUIPaper),
        INV_NoneTax: this.normalize(raw.INV_NoneTax),
        INV_Cancel: this.normalize(raw.INV_Cancel),
        INV_GUIType: this.normalize(raw.INV_GUIType),
        INV_GUITrack: this.normalize(raw.INV_GUITrack),
        INV_GUINumber: this.normalize(raw.INV_GUINumber),
        TXN_Date: this.toDateOnlyString(raw.TXN_Date) ?? '',
        INV_DeclareYM: this.toYYYYMM(raw.INV_DeclareYM) ?? '',
        TXN_SaleAmt: raw.TXN_SaleAmt != null ? Number(raw.TXN_SaleAmt) : 0,
        TXN_Net: raw.TXN_Net != null ? Number(raw.TXN_Net) : 0,
        TXN_Tax: raw.TXN_Tax != null ? Number(raw.TXN_Tax) : 0,
        PLU_TaxType: this.normalize(raw.PLU_TaxType),
        Source_Doc_No: this.normalize(raw.Source_Doc_No),
        Voucher_No: this.normalize(raw.Voucher_No),
        SAL_Type: this.normalize(raw.SAL_Type),
        AssetType: this.normalize(raw.AssetType),
        INV_Remark: this.normalize(raw.INV_Remark),
        Tlt_No: this.normalize(raw.Tlt_No),
        Ven_No: this.normalize(raw.Ven_No),
        SYS_ORIGIN: this.normalize(raw.SYS_ORIGIN),
      } as const;

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13060Service.insertFIN13060(payload).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();
          this.hydrateStoreInfoFromLocalStorage();
          this.updateDisabledState();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const id = form.controls.ID.getRawValue();
        const upd = id != null ? { ...payload, ID: Number(id) } : payload;
        this.fin13060Service.updateFIN13060(upd).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }

  // 集中中文錯誤訊息（提交前使用）
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

    return true; // 阻擋送出
  }
}
