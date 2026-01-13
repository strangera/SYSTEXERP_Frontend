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
import { NgIf, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import {
  FIN13050Service,
  VendorOption,
} from '../../../service/api/fin/fin13050.service';
import { ValidationService } from '@shared/service/validation.service';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';

/* ---------------------------
 *  進階 Validators（中文化原因）
 * --------------------------- */
/** 有填才驗證：英數且長度必須是 16 */
const alnumMax16IfFilled: ValidatorFn = (
  c: AbstractControl,
): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v) return null; // 空值：合法（非必填）
  if (!/^[A-Za-z0-9]+$/.test(v))
    return { alnum: { reason: '包含非英數字元' } };
  if (v.length > 16)
    return { maxlength: { requiredLength: 16, actualLength: v.length } };
  return null; // 1~16 碼 OK
};
/** 2 碼大寫英文字母（同時配合 min/maxLength(2)） */
const twoUppercaseValidator: ValidatorFn = (
  c: AbstractControl,
): ValidationErrors | null => {
  const v = (c.value ?? '').toString();
  if (!v) return { required: true };
  if (!/^[A-Z]+$/.test(v))
    return { twoUppercase: { reason: '包含非大寫英文字母' } };
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

export const yyyymmEvenMonthValidator: ValidatorFn = (
  ctrl: AbstractControl,
): ValidationErrors | null => {
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
export class FIN13050CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit
{
  @Output() fieldChange = new EventEmitter<any>();

  // 下拉來源
  ACP_TypeOptions: any[] = [];
  PUR_VoucherTypeOptions: any[] = [];
  invoicePurposeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  deductOptions: any[] = [];
  typeOptions: any[] = [];
  salTypeOptions: any[] = []; // SAL_Type = 系統別（取 SYS_ORIGIN 代碼）
  PUR_GUIStatusOptions: any[] = [
    { value: '0', label: '未立帳' },
    { value: '1', label: '已立帳' },
  ];

  // 供應商統一編號下拉（含 No/Name/Uniform）
  PUR_VenUniformOptions: VendorOption[] = [];

  // 供應商「廠商編號」下拉（value=VEN_No, label="VEN_No VEN_Name"）
  VendorNoOptions: {
    label: string;
    value: string;
    venName?: string;
    venUniform?: string;
  }[] = [];

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
    SAL_Type: '系統別',
    PUR_Remark: '備註',
  };

  /** 錯誤顯示順序 */
  private checkOrder: string[] = [
    'PUR_VoucherType',
    'PUR_GUITrack',
    'PUR_GUINo',
    'PUR_GUIDate',
    'PUR_RepYYYYMM',
    'PUR_VenUniform',
    'PUR_VenNo',
    'PUR_Amt',
    'PUR_Net',
    'PUR_Tax',
    'PUR_TaxType',
    'Source_Doc_No',
  ];

  /** 接受 Date 或 'YYYYMM'，同時檢查偶數月 */
  private repYYYYMMEvenValidator: ValidatorFn = (
    ctrl: AbstractControl,
  ): ValidationErrors | null => {
    const v = ctrl.value;
    if (v == null || v === '') return { required: true };

    let y: number, m: number;

    if (v instanceof Date && !isNaN(v.getTime())) {
      y = v.getFullYear();
      m = v.getMonth() + 1;
    } else {
      const s = String(v).trim();
      if (!/^\d{6}$/.test(s)) return { invalidDate2: true };
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
    mid: [0, [Validators.required]], // 商場編號
    STO_No: ['', [Validators.required]], // 分店編號

    ACP_Type: ['2', [Validators.required]], // 應付帳款類型：預設 '2'
    PUR_Uniform: [
      '',
      [
        Validators.required,
        digitsOnly,
        Validators.minLength(8),
        Validators.maxLength(8),
      ],
    ], // 自家統編
    PUR_GUIStatus: ['0', [Validators.required]], // 發票狀態：預設 '0'
    PUR_GUIBalance: [0, [Validators.required, Validators.min(0)]], // 已沖金額：預設 0
    PUR_SeqNo: [1, [Validators.required, Validators.min(1)]], // 項次：預設 1

    // ===== 使用者輸入 =====
    PUR_VoucherType: ['', [Validators.required]], // 發票格式

    // 字軌：2 碼大寫英文（必填）
    PUR_GUITrack: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(2),
        twoUppercaseValidator,
      ],
    ],

    // 發票號碼：8 碼純數字（必填） —— 一進畫面就會被正規化成後 8 碼
    PUR_GUINo: [
      '',
      [
        Validators.required,
        digitsOnly,
        Validators.minLength(8),
        Validators.maxLength(8),
      ],
    ],

    // 發票日期
    PUR_GUIDate: [null as any, [Validators.required]],

    // 申報年月：YYYYMM + 偶數月
    PUR_RepYYYYMM: [
      null as any,
      [Validators.required, this.repYYYYMMEvenValidator],
    ],

    // ===== 供應商 =====
    PUR_VenNo: ['', [Validators.required]], // 廠商編號
    PUR_VenName: [{ value: '', disabled: true }], // 廠商名稱（唯讀）
    PUR_VenUniform: [
      '',
      [
        Validators.required,
        digitsOnly,
        Validators.minLength(8),
        Validators.maxLength(8),
      ],
    ], // 廠商統編

    // ===== 金額 =====
    PUR_Amt: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Net: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Tax: [null as any, [Validators.required]],

    // ===== 其他下拉 =====
    PUR_DirectType: ['1'], // 發票用途
    PUR_TaxType: ['1', [Validators.required]], // 課稅別
    PUR_DiscNo: ['1'], // 扣抵代號
    PUR_Type: [''], // 類別區分

    // ===== 憑證/傳票/系統別/備註 =====
    Source_Doc_No: ['', [alnumMax16IfFilled]], // 憑證單號 (非必填)
    Voucher_No: [{ value: '', disabled: true }], // 傳票號碼
    SAL_Type: [''], // 系統別（對應後端 SAL_Type）
    PUR_Remark: [''], // 備註
  });

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
    private readonly datePipe: DatePipe,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13050', this.dataForm);

    // 帶使用者基本資料
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
      PUR_Uniform: u?.STR_Uniform ?? '',
    });

    // ❶ 如果是從外部帶 GUI_No 進來
    this.route.queryParams
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        const guiNo = (params['GUI_No'] ?? '').toString().trim();
        if (!guiNo) return;

        this.fin13050Service
          .queryDetailByGUI({ GUI_No: guiNo })
          .pipe(untilDestroyed(this))
          .subscribe((res) => {
            const row = Array.isArray(res?.Data) ? res.Data[0] : null;
            if (!row) {
              this.messageService.errorBubble(
                `查無發票資料（GUI_No=${guiNo}）`,
              );
              return;
            }

            const patch: any = { ...row };

            // 後端回傳欄位不管是 PUR_GUINo 或 GUI_No，都只保留最後 8 碼數字
            if (patch.PUR_GUINo) {
              patch.PUR_GUINo = this.normalizeGuiNo(patch.PUR_GUINo);
            } else if (patch.GUI_No) {
              patch.PUR_GUINo = this.normalizeGuiNo(patch.GUI_No);
            }

            this.dataForm.patchValue(patch, { emitEvent: false });

            // 進來就是檢視模式
            this.crudstatus = CRUDStatus.Read;
            this.updateDisabledState();
          });
      });

    // ❷ 一般從列表進編輯：下一個 tick 把發票號碼先正規化成 8 碼
    setTimeout(() => {
      const ctrl = this.dataForm.get('PUR_GUINo');
      const v = ctrl?.value;
      if (v) {
        ctrl.patchValue(this.normalizeGuiNo(v), { emitEvent: false });
      }
    }, 0);

    // 發票日期變更 → 自動帶偶數月申報年月
    this.dataForm
      .get('PUR_GUIDate')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((d) => {
        const yyyymm = this.toEvenYYYYMM(d);
        if (yyyymm)
          this.dataForm.patchValue(
            { PUR_RepYYYYMM: yyyymm },
            { emitEvent: false },
          );
      });

    const repCtrl = this.dataForm.get('PUR_RepYYYYMM');
    repCtrl?.addValidators(
      this.validationService.evenMonthValidator.bind(this.validationService),
    );
    repCtrl?.updateValueAndValidity({ emitEvent: false });

    // 發票號碼輸入時：強制轉成「純數字 + 最後 8 碼」
    this.dataForm
      .get('PUR_GUINo')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val == null || val === '') return;
        const normalized = this.normalizeGuiNo(val);
        const current = String(val);
        if (normalized !== current) {
          this.dataForm
            .get('PUR_GUINo')
            ?.patchValue(normalized, { emitEvent: false });
        }
      });

    this.loadDropdowns();
    this.loadVendorUniformOptions();
    this.loadVendorNoOptions();

    // 廠商編號變更 → 自動帶廠商名稱
    this.dataForm
      .get('PUR_VenNo')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((venNo) => {
        const picked = this.VendorNoOptions.find((o) => o.value === venNo);
        this.dataForm.patchValue(
          { PUR_VenName: picked?.venName ?? '' },
          { emitEvent: false },
        );
      });

    this.updateDisabledState();
  }

  /** 下拉載入 */
  private loadDropdowns(): void {
    this.fin13050Service.queryAPS2002DropDownList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.PUR_VoucherTypeOptions = list.map((x) => ({
        value: String(x.No),
        label: String(x.Name),
      }));
    });

    this.fin13050Service
      .querySYS1000DropDownList('ACP_TYPE')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.ACP_TypeOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });

    this.fin13050Service
      .querySYS1000DropDownList('PUR_DirectType')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.invoicePurposeOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });

    this.fin13050Service
      .querySYS1000DropDownList('PUR_TaxType')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.taxTypeOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });

    this.fin13050Service
      .querySYS1000DropDownList('PUR_DiscNo')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.deductOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });

    this.fin13050Service
      .querySYS1000DropDownList('PUR_Type')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.typeOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });

    // SAL_Type 使用 SYS_ORIGIN 代碼：系統別
    this.fin13050Service
      .querySYS1000DropDownList('SYS_ORIGIN')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.salTypeOptions = list.map((x: any) => ({
          value: String(x.No),
          label: String(x.Name),
        }));
      });
  }

  /** 供應商統編下拉 */
  private loadVendorUniformOptions(keyword = ''): void {
    this.fin13050Service
      .queryVendorUniformOptions(keyword)
      .subscribe((opts) => {
        this.PUR_VenUniformOptions = opts ?? [];
      });
  }

  /** 供應商「廠商編號」下拉 */
  private loadVendorNoOptions(keyword = ''): void {
    this.fin13050Service
      .queryVendorNoOptions(keyword)
      .subscribe((opts) => {
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

  /** 送出：不再送 CRT_* / UPD_*，全部交給後端自己寫入 */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(null, () => {
      Object.values(this.dataForm.controls).forEach((c) => c.markAsTouched());
      this.submitted = true;

      if (this.dataForm.invalid) {
        this.showTopErrors();
        this.messageService.unblockUi();
        this.loading = false;
        return;
      }

      const fv = this.dataForm.getRawValue();
      const u = this.getUserInfo();

      // 組 payload (對應 insertFIN13050Request / updateFIN13050Request)
      const payload: any = {
        id: fv.id ?? this.rowdata?.id ?? null,
        mid: Number(u?.mid) || Number(fv.mid) || 0,
        STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,

        ACP_Type: fv.ACP_Type ?? '2',
        PUR_Uniform: u?.STR_Uniform ?? fv.PUR_Uniform ?? null,
        PUR_GUIStatus: fv.PUR_GUIStatus ?? '0',
        PUR_GUIBalance:
          fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
        PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 1,

        PUR_VoucherType: fv.PUR_VoucherType,
        PUR_GUITrack: fv.PUR_GUITrack,
        // 發票號碼：只送後 8 碼純數字
        PUR_GUINo: this.normalizeGuiNo(fv.PUR_GUINo),

        PUR_GUIDate: fv.PUR_GUIDate
          ? new Date(fv.PUR_GUIDate).toISOString()
          : null,
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

        Source_Doc_No: (fv.Source_Doc_No ?? '').toString().trim() || null,
        Voucher_No: fv.Voucher_No ?? null,
        SAL_Type: fv.SAL_Type ?? null,
        PUR_Remark: fv.PUR_Remark ?? null,
      };

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        // Insert：不送 id
        const { id, ...forInsert } = payload;
        this.fin13050Service.insertFIN13050(forInsert).subscribe(
          () => {
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
          },
          () => {
            this.messageService.unblockUi();
          },
        );
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        // Update：把 payload 直接丟給後端，讓後端自己寫 UPD_*
        this.fin13050Service.updateFIN13050(payload).subscribe(
          () => {
            this.messageService.successBubble('更新成功');
            this.onCancel();
          },
          () => {
            this.messageService.unblockUi();
          },
        );
      } else {
        this.messageService.unblockUi();
      }
    });
  }

  /** 只用右上角泡泡顯示全部錯誤（逐條） */
  private showTopErrors(): void {
    const msgs: string[] = [];

    this.checkOrder.forEach((name) => {
      const msg = this.buildFieldError(name);
      if (msg) msgs.push(msg);
    });

    Object.keys(this.dataForm.controls).forEach((name) => {
      if (this.checkOrder.includes(name)) return;
      const msg = this.buildFieldError(name);
      if (msg && !msgs.includes(msg)) msgs.push(msg);
    });

    if (msgs.length) msgs.forEach((m) => this.messageService.errorBubble(m));
  }

  private buildFieldError(ctrlName: string): string | null {
    const ctrl = this.dataForm.get(ctrlName);
    if (!ctrl || !ctrl.errors) return null;

    const label = this.labelOf[ctrlName] ?? ctrlName;
    const e = ctrl.errors as Record<string, any>;

    if (e['required']) return `「${label}」必填，請輸入資料。`;

    if (e['digits']) {
      const reason = e['digits'].reason ? `（${e['digits'].reason}）` : '';
      return `「${label}」需為純數字${reason}。`;
    }
    if (e['alnum']) {
      const reason = e['alnum'].reason ? `（${e['alnum'].reason}）` : '';
      return `「${label}」需為英數字元${reason}。`;
    }

    if (e['minlength']) {
      return `「${label}」需為 ${e['minlength'].requiredLength} 碼，目前為 ${e['minlength'].actualLength} 碼。`;
    }
    if (e['maxlength']) {
      return `「${label}」最長 ${e['maxlength'].requiredLength} 碼，目前為 ${e['maxlength'].actualLength} 碼。`;
    }

    if (e['twoUppercase']) {
      const reason = e['twoUppercase'].reason
        ? `（${e['twoUppercase'].reason}）`
        : '';
      return `「${label}」需為 2 碼大寫英文字母${reason}。`;
    }

    if (e['invalidEvenMonth'])
      return `「${label}」僅接受偶數月：02/04/06/08/10/12。`;
    if (e['invalidDate2']) return `「${label}」日期格式錯誤。`;

    if (e['min']?.min != null)
      return `「${label}」數值不可小於 ${e['min'].min}。`;
    if (e['length']) {
      return `「${label}」需為 ${e['length'].required} 碼，目前為 ${e['length'].actual} 碼。`;
    }

    return `「${label}」格式有誤，請檢查輸入資料。`;
  }

  private getUserInfo(): any {
    try {
      return JSON.parse(localStorage.getItem('UserInfo') || '{}');
    } catch {
      return {};
    }
  }

  /** 發票日期 -> 偶數月 YYYYMM */
  private toEvenYYYYMM(input: any): string | null {
    const d =
      input instanceof Date ? input : input ? new Date(input) : null;
    if (!d || isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    let m = d.getMonth() + 1;
    if (m % 2 === 1) m += 1;
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

  /** 發票號碼正規化：只保留最後 8 碼純數字 */
  private normalizeGuiNo(val: any): string {
    if (val == null) return '';
    const digits = String(val).replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 8) return digits;
    return digits.slice(-8);
  }
}
