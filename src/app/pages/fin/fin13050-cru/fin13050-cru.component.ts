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
} from '../../../service/api/fin/fin13050.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

/* ---------------------------
 * Validators
 * --------------------------- */
const alnumMax16IfFilled: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v) return null;
  if (!/^[A-Za-z0-9]+$/.test(v)) return { alnum: { reason: '包含非英數字元' } };
  if (v.length > 16) return { maxlength: { requiredLength: 16, actualLength: v.length } };
  return null;
};

const invoiceNoValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value ?? '').toString().trim();
  if (!v) return { required: true };
  if (/^00\d{8}$/.test(v)) {
    if (!/^000{8}$/.test(v)) {
      return { invoiceNo: { reason: '前2碼為00時，後8碼必須全部為0' } };
    }
    return null;
  }
  if (!/^[A-Z]{2}\d{8}$/.test(v)) {
    return { invoiceNo: { reason: '格式需為2碼大寫英文+8碼數字（如AB12345678）' } };
  }
  return null;
};

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

  vendorOptions: DropdownOption[] = [];
  private pos2013Map = new Map<string, { venName: string; venUniform: string }>();

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
    PUR_Remark: '備註',
  };

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

  dataForm = this.formBuilder.group({
    id: [{ value: null, disabled: true }],

    mid: [0, [Validators.required]],
    STO_No: ['', [Validators.required]],
    ACP_Type: ['6', [Validators.required]],
    PUR_Uniform: ['', [Validators.required, digitsOnly, Validators.minLength(8), Validators.maxLength(8)]],
    PUR_GUIStatus: ['0', [Validators.required]],
    PUR_GUIBalance: [0, [Validators.required, Validators.min(0)]],
    PUR_SeqNo: [1, [Validators.required, Validators.min(1)]],

    PUR_VoucherType: ['', [Validators.required]],
    PUR_GUINo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), invoiceNoValidator]],
    PUR_GUIDate: [null as Date | null, [Validators.required]],
    PUR_RepYYYYMM: [null as Date | null, [Validators.required, this.repYYYYMMEvenValidator]],

    PUR_VenNo: ['', [Validators.required]],
    PUR_VenName: [{ value: '', disabled: true }],
    PUR_VenUniform: ['', [digitsOnly, Validators.minLength(8), Validators.maxLength(8)]],

    PUR_Amt: [null as number | null, [Validators.required, Validators.min(0.01)]],
    PUR_Net: [null as number | null, [Validators.required, Validators.min(0.01)]],
    PUR_Tax: [null as number | null, [Validators.required]],

    PUR_DirectType: ['1'],
    PUR_TaxType: ['1', [Validators.required]],
    PUR_DiscNo: ['1'],
    PUR_Type: [''],

    Source_Doc_No: ['', [alnumMax16IfFilled]],
    Voucher_No: [''],
    SYS_ORIGIN: ['G'],
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
    this.setupAmountRelations();
    this.updateDisabledState();
  }

  private initUserInfo(): void {
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
    });

    this.fin13050Service.queryFIN11010({ STO_StatusList: ['1'] })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
          const stoUniform = data?.STO_Uniform ?? '';
          if (stoUniform) {
            this.dataForm.patchValue({ PUR_Uniform: stoUniform }, { emitEvent: false });
          }
        },
      });
  }

  private handleRowData(): void {
    const rd: any = this.rowdata;
    if (!rd) return;

    this.patchForm(rd);
  }

  private handleQueryParams(): void {
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      const guiNo = (
        params['GUI_No'] ??
        params['gui_no'] ??
        params['invoiceNo'] ??
        ''
      ).toString().trim().toUpperCase();

      if (!guiNo) return;

      const body = {
        pageSize: 30,
        pageIndex: 1,
        PUR_GUINo: guiNo,
        SortBy: [
          { field: 'PUR_GUINo', order: 1 },
          { field: 'PUR_GUIDate', order: 1 }
        ]
      };

      this.fin13050Service.queryFIN13050(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: any) => {
            const row = Array.isArray(res?.Data) ? res.Data[0] : null;
            if (!row) {
              this.messageService.errorBubble(`查無發票資料（PUR_GUINo=${guiNo}）`);
              return;
            }

            this.patchForm(row);
            this.crudstatus = CRUDStatus.Read;
            this.updateDisabledState();
          },
          error: () => {
            this.messageService.errorBubble('查詢發票資料失敗');
          },
        });
    });
  }

  private patchForm(row: any): void {
    const patch: any = {
      id: row.id ?? null,
      mid: row.mid ?? this.dataForm.get('mid')?.value ?? 0,
      STO_No: row.STO_No ?? this.dataForm.get('STO_No')?.value ?? '',
      ACP_Type: row.ACP_Type ?? '6',
      PUR_Uniform: row.PUR_Uniform ?? this.dataForm.get('PUR_Uniform')?.value ?? '',
      PUR_GUIStatus: row.PUR_GUIStatus ?? '0',
      PUR_GUIBalance: this.toNumberOrZero(row.PUR_GUIBalance),
      PUR_SeqNo: this.toNumberOrDefault(row.PUR_SeqNo, 1),

      PUR_VoucherType: row.PUR_VoucherType ?? '',
      PUR_GUINo: this.normalizeInvoiceNo(
        row.PUR_GUINo ?? this.mergeInvoiceNo(row.PUR_GUITrack, row.PUR_GUINo)
      ),
      PUR_GUIDate: this.toDate(row.PUR_GUIDate),
      PUR_RepYYYYMM: this.toYYYYMM(row.PUR_RepYYYYMM),

      PUR_VenNo: row.PUR_VenNo ?? '',
      PUR_VenName: row.PUR_VenName ?? '',
      PUR_VenUniform: row.PUR_VenUniform ?? '',

      PUR_Amt: this.toNumberOrNull(row.PUR_Amt),
      PUR_Net: this.toNumberOrNull(row.PUR_Net),
      PUR_Tax: this.toNumberOrNull(row.PUR_Tax),

      PUR_DirectType: row.PUR_DirectType ?? '1',
      PUR_TaxType: row.PUR_TaxType ?? '1',
      PUR_DiscNo: row.PUR_DiscNo ?? '1',
      PUR_Type: row.PUR_Type ?? '',

      Source_Doc_No: row.Source_Doc_No ?? '',
      Voucher_No: row.Voucher_No ?? '',
      SYS_ORIGIN: row.SYS_ORIGIN ?? 'G',
      PUR_Remark: row.PUR_Remark ?? '',
    };

    this.dataForm.patchValue(patch, { emitEvent: false });
    this.syncVendorName();
  }

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

    this.loadVendorOptions();
  }

  private loadVendorOptions(): void {
    this.fin13050Service.queryPOS2013VendorList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const list: { VEN_No?: string; Name?: string; No?: string }[] =
            Array.isArray(res?.Data) ? res.Data : [];
          this.pos2013Map.clear();
          this.vendorOptions = [];
          for (const v of list) {
            const venNo = String(v.VEN_No ?? '').trim();
            const venName = String(v.Name ?? '').trim();
            const venUniform = String(v.No ?? '').trim();
            if (!venNo) continue;
            this.pos2013Map.set(venNo, { venName, venUniform });
            this.vendorOptions.push({
              value: venNo,
              label: venName ? `${venNo} - ${venName}` : venNo,
              venName,
            });
          }
          this.syncVendorName();
        },
      });
  }

  private setupVendorSync(): void {
    this.dataForm.get('PUR_VenNo')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.syncVendorName();
      });
  }

  private syncVendorName(): void {
    const venNo = (this.dataForm.get('PUR_VenNo')?.value ?? '').toString().trim();
    const info = this.pos2013Map.get(venNo);
    if (!info) return;

    this.dataForm.patchValue(
      { PUR_VenName: info.venName, PUR_VenUniform: info.venUniform },
      { emitEvent: false },
    );
  }

  private updateDisabledState(): void {
    const alwaysDisabled = ['id', 'PUR_VenName', 'PUR_Tax'];

    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable({ emitEvent: false });
    } else {
      this.dataForm.enable({ emitEvent: false });
      alwaysDisabled.forEach((name) => this.dataForm.get(name)?.disable({ emitEvent: false }));
    }
  }

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

  private buildPayload(): any {
    const fv = this.dataForm.getRawValue();
    const u = this.getUserInfo();

    return {
      id: fv.id ?? this.rowdata?.id ?? null,
      mid: Number(u?.mid) || Number(fv.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? fv.STO_No ?? null,
      ACP_Type: fv.ACP_Type ?? '6',
      PUR_Uniform: fv.PUR_Uniform ?? null,
      PUR_GUIStatus: fv.PUR_GUIStatus ?? '0',
      PUR_GUIBalance: fv.PUR_GUIBalance != null ? Number(fv.PUR_GUIBalance) : 0,
      PUR_SeqNo: fv.PUR_SeqNo != null ? Number(fv.PUR_SeqNo) : 1,
      PUR_VoucherType: fv.PUR_VoucherType,
      PUR_GUINo: this.normalizeInvoiceNo(fv.PUR_GUINo),
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
      SYS_ORIGIN: fv.SYS_ORIGIN ?? null,
      PUR_Remark: fv.PUR_Remark ?? null,
    };
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13050'], {
      state: { fromRoute: this.router.url },
    });
  }

  private doUpdate(payload: any): void {
    this.fin13050Service.updateFIN13050(payload).subscribe({
      next: () => {
        this.messageService.successBubble('更新成功');
        this.onCancel();
      },
      error: () => this.messageService.unblockUi(),
    });
  }

  private doInsert(payload: any): void {
    const { id, ...forInsert } = payload;
    this.fin13050Service.insertFIN13050(forInsert).subscribe({
      next: () => {
        this.messageService.successBubble('新增成功');
        this.onCancel();
      },
      error: () => this.messageService.unblockUi(),
    });
  }

  private resetFormAfterInsert(): void {
    this.dataForm.reset();
    const u = this.getUserInfo();
    this.dataForm.patchValue({
      mid: Number(u?.mid) || 0,
      STO_No: u?.SYS_StoreNo ?? '',
      PUR_Uniform: '',
      ACP_Type: '6',
      PUR_GUIStatus: '0',
      PUR_GUIBalance: 0,
      PUR_SeqNo: 1,
    });
    this.updateDisabledState();
  }

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

  private toDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

    const s = String(val).trim();
    const digits = s.replace(/\D/g, '');

    if (/^\d{8}$/.test(digits)) {
      return new Date(
        Number(digits.slice(0, 4)),
        Number(digits.slice(4, 6)) - 1,
        Number(digits.slice(6, 8))
      );
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  private toMonthDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : new Date(val.getFullYear(), val.getMonth(), 1);
    }

    const s = String(val).trim();
    const digits = s.replace(/\D/g, '');

    if (/^\d{6}$/.test(digits)) {
      return new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, 1);
    }

    if (/^\d{8}$/.test(digits)) {
      return new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, 1);
    }

    const m = s.match(/^(\d{4})[-\/](\d{1,2})$/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, 1);
    }

    return null;
  }

  private mergeInvoiceNo(track: any, no: any): string {
    const t = (track ?? '').toString().trim().toUpperCase();
    const n = (no ?? '').toString().replace(/\D/g, '');
    const trackPart = t.slice(0, 2);
    const noPart = n.length > 8 ? n.slice(-8) : n.padStart(8, '0');
    return trackPart + noPart;
  }

  private normalizeInvoiceNo(value: any): string {
    return String(value ?? '').trim().toUpperCase();
  }

  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

  private toNumberOrZero(value: any): number {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  }

  private toNumberOrDefault(value: any, defaultValue: number): number {
    const n = Number(value);
    return isNaN(n) ? defaultValue : n;
  }

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');

    if (!netControl || !taxControl || !amtControl) {
      return;
    }

    let updatingFromNet = false;
    let updatingFromAmt = false;

    netControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (updatingFromAmt) return;
      updatingFromNet = true;

      if (value === null || value === undefined || String(value) === '') {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        updatingFromNet = false;
        return;
      }

      const rawNet = Number(value);
      if (!isNaN(rawNet)) {
        const netInt = this.roundToInt(rawNet);
        const currentAmt = amtControl.value;
        if (currentAmt !== null && currentAmt !== undefined && String(currentAmt) !== '') {
          const totalInt = this.roundToInt(Number(currentAmt));
          taxControl.setValue(totalInt - netInt, { emitEvent: false });
        } else {
          const taxInt = this.roundToInt(netInt * 0.05);
          taxControl.setValue(taxInt, { emitEvent: false });
          amtControl.setValue(this.roundToInt(netInt + taxInt), { emitEvent: false });
        }
        netControl.setValue(netInt, { emitEvent: false });
      }

      updatingFromNet = false;
    });

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
        const netInt = this.roundToInt(totalInt / 1.05);
        const taxInt = totalInt - netInt;

        amtControl.setValue(totalInt, { emitEvent: false });
        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });
      }

      updatingFromAmt = false;
    });
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }
}
