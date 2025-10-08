/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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

/** ===== Custom Validators ===== */
const twoUppercaseValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = (ctrl.value ?? '').toString();
  return /^[A-Z]{2}$/.test(v) ? null : { twoUppercase: true };
};
const eightDigitsValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = (ctrl.value ?? '').toString();
  return /^\d{8}$/.test(v) ? null : { eightDigits: true };
};
const sixteenAlphaNumValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = (ctrl.value ?? '').toString();
  return /^[A-Za-z0-9]{16}$/.test(v) ? null : { sixteenAlnum: true };
};
/** YYYYMM 且偶數月 */
const yyyymmEvenMonthValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const v = (ctrl.value ?? '').toString();
  if (!/^\d{6}$/.test(v)) return { yyyymm: true };
  const mm = Number(v.slice(4, 6));
  return mm % 2 === 0 ? null : { evenMonth: true };
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
  ACP_TypeOptions: any[] = [];                // SYS1000.ACP_TYPE
  PUR_VoucherTypeOptions: any[] = [];         // APS2002
  invoicePurposeOptions: any[] = [];          // SYS1000.PUR_DirectType
  taxTypeOptions: any[] = [];                 // SYS1000.PUR_TaxType
  deductOptions: any[] = [];                  // SYS1000.PUR_DiscNo
  typeOptions: any[] = [];                    // SYS1000.PUR_Type
  salTypeOptions: any[] = [];                 // SYS1000.T205（使用別）
  sysOriginOptions: any[] = [];               // SYS1000.SYS_ORIGIN
PUR_GUIStatusOptions: any[] = [
  { value: '0', label: '未立帳' },
  { value: '1', label: '已立帳' },
];

  // 供應商統一編號下拉（含 No/Name/Uniform）
  PUR_VenUniformOptions: VendorOption[] = [];

  dataForm = this.formBuilder.group({
    // ===== 不顯示但必送 =====
    id: [{ value: null, disabled: true }],
    mid: [0, [Validators.required]],
    STO_No: ['', [Validators.required]],

    // ===== 系統欄位（必填 & 預設） =====
    ACP_Type: ['2', [Validators.required]],      // 預設 2 專櫃帳款
    PUR_Uniform: ['', [Validators.required, eightDigitsValidator]], // 自家統編
    PUR_GUIStatus: ['0', [Validators.required]], // 預設 0
    PUR_GUIBalance: [0, [Validators.required, Validators.min(0)]],
    PUR_SeqNo: [1, [Validators.required, Validators.min(1)]],

    // ===== 使用者輸入 =====
    PUR_VoucherType: ['', [Validators.required]],
    PUR_GUITrack: ['', [Validators.required, twoUppercaseValidator]], // 2 大寫
    PUR_GUINo: ['', [Validators.required, eightDigitsValidator]],     // 8 位數字
    PUR_GUIDate: [null as any, [Validators.required]],

    // YYYYMM（偶數月），預設依 PUR_GUIDate 計
    PUR_RepYYYYMM: ['', [Validators.required, yyyymmEvenMonthValidator]],

    // 供應商
    PUR_VenNo: ['', [Validators.required]],
    PUR_VenName: [{ value: '', disabled: true }],               // 唯讀
    PUR_VenUniform: ['', [Validators.required, eightDigitsValidator]],

    // 金額（正數）
    PUR_Amt: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Net: [null as any, [Validators.required, Validators.min(0.01)]],
    PUR_Tax: [null as any, [Validators.required, Validators.min(0.01)]],

    // 其他下拉
    PUR_DirectType: ['1'], // 預設 1 專供課稅
    PUR_TaxType: ['1', [Validators.required]], // 預設 1 應稅
    PUR_DiscNo: ['1'],     // 預設 1 代表進項可扣抵之進貨及費用
    PUR_Type: [''],

    // 憑證/傳票/使用別/系統別/備註
    Source_Doc_No: ['', [Validators.required, sixteenAlphaNumValidator]], // 16 位英數
    Voucher_No: [{ value: '', disabled: true }],  // 唯讀
    SAL_Type: [''],         // SYS1000.T205（使用別）
    SYS_ORIGIN: [''],       // SYS1000.SYS_ORIGIN
    PUR_Remark: [''],
  });

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN13050', this.dataForm);

    // 帶使用者基本資訊；PUR_Uniform 以 STR_Uniform 預設（等同你列出的查詢結果）
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
      PUR_Uniform: u?.STR_Uniform ?? '',
    });

    // 依發票日期初始化 / 同步 申報年月(偶數月)
    this.dataForm.get('PUR_GUIDate')?.valueChanges.subscribe(d => {
      const yyyymm = this.toEvenYYYYMM(d);
      if (yyyymm) this.dataForm.patchValue({ PUR_RepYYYYMM: yyyymm }, { emitEvent: false });
    });

    // 載入下拉（APS2002 / SYS1000）
    this.loadDropdowns();

    // 供應商統編下拉
    this.loadVendorUniformOptions();

    // 統編選取時，自動帶入 VenNo / VenName / VenUniform
    this.dataForm.get('PUR_VenUniform')?.valueChanges.subscribe(v => {
      const picked = this.PUR_VenUniformOptions.find(o => o.value === v);
      if (picked) {
        this.dataForm.patchValue({
          PUR_VenNo: picked.venNo ?? '',
          PUR_VenName: picked.venName ?? '',
          // PUR_VenUniform 已等於 v
        }, { emitEvent: false });
      }
    });

    this.updateDisabledState();
  }

  /** 下拉載入 */
  private loadDropdowns(): void {
    // 發票格式（APS2002）
    this.fin13050Service.queryAPS2002DropDownList().subscribe(res => {
      const list = res?.Data ?? [];
      this.PUR_VoucherTypeOptions = list.map(x => ({ value: String(x.No), label: String(x.Name) }));
    });

    // SYS1000：多個 Code 類別
    this.fin13050Service.querySYS1000DropDownList('ACP_TYPE').subscribe(res => {
      const list = res?.Data ?? [];
      this.ACP_TypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('PUR_DirectType').subscribe(res => {
      const list = res?.Data ?? [];
      this.invoicePurposeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('PUR_TaxType').subscribe(res => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('PUR_DiscNo').subscribe(res => {
      const list = res?.Data ?? [];
      this.deductOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('PUR_Type').subscribe(res => {
      const list = res?.Data ?? [];
      this.typeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('T205').subscribe(res => {
      const list = res?.Data ?? [];
      this.salTypeOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });

    this.fin13050Service.querySYS1000DropDownList('SYS_ORIGIN').subscribe(res => {
      const list = res?.Data ?? [];
      this.sysOriginOptions = list.map((x: any) => ({ value: String(x.No), label: String(x.Name) }));
    });
  }

  /** 供應商統編下拉 */
  private loadVendorUniformOptions(keyword = ''): void {
    this.fin13050Service.queryVendorUniformOptions(keyword).subscribe(opts => {
      this.PUR_VenUniformOptions = opts ?? [];
    });
  }

  /** 依 CRUD 狀態切換欄位啟用/停用 */
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      // 需求沒特別限制可編欄位；保留唯讀規則
      this.dataForm.get('id')?.disable();
      this.dataForm.get('Voucher_No')?.disable();
      this.dataForm.get('PUR_VenName')?.disable();
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      // Create
      this.dataForm.enable();
      this.dataForm.get('id')?.disable();
      this.dataForm.get('Voucher_No')?.disable();
      this.dataForm.get('PUR_VenName')?.disable();
    }
  }

  /** 送出：補齊審核欄位 & 型別處理 */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (form.invalid) {
       
        return;
      }

      const fv = form.getRawValue(); // 會包含 disabled 欄位
      const u = this.getUserInfo();
      const nowIso = new Date().toISOString();

      // 依發票日期再保險一次申報年月（偶數月）
      const rep = this.toEvenYYYYMM(fv.PUR_GUIDate) ?? this.toYYYYMM(fv.PUR_RepYYYYMM);

      // 組 payload
      const payload: any = {
        // 系統欄位
        mid: Number(u?.mid) || Number(fv.mid) || 0,
        STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,
        PUR_Uniform: u?.STR_Uniform ?? fv.PUR_Uniform ?? null,

        // 必填/預設
        ACP_Type: fv.ACP_Type ?? '2',
        PUR_GUIStatus: fv.PUR_GUIStatus ?? '0',
        PUR_GUIBalance: fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
        PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 1,

        // 發票
        PUR_VoucherType: fv.PUR_VoucherType,
        PUR_GUITrack: fv.PUR_GUITrack,
        PUR_GUINo: fv.PUR_GUINo,
        PUR_GUIDate: fv.PUR_GUIDate ? new Date(fv.PUR_GUIDate).toISOString() : null,
        PUR_RepYYYYMM: rep,

        // 供應商
        PUR_VenNo: fv.PUR_VenNo,
        PUR_VenName: fv.PUR_VenName,
        PUR_VenUniform: fv.PUR_VenUniform,

        // 金額
        PUR_Amt: Number(fv.PUR_Amt),
        PUR_Net: Number(fv.PUR_Net),
        PUR_Tax: Number(fv.PUR_Tax),

        // 其他
        PUR_DirectType: fv.PUR_DirectType ?? '1',
        PUR_TaxType: fv.PUR_TaxType ?? '1',
        PUR_DiscNo: fv.PUR_DiscNo ?? '1',
        PUR_Type: fv.PUR_Type ?? null,

        // 憑證/傳票/使用別/系統別/備註
        Source_Doc_No: fv.Source_Doc_No,
        Voucher_No: fv.Voucher_No ?? null,
        SAL_Type: fv.SAL_Type ?? null,
        SYS_ORIGIN: fv.SYS_ORIGIN ?? null,
        PUR_Remark: fv.PUR_Remark ?? null,

        // 主鍵
        id: fv.id ?? this.rowdata?.id ?? null,
      };

      // 稽核欄位
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

          // 重帶系統欄位 + 預設
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
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        payload.UPD_USR_No = usrNo;
        payload.UPD_USR_Name = usrName;
        payload.UPD_Date = nowIso;

        this.fin13050Service.updateFIN13050(payload).subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
      }
    });
  }

  /** 讀取本機使用者資訊 */
  private getUserInfo(): any {
    try { return JSON.parse(localStorage.getItem('UserInfo') || '{}'); }
    catch { return {}; }
  }

  /** 轉偶數月 YYYYMM（例：2025/07 -> 202508；2025/08 -> 202508） */
  private toEvenYYYYMM(input: any): string | null {
    const d = input instanceof Date ? input : (input ? new Date(input) : null);
    if (!d || isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    let m = d.getMonth() + 1;
    if (m % 2 === 1) m += 1; // odd -> next even
    if (m === 13) { return `${y + 1}02`; }
    return `${y}${String(m).padStart(2, '0')}`;
  }

  /** 把 Date/ISO/'YYYYMM' 統一成 'YYYYMM'（允許已是 YYYYMM 直接回傳） */
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
