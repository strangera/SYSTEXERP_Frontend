/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin13020-cru',
  templateUrl: './fin13020-cru.component.html',
  styleUrls: ['./fin13020-cru.component.scss'],
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
    TableComponent,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN13020CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
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

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null],                                 // Update 主鍵

    GUI_Track: [null as string | null, Validators.required],     // 字軌
    PUR_GUINo: ['', Validators.required],                        // 發票號碼 (送 InvoiceNumber)
    InvoiceNumber_Correspond: [''],                              // 字軌+號碼，查對應用
    PUR_GUIDate: ['', Validators.required],                      // 退出/折讓日期 (送 InvoiceDate)
    PUR_VoucherType: ['', Validators.required],                  // 發票格式 (送 InvoiceType)
    PUR_RepYYYYMM: [null],                                       // 申報年月 (送 INV_DeclareYM)
    Credit_Type: ['', Validators.required],                      // 區別（折讓/退出）→ 程式自動判斷
    PUR_TaxType: ['', Validators.required],                      // 課稅別（由原發票帶入）
    PUR_Net: [undefined as any],                                 // 退出/折讓金額
    PUR_Tax: [undefined as any],                                 // 退出/折讓稅額（自動計算）
    PUR_Amt: [undefined as any],                                 // 退回/折讓總金額
    Inv_Date: [undefined as any],                                // 發票日期（顯示用）
    Total_hitory_PUR_Amt: [undefined as any],                    // 已退出/折讓歷史總金額（顯示用）
    Total_Amt: [undefined as any],                               // 剩餘總金額（顯示用）
    TXN_Ret_No: ['系統自動帶入', Validators.required],            // 退出/折讓單號（Update 時送）
    Inv_Net: [undefined as any],                                 // 銷售額（顯示用，不送）
    Inv_Tax: [undefined as any],                                 // 稅額（顯示用，不送）
    Source_Doc_No: [''],                                         // 憑證單號
    Voucher_No: [''],                                            // 傳票編號
  });

  detailRows: any[] = [];

  constructor(
    private apiService: FIN13010Service,
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', this.dataForm);
    this.updateDisabledState();
    this.setupAmountRelations();          // 金額欄位互算 + 上限檢查 + 區別判斷
    this.setupRemainAmountCalculation();  // 目前骨架，不影響

    // 固定禁止輸入的欄位（發票格式在 Create 模式要能選，交給 updateDisabledState 控制）
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('PUR_Tax')?.disable();      // 退出/折讓稅額不可手改
    this.dataForm.get('Credit_Type')?.disable();  // 區別改成程式自動判斷

    this.setupTrackNoWatcher();            // 監聽字軌 → 發票號碼下拉
    this.setupGuiNoAndCorrespondWatcher(); // 監聽字軌+發票號碼 → 帶對應資料

    // 編輯 / 檢視模式：一進畫面就用目前字軌＋發票號碼去撈 APS4023
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadInvoiceInfoByCurrentGUINo();
    }
  }

  /* ----------------- 共用：依目前 GUI_Track + PUR_GUINo 撈 APS4023 對應資料 ----------------- */

  private loadInvoiceInfoByCurrentGUINo(): void {
    const trackRaw = this.dataForm.get('GUI_Track')?.value as string | null;
    const guiNoRaw = this.dataForm.get('PUR_GUINo')?.value as string | null;

    const track = trackRaw?.trim();
    const guiNo = guiNoRaw?.trim();

    if (!track || !guiNo) return;

    const full = `${track}${guiNo}`;

    this.dataForm.patchValue(
      { InvoiceNumber_Correspond: full },
      { emitEvent: false },
    );

    this.fin13020Service
      .queryCorrespondByGUINoCorrespond({ InvoiceNumber_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];
        if (detail) {
          const invoiceType = detail.InvoiceType as string | undefined;

          let voucherType = '';
          if (invoiceType === '31' || invoiceType === '35') {
            voucherType = '33';
          } else if (invoiceType === '32') {
            voucherType = '34';
          }

          this.dataForm.patchValue(
            {
              Inv_Date: detail.InvoiceDate,
              PUR_VoucherType: voucherType,
              PUR_TaxType: detail.PUR_TaxType,
              Inv_Net: detail.PUR_Net,
              Inv_Tax: detail.PUR_Tax,
              Total_hitory_PUR_Amt: (detail as any).Total_hitory_PUR_Amt,
              Total_Amt: (detail as any).Total_Amt,
            },
            { emitEvent: false },
          );

          const currentAmt = this.dataForm.get('PUR_Amt')?.value;
          const totalInt =
            currentAmt === null || currentAmt === undefined || currentAmt === ''
              ? null
              : this.roundToInt(Number(currentAmt));
          this.updateCreditTypeByAmount(totalInt);
        } else {
          this.dataForm.patchValue(
            {
              Inv_Date: null,
              PUR_VoucherType: '',
              PUR_TaxType: '',
              Inv_Net: null,
              Inv_Tax: null,
              PUR_Amt: null,
              Total_hitory_PUR_Amt: null,
              Total_Amt: null,
              Credit_Type: '',
            },
            { emitEvent: false },
          );
        }
      });
  }

  /* ----------------- 監聽字軌 & 發票號碼 ----------------- */

  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');

    if (trackControl) {
      trackControl.valueChanges.subscribe((trackNo) => {
        if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
          this.fin13020Service
            .queryINV1000List({ GUI_Track: trackNo.trim() })
            .subscribe((res) => {
              this.guiNumberOptions = (res.Data || []).map((item: any) => ({
                label: item.InvoiceNumber,
                value: item.InvoiceNumber,
              }));
            });
        } else {
          this.guiNumberOptions = [];
        }
      });
    }
  }

  private setupGuiNoAndCorrespondWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    const noControl = this.dataForm.get('PUR_GUINo');

    if (trackControl && noControl) {
      const trigger = () => this.loadInvoiceInfoByCurrentGUINo();
      trackControl.valueChanges.subscribe(trigger);
      noControl.valueChanges.subscribe(trigger);
    }
  }

  // 依 CRUDStatus 控制可編輯欄位
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'Source_Doc_No',
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No',
      ];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) {
          control?.enable();
        } else {
          control?.disable();
        }
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable(); // Create 模式
    }

    // 一律不可手動修改
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      const intNet = this.toIntOrNull(formValue.PUR_Net);
      const intTax = this.toIntOrNull(formValue.PUR_Tax);
      const intAmt = this.toIntOrNull(formValue.PUR_Amt);

      const invoiceDate = formValue.PUR_GUIDate
        ? new Date(formValue.PUR_GUIDate)
        : null;

      const invDeclareYM = this.toYYYYMM(formValue.PUR_RepYYYYMM);

      // ⏳ 開始 API 前開啟 loading
      this.loading = true;

      if (this.crudstatus === CRUDStatus.Edit) {
        // Update：比照 Swagger（含 id）
        const payload: any = {
          id: formValue.id,
          TXN_Ret_No: formValue.TXN_Ret_No,
          GUI_Track: formValue.GUI_Track,
          InvoiceNumber: formValue.PUR_GUINo,
          InvoiceDate: invoiceDate,
          InvoiceType: formValue.PUR_VoucherType,
          INV_DeclareYM: invDeclareYM,
          Credit_Type: formValue.Credit_Type,
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

        if (this.canEdit()) {
          this.fin13020Service.updateFIN13020(payload).subscribe({
            next: () => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            },
            error: (err) => {
              this.loading = false;
              this.messageService.errorBubble(
                err?.error?.Message || '更新失敗，請聯絡系統管理員',
              );
            },
            complete: () => {
              this.loading = false;
            },
          });
        } else {
          this.loading = false;
        }
      } else {
        // Insert：完全對齊 Swagger
        const payload: any = {
          Source: 'APS',
          GUI_Track: formValue.GUI_Track,
          InvoiceNumber: formValue.PUR_GUINo,
          InvoiceDate: invoiceDate,
          InvoiceType: formValue.PUR_VoucherType,
          INV_DeclareYM: invDeclareYM,
          Credit_Type: formValue.Credit_Type,
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
          this.fin13020Service.insertFIN13020(payload).subscribe({
            next: () => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            },
            error: (err) => {
              this.loading = false;
              this.messageService.errorBubble(
                err?.error?.Message || '新增失敗，請聯絡系統管理員',
              );
            },
            complete: () => {
              this.loading = false;
            },
          });
        } else {
          this.loading = false;
        }
      }
    });
  }

  /* ----------------- 金額互算邏輯（比照 FIN13010） ----------------- */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');

    if (!netControl || !taxControl || !amtControl) return;

    let updatingFromNet = false;
    let updatingFromAmt = false;

    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt) return;
      updatingFromNet = true;

      if (value === null || value === undefined || value === '') {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromNet = false;
        return;
      }

      const rawNet = Number(value);
      if (!isNaN(rawNet)) {
        const invNetControl = this.dataForm.get('Inv_Net');
        const invNetRaw = invNetControl?.value;
        const invNet =
          invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
            ? null
            : Number(invNetRaw);

        let netInt = this.roundToInt(rawNet);
        let taxInt = this.roundToInt(netInt * 0.05);
        let totalInt = this.roundToInt(netInt + taxInt);

        if (invNet !== null && !isNaN(invNet) && invNet > 0 && totalInt > invNet) {
          this.messageService.errorBubble('退回/折讓總金額不可大於銷售額');

          const maxTotal = this.roundToInt(invNet);
          const maxNet = this.roundToInt(maxTotal / 1.05);
          const maxTax = maxTotal - maxNet;

          netInt = maxNet;
          taxInt = maxTax;
          totalInt = maxTotal;
        }

        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });
        amtControl.setValue(totalInt, { emitEvent: false });

        this.updateCreditTypeByAmount(totalInt);
      }

      updatingFromNet = false;
    });

    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || value === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromAmt = false;
        return;
      }

      const rawTotal = Number(value);
      if (!isNaN(rawTotal)) {
        const invNetControl = this.dataForm.get('Inv_Net');
        const invNetRaw = invNetControl?.value;
        const invNet =
          invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
            ? null
            : Number(invNetRaw);

        let totalInt = this.roundToInt(rawTotal);

        if (invNet !== null && !isNaN(invNet) && invNet > 0 && totalInt > invNet) {
          this.messageService.errorBubble('退回/折讓總金額不可大於銷售額');
          totalInt = this.roundToInt(invNet);
        }

        const approxNet = totalInt / 1.05;
        const netInt = this.roundToInt(approxNet);
        const taxInt = totalInt - netInt;

        amtControl.setValue(totalInt, { emitEvent: false });
        netControl.setValue(netInt, { emitEvent: false });
        taxControl.setValue(taxInt, { emitEvent: false });

        this.updateCreditTypeByAmount(totalInt);
      }

      updatingFromAmt = false;
    });
  }

  private updateCreditTypeByAmount(totalAmt: number | null): void {
    const creditControl = this.dataForm.get('Credit_Type');
    const invNetControl = this.dataForm.get('Inv_Net');
    const totalAmtControl = this.dataForm.get('Total_Amt');

    if (!creditControl) return;

    if (totalAmtControl) {
      const remainingRaw = totalAmtControl.value;
      if (
        remainingRaw !== null &&
        remainingRaw !== undefined &&
        remainingRaw !== ''
      ) {
        const remaining = Number(remainingRaw);
        if (!isNaN(remaining)) {
          if (remaining === 0) {
            creditControl.setValue('R', { emitEvent: false });
            return;
          }
          if (remaining > 0) {
            creditControl.setValue('C', { emitEvent: false });
            return;
          }
        }
      }
    }

    if (!invNetControl) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    const invNetRaw = invNetControl.value;
    const invNet =
      invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
        ? null
        : Number(invNetRaw);

    if (
      totalAmt === null ||
      totalAmt === undefined ||
      isNaN(totalAmt) ||
      invNet === null ||
      isNaN(invNet) ||
      invNet <= 0
    ) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    if (totalAmt === invNet) {
      creditControl.setValue('R', { emitEvent: false });
    } else if (totalAmt < invNet) {
      creditControl.setValue('C', { emitEvent: false });
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
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

  private setupRemainAmountCalculation(): void {
    const amtControl = this.dataForm.get('PUR_Amt');
    const historyControl = this.dataForm.get('History_RetAmt');
    const remainControl = this.dataForm.get('Remain_Amt');

    if (amtControl && historyControl && remainControl) {
      amtControl.valueChanges.subscribe(() => this.calculateRemainAmount());
      historyControl.valueChanges.subscribe(() => this.calculateRemainAmount());
    }
  }

  private calculateRemainAmount(): void {
    const amt = this.dataForm.get('PUR_Amt')?.value || 0;
    const history = this.dataForm.get('Total_hitory_PUR_Amt')?.value || 0;
    this.dataForm
      .get('Total_hitory_PUR_Amt')
      ?.setValue(amt - history, { emitEvent: false });
  }

  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = {};
    keepValues.forEach((key) => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset();
    this.dataForm.patchValue(patch);
    this.updateDisabledState();
  }

  @Output() fieldChange = new EventEmitter<any>();

  columns: any[] = [
    { field: 'PLU_Name', header: '品名', type: 'input', editable: true },
    { field: 'TXN_Qty', header: '數量', type: 'inputNumber', editable: true },
    {
      field: 'PLU_SalePrc',
      header: '單價',
      type: 'inputNumber',
      editable: true,
      format: (value: any) => this.moneyFormat(value),
      style: 'text-right',
    },
    {
      field: 'TXN_SaleAmt',
      header: '金額',
      format: (value: any) => this.moneyFormat(value),
      style: 'text-right',
    },
  ];

  onFieldChange(event: { rowData: any; field: string; value: any }) {
    const { rowData, field, value } = event;
    rowData[field] = value;

    if (field === 'TXN_Qty' || field === 'PLU_SalePrc') {
      const TXN_Qty = parseFloat(rowData.TXN_Qty) || 0;
      const PLU_SalePrc = parseFloat(rowData.PLU_SalePrc) || 0;
      rowData.TXN_SaleAmt = TXN_Qty * PLU_SalePrc;
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

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  private optionLabelOf(
    opts: Array<{ label: string; value: any }>,
    value: any,
  ): string {
    const hit = opts?.find((o) => String(o.value) === String(value));
    return hit?.label ?? (value ?? '');
  }

  formatDate(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
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

  readonly columnsRead = [
    { field: 'PLU_Name', header: '品名' },
    { field: 'TXN_Qty', header: '數量', format: (v: any) => v },
    {
      field: 'PLU_SalePrc',
      header: '單價',
      format: (v: any) => this.moneyFormat(v),
      style: 'text-right',
    },
    {
      field: 'TXN_SaleAmt',
      header: '金額',
      format: (v: any) => this.moneyFormat(v),
      style: 'text-right',
    },
  ];

  get columnsForView() {
    return this.isRead ? this.columnsRead : this.columns;
  }
}
