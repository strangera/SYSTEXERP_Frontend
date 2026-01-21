/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { ValidationService } from '@shared/service/validation.service';

// UI
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-fin13010-cru',
  templateUrl: './fin13010-cru.component.html',
  styleUrls: ['./fin13010-cru.component.scss'],
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
    YearMonthComponent,
    InputNumberComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN13010CRUComponent extends BasicCruPageComponent<any> {
  CRUDStatus = CRUDStatus;

  /** 發票格式（進項） */
  voucherTypeOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    {
      value: '23',
      label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單',
    },
    {
      value: '24',
      label:
        '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單',
    },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    {
      value: '26',
      label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  /** 區別 */
  creditTypeOptions = [
    { value: 'C', label: '折讓' },
    { value: 'R', label: '退出' },
  ];

  /** 課稅別 */
  taxTypeOptions = [
    { value: '1', label: '應稅' },
    { value: '2', label: '零稅率' },
    { value: '3', label: '免稅' },
  ];

  /** 依字軌撈回來的發票號碼清單 */
  guiNumberOptions: { label: string; value: string }[] = [];

  /** 原始的「剩餘總金額」（從 APS 對應資料帶入，用來判斷區別與上限） */
  private originalRemainingAmt: number | null = null;

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null], // 主檔 id（Update 用）

    TXN_Ret_No: [
      '系統自動帶入',
      [Validators.required, Validators.maxLength(20)],
    ], // 退出/折讓單號（系統自動編號）
    GUI_Track: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    PUR_GUINo: ['', [Validators.required, Validators.maxLength(10)]], // 發票號碼
    InvoiceNumber_Correspond: [''], // 字軌+號碼，用來呼叫對應 API

    Inv_Date: [null as any], // 發票日期（系統帶出）
    PUR_GUIDate: [null as any, Validators.required], // 退出/折讓日期

    PUR_VoucherType: ['', Validators.required], // 發票格式
    PUR_RepYYYYMM: [null as string | null], // 申報年月（六碼 YYYYMM）
    Credit_Type: ['', Validators.required], // 區別（系統判斷）
    PUR_TaxType: ['', Validators.required], // 課稅別（系統帶出）

    Inv_Net: [null as any], // 銷售額（顯示用）
    Inv_Tax: [null as any], // 稅額（顯示用）

    PUR_Net: [null as any], // 退出/折讓金額
    PUR_Tax: [null as any], // 退出/折讓稅額（自算）
    PUR_Amt: [null as any], // 退回/折讓總金額

    Total_hitory_PUR_Amt: [null as any], // 已退出/折讓歷史總金額（系統帶出）
    Total_Amt: [null as any], // 剩餘總金額（系統帶出 / 再扣本次）

    Source_Doc_No: ['', [Validators.maxLength(16)]], // 憑證單號
    Voucher_No: ['', [Validators.maxLength(16)]], // 傳票編號（系統用）
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private fin13010Service: FIN13010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // 會把 crudstatus / rowdata / 權限帶進來
    this.initializePage('FIN13010', this.dataForm);

    const row: any = (this as any).rowdata;

       if (row) {
      const repRaw =
        row.PUR_RepYYYYMM ??
        row.INV_DeclareYM ??
        this.dataForm.get('PUR_RepYYYYMM')?.value;

      const rawVoucherType =
        row.PUR_VoucherType ??
        row.InvoiceType ??
        this.dataForm.get('PUR_VoucherType')?.value;

      this.dataForm.patchValue(
        {
          id: row.id ?? row.ID ?? null,
          TXN_Ret_No:
            row.TXN_Ret_No ?? this.dataForm.get('TXN_Ret_No')?.value,
          GUI_Track:
            row.GUI_Track ??
            row.InvoiceTrack ??
            this.dataForm.get('GUI_Track')?.value,
          PUR_GUINo:
            row.PUR_GUINo ??
            row.InvoiceNumber ??
            this.dataForm.get('PUR_GUINo')?.value,
          Inv_Date:
            row.Inv_Date ??
            row.InvoiceDate ??
            this.dataForm.get('Inv_Date')?.value,
          PUR_GUIDate:
            row.PUR_GUIDate ??
            row.Ret_Date ??
            this.dataForm.get('PUR_GUIDate')?.value,

          // ⭐ 在這裡轉：21/25→23、22→24
          PUR_VoucherType: this.normalizeVoucherType(rawVoucherType),

          PUR_RepYYYYMM: this.normalizeYYYYMMForControl(repRaw),
          Credit_Type:
            row.Credit_Type ?? this.dataForm.get('Credit_Type')?.value,
          PUR_TaxType:
            row.PUR_TaxType ?? this.dataForm.get('PUR_TaxType')?.value,
          Inv_Net:
            row.Inv_Net ??
            row.PUR_Net ??
            this.dataForm.get('Inv_Net')?.value,
          Inv_Tax:
            row.Inv_Tax ??
            row.PUR_Tax ??
            this.dataForm.get('Inv_Tax')?.value,
          PUR_Net: row.PUR_Net ?? this.dataForm.get('PUR_Net')?.value,
          PUR_Tax: row.PUR_Tax ?? this.dataForm.get('PUR_Tax')?.value,
          PUR_Amt: row.PUR_Amt ?? this.dataForm.get('PUR_Amt')?.value,
          Total_hitory_PUR_Amt:
            row.Total_hitory_PUR_Amt ??
            this.dataForm.get('Total_hitory_PUR_Amt')?.value,
          Total_Amt:
            row.Total_Amt ?? this.dataForm.get('Total_Amt')?.value,
          Source_Doc_No:
            row.Source_Doc_No ??
            this.dataForm.get('Source_Doc_No')?.value,
          Voucher_No:
            row.Voucher_No ?? this.dataForm.get('Voucher_No')?.value,
        },
        { emitEvent: false },
      );
    }

    // 狀態控制（Create / Edit / Read）
    this.updateDisabledState();

    // 監聽字軌 / 發票號碼，撈 APS 發票清單 + 對應資料
    this.setupTrackNoWatcher();
    this.setupGuiNoAndCorrespondWatcher();

    // 金額互算 + 剩餘總金額 + 區別判斷
    this.setupAmountRelations();

    // Create 模式：預設今天 + 當期雙月的申報年月
    if (this.crudstatus === CRUDStatus.Create) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      let evenMonth = month % 2 === 0 ? month : month + 1;
      if (evenMonth > 12) {
        evenMonth = 12;
      }
      const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;

      this.dataForm.patchValue(
        {
          PUR_GUIDate: today, // 退出/折讓日期 = 今日
          PUR_RepYYYYMM: repYYYYMM,
        },
        { emitEvent: false },
      );
    }

    // 編輯 / 檢視：依目前 GUI_Track + PUR_GUINo 撈 APS 對應資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadInvoiceInfoByCurrentGUINo();
    }
  }

  /* ==================== GUI_Track + PUR_GUINo 對應資料 ==================== */

  // 依目前 GUI_Track + PUR_GUINo 撈 APS 對應資料
  private loadInvoiceInfoByCurrentGUINo(): void {
    const trackRaw = this.dataForm.get('GUI_Track')?.value as string | null;
    const guiNoRaw = this.dataForm.get('PUR_GUINo')?.value as string | null;

    const track = trackRaw?.trim();
    const guiNo = guiNoRaw?.trim();

    if (!track || !guiNo) return;

    const full = `${track}${guiNo}`;

    // 如果你有這個控制項就寫，沒有可以拿掉
    this.dataForm.patchValue(
      { InvoiceNumber_Correspond: full },
      { emitEvent: false },
    );

    // ✅ 根據實際 API 名稱與參數調整：Swagger 要的是 PUR_GUINo_Correspond
    this.fin13010Service
      .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
      .subscribe((res) => {
    const detail = res?.Data?.[0];
        if (detail) {
          // 先拿原始值，再做 21/25→23、22→24 的轉換
          const rawVoucherType =
            (detail as any).PUR_VoucherType ??
            (detail as any).InvoiceType ??
            '';

          const voucherType = this.normalizeVoucherType(rawVoucherType);

          // 原始「剩餘總金額」來源：優先 Total_Amt，其次 PUR_Amount / PUR_Amt
          const rawOriginal =
            (detail as any).Total_Amt ??
            (detail as any).PUR_Amount ??
            (detail as any).PUR_Amt ??
            null;

          const original =
            rawOriginal !== null && rawOriginal !== undefined
              ? Number(rawOriginal)
              : null;

          this.originalRemainingAmt =
            original !== null && !isNaN(original)
              ? this.roundToInt(original)
              : null;

          // 目前畫面上的退回/折讓總金額
          const currentAmtRaw = this.dataForm.get('PUR_Amt')?.value;
          const currentTotal =
            currentAmtRaw === null ||
            currentAmtRaw === undefined ||
            currentAmtRaw === ''
              ? null
              : this.roundToInt(Number(currentAmtRaw));

          // 剩餘總金額 = 原始剩餘 - 本次退回（若本次尚未輸入，就顯示原始剩餘）
          const remaining =
            this.originalRemainingAmt !== null &&
            !isNaN(this.originalRemainingAmt) &&
            currentTotal !== null &&
            !isNaN(currentTotal)
              ? this.roundToInt(this.originalRemainingAmt - currentTotal)
              : this.originalRemainingAmt;

          this.dataForm.patchValue(
            {
              Inv_Date: (detail as any).PUR_GUIDate ?? (detail as any).InvoiceDate,
              Inv_Net: (detail as any).PUR_Net,
              Inv_Tax: (detail as any).PUR_Tax,
              PUR_VoucherType: voucherType ? String(voucherType) : '',
              PUR_TaxType: (detail as any).PUR_TaxType,
              Total_hitory_PUR_Amt: (detail as any).Total_hitory_PUR_Amt,
              Total_Amt: remaining,
            },
            { emitEvent: false },
          );

          this.updateCreditTypeByAmount(currentTotal);
        } else {
          this.originalRemainingAmt = null;
          this.dataForm.patchValue(
            {
              Inv_Date: null,
              Inv_Net: null,
              Inv_Tax: null,
              PUR_VoucherType: '',
              PUR_TaxType: '',
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


  /** 字軌變動時，撈該字軌所有發票號碼（下拉選單用） */
private setupTrackNoWatcher(): void {
  const trackControl = this.dataForm.get('GUI_Track');

  if (trackControl) {
    trackControl.valueChanges.subscribe((trackNo) => {
      if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
        this.fin13010Service
          .queryINV1000List({ GUI_Track: trackNo.trim() })
          .subscribe((res) => {
            this.guiNumberOptions = (res.Data || []).map((item: any) => ({
              label: item.PUR_GUINo,  // ✅ 顯示文字
              value: item.PUR_GUINo,  // ✅ 寫回表單的值
            }));
          });
      } else {
        this.guiNumberOptions = [];
      }
    });
  }
}
  private normalizeVoucherType(raw: any): string {
    const v = String(raw ?? '').trim();
    if (v === '21' || v === '25') return '23';
    if (v === '22') return '24';
    return v;
  }

  /** 監聽 GUI_Track 與 PUR_GUINo，只要有變動就重撈對應資料 */
  private setupGuiNoAndCorrespondWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    const noControl = this.dataForm.get('PUR_GUINo');

    if (trackControl && noControl) {
      const trigger = () => this.loadInvoiceInfoByCurrentGUINo();
      trackControl.valueChanges.subscribe(trigger);
      noControl.valueChanges.subscribe(trigger);
    }
  }

  /* ==================== 欄位啟用 / 停用 ==================== */

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      // 編輯模式：只有這些欄位可以改
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
      // 檢視模式：全鎖
      this.dataForm.disable();
    } else {
      // Create 模式：先全部啟用，再鎖一些欄位
      this.dataForm.enable();
    }

    // 不論狀態一律禁止的欄位（系統自帶或計算）
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('Voucher_No')?.disable();
  }

  /* ==================== 金額互算 + 區別判斷 ==================== */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net'); // 退出/折讓金額
    const taxControl = this.dataForm.get('PUR_Tax'); // 退出/折讓稅額（自動）
    const amtControl = this.dataForm.get('PUR_Amt'); // 退回/折讓總金額
    const remainingControl = this.dataForm.get('Total_Amt'); // 剩餘總金額
    const invNetControl = this.dataForm.get('Inv_Net'); // 銷售額（原始）

    if (!netControl || !taxControl || !amtControl || !remainingControl) {
      return;
    }

    let updatingFromNet = false;
    let updatingFromAmt = false;

    // 使用者輸入「退出/折讓金額」
    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt) return;
      updatingFromNet = true;

      if (value === null || value === undefined || value === '') {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, {
          emitEvent: false,
        });
        this.updateCreditTypeByAmount(null);
        updatingFromNet = false;
        return;
      }

      let netInt = this.roundToInt(Number(value));
      if (isNaN(netInt)) {
        updatingFromNet = false;
        return;
      }

      // 不可大於銷售額
      const invNetRaw = invNetControl?.value;
      const invNet =
        invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
          ? null
          : Number(invNetRaw);

      if (invNet !== null && !isNaN(invNet) && netInt > invNet) {
        this.messageService.errorBubble('退出/折讓金額不可大於銷售額');
        netInt = this.roundToInt(invNet);
      }

      // 先算稅額 & 總額（假設 5% 稅）
      let taxInt = this.roundToInt(netInt * 0.05);
      let totalInt = this.roundToInt(netInt + taxInt);

      // 退回/折讓總金額 不可大於 剩餘總金額（原始）
      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
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
          ? this.roundToInt(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromNet = false;
    });

    // 使用者直接修改「退回/折讓總金額」
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || value === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, {
          emitEvent: false,
        });
        this.updateCreditTypeByAmount(null);
        updatingFromAmt = false;
        return;
      }

      let totalInt = this.roundToInt(Number(value));
      if (isNaN(totalInt)) {
        updatingFromAmt = false;
        return;
      }

      // 退回/折讓總金額 不可大於 剩餘總金額
      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
        totalInt > this.originalRemainingAmt
      ) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        totalInt = this.roundToInt(this.originalRemainingAmt);
      }

      // total = net + tax，假設稅 5%
      let approxNet = totalInt / 1.05;
      let netInt = this.roundToInt(approxNet);
      let taxInt = totalInt - netInt;

      // 退出/折讓金額不可大於銷售額
      const invNetRaw = invNetControl?.value;
      const invNet =
        invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
          ? null
          : Number(invNetRaw);

      if (invNet !== null && !isNaN(invNet) && netInt > invNet) {
        this.messageService.errorBubble('退出/折讓金額不可大於銷售額');
        netInt = this.roundToInt(invNet);
        taxInt = this.roundToInt(netInt * 0.05);
        totalInt = this.roundToInt(netInt + taxInt);

        // 再檢查一次 total 不可大於 原始剩餘
        if (
          this.originalRemainingAmt !== null &&
          !isNaN(this.originalRemainingAmt) &&
          totalInt > this.originalRemainingAmt
        ) {
          totalInt = this.roundToInt(this.originalRemainingAmt);
          approxNet = totalInt / 1.05;
          netInt = this.roundToInt(approxNet);
          taxInt = totalInt - netInt;
        }
      }

      amtControl.setValue(totalInt, { emitEvent: false });
      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromAmt = false;
    });
  }

  /**
   * 區別：
   *  - totalAmt === originalRemainingAmt → 退出 (R)
   *  - 0 < totalAmt < originalRemainingAmt → 折讓 (C)
   */
  private updateCreditTypeByAmount(totalAmt: number | null): void {
    const creditControl = this.dataForm.get('Credit_Type');
    if (!creditControl) return;

    if (
      totalAmt === null ||
      totalAmt === undefined ||
      isNaN(totalAmt) ||
      totalAmt <= 0 ||
      this.originalRemainingAmt === null ||
      isNaN(this.originalRemainingAmt) ||
      this.originalRemainingAmt <= 0
    ) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    const t = this.roundToInt(totalAmt);
    const origin = this.roundToInt(this.originalRemainingAmt);

    if (t === origin) {
      creditControl.setValue('R', { emitEvent: false }); // 退出
    } else if (t < origin) {
      creditControl.setValue('C', { emitEvent: false }); // 折讓
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }

  /* ==================== 年月處理 ==================== */

  /** 後端 / rowdata 的 YYYYMM 轉成控制項用的六碼 YYYYMM */
  private normalizeYYYYMMForControl(raw: any): string | null {
    if (!raw) return null;
    const only = String(raw).replace(/\D/g, '');
    if (only.length < 6) return null;
    return only.slice(0, 6); // 例如 "2026/02" -> "202602"
  }

  /** year-month 控制值 -> YYYYMM 傳回後端 */
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

  /* ==================== 送出 ==================== */

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (form.invalid) {
        this.messageService.warnBubble('請先修正表單錯誤');
        return;
      }

      const raw = form.getRawValue() as any;

      // year-month 轉 YYYYMM
      raw.PUR_RepYYYYMM = this.toYYYYMM(raw.PUR_RepYYYYMM);

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13010Service.insertFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('success_message'),
            );
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('create_failed'),
            );
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        raw.id = this.rowdata?.id;

        this.fin13010Service.updateFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully'),
            );
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('update_failed'),
            );
          },
        });
      }
    });
  }

  /** 返回按鈕：一律帶 fromCru=true，讓查詢頁還原條件 */
  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13010'], {
      state: { fromCru: true },
    });
  }

  // 清除：如果你有需要，也可以再客製
  onClear(): void {
    this.dataForm.reset();
    this.dataForm.markAsPristine();
    this.originalRemainingAmt = null;
    this.updateDisabledState();
  }
}
