/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableEditComponent } from '../../../shared/components/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin13020-cru',
  templateUrl: './fin13020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    InputNumberComponent,
    NgIf,
    TableEditComponent,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN13020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  readonly CRUD = CRUDStatus;

  guiNumberOptions: { label: string; value: string }[] = [];
  voucherTypeOptions = [
    { label: '33 - 三聯式收銀專用發票', value: '33' },
    { label: '34 - 二聯式收銀專用發票', value: '34' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  creditTypeOptions = [
    { label: '折讓', value: 'C' },
    { label: '退出', value: 'R' },
  ];

  /**
   * 原始剩餘總金額
   * = 銷售額 + 稅額 - 已退出/折讓歷史總金額
   */
  private originalRemainingAmt: number | null = null;

  /** 已退出/折讓歷史總金額（用於判斷區別：有歷史→折讓，無歷史且全額→退出） */
  private originalHistoryAmt: number | null = null;

  /**
   * 避免同一組字軌+發票號碼重複打 API
   */
  private lastLoadedInvoiceKey = '';

  /** Edit/Read 模式下保存從 row 帶入的 Credit_Type，防止被各種計算邏輯清空 */
  private storedCreditType = '';

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null],

    GUI_Track: [null as string | null, Validators.required],
    PUR_GUINo: ['', Validators.required],
    InvoiceNumber_Correspond: [''],
    PUR_GUIDate: [null as any, Validators.required],
    PUR_RepYYYYMM: [null as string | null],
    PUR_VoucherType: ['', Validators.required],
    Credit_Type: ['', Validators.required],
    PUR_TaxType: ['', Validators.required],
    PUR_Net: [undefined as any],
    PUR_Tax: [undefined as any],
    PUR_Amt: [undefined as any],
    Inv_Date: [undefined as any],
    Total_hitory_PUR_Amt: [undefined as any],
    Total_Amt: [undefined as any],
    TXN_Ret_No: ['系統自動帶入', Validators.required],
    Inv_Net: [undefined as any],
    Inv_Tax: [undefined as any],
    Source_Doc_No: [''],
    Voucher_No: [''],
  });

  detailRows: any[] = [];

  constructor(
    private apiService: FIN13010Service,
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', this.dataForm);

    const row: any = (this as any).rowdata;

    if (row) {
      const masterId = row.id ?? row.ID ?? null;

      const repRaw =
        row.PUR_RepYYYYMM ??
        row.INV_DeclareYM ??
        this.dataForm.get('PUR_RepYYYYMM')?.value;

      console.log('rowdata', row, 'repRaw', repRaw);

      this.dataForm.patchValue(
        {
          id: masterId,
          TXN_Ret_No: row.TXN_Ret_No ?? this.dataForm.get('TXN_Ret_No')?.value,

          GUI_Track: row.GUI_Track ?? row.InvoiceTrack ?? this.dataForm.get('GUI_Track')?.value,
          Inv_Date: row.InvoiceDate ?? this.dataForm.get('Inv_Date')?.value,
          PUR_GUINo: this.normalizeInvoiceNumber(
            row.PUR_GUINo ?? row.InvoiceNumber ?? this.dataForm.get('PUR_GUINo')?.value,
            row.GUI_Track ?? row.InvoiceTrack ?? this.dataForm.get('GUI_Track')?.value
          ),
          PUR_GUIDate: row.PUR_GUIDate ?? row.InvoiceDate ?? this.dataForm.get('PUR_GUIDate')?.value,
          PUR_VoucherType: row.PUR_VoucherType ?? row.InvoiceType ?? this.dataForm.get('PUR_VoucherType')?.value,

          PUR_RepYYYYMM: this.normalizeYYYYMMForControl(repRaw),
          Credit_Type: row.Credit_Type ?? this.dataForm.get('Credit_Type')?.value,
          PUR_TaxType: row.PUR_TaxType ?? this.dataForm.get('PUR_TaxType')?.value,

          PUR_Net: row.PUR_Net ?? this.dataForm.get('PUR_Net')?.value,
          PUR_Tax: row.PUR_Tax ?? this.dataForm.get('PUR_Tax')?.value,
          PUR_Amt: row.PUR_Amt ?? this.dataForm.get('PUR_Amt')?.value,

          Source_Doc_No: row.Source_Doc_No ?? this.dataForm.get('Source_Doc_No')?.value,
          Voucher_No: row.Voucher_No ?? this.dataForm.get('Voucher_No')?.value,
        },
        { emitEvent: false }
      );

      const details = (row.APS40235List ?? row.Details ?? []) as any[];
      this.detailRows = details.map((d) => ({
        ID: d.ID ?? null,
        PLU_Name: d.PLU_Name,
        TXN_Qty: d.TXN_Qty,
        PLU_SalePrc: d.PLU_SalePrc,
        TXN_SaleAmt: d.TXN_SaleAmt,
      }));

      // 先存好 row 的 Credit_Type，syncPurAmtFromDetails 會把它清掉
      this.storedCreditType = row.Credit_Type ?? '';

      this.syncPurAmtFromDetails();

      // syncPurAmtFromDetails 可能清掉 Credit_Type，Edit/Read 模式補回來
      if (this.crudstatus !== CRUDStatus.Create && this.storedCreditType) {
        this.dataForm.patchValue({ Credit_Type: this.storedCreditType }, { emitEvent: false });
      }
    }

    this.updateDisabledState();
    this.setupTrackNoWatcher();
    this.setupGuiNoChangeWatcher();
    this.setupAmountRelations();
    this.setupVoucherNoWatcher();

    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    // this.dataForm.get('Voucher_No')?.disable();

    if (this.crudstatus === CRUDStatus.Create) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      let evenMonth = month % 2 === 0 ? month : month + 1;
      if (evenMonth > 12) evenMonth = 12;

      const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;
      this.dataForm.patchValue(
        {
          PUR_GUIDate: today,
          PUR_RepYYYYMM: repYYYYMM,
        },
        { emitEvent: false }
      );
    }

    if (this.crudstatus !== CRUDStatus.Create) {
      // Edit/Read 進頁時字軌+發票號碼已由 row 直接帶入，不必再打 API 查整批清單，
      // 直接用 row 的值組一筆選項，讓 app-dropdown 的 selectedOptionLabel 找得到對應項目
      const initialNo = (this.dataForm.get('PUR_GUINo')?.value as string | null)?.trim();
      if (initialNo) {
        this.guiNumberOptions = [{ label: initialNo, value: initialNo }];
      }
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      this.loadInvoiceInfoByCurrentGUINo();
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.loadTotalAmtForRead();
    }
  }

  /* ----------------- 編輯/檢視：依目前 GUI_Track + PUR_GUINo 撈 FIN13020 ----------------- */
  private setupVoucherNoWatcher(): void {
    this.dataForm.get('Voucher_No')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((voucherNo) => {
        const vouNo = String(voucherNo ?? '').trim();
        const ctrl = this.dataForm.get('Voucher_No');

        if (!vouNo) {
          const errors = { ...ctrl?.errors };
          delete errors['voucherNotFound'];
          ctrl?.setErrors(Object.keys(errors).length ? errors : null);
          return;
        }

        this.fin13020Service.queryFIN13100ByVoucherNo(vouNo).subscribe({
          next: (res: any) => {
            const exists =
              Array.isArray(res?.Data) &&
              res.Data.some((x: any) => String(x.VouNo ?? '').trim() === vouNo);

            if (!exists) {
              ctrl?.setErrors({ ...ctrl.errors, voucherNotFound: true });
              ctrl?.markAsTouched();
              this.messageService.warnBubble(`查無傳票編號：${vouNo}`);
            } else {
              const errors = { ...ctrl?.errors };
              delete errors['voucherNotFound'];
              ctrl?.setErrors(Object.keys(errors).length ? errors : null);
            }
          },
          error: () => {
            this.messageService.errorBubble('查詢傳票編號失敗');
          },
        });
      });
  }
  private loadInvoiceInfoByCurrentGUINo(): void {
    const track = (this.dataForm.get('GUI_Track')?.value as string | null)?.trim();
    const noRaw = (this.dataForm.get('PUR_GUINo')?.value as string | null)?.trim();
    const no = this.normalizeInvoiceNumber(noRaw, track);

    if (!track || !no) return;

    const key = `EDIT|${track}|${no}`;
    if (this.lastLoadedInvoiceKey === key) return;
    this.lastLoadedInvoiceKey = key;

    const full = `${track}${no}`;
    this.dataForm.patchValue(
      { InvoiceNumber_Correspond: full },
      { emitEvent: false }
    );

    // clearLoadedInvoiceFields 會清掉 Credit_Type，先保存
    const savedCreditType = this.storedCreditType || this.dataForm.getRawValue().Credit_Type;
    this.clearLoadedInvoiceFields(false);
    // 還原 Credit_Type
    if (savedCreditType) {
      this.dataForm.patchValue({ Credit_Type: savedCreditType }, { emitEvent: false });
    }

    // 呼叫 correspond API 才能取得原始發票的正確剩餘金額
    this.fin13020Service
      .queryCorrespondByGUINoCorrespond({
        InvoiceNumber_Correspond: full,
        Source: 'APS',
      })
      .subscribe((res: any) => {
        const dto = res?.Data?.[0];
        if (!dto) return;
        this.applyInvoiceDto(dto, track, no);
      });
  }

  /* ----------------- 檢視：只撈剩餘總金額 ----------------- */

  private loadTotalAmtForRead(): void {
    const track = (this.dataForm.get('GUI_Track')?.value as string | null)?.trim();
    const noRaw = (this.dataForm.get('PUR_GUINo')?.value as string | null)?.trim();
    const no = this.normalizeInvoiceNumber(noRaw, track);
    if (!track || !no) return;

    this.fin13020Service
      .queryCorrespondByGUINoCorrespond({
        InvoiceNumber_Correspond: `${track}${no}`,
        Source: 'APS',
      })
      .subscribe((res: any) => {
        const dto = res?.Data?.[0];
        if (!dto) return;
        this.dataForm.patchValue({
          Inv_Date: dto.InvoiceDate ?? null,
          Inv_Net: dto.PUR_Net ?? null,
          Inv_Tax: dto.PUR_Tax ?? null,
          Total_hitory_PUR_Amt: dto.Total_hitory_PUR_Amt ?? null,
          Total_Amt: dto.Total_Amt ?? null,
        }, { emitEvent: false });
      });
  }

  /* ----------------- 新增：依字軌+發票號碼查對應資料 ----------------- */

  private loadCorrespondInvoiceInfo(): void {
    const track = (this.dataForm.get('GUI_Track')?.value as string | null)?.trim();
    const noRaw = (this.dataForm.get('PUR_GUINo')?.value as string | null)?.trim();
    const no = this.normalizeInvoiceNumber(noRaw, track);

    if (!track || !no) return;

    const key = `CREATE|${track}|${no}`;
    if (this.lastLoadedInvoiceKey === key) return;
    this.lastLoadedInvoiceKey = key;

    const full = `${track}${no}`;
    this.dataForm.patchValue(
      {
        PUR_GUINo: no,
        InvoiceNumber_Correspond: full,
      },
      { emitEvent: false }
    );

    this.clearLoadedInvoiceFields(false);

    this.fin13020Service
      .queryCorrespondByGUINoCorrespond({
        InvoiceNumber_Correspond: full,
        Source: 'APS',
      })
      .subscribe((res: any) => {
        const dto = res?.Data?.[0];
        if (!dto) return;

        this.applyInvoiceDto(dto, track, no);
      });
  }

  /**
   * 共用：把 API 回來的資料套進畫面
   */
  private applyInvoiceDto(dto: any, track: string, no: string): void {
    const invoiceType = String(dto.InvoiceType ?? '');
    let voucherType = invoiceType;
    if (invoiceType === '31' || invoiceType === '35') voucherType = '33';
    else if (invoiceType === '32') voucherType = '34';

    this.originalRemainingAmt = this.buildOriginalRemainingAmt(dto);
    this.originalHistoryAmt = dto.Total_hitory_PUR_Amt != null ? Math.round(Number(dto.Total_hitory_PUR_Amt)) : 0;

    const dtoPurAmt = this.toIntOrNull(dto.PUR_Amt);
    const dtoCreditType = this.calcCreditTypeByRemainingAmt(dtoPurAmt, this.originalRemainingAmt);

    const isCreateMode = this.crudstatus === CRUDStatus.Create;

    this.dataForm.patchValue(
      {
        GUI_Track: dto.InvoiceTrack ?? track,
        PUR_GUINo: this.normalizeInvoiceNumber(dto.InvoiceNumber ?? no, dto.InvoiceTrack ?? track),
        Inv_Date: dto.InvoiceDate ?? null,
        PUR_VoucherType: voucherType,
        PUR_TaxType: dto.PUR_TaxType ?? '',
        Inv_Net: dto.PUR_Net ?? null,
        Inv_Tax: dto.PUR_Tax ?? null,
        Total_hitory_PUR_Amt: dto.Total_hitory_PUR_Amt ?? null,
        Total_Amt: this.originalRemainingAmt,
        ...(isCreateMode ? { Credit_Type: dtoCreditType } : {}),
        Source_Doc_No: dto.Source_Doc_No ?? '',
        Voucher_No: dto.Voucher_No ?? '',
      },
      { emitEvent: false }
    );

    const rawDetails = Array.isArray(dto.Details) ? dto.Details : [];
    const seenIds = new Set<number>();
    const details = rawDetails.filter((d: any) => {
      if (d.ID == null) return true;
      if (seenIds.has(d.ID)) return false;
      seenIds.add(d.ID);
      return true;
    });
    this.detailRows = details.map((d: any) => ({
      ID: d.ID ?? null,
      PLU_Name: d.PLU_Name ?? '',
      TXN_Qty: d.TXN_Qty ?? null,
      PLU_SalePrc: d.PLU_SalePrc ?? null,
      TXN_SaleAmt: d.TXN_SaleAmt ?? null,
    }));

    this.syncPurAmtFromDetails();

    if (
      this.crudstatus === CRUDStatus.Create &&
      this.originalRemainingAmt !== null &&
      this.originalRemainingAmt <= 0
    ) {
      this.messageService.errorBubble('此發票已無可退出/折讓金額，不可新增');
    }

    if (!this.detailRows.length) {
      const purAmt = this.toIntOrNull(dto.PUR_Amt);
      const purNet = this.toIntOrNull(dto.PUR_Net);
      const purTax = this.toIntOrNull(dto.PUR_Tax);

      this.dataForm.patchValue(
        {
          PUR_Net: purNet,
          PUR_Tax: purTax,
          PUR_Amt: purAmt,
        },
        { emitEvent: false }
      );

      this.updateCreditTypeByRemainingAmt(purAmt);
    }
  }

  /**
   * 剩餘總金額優先自己算，不直接相信 API Total_Amt
   * 公式：銷售額 + 稅額 - 已退出/折讓歷史總金額
   */
  private buildOriginalRemainingAmt(dto: any): number | null {
    const invNet = this.toIntOrNull(dto?.PUR_Net);
    const invTax = this.toIntOrNull(dto?.PUR_Tax);
    const historyAmt = this.toIntOrNull(dto?.Total_hitory_PUR_Amt) ?? 0;
    const apiTotalAmt = this.toIntOrNull(dto?.Total_Amt);

    const calcAmt =
      invNet !== null && invTax !== null
        ? this.roundToInt(invNet + invTax - historyAmt)
        : null;

    if (calcAmt !== null) {
      return calcAmt;
    }

    return apiTotalAmt;
  }

  /* ----------------- 字軌 / 發票號碼 ----------------- */

  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    if (!trackControl) return;

    trackControl.valueChanges.subscribe((trackNo) => {
      const track = typeof trackNo === 'string' ? trackNo.trim() : '';

      this.lastLoadedInvoiceKey = '';

      if (track.length >= 2) {
        this.fin13020Service.queryINV1000List({ GUI_Track: track }).subscribe((res) => {
          this.guiNumberOptions = (res.Data || []).map((item: any) => {
            const pureNo = this.normalizeInvoiceNumber(item.InvoiceNumber, track);
            return {
              label: pureNo,
              value: pureNo,
            };
          });

          this.dataForm.patchValue(
            {
              PUR_GUINo: '',
              InvoiceNumber_Correspond: '',
            },
            { emitEvent: false }
          );

          this.clearLoadedInvoiceFields();
        });
      } else {
        this.guiNumberOptions = [];
        this.dataForm.patchValue(
          {
            PUR_GUINo: '',
            InvoiceNumber_Correspond: '',
          },
          { emitEvent: false }
        );
        this.clearLoadedInvoiceFields();
      }
    });
  }

  private setupGuiNoChangeWatcher(): void {
    const noControl = this.dataForm.get('PUR_GUINo');
    if (!noControl) return;

    noControl.valueChanges.subscribe((value) => {
      const track = (this.dataForm.get('GUI_Track')?.value as string | null)?.trim();
      const no = this.normalizeInvoiceNumber(value, track);

      if (!track || !no) return;

      if (!this.isValidSelectedGuiNo(no)) {
        return;
      }

      if (String(value ?? '') !== no) {
        this.dataForm.patchValue({ PUR_GUINo: no }, { emitEvent: false });
      }

      if (this.crudstatus === CRUDStatus.Create) {
        this.loadCorrespondInvoiceInfo();
      } else {
        this.loadInvoiceInfoByCurrentGUINo();
      }
    });
  }

  private isValidSelectedGuiNo(no: string): boolean {
    const pureNo = this.normalizeInvoiceNumber(no, this.dataForm.get('GUI_Track')?.value);
    return this.guiNumberOptions.some(
      (opt) => this.normalizeInvoiceNumber(opt.value, this.dataForm.get('GUI_Track')?.value) === pureNo
    );
  }

  private clearLoadedInvoiceFields(clearDetailRows = true): void {
    if (clearDetailRows) {
      this.detailRows = [];
    }

    this.originalRemainingAmt = null;
    this.originalHistoryAmt = null;

    this.dataForm.patchValue(
      {
        Inv_Date: null,
        PUR_VoucherType: '',
        PUR_TaxType: '',
        Inv_Net: null,
        Inv_Tax: null,
        Total_hitory_PUR_Amt: null,
        Total_Amt: null,
        PUR_Net: null,
        PUR_Tax: null,
        PUR_Amt: null,
        Credit_Type: '',
        Source_Doc_No: '',
        Voucher_No: '',
      },
      { emitEvent: false }
    );
  }

  onDetailRowsChange(rows: any[]): void {
    this.detailRows = Array.isArray(rows) ? rows : [];
    this.syncPurAmtFromDetails();
  }

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = ['PUR_GUIDate', 'PUR_RepYYYYMM', 'Source_Doc_No', 'PUR_Net', 'PUR_Tax', 'PUR_Amt'];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) control?.enable();
        else control?.disable();
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
      this.updateAmountFieldsByDetailRows();
    }

    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    // this.dataForm.get('Voucher_No')?.disable();
  }

  private updateAmountFieldsByDetailRows(): void {
    if (this.crudstatus !== CRUDStatus.Create) return;
    const hasDetails = (this.detailRows ?? []).length > 0;
    if (hasDetails) {
      this.dataForm.get('PUR_Net')?.disable();
      this.dataForm.get('PUR_Tax')?.disable();
      this.dataForm.get('PUR_Amt')?.disable();
    } else {
      this.dataForm.get('PUR_Net')?.enable();
      this.dataForm.get('PUR_Tax')?.enable();
      this.dataForm.get('PUR_Amt')?.enable();
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      const purDate = formValue.PUR_GUIDate ? new Date(formValue.PUR_GUIDate) : null;
      const invDate = formValue.Inv_Date ? new Date(formValue.Inv_Date) : null;
      if (purDate && invDate && purDate < invDate) {
        this.messageService.errorBubble('退出/折讓日期不可小於發票日期');
        return;
      }

      const detailTotalRaw = this.detailRows.reduce((sum, row) => {
        const v = Number(row?.TXN_SaleAmt);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
      const detailTotal = this.roundToInt(detailTotalRaw);

      const purAmtInt = this.toIntOrNull(formValue.PUR_Amt);
      if (this.detailRows.length > 0 && purAmtInt !== null && purAmtInt !== detailTotal) {
        this.messageService.errorBubble('明細的金額加總必須等於「退回/折讓總金額」');
        return;
      }

      const remainingAmt = this.toIntOrNull(formValue.Total_Amt);
      if (remainingAmt !== null && purAmtInt !== null && purAmtInt > remainingAmt) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        return;
      }

      if (this.crudstatus === CRUDStatus.Create) {
        if (remainingAmt !== null && remainingAmt <= 0) {
          this.messageService.errorBubble('此發票已無可退出/折讓金額，不可新增');
          return;
        }
      }

      const creditType = this.calcCreditTypeByRemainingAmt(
        formValue.PUR_Amt,
        remainingAmt
      );

      const intNet = this.toIntOrNull(formValue.PUR_Net);
      const intTax = this.toIntOrNull(formValue.PUR_Tax);
      const intAmt = this.toIntOrNull(formValue.PUR_Amt);

      const invoiceDate = formValue.PUR_GUIDate ? new Date(formValue.PUR_GUIDate) : null;
      const invDeclareYM = this.toYYYYMM(formValue.PUR_RepYYYYMM);
      const pureInvoiceNumber = this.normalizeInvoiceNumber(formValue.PUR_GUINo, formValue.GUI_Track);

      this.loading = true;
      this.messageService.blockUi();

      if (this.crudstatus === CRUDStatus.Edit) {
        const payload: any = {
          id: formValue.id,
          TXN_Ret_No: formValue.TXN_Ret_No,
          GUI_Track: formValue.GUI_Track,
          InvoiceNumber: pureInvoiceNumber,
          InvoiceDate: invoiceDate,
          InvoiceType: formValue.PUR_VoucherType,
          INV_DeclareYM: invDeclareYM,
          Credit_Type: creditType,
          PUR_TaxType: formValue.PUR_TaxType,
          PUR_Net: intNet,
          PUR_Tax: intTax,
          PUR_Amt: intAmt,
          Source_Doc_No: formValue.Source_Doc_No,
          APS40235List: this.detailRows.map((row) => ({
            ID: typeof row.ID === 'number' ? row.ID : 0,
            PLU_Name: row.PLU_Name,
            TXN_Qty: row.TXN_Qty,
            PLU_SalePrc: row.PLU_SalePrc,
            TXN_SaleAmt: row.TXN_SaleAmt,
          })),
        };

        if (this.canEdit()) {
          this.fin13020Service.updateFIN13020(payload).pipe(
            finalize(() => {
              this.loading = false;
              this.messageService.unblockUi();
            })
          ).subscribe({
            next: () => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            },
            error: (err) => {
              this.messageService.errorBubble(err?.error?.Message || '更新失敗，請聯絡系統管理員');
            },
          });
        } else {
          this.loading = false;
          this.messageService.unblockUi();
        }
      } else {
        const insertPayload: any = {
          Source: 'APS',
          GUI_Track: formValue.GUI_Track,
          InvoiceNumber: pureInvoiceNumber,
          InvoiceDate: invoiceDate,
          InvoiceType: formValue.PUR_VoucherType,
          INV_DeclareYM: invDeclareYM,
          Credit_Type: creditType,
          PUR_TaxType: formValue.PUR_TaxType,
          PUR_Net: intNet,
          PUR_Tax: intTax,
          PUR_Amt: intAmt,
          Source_Doc_No: formValue.Source_Doc_No,
          APS40235List: this.detailRows.map((row) => ({
            PLU_Name: row.PLU_Name,
            TXN_Qty: row.TXN_Qty,
            PLU_SalePrc: row.PLU_SalePrc,
            TXN_SaleAmt: row.TXN_SaleAmt,
          })),
        };

        if (this.canAdd()) {
          this.fin13020Service.insertFIN13020(insertPayload).pipe(
            switchMap(() => {
              return this.queryInsertedRecordAndPrint(
                formValue.GUI_Track,
                pureInvoiceNumber,
                invDeclareYM
              );
            }),
            finalize(() => {
              this.loading = false;
              this.messageService.unblockUi();
            })
          ).subscribe({
            next: () => {
              this.messageService.successBubble('新增成功並列印完成');

              this.dataForm.reset();
              this.detailRows = [];
              this.originalRemainingAmt = null;
              this.lastLoadedInvoiceKey = '';

              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth() + 1;
              let evenMonth = month % 2 === 0 ? month : month + 1;
              if (evenMonth > 12) evenMonth = 12;

              this.dataForm.patchValue(
                {
                  PUR_GUIDate: today,
                  PUR_RepYYYYMM: `${year}${String(evenMonth).padStart(2, '0')}`,
                  TXN_Ret_No: '系統自動帶入',
                },
                { emitEvent: false }
              );

              this.updateDisabledState();
            },
            error: (err) => {
              this.messageService.errorBubble(
                err?.error?.Message || err?.message || '新增或列印失敗，請聯絡系統管理員'
              );
            },
          });
        } else {
          this.loading = false;
          this.messageService.unblockUi();
        }
      }
    });
  }

  /**
   * 新增成功後：
   * 1. 先查 queryFIN13020 抓到 TXN_Ret_No
   * 2. 再用 TXN_Ret_No 去列印
   */
  private queryInsertedRecordAndPrint(
    guiTrack: string,
    pureInvoiceNumber: string,
    invDeclareYM: string | null
  ) {
    const queryPayload = {
      TXN_Ret_NoStart: null,
      TXN_Ret_NoEnd: null,
      GUI_Track: guiTrack,
      InvoiceNumberStart: pureInvoiceNumber,
      InvoiceNumberEnd: pureInvoiceNumber,
      InvoiceDateStart: null,
      InvoiceDateEnd: null,
      InvoiceType: null,
      INV_DeclareYM: invDeclareYM,
      Source_Doc_NoStart: null,
      Source_Doc_NoEnd: null,
      Voucher_NoStart: null,
      Voucher_NoEnd: null,
      pageIndex: 1,
      pageSize: 30,
      SortBy: [{ field: 'ID', order: -1 }],
    };

    return this.fin13020Service.queryFIN13020(queryPayload).pipe(
      map((res: any) => {
        const list = Array.isArray(res?.Data) ? res.Data : [];
        if (!list.length) {
          throw new Error('新增成功，但查不到剛新增的折讓單資料');
        }

        const hit =
          list.find((x: any) =>
            String(x?.InvoiceTrack ?? '').trim() === String(guiTrack ?? '').trim() &&
            this.normalizeInvoiceNumber(x?.InvoiceNumber, x?.InvoiceTrack) === pureInvoiceNumber
          ) ?? list[0];

        const txnRetNo = String(hit?.TXN_Ret_No ?? '').trim();
        const invYM = String(hit?.INV_DeclareYM ?? invDeclareYM ?? '').trim();
        const track = String(hit?.InvoiceTrack ?? guiTrack ?? '').trim();
        const invNo = this.normalizeInvoiceNumber(hit?.InvoiceNumber ?? pureInvoiceNumber, track);

        if (!txnRetNo) {
          throw new Error('新增成功，但查到的資料沒有退出/折讓單號（TXN_Ret_No）');
        }

        this.dataForm.patchValue(
          {
            TXN_Ret_No: txnRetNo,
          },
          { emitEvent: false }
        );

        return {
          INV_DeclareYM: invYM,
          TXN_Ret_NoS: txnRetNo,
          TXN_Ret_NoE: txnRetNo,
          InvoiceTrack: track,
          InvoiceNumberS: invNo,
          InvoiceNumberE: invNo,
        };
      }),
      switchMap((printPayload) => this.fin13020Service.printFIN13020(printPayload)),
      switchMap((resp: HttpResponse<Blob>) => this.openPrintResponse$(resp))
    );
  }

  /**
   * 改成 Observable 版本，讓外面可以串接 loading 到真正開啟列印完成為止
   */
  private openPrintResponse$(resp: HttpResponse<Blob>) {
    return new Promise<void>((resolve, reject) => {
      const ct = resp.headers.get('content-type') || '';

      if (ct.includes('application/pdf')) {
        try {
          const url = URL.createObjectURL(resp.body!);
          globalThis.open(url, '_blank');
          resolve();
        } catch (e) {
          reject(e);
        }
        return;
      }

      resp.body!.text().then((text) => {
        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          try {
            const url = URL.createObjectURL(resp.body!);
            globalThis.open(url, '_blank');
            resolve();
          } catch (e) {
            reject(e);
          }
          return;
        }

        const printUrl = json?.Print_URL ?? json?.Data?.Print_URL ?? json?.Data?.[0]?.Print_URL;
        if (!printUrl) {
          reject(new Error('列印回應未包含 Print_URL'));
          return;
        }

        const base = environment.ApiUrl;
        const fullUrl = `${base}${printUrl}`;

        globalThis.open(fullUrl, '_blank');
        resolve();
      }).catch((err) => reject(err));
    }).then(() => void 0);
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13020'], {
      state: { fromCru: true },
    });
  }

  /* ------- 金額互算 + 剩餘總金額 + 區別判斷 ------- */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');
    const remainingControl = this.dataForm.get('Total_Amt');

    if (!netControl || !taxControl || !amtControl || !remainingControl) return;

    let updatingFromNet = false;
    let updatingFromTax = false;
    let updatingFromAmt = false;

    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt || updatingFromTax) return;
      updatingFromNet = true;

      if (value === null || value === undefined || value === '') {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByRemainingAmt(null);
        updatingFromNet = false;
        return;
      }

      let netInt = this.roundToInt(Number(value));
      if (isNaN(netInt)) {
        updatingFromNet = false;
        return;
      }

      let taxInt = this.roundToInt(netInt * 0.05);
      let totalInt = this.roundToInt(netInt + taxInt);

      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
        this.originalRemainingAmt > 0 &&
        totalInt > this.originalRemainingAmt
      ) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        totalInt = this.roundToInt(this.originalRemainingAmt);
        const approxNet = totalInt / 1.05;
        netInt = this.roundToInt(approxNet);
        taxInt = totalInt - netInt;
      }

      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });
      amtControl.setValue(totalInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByRemainingAmt(totalInt);
      updatingFromNet = false;
    });

    taxControl.valueChanges.subscribe((value) => {
      if (updatingFromNet || updatingFromAmt) return;
      updatingFromTax = true;

      const taxInt = this.toIntOrNull(value);
      const netInt = this.toIntOrNull(netControl.value);

      if (taxInt === null || netInt === null) {
        updatingFromTax = false;
        return;
      }

      const totalInt = netInt + taxInt;
      amtControl.setValue(totalInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByRemainingAmt(totalInt);
      updatingFromTax = false;
    });

    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet || updatingFromTax) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || value === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByRemainingAmt(null);
        updatingFromAmt = false;
        return;
      }

      let totalInt = this.roundToInt(Number(value));
      if (isNaN(totalInt)) {
        updatingFromAmt = false;
        return;
      }

      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
        this.originalRemainingAmt > 0 &&
        totalInt > this.originalRemainingAmt
      ) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        totalInt = this.roundToInt(this.originalRemainingAmt);
      }

      const approxNet = totalInt / 1.05;
      const netInt = this.roundToInt(approxNet);
      const taxInt = totalInt - netInt;

      amtControl.setValue(totalInt, { emitEvent: false });
      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByRemainingAmt(totalInt);
      updatingFromAmt = false;
    });
  }

  private updateCreditTypeByRemainingAmt(purAmt: number | null): void {
    const creditControl = this.dataForm.get('Credit_Type');
    const remainingControl = this.dataForm.get('Total_Amt');

    if (!creditControl || !remainingControl) return;

    const remainingRaw = remainingControl.value;
    const remaining =
      remainingRaw === null || remainingRaw === undefined || remainingRaw === ''
        ? null
        : this.roundToInt(Number(remainingRaw));

    if (
      purAmt === null ||
      purAmt === undefined ||
      isNaN(Number(purAmt)) ||
      Number(purAmt) <= 0 ||
      remaining === null ||
      isNaN(remaining) ||
      remaining <= 0
    ) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    const p = this.roundToInt(Number(purAmt));
    const r = this.roundToInt(remaining);
    const historyAmt = this.originalHistoryAmt ?? 0;

    // 已有歷史退出/折讓紀錄 → 一律折讓
    if (historyAmt > 0) {
      creditControl.setValue('C', { emitEvent: false });
    } else if (p === r) {
      creditControl.setValue('R', { emitEvent: false }); // 第一次且全額用完 → 退出
    } else if (p < r) {
      creditControl.setValue('C', { emitEvent: false }); // 第一次但部分金額 → 折讓
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
  }

  private calcCreditTypeByRemainingAmt(purAmt: any, remainingAmt: any): 'R' | 'C' | '' {
    const p = this.toIntOrNull(purAmt);
    const r = this.toIntOrNull(remainingAmt);

    if (p === null || r === null || p <= 0 || r <= 0) return '';

    const historyAmt = this.originalHistoryAmt ?? 0;

    if (historyAmt > 0) return 'C';  // 已有歷史 → 折讓
    if (p === r) return 'R';         // 第一次且全額 → 退出
    if (p < r) return 'C';           // 第一次但部分 → 折讓

    return '';
  }
  private roundToInt(value: number): number {
    return Math.round(value);
  }

  private toIntOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (isNaN(n)) return null;
    return this.roundToInt(n);
  }

  private normalizeInvoiceNumber(value: any, track?: any): string {
    if (value === null || value === undefined) return '';
    let str = String(value).trim();
    const trackStr = track ? String(track).trim() : '';

    if (trackStr && str.toUpperCase().startsWith(trackStr.toUpperCase())) {
      str = str.slice(trackStr.length);
    }

    return str.trim();
  }

  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = {};
    keepValues.forEach((key) => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset();
    this.dataForm.patchValue(patch);
    this.originalRemainingAmt = null;
    this.lastLoadedInvoiceKey = '';
    this.updateDisabledState();
  }

  @Output() fieldChange = new EventEmitter<any>();

  editColumns: EditColumn[] = [
    { field: 'PLU_Name', header: '品名', type: 'input' },
    { field: 'TXN_Qty', header: '數量', type: 'inputNumber' },
    { field: 'PLU_SalePrc', header: '單價', type: 'inputNumber', textAlign: 'right' },
    { field: 'TXN_SaleAmt', header: '金額', type: 'inputNumber', textAlign: 'right', disabled: () => true },
  ];

  onFieldChange(event: { rowData: any; field: string; value: any }) {
    const { rowData, field, value } = event;
    rowData[field] = value;

    if (field === 'TXN_Qty' || field === 'PLU_SalePrc') {
      const TXN_Qty = parseFloat(rowData.TXN_Qty) || 0;
      const PLU_SalePrc = parseFloat(rowData.PLU_SalePrc) || 0;

      rowData.TXN_SaleAmt = this.roundToInt(TXN_Qty * PLU_SalePrc);
      this.syncPurAmtFromDetails();
    }

    if (field === 'TXN_SaleAmt') {
      this.syncPurAmtFromDetails();
    }
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6);
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      }
      return null;
    }

    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  private normalizeYYYYMMForControl(raw: any): string | null {
    if (!raw) return null;
    const only = String(raw).replace(/\D/g, '');
    if (only.length < 6) return null;
    return only.slice(0, 6);
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  private optionLabelOf(opts: { label: string; value: any }[], value: any): string {
    const hit = opts?.find((o) => String(o.value) === String(value));
    return hit?.label ?? (value ?? '');
  }

  formatDate(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).toString().padStart(2, '0');
    return `${y}/${m}/${day}`;
  }

  formatRepYYYYMM(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') {
      const only = v.replace(/\D/g, '');
      if (only.length >= 6) return `${only.slice(0, 4)}/${only.slice(4, 6)}`;
    }
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    return String(v);
  }


  private syncPurAmtFromDetails(): void {
    const sumRaw = (this.detailRows ?? []).reduce((sum, r) => {
      const v = Number(r?.TXN_SaleAmt);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

    let sum = this.roundToInt(sumRaw);
    const hasDetails = (this.detailRows ?? []).length > 0;

    if (
      hasDetails &&
      this.originalRemainingAmt !== null &&
      !isNaN(this.originalRemainingAmt) &&
      sum > this.roundToInt(this.originalRemainingAmt)
    ) {
      this.messageService.errorBubble('明細加總不可大於剩餘總金額');
      sum = this.roundToInt(this.originalRemainingAmt);
    }

    this.dataForm.get('PUR_Amt')?.setValue(hasDetails ? sum : null, { emitEvent: false });

    if (hasDetails) {
      const approxNet = this.roundToInt(sum / 1.05);
      const tax = sum - approxNet;

      this.dataForm.patchValue(
        {
          PUR_Net: approxNet,
          PUR_Tax: tax,
          Total_Amt:
            this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
              ? this.roundToInt(this.originalRemainingAmt)
              : null,
        },
        { emitEvent: false }
      );

      this.updateCreditTypeByRemainingAmt(sum);
    } else {
      this.dataForm.patchValue(
        {
          PUR_Net: null,
          PUR_Tax: null,
          Total_Amt:
            this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
              ? this.roundToInt(this.originalRemainingAmt)
              : null,
        },
        { emitEvent: false }
      );

      this.updateCreditTypeByRemainingAmt(null);
    }
  }
}