import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';

import {
  FIN13050Service,
  VendorOption,
} from '../../../service/api/fin/fin13050.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

/* ---------------------------
 *  Validators
 * --------------------------- */
/** 有填才驗證：英數且長度必須是 16 */
const alnumMax16IfFilled: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v) return null;
  if (!/^[A-Za-z0-9]+$/.test(v)) return { alnum: { reason: '包含非英數字元' } };
  if (v.length > 16) return { maxlength: { requiredLength: 16, actualLength: v.length } };
  return null;
};

/** 發票號碼驗證：2碼大寫英文 + 8碼數字 */
const invoiceNoValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v) return { required: true };
  if (!/^[A-Z]{2}\d{8}$/.test(v))
    return { invoiceNo: { reason: '格式需為2碼大寫英文+8碼數字（如AB12345678）' } };
  return null;
};

/** 純數字驗證 */
const digitsOnly: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString();
  if (!v) return { required: true };
  if (!/^\d+$/.test(v)) return { digits: { reason: '包含非數字字元' } };
  return null;
};

interface DropdownOption {
  label: string;
  value: string;
  venName?: string;
  venUniform?: string;
}

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
    InputNumberComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
    CalendarComponent,
    YearMonthComponent,
  ],
})
export class FIN13050CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // 下拉來源
  ACP_TypeOptions: DropdownOption[] = [];
  PUR_VoucherTypeOptions: DropdownOption[] = [];
  invoicePurposeOptions: DropdownOption[] = [];
  taxTypeOptions: DropdownOption[] = [];
  deductOptions: DropdownOption[] = [];
  typeOptions: DropdownOption[] = [];
  salTypeOptions: DropdownOption[] = [];
  PUR_GUIStatusOptions: DropdownOption[] = [
    { value: '0', label: '未立帳' },
    { value: '1', label: '已立帳' },
  ];

  // 供應商下拉
  PUR_VenUniformOptions: VendorOption[] = [];
  VendorNoOptions: DropdownOption[] = [];

  /** 欄位中文名稱 */
  private readonly labelOf: Record<string, string> = {
    ACP_Type: '應付帳款類型',
    PUR_Uniform: '自家統編',
    PUR_VenUniform: '統一編號',
    PUR_GUIStatus: '發票狀態',
    PUR_GUIBalance: '已沖金額',
    PUR_SeqNo: '序號',
    PUR_VoucherType: '發票格式',
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
  private readonly checkOrder: string[] = [
    'PUR_VoucherType',
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

  /** 申報年月驗證：接受 Date 或 'YYYYMM'，同時檢查偶數月 */
  private repYYYYMMEvenValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
    const v = ctrl.value;
    if (v == null || v === '') return { required: true };

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

  /* ---------------------------
   *  表單
   * --------------------------- */
  dataForm = this.formBuilder.group({
    id: [{ value: null, disabled: true }],

    // 系統欄位
    mid: [0, [Validators.required]],
    STO_No: ['', [Validators.required]],
    ACP_Type: ['6', [Validators.required]],
    PUR_Uniform: ['', [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)]],
    PUR_GUIStatus: ['0', [Validators.required]],
    PUR_GUIBalance: [0, [Validators.required, Validators.min(0)]],
    PUR_SeqNo: [1, [Validators.required, Validators.min(1)]],

    // 使用者輸入
    PUR_VoucherType: ['', [Validators.required]],
    PUR_GUINo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), invoiceNoValidator]],
    PUR_GUIDate: [null as Date | null, [Validators.required]],
    PUR_RepYYYYMM: [null as Date | null, [Validators.required, this.repYYYYMMEvenValidator]],

    // 供應商
    PUR_VenNo: ['', [Validators.required]],
    PUR_VenName: [{ value: '', disabled: true }],
    PUR_VenUniform: ['', [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)]],

    // 金額
    PUR_Amt: [null as number | null, [Validators.required, Validators.min(0.01)]],
    PUR_Net: [null as number | null, [Validators.required, Validators.min(0.01)]],
    PUR_Tax: [null as number | null, [Validators.required]],

    // 其他下拉
    PUR_DirectType: ['1'],
    PUR_TaxType: ['1', [Validators.required]],
    PUR_DiscNo: ['1'],
    PUR_Type: [''],

    // 憑證/傳票/系統別/備註
    Source_Doc_No: ['', [alnumMax16IfFilled]],
    Voucher_No: [{ value: '', disabled: true }],
    SAL_Type: ['G'],
    PUR_Remark: [''],
  });

  constructor(
    private readonly fin13050Service: FIN13050Service,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13050', this.dataForm);
    this.initUserInfo();
    this.handleRowData();
    this.handleQueryParams();
    this.loadAllDropdowns();
    this.setupVendorSync();
    this.setupAmountRelations(); // 金額自動計算
    this.updateDisabledState();
  }

  /** 初始化使用者資料 */
  private initUserInfo(): void {
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
    });

    // 從 queryFIN11010 取得 STO_Uniform（統一編號），STO_Status 後端收 list
    this.fin13050Service.queryFIN11010({ STO_StatusList: ['1'] }).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        const data = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
        const stoUniform = data?.STO_Uniform ?? '';
        if (stoUniform) {
          this.dataForm.patchValue({ PUR_Uniform: stoUniform }, { emitEvent: false });
        }
      },
    });
  }

  /** 處理從查詢頁帶入的 rowdata */
  private handleRowData(): void {
    const rd: any = this.rowdata;
    if (!rd) return;

    const patch: any = {
      ...rd,
      PUR_GUINo: this.mergeInvoiceNo(rd.PUR_GUITrack, rd.PUR_GUINo),
    };

    if (rd.PUR_VenUniform) {
      patch.PUR_VenUniform = rd.PUR_VenUniform;
      patch.PUR_VenNo = rd.PUR_VenUniform;
    }

    this.dataForm.patchValue(patch, { emitEvent: false });
  }

  /** 處理 queryParams 帶入的 GUI_No */
  private handleQueryParams(): void {
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      const guiNo = (params['GUI_No'] ?? '').toString().trim();
      if (!guiNo) return;

      this.fin13050Service.queryDetailByGUI({ GUI_No: guiNo }).pipe(untilDestroyed(this)).subscribe({
        next: (res) => {
          const row = Array.isArray(res?.Data) ? res.Data[0] : null;
          if (!row) {
            this.messageService.errorBubble(`查無發票資料（GUI_No=${guiNo}）`);
            return;
          }

          const patch: any = {
            ...row,
            PUR_GUINo: this.mergeInvoiceNo(row.PUR_GUITrack, row.PUR_GUINo ?? row.GUI_No),
          };

          this.dataForm.patchValue(patch, { emitEvent: false });
          this.crudstatus = CRUDStatus.Read;
          this.updateDisabledState();
        },
        error: () => {
          this.messageService.errorBubble('查詢發票資料失敗');
        },
      });
    });
  }

  /** 使用 forkJoin 並行載入所有下拉選項 */
  private loadAllDropdowns(): void {
    forkJoin({
      voucherType: this.fin13050Service.queryAPS2002DropDownList(),
      acpType: this.fin13050Service.querySYS1000DropDownList('ACP_TYPE'),
      directType: this.fin13050Service.querySYS1000DropDownList('PUR_DirectType'),
      taxType: this.fin13050Service.querySYS1000DropDownList('PUR_TaxType'),
      discNo: this.fin13050Service.querySYS1000DropDownList('PUR_DiscNo'),
      purType: this.fin13050Service.querySYS1000DropDownList('PUR_Type'),
      sysOrigin: this.fin13050Service.querySYS1000DropDownList('SYS_ORIGIN'),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (results) => {
          const mapToOptions = (list: any[]) =>
            (list ?? []).map((x: any) => ({
              value: String(x.No),
              label: `${x.No}-${x.Name}`,
            }));

          this.PUR_VoucherTypeOptions = mapToOptions(results.voucherType?.Data);
          this.ACP_TypeOptions = mapToOptions(results.acpType?.Data);
          this.invoicePurposeOptions = mapToOptions(results.directType?.Data);
          this.taxTypeOptions = mapToOptions(results.taxType?.Data);
          this.deductOptions = mapToOptions(results.discNo?.Data);
          this.typeOptions = mapToOptions(results.purType?.Data);
          this.salTypeOptions = mapToOptions(results.sysOrigin?.Data);
        },
      });

    // 供應商下拉（獨立載入）
    this.loadVendorOptions();
  }

  /** 載入供應商選項 */
  private loadVendorOptions(): void {
    forkJoin({
      uniform: this.fin13050Service.queryVendorUniformOptions(''),
      vendor: this.fin13050Service.queryVendorNoOptions(''),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ uniform, vendor }) => {
          this.PUR_VenUniformOptions = uniform ?? [];
          // 廠商編號下拉：顯示 VEN_No - VEN_Name，值用 VEN_No
          this.VendorNoOptions = (vendor ?? []).map((x: any) => {
            const venNo = String(x.value ?? x.VEN_No ?? '').trim();
            const venName = String(x.venName ?? x.VEN_Name ?? '').trim();
            const venUniform = String(x.venUniform ?? x.VEN_Uniform ?? '').trim();
            return {
              value: venNo,
              label: venNo ? `${venNo} - ${venName}` : venName,
              venName,
              venUniform,
            };
          });
          this.syncVendorFromDropdown();
        },
      });
  }

  /** 設定廠商編號變更時的同步 */
  private setupVendorSync(): void {
    this.dataForm.get('PUR_VenNo')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.syncVendorFromDropdown();
    });
  }

  /** 同步廠商名稱與統一編號（依 VEN_No 查找） */
  private syncVendorFromDropdown(): void {
    const venNoCtrl = this.dataForm.get('PUR_VenNo');
    if (!venNoCtrl) return;

    const venNo = venNoCtrl.value;
    const picked = this.VendorNoOptions.find((o) => o.value === venNo);

    this.dataForm.patchValue(
      {
        PUR_VenName: picked?.venName ?? '',
        PUR_VenUniform: picked?.venUniform ?? this.dataForm.get('PUR_VenUniform')?.value ?? '',
      },
      { emitEvent: false },
    );
  }

  /** CRUD 狀態 -> 啟用/停用 */
  private updateDisabledState(): void {
    // PUR_Tax 永遠不可手動編輯（自動計算）
    const alwaysDisabled = ['id', 'Voucher_No', 'PUR_VenName', 'PUR_Tax'];

    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
      alwaysDisabled.forEach((name) => this.dataForm.get(name)?.disable());
    }
  }

  /** 送出表單 */
  onSubmit(): void {
    this.handleSubmit(null, () => {
      Object.values(this.dataForm.controls).forEach((c) => c.markAsTouched());
      this.submitted = true;

      if (this.dataForm.invalid) {
        this.showTopErrors();
        this.messageService.unblockUi();
        this.loading = false;
        return;
      }

      const payload = this.buildPayload();

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.doInsert(payload);
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        this.doUpdate(payload);
      } else {
        this.messageService.unblockUi();
      }
    });
  }

  /** 組裝 payload */
  private buildPayload(): any {
    const fv = this.dataForm.getRawValue();
    const u = this.getUserInfo();

    return {
      id: fv.id ?? this.rowdata?.id ?? null,
      mid: Number(u?.mid) || Number(fv.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,
      ACP_Type: fv.ACP_Type ?? '6',
      PUR_Uniform: u?.STR_Uniform ?? fv.PUR_Uniform ?? null,
      PUR_GUIStatus: fv.PUR_GUIStatus ?? '0',
      PUR_GUIBalance: fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
      PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 1,
      PUR_VoucherType: fv.PUR_VoucherType,
      PUR_GUINo: fv.PUR_GUINo?.toUpperCase() ?? '',
      PUR_GUIDate: fv.PUR_GUIDate ? new Date(fv.PUR_GUIDate).toISOString() : null,
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
  }

  /** 執行新增 */
  private doInsert(payload: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...forInsert } = payload;
    this.fin13050Service.insertFIN13050(forInsert).subscribe({
      next: () => {
        this.messageService.successBubble('新增成功');
        this.resetFormAfterInsert();
      },
      error: () => {
        this.messageService.unblockUi();
      },
    });
  }

  /** 執行更新 */
  private doUpdate(payload: any): void {
    this.fin13050Service.updateFIN13050(payload).subscribe({
      next: () => {
        this.messageService.successBubble('更新成功');
        this.onCancel();
      },
      error: () => {
        this.messageService.unblockUi();
      },
    });
  }

  /** 新增成功後重設表單 */
  private resetFormAfterInsert(): void {
    this.dataForm.reset();
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
      PUR_Uniform: u?.STR_Uniform ?? '',
      ACP_Type: '6',
      PUR_GUIStatus: '0',
      PUR_GUIBalance: 0,
      PUR_SeqNo: 1,
    });
    this.updateDisabledState();
  }

  /** 顯示錯誤訊息 */
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

    msgs.forEach((m) => this.messageService.errorBubble(m));
  }

  private buildFieldError(ctrlName: string): string | null {
    const ctrl = this.dataForm.get(ctrlName);
    if (!ctrl?.errors) return null;

    const label = this.labelOf[ctrlName] ?? ctrlName;
    const e = ctrl.errors as Record<string, any>;

    if (e['required']) return `「${label}」必填，請輸入資料。`;
    if (e['digits']) return `「${label}」需為純數字（${e['digits'].reason ?? ''}）。`;
    if (e['alnum']) return `「${label}」需為英數字元（${e['alnum'].reason ?? ''}）。`;
    if (e['minlength']) return `「${label}」需為 ${e['minlength'].requiredLength} 碼，目前為 ${e['minlength'].actualLength} 碼。`;
    if (e['maxlength']) return `「${label}」最長 ${e['maxlength'].requiredLength} 碼，目前為 ${e['maxlength'].actualLength} 碼。`;
    if (e['invoiceNo']) return `「${label}」格式錯誤（${e['invoiceNo'].reason ?? ''}）`;
    if (e['invalidEvenMonth']) return `「${label}」僅接受偶數月：02/04/06/08/10/12。`;
    if (e['invalidDate2']) return `「${label}」日期格式錯誤。`;
    if (e['min']?.min != null) return `「${label}」數值不可小於 ${e['min'].min}。`;
    if (e['length']) return `「${label}」需為 ${e['length'].required} 碼，目前為 ${e['length'].actual} 碼。`;

    return `「${label}」格式有誤，請檢查輸入資料。`;
  }

  private getUserInfo(): any {
    try {
      return JSON.parse(localStorage.getItem('UserInfo') || '{}');
    } catch {
      return {};
    }
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

  /** 合併字軌與號碼為完整發票號碼（10碼），用於編輯時從後端資料組合 */
  private mergeInvoiceNo(track: any, no: any): string {
    const t = (track ?? '').toString().trim().toUpperCase();
    const n = (no ?? '').toString().replace(/\D/g, '');
    const trackPart = t.slice(0, 2);
    const noPart = n.length > 8 ? n.slice(-8) : n.padStart(8, '0');
    return trackPart + noPart;
  }

  /**
   * 金額互算邏輯（比照 fin13010）
   * - 輸入「發票未稅金額」(PUR_Net) → 自動計算「發票稅額」(PUR_Tax) + 「發票總金額」(PUR_Amt)
   * - 輸入「發票總金額」(PUR_Amt) → 反推「發票未稅金額」(PUR_Net) + 「發票稅額」(PUR_Tax)
   */
  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');   // 發票未稅金額
    const taxControl = this.dataForm.get('PUR_Tax');   // 發票稅額（自動計算，不可修改）
    const amtControl = this.dataForm.get('PUR_Amt');   // 發票總金額

    if (!netControl || !taxControl || !amtControl) {
      return;
    }

    let updatingFromNet = false;
    let updatingFromAmt = false;

    // 使用者輸入「發票未稅金額」時：
    netControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (updatingFromAmt) return; // 避免互相觸發
      updatingFromNet = true;

      if (value === null || value === undefined || String(value) === '') {
        // 清空時：連帶清空稅額與總額
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        updatingFromNet = false;
        return;
      }

      const rawNet = Number(value);
      if (!isNaN(rawNet)) {
        const netInt = this.roundToInt(rawNet);
        const taxInt = this.roundToInt(netInt * 0.05);
        const totalInt = this.roundToInt(netInt + taxInt);

        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });
        amtControl.setValue(totalInt, { emitEvent: false });
      }

      updatingFromNet = false;
    });

    // 使用者輸入「發票總金額」時：
    amtControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || String(value) === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        updatingFromAmt = false;
        return;
      }

      const rawTotal = Number(value);
      if (!isNaN(rawTotal)) {
        const totalInt = this.roundToInt(rawTotal);
        // total = net + tax，tax = round(net * 0.05)
        // 反推 net，用 total / 1.05，再取整數
        const netInt = this.roundToInt(totalInt / 1.05);
        const taxInt = totalInt - netInt; // 保證 net + tax = total

        amtControl.setValue(totalInt, { emitEvent: false });
        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });
      }

      updatingFromAmt = false;
    });
  }

  /** 四捨五入為整數 */
  private roundToInt(value: number): number {
    return Math.round(value);
  }
}
