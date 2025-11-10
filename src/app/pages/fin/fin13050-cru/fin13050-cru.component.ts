/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { FIN13050Service, VendorOption } from '../../../service/api/fin/fin13050.service';
import { ValidationService } from '@shared/service/validation.service';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';

/* ---------------------------
 *  進階 Validators（中文化原因）
 * --------------------------- */

/** 2 碼大寫英文字母（同時配合 min/maxLength(2)） */
const twoUppercaseValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString();
  if (!v) return { required: true };
  if (!/^[A-Z]+$/.test(v)) return { twoUppercase: { reason: '包含非大寫英文字母' } };
  return null;
};

/** 純數字驗證（長度改交由 minlength/maxlength 控制） */
const digitsOnly: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString();
  if (!v) return { required: true };
  if (!/^\d+$/.test(v)) return { digits: { reason: '包含非數字字元' } };
  return null;
};

/** 英數驗證（長度改交由 minlength/maxlength 控制） */
const alnumOnly: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString();
  if (!v) return { required: true };
  if (!/^[A-Za-z0-9]+$/.test(v)) return { alnum: { reason: '包含非英數字元' } };
  return null;
};
export const yyyymmEvenMonthValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = (ctrl.value ?? '').toString().trim();
  if (!/^\d{6}$/.test(v)) return { yyyymm: { example: 'YYYYMM' } };

  const m = Number(v.slice(4, 6));
  if (m < 1 || m > 12) return { yyyymm: { example: 'YYYYMM' } };
  if (m % 2 !== 0) return { invalidEvenMonth: true };
  return null;
};

@Component({
  selector: 'app-fin13050-cru',
  standalone: true,
  templateUrl: './fin13050-cru.component.html',
  styleUrls: ['./fin13050-cru.component.scss'],
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
export class FIN13050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉來源
  ACP_TypeOptions: any[] = [];
  PUR_VoucherTypeOptions: any[] = [];
  invoicePurposeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  deductOptions: any[] = [];
  typeOptions: any[] = [];
  salTypeOptions: any[] = [];
  sysOriginOptions: any[] = [];
  PUR_GUIStatusOptions: any[] = [
    { value: '0', label: '未立帳' },
    { value: '1', label: '已立帳' },
  ];

  // 供應商統一編號下拉（含 No/Name/Uniform）
  PUR_VenUniformOptions: VendorOption[] = [];

  // 供應商「廠商編號」下拉（value=VEN_No, label="VEN_No VEN_Name"）
  VendorNoOptions: { label: string; value: string; venName?: string; venUniform?: string }[] = [];

  /** 欄位中文名稱（出現在泡泡） */
  private labelOf: Record<string, string> = {
    ACP_Type: '應付帳款類型',
    PUR_Uniform: '自家統編',
    PUR_VenUniform: '統一編號',
    PUR_GUIStatus: '發票狀態',
    PUR_GUIBalance: '已沖金額',
    PUR_SeqNo: '序號',
    PUR_VoucherType: '發票格式',
    PUR_GUITrack: '字軌',
    PUR_GUINo: '發票號碼',
    PUR_GUIDate: '發票日期',
    PUR_RepYYYYMM: '申報年月',
    PUR_VenNo: '廠商編號',
    PUR_VenName: '廠商名稱',
    PUR_Amt: '發票總金額',
    PUR_Net: '發票未稅金額',
    PUR_Tax: '發票稅額',
    PUR_DirectType: '發票用途',
    PUR_TaxType: '課稅別',
    PUR_DiscNo: '扣抵代號',
    PUR_Type: '類別區分',
    Source_Doc_No: '憑證單號',
    Voucher_No: '傳票號碼',
    SAL_Type: '使用別',
    SYS_ORIGIN: '系統別',
    PUR_Remark: '備註',
  };

  /** 中文錯誤訊息 */
  private zhErrorMap: Record<string, string> = {
    required: '必填，請輸入資料。',
    digits: '需為純數字（不可含空白或符號）。',
    twoUppercase: '需為 2 碼大寫英文字母（A–Z）。',
    alnum: '需為英數字元（不可含空白或符號）。',
    minlength: '長度不足。',
    maxlength: '長度過長。',
    invalidEvenMonth: '僅接受偶數月：02/04/06/08/10/12。',
    invalidDate2: '日期格式錯誤。',
    min: '數值不可小於限制。',
  };

  /** 錯誤顯示順序 */
  private checkOrder: string[] = [
    'PUR_VoucherType', 'PUR_GUITrack', 'PUR_GUINo', 'PUR_GUIDate', 'PUR_RepYYYYMM',
    'PUR_VenUniform', 'PUR_VenNo',
    'PUR_Amt', 'PUR_Net', 'PUR_Tax',
    'PUR_TaxType', 'Source_Doc_No',
  ];
  /** 接受 Date 或 'YYYYMM'，同時檢查偶數月 */
private repYYYYMMEvenValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = ctrl.value;
  if (v == null || v === '') return { required: true };

  let y: number, m: number;

  // 允許 Date
  if (v instanceof Date && !isNaN(v.getTime())) {
    y = v.getFullYear();
    m = v.getMonth() + 1;
  } else {
    // 允許 'YYYYMM' 字串
    const s = String(v).trim();
    if (!/^\d{6}$/.test(s)) return { invalidDate2: true }; // 統一用 invalidDate2 給你的泡泡訊息
    y = Number(s.slice(0, 4));
    m = Number(s.slice(4, 6));
  }

  if (m < 1 || m > 12) return { invalidDate2: true };
  if (m % 2 !== 0) return { invalidEvenMonth: true };
  return null;
};


  /* ---------------------------
   *  表單
   * --------------------------- */
  dataForm = this.formBuilder.group({
    // 不顯示但必送
    id: [{ value: null, disabled: true }],

    // ===== 系統欄位（必填 & 預設） =====
    mid: [0, [Validators.required]],                                  // 商場編號（必填）
    STO_No: ['', [Validators.required]],                               // 分店編號（必填）

    ACP_Type: ['2', [Validators.required]],                            // 應付帳款類型：預設 '2'
    // PUR_Uniform 預設會在 ngOnInit 以「SELECT STO_Uniform FROM TDS1003 WHERE STO_Status='1'」
    // 帶入後再 patch；此處先設必填 + 8 碼數字限制
    PUR_Uniform: ['', [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)]],
    PUR_GUIStatus: ['0', [Validators.required]],                       // 發票狀態：預設 '0'
    PUR_GUIBalance: [0, [Validators.required, Validators.min(0)]],     // 已沖金額：預設 0（數字）
    PUR_SeqNo: [1, [Validators.required, Validators.min(1)]],          // 項次：預設 1（數字）

    // ===== 使用者輸入 =====
    PUR_VoucherType: ['', [Validators.required]],                      // 發票格式：下拉（必填）

    // 字軌：2 碼大寫英文（必填）
    PUR_GUITrack: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(2), twoUppercaseValidator],
    ],

    // 發票號碼：8 碼純數字（必填）
    PUR_GUINo: [
      '',
      [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)],
    ],

    // 發票日期（必填）
    PUR_GUIDate: [null as any, [Validators.required]],

    // 申報年月：YYYYMM + 偶數月（必填）
    // - HTML 請加 maxlength="6"
    // - 預設值會依發票日期自動帶偶數月（在 ngOnInit 的 valueChanges 裡處理）
PUR_RepYYYYMM: [null as any, [Validators.required, this.repYYYYMMEvenValidator]],

    // ===== 供應商 =====
    PUR_VenNo: ['', [Validators.required]],                            // 廠商編號（改下拉）
    PUR_VenName: [{ value: '', disabled: true }],                      // 廠商名稱（唯讀，自動帶入）
    PUR_VenUniform: [
      '',
      [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)], // 統編 8 碼
    ],

    // ===== 金額（正數） =====
    PUR_Amt: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Net: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Tax: [null as any, [Validators.required, Validators.min(0.01)]],

    // ===== 其他下拉 =====
    PUR_DirectType: ['1'],                                             // 發票用途（預設 1 專供課稅）
    PUR_TaxType: ['1', [Validators.required]],                         // 課稅別（必填，預設 1 應稅）
    PUR_DiscNo: ['1'],                                                 // 扣抵代號（預設 1）
    PUR_Type: [''],                                                    // 類別區分（選填）

    // ===== 憑證/傳票/使用別/系統別/備註 =====
    // 憑證單號：16 碼英數（必填）
    Source_Doc_No: [
      '',
      [ alnumOnly, Validators.minLength(16), Validators.maxLength(16)],
    ],
    Voucher_No: [{ value: '', disabled: true }],                       // 傳票號碼（唯讀）
    SAL_Type: [''],                                                    // 使用別（SYS1000.T205）
    SYS_ORIGIN: [''],                                                  // 系統別（SYS1000.SYS_ORIGIN）
    PUR_Remark: [''],                                                  // 備註
  });

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN13050', this.dataForm);

    // 帶使用者基本資料
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
      PUR_Uniform: u?.STR_Uniform ?? '',
    });

    // 發票日期 -> 自動帶申報年月（偶數月）
    this.dataForm.get('PUR_GUIDate')?.valueChanges.subscribe((d) => {
      const yyyymm = this.toEvenYYYYMM(d);
      if (yyyymm) this.dataForm.patchValue({ PUR_RepYYYYMM: yyyymm }, { emitEvent: false });
    });

    // 申報年月：使用 ValidationService.evenMonthValidator（值為 Date）
    const repCtrl = this.dataForm.get('PUR_RepYYYYMM');
    repCtrl?.addValidators(this.validationService.evenMonthValidator.bind(this.validationService));
    repCtrl?.updateValueAndValidity({ emitEvent: false });

    // 下拉
    this.loadDropdowns();
    this.loadVendorUniformOptions();
    this.loadVendorNoOptions(); // ❶ 讀取「廠商編號」下拉

    // 統編選取 -> 帶廠商編號/名稱
    this.dataForm.get('PUR_VenUniform')?.valueChanges.subscribe((v) => {
      const picked = this.PUR_VenUniformOptions.find((o) => o.value === v);
      if (picked) {
        this.dataForm.patchValue(
          { PUR_VenNo: picked.venNo ?? '', PUR_VenName: picked.venName ?? '' },
          { emitEvent: false },
        );
      } else {
        // 清空（使用者清除）
        this.dataForm.patchValue({ PUR_VenNo: '', PUR_VenName: '' }, { emitEvent: false });
      }
    });

    // ❷ 廠商編號選取 -> 自動帶入【廠商名稱】（必要時也可一併帶統編）
    this.dataForm.get('PUR_VenNo')?.valueChanges.subscribe((venNo) => {
      const picked = this.VendorNoOptions.find(o => o.value === venNo);
      if (picked) {
        this.dataForm.patchValue(
          {
            PUR_VenName: picked.venName ?? '',
            // 如果也要一併帶統編，取消下一行註解
            // PUR_VenUniform: picked.venUniform ?? this.dataForm.get('PUR_VenUniform')?.value
          },
          { emitEvent: false }
        );
      } else {
        // 清空名稱
        this.dataForm.patchValue({ PUR_VenName: '' }, { emitEvent: false });
      }
    });

    this.updateDisabledState();
  }

  /** 下拉載入 */
  private loadDropdowns(): void {
    this.fin13050Service.queryAPS2002DropDownList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.PUR_VoucherTypeOptions = list.map((x) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('ACP_TYPE').subscribe((res) => {
      const list = res?.Data ?? [];
      this.ACP_TypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('PUR_DirectType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.invoicePurposeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('PUR_TaxType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('PUR_DiscNo').subscribe((res) => {
      const list = res?.Data ?? [];
      this.deductOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('PUR_Type').subscribe((res) => {
      const list = res?.Data ?? [];
      this.typeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('T205').subscribe((res) => {
      const list = res?.Data ?? [];
      this.salTypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
    this.fin13050Service.querySYS1000DropDownList('SYS_ORIGIN').subscribe((res) => {
      const list = res?.Data ?? [];
      this.sysOriginOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
  }

  /** 供應商統編下拉 */
  private loadVendorUniformOptions(keyword = ''): void {
    this.fin13050Service.queryVendorUniformOptions(keyword).subscribe((opts) => {
      this.PUR_VenUniformOptions = opts ?? [];
    });
  }

  /** 供應商「廠商編號」下拉 */
  private loadVendorNoOptions(keyword = ''): void {
    this.fin13050Service.queryVendorNoOptions(keyword).subscribe(opts => {
      this.VendorNoOptions = opts ?? [];
    });
  }

  /** CRUD 狀態 -> 啟用/停用 */
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('id')?.disable();
      this.dataForm.get('Voucher_No')?.disable();
      this.dataForm.get('PUR_VenName')?.disable();
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
      this.dataForm.get('id')?.disable();
      this.dataForm.get('Voucher_No')?.disable();
      this.dataForm.get('PUR_VenName')?.disable();
    }
  }

  /** 送出（改用 handleSubmit(null, ...) 自行驗證 & 中文泡泡） */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(null, () => {
      // 觸發驗證
      Object.values(this.dataForm.controls).forEach((c) => c.markAsTouched());
      this.submitted = true;

      // 直接檢查表單有效性
      if (this.dataForm.invalid) {
        this.showTopErrors();
        this.messageService.unblockUi(); // handSubmit(null, cb) 不會自動解
        this.loading = false;
        return;
      }

      const fv = this.dataForm.getRawValue();
      const u = this.getUserInfo();
      const nowIso = new Date().toISOString();

      // 組 payload
      const payload: any = {
        mid: Number(u?.mid) || Number(fv.mid) || 0,
        STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,
        PUR_Uniform: u?.STR_Uniform ?? fv.PUR_Uniform ?? null,

        ACP_Type: fv.ACP_Type ?? '2',
        PUR_GUIStatus: fv.PUR_GUIStatus ?? '0',
        PUR_GUIBalance: fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
        PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 1,

        PUR_VoucherType: fv.PUR_VoucherType,
        PUR_GUITrack: fv.PUR_GUITrack,
        PUR_GUINo: fv.PUR_GUINo,
        PUR_GUIDate: fv.PUR_GUIDate ? new Date(fv.PUR_GUIDate).toISOString() : null,
        // 申報年月：使用 Date -> YYYYMM
        PUR_RepYYYYMM: this.toYYYYMM(fv.PUR_RepYYYYMM),

        PUR_VenNo: fv.PUR_VenNo,
        PUR_VenName: fv.PUR_VenName,
        PUR_VenUniform: fv.PUR_VenUniform,

        PUR_Amt: Number(fv.PUR_Amt),
        PUR_Net: Number(fv.PUR_Net),
        PUR_Tax: Number(fv.PUR_Tax),

        PUR_DirectType: fv.PUR_DirectType ?? '1',
        PUR_TaxType: fv.PUR_TaxType ?? '1',
        PUR_DiscNo: fv.PUR_DiscNo ?? '1',
        PUR_Type: fv.PUR_Type ?? null,

        Source_Doc_No: fv.Source_Doc_No,
        Voucher_No: fv.Voucher_No ?? null,
        SAL_Type: fv.SAL_Type ?? null,
        SYS_ORIGIN: fv.SYS_ORIGIN ?? null,
        PUR_Remark: fv.PUR_Remark ?? null,

        id: fv.id ?? this.rowdata?.id ?? null,
      };

      const usrNo = u?.USR_No ?? u?.UserNo ?? u?.Account ?? '';
      const usrName = u?.USR_Name ?? u?.UserName ?? u?.AccountName ?? '';

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        payload.CRT_USR_No = usrNo;
        payload.CRT_USR_Name = usrName;
        payload.CRT_Date = nowIso;

        const { id, ...forInsert } = payload;
        this.fin13050Service.insertFIN13050(forInsert).subscribe(() => {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset();

          const uu = this.getUserInfo();
          this.dataForm.patchValue({
            mid: Number(uu?.mid) || 0,
            STO_No: uu?.SYS_StoreNo ?? '',
            PUR_Uniform: uu?.STR_Uniform ?? '',
            ACP_Type: '2',
            PUR_GUIStatus: '0',
            PUR_GUIBalance: 0,
            PUR_SeqNo: 1,
          });
          this.updateDisabledState();
        }, () => {
          this.messageService.unblockUi();
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        payload.UPD_USR_No = usrNo;
        payload.UPD_USR_Name = usrName;
        payload.UPD_Date = nowIso;

        this.fin13050Service.updateFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        }, () => {
          this.messageService.unblockUi();
        });
      } else {
        this.messageService.unblockUi();
      }
    });
  }

  /** 只用右上角泡泡顯示全部錯誤（逐條） */
  private showTopErrors(): void {
    const msgs: string[] = [];
    // 依排序清單檢查
    this.checkOrder.forEach((name) => {
      const msg = this.buildFieldError(name);
      if (msg) msgs.push(msg);
    });
    // 其餘欄位
    Object.keys(this.dataForm.controls).forEach((name) => {
      if (this.checkOrder.includes(name)) return;
      const msg = this.buildFieldError(name);
      if (msg && !msgs.includes(msg)) msgs.push(msg);
    });
    if (msgs.length) msgs.forEach((m) => this.messageService.errorBubble(m));
  }

  /** 單欄位錯誤轉中文原因（索引簽章安全寫法） */
  private buildFieldError(ctrlName: string): string | null {
    const ctrl = this.dataForm.get(ctrlName);
    if (!ctrl || !ctrl.errors) return null;

    const label = this.labelOf[ctrlName] ?? ctrlName;
    const e = ctrl.errors as Record<string, any>;

    if (e['required']) return `「${label}」必填，請輸入資料。`;

    // 純數字/英數
    if (e['digits']) {
      const reason = e['digits'].reason ? `（${e['digits'].reason}）` : '';
      return `「${label}」需為純數字${reason}。`;
    }
    if (e['alnum']) {
      const reason = e['alnum'].reason ? `（${e['alnum'].reason}）` : '';
      return `「${label}」需為英數字元${reason}。`;
    }

    // 長度
    if (e['minlength']) {
      return `「${label}」需為 ${e['minlength'].requiredLength} 碼，目前為 ${e['minlength'].actualLength} 碼。`;
    }
    if (e['maxlength']) {
      return `「${label}」最長 ${e['maxlength'].requiredLength} 碼，目前為 ${e['maxlength'].actualLength} 碼。`;
    }

    // 字軌（2 碼大寫）
    if (e['twoUppercase']) {
      const reason = e['twoUppercase'].reason ? `（${e['twoUppercase'].reason}）` : '';
      return `「${label}」需為 2 碼大寫英文字母${reason}。`;
    }

    // 申報年月（ValidationService.evenMonthValidator）
    if (e['invalidEvenMonth']) return `「${label}」僅接受偶數月：02/04/06/08/10/12。`;
    if (e['invalidDate2']) return `「${label}」日期格式錯誤。`;

    // 一般 min 檢查
    if (e['min']?.min != null) return `「${label}」數值不可小於 ${e['min'].min}。`;

    return `「${label}」格式有誤，請檢查輸入資料。`;
  }

  /** 讀取本機使用者資訊 */
  private getUserInfo(): any {
    try { return JSON.parse(localStorage.getItem('UserInfo') || '{}'); }
    catch { return {}; }
  }

  /** 發票日期 -> 偶數月 YYYYMM */
  private toEvenYYYYMM(input: any): string | null {
    const d = input instanceof Date ? input : (input ? new Date(input) : null);
    if (!d || isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    let m = d.getMonth() + 1;
    if (m % 2 === 1) m += 1; // odd -> next even
    if (m === 13) return `${y + 1}02`;
    return `${y}${String(m).padStart(2, '0')}`;
  }

  /** Date/ISO/'YYYYMM' -> 'YYYYMM' */
  private toYYYYMM(input: any): string | null {
    if (!input && input !== 0) return null;
    if (input instanceof Date && !isNaN(input.getTime())) {
      const yyyy = input.getFullYear();
      const mm = String(input.getMonth() + 1).padStart(2, '0');
      return `${yyyy}${mm}`;
    }
    const s = String(input).replace(/\D/g, '');
    return s.length >= 6 ? s.slice(0, 6) : null;
  }
}
