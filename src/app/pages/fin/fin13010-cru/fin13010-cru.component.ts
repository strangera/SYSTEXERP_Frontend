/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { ValidationService } from '@shared/service/validation.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

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
    InputNumberComponent,
    NgIf,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN13010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  guiNumberOptions: { label: string; value: string }[] = [];

  /** APS 進項發票格式清單（顯示 / value 皆使用「映射後」的代碼，例如 21/25 → 23，22 → 24） */
  voucherTypeOptions: any[] = [
    { value: '23', label: '23-三聯式及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
    // 其他直接使用原代碼顯示：
    { value: '26', label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

  /** 區別：'C' 折讓、'R' 退出（程式依金額自動判斷，使用者不能改） */
  creditTypeOptions = [
    { label: '折讓', value: 'C' },
    { label: '退出', value: 'R' },
  ];

  /**
   * 從 APS2002 撈到的「原始剩餘總金額」，
   * 之後畫面上任何金額調整，剩餘總金額一律用這個基準來扣。
   */
  private originalRemainingAmt: number | null = null;

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null],

    GUI_Track: [null as string | null, Validators.required], // 字軌 (必填)
    PUR_GUINo: ['', Validators.required],                    // 發票號碼 (必填)
    PUR_GUINo_Correspond: [''],                              // 發票號碼(字軌+號碼)

    PUR_GUIDate: [null as any, Validators.required],         // 退出/折讓日期
    PUR_VoucherType: [null as string | null],                // 發票格式（由 APS 帶入 + disable）
    PUR_RepYYYYMM: [null as string | null],                  // 申報年月（YearMonthComponent 綁的 Control）

    Credit_Type: ['', Validators.required],                  // 區別（折讓/退出）→ 自動判斷
    PUR_TaxType: ['', Validators.required],                  // 稅別

    PUR_Net: [undefined as any],                             // 退出/折讓金額
    PUR_Tax: [undefined as any],                             // 退出/折讓稅額（自動計算，不可修改）
    PUR_Amt: [undefined as any],                             // 退回/折讓總金額

    Inv_Date: [undefined as any],                            // 發票日期
    Inv_Net: [undefined as any],                             // 銷售額
    Inv_Tax: [undefined as any],                             // 稅額

    Total_hitory_PUR_Amt: [undefined as any],                // 已退出/折讓歷史總金額
    Total_Amt: [undefined as any],                           // 剩餘總金額（原始剩餘 - 本次退回）

    TXN_Ret_No: ['系統自動帶入', Validators.required],        // 退出/折讓單號

    Source_Doc_No: [''],                                     // 憑證單號
    Voucher_No: [''],                                        // 傳票編號（永遠 disable）
  });

  constructor(
    private fin13010Service: FIN13010Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
  // 先讓 BasicCruPageComponent 幫你把後端資料 patch 進 dataForm（含 PUR_RepYYYYMM = "202602"）
  this.initializePage('FIN13010', this.dataForm);

  // ⭐ 編輯 / 檢視模式：
  // 一進畫面就先依目前 GUI_Track + PUR_GUINo 撈 APS 資料
  // （發票日期、銷售額、稅額、原始剩餘總金額等）
  if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
    this.loadInvoiceInfoByCurrentGUINo();
  }

  // 共用初始化
  this.updateDisabledState();
  this.setupTrackNoWatcher();
  this.setupGuiNoAndCorrespondWatcher();
  this.setupAmountRelations();

  // 固定禁用欄位（保險再鎖一次）
  this.dataForm.get('TXN_Ret_No')?.disable();
  this.dataForm.get('PUR_VoucherType')?.disable();
  this.dataForm.get('PUR_TaxType')?.disable();
  this.dataForm.get('Inv_Tax')?.disable();
  this.dataForm.get('Inv_Net')?.disable();
  this.dataForm.get('Inv_Date')?.disable();
  this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
  this.dataForm.get('Total_Amt')?.disable();
  this.dataForm.get('PUR_Tax')?.disable();
  this.dataForm.get('Credit_Type')?.disable();
  this.dataForm.get('Voucher_No')?.disable();

  // Create 模式：預設今天 + 當年月（✅ 這裡用 YYYYMM 給 YearMonthComponent 的 control）
  if (this.crudstatus === CRUDStatus.Create) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    this.dataForm.patchValue(
      {
        PUR_GUIDate: today,
        PUR_RepYYYYMM: `${year}${month}`, // 例如 202602
      },
      { emitEvent: false },
    );
  }
}


  /* ----------------- 共用：依 GUI_Track + PUR_GUINo 撈 APS2002 對應資料 ----------------- */

  private loadInvoiceInfoByCurrentGUINo(): void {
    const track = this.dataForm.get('GUI_Track')?.value?.toString().trim();
    const guiNo = this.dataForm.get('PUR_GUINo')?.value?.toString().trim();

    if (!track || !guiNo) {
      return;
    }

    const full = `${track}${guiNo}`;

    // 更新 PUR_GUINo_Correspond 欄位（如果後端有用）
    this.dataForm.patchValue(
      { PUR_GUINo_Correspond: full },
      { emitEvent: false },
    );

    this.fin13010Service
      .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];
        if (detail) {
          // 原始剩餘總金額（只在這裡設一次，之後都用這個基準扣）
          const rawOriginalRemaining =
            detail.Total_Amt ??
            detail.PUR_Amount ??
            detail.PUR_Amt ??
            null;

          const originalRemaining = rawOriginalRemaining != null
            ? Number(rawOriginalRemaining)
            : null;

          this.originalRemainingAmt =
            originalRemaining != null && !isNaN(originalRemaining)
              ? this.roundToInt(originalRemaining)
              : null;

          // 映射後的發票格式（21/25 → 23, 22 → 24）
          const mappedVoucherType = this.mapVoucherType(detail.PUR_VoucherType);

          this.dataForm.patchValue(
            {
              Inv_Date: detail.PUR_GUIDate ?? detail.InvoiceDate,
              Inv_Net: detail.PUR_Net,
              Inv_Tax: detail.PUR_Tax,
              PUR_TaxType: detail.PUR_TaxType,
              Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt,
              Total_Amt: this.originalRemainingAmt,   // 這是畫面一開始看到的剩餘總金額
              PUR_VoucherType: mappedVoucherType,
            },
            { emitEvent: false },
          );

          // 依目前「退回/折讓總金額 + 原始剩餘總金額」重新判斷 區別
          const currentAmtRaw = this.dataForm.get('PUR_Amt')?.value;
          const currentTotal =
            currentAmtRaw === null || currentAmtRaw === undefined || currentAmtRaw === ''
              ? null
              : this.roundToInt(Number(currentAmtRaw));
          this.updateCreditTypeByAmount(currentTotal);
        } else {
          // 查不到則清空
          this.originalRemainingAmt = null;
          this.dataForm.patchValue(
            {
              Inv_Date: null,
              Inv_Net: null,
              Inv_Tax: null,
              PUR_TaxType: '',
              PUR_Amt: null,
              Total_hitory_PUR_Amt: null,
              Total_Amt: null,
              Credit_Type: '',
              PUR_VoucherType: null,
            },
            { emitEvent: false },
          );
        }
      });
  }

  /** 21 / 25 → 23；22 → 24；其餘保持原值 */
  private mapVoucherType(source: any): string | null {
    const code = (source ?? '').toString();
    if (code === '21' || code === '25') return '23';
    if (code === '22') return '24';
    if (!code) return null;
    return code;
  }

  /* ----------------- 監聽字軌 & 發票號碼 ----------------- */

  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');

    if (trackControl) {
      trackControl.valueChanges.subscribe((trackNo) => {
        if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
          this.fin13010Service
            .queryINV1000List({ GUI_Track: trackNo.trim() })
            .subscribe((res) => {
              this.guiNumberOptions = (res.Data || []).map((item: any) => ({
                label: item.PUR_GUINo,
                value: item.PUR_GUINo,
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
      const trigger = () => {
        this.loadInvoiceInfoByCurrentGUINo();
      };

      trackControl.valueChanges.subscribe(trigger);
      noControl.valueChanges.subscribe(trigger);
    }
  }

  // 依照 CRUDStatus 控制哪些欄位可編輯
  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'Source_Doc_No',
        'PUR_Net',
        'PUR_Amt',
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
      this.dataForm.enable();
    }

    // 不論什麼狀態，以下欄位一律不可手動修改
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('Voucher_No')?.disable();
  }

  /* ----------------- 送出 ----------------- */

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      // 送後端前，先把金額三個欄位變成整數（或 null）
      const intNet = this.toIntOrNull(formValue.PUR_Net);
      const intTax = this.toIntOrNull(formValue.PUR_Tax);
      const intAmt = this.toIntOrNull(formValue.PUR_Amt);

      const payload: any = {
        id: formValue.id,
        GUI_Track: formValue.GUI_Track,
        PUR_GUINo: formValue.PUR_GUINo,
        PUR_GUIDate: formValue.PUR_GUIDate,
        PUR_VoucherType: formValue.PUR_VoucherType,
        PUR_RepYYYYMM: formValue.PUR_RepYYYYMM,
        Credit_Type: formValue.Credit_Type, // 由程式自動帶入 C/R
        PUR_TaxType: formValue.PUR_TaxType,
        PUR_Net: intNet,
        PUR_Tax: intTax,
        PUR_Amt: intAmt,
        Source_Doc_No: formValue.Source_Doc_No,
        Voucher_No: formValue.Voucher_No,
        TXN_Ret_No: formValue.TXN_Ret_No,
      };

      // ⭐ 把 YearMonthComponent 的值（可能是 "2026/02"）轉回 "202602" 給後端
      payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);

      // 退出/折讓日期不可小於發票日期
      const purDate = formValue.PUR_GUIDate ? new Date(formValue.PUR_GUIDate) : null;
      const invDate = formValue.Inv_Date ? new Date(formValue.Inv_Date) : null;
      if (purDate && invDate && purDate < invDate) {
        this.messageService.errorBubble('退出/折讓日期不可小於發票日期');
        return;
      }

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.fin13010Service.insertFIN13010(payload).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
              this.originalRemainingAmt = null;
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.fin13010Service.updateFIN13010(payload).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  /* ----------------- 金額互算 + 區別判斷 + 剩餘總金額 ----------------- */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net'); // 退出/折讓金額
    const taxControl = this.dataForm.get('PUR_Tax'); // 退出/折讓稅額（自動）
    const amtControl = this.dataForm.get('PUR_Amt'); // 退回/折讓總金額
    const remainingControl = this.dataForm.get('Total_Amt');
    const invNetControl = this.dataForm.get('Inv_Net');

    if (!netControl || !taxControl || !amtControl || !remainingControl) {
      return;
    }

    let updatingFromNet = false;
    let updatingFromAmt = false;

    // 使用者輸入「退出/折讓金額」時：
    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt) return;
      updatingFromNet = true;

      if (value === null || value === undefined || value === '') {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromNet = false;
        return;
      }

      let netInt = this.roundToInt(Number(value));
      if (isNaN(netInt)) {
        updatingFromNet = false;
        return;
      }

      // ① 限制：退出/折讓金額不得大於「銷售額」
      const invNetRaw = invNetControl?.value;
      const invNet =
        invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
          ? null
          : Number(invNetRaw);

      if (invNet !== null && !isNaN(invNet) && netInt > invNet) {
        this.messageService.errorBubble('退出/折讓金額不可大於銷售額');
        netInt = this.roundToInt(invNet);
      }

      // 先算稅額 & 總額
      let taxInt = this.roundToInt(netInt * 0.05);
      let totalInt = this.roundToInt(netInt + taxInt);

      // ② 限制：退回/折讓總金額不得大於「原始剩餘總金額」
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

      // ⭐ 剩餘總金額 = 「API 帶進來的原始剩餘」-「這次退回/折讓總金額」
      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromNet = false;
    });

    // 使用者直接改「退回/折讓總金額」時：
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      if (value === null || value === undefined || value === '') {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromAmt = false;
        return;
      }

      let totalInt = this.roundToInt(Number(value));
      if (isNaN(totalInt)) {
        updatingFromAmt = false;
        return;
      }

      // ① 限制：退回/折讓總金額不得大於「原始剩餘總金額」
      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
        totalInt > this.originalRemainingAmt
      ) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        totalInt = this.roundToInt(this.originalRemainingAmt);
      }

      // total = net + tax，tax = round(net * 0.05)
      let approxNet = totalInt / 1.05;
      let netInt = this.roundToInt(approxNet);
      let taxInt = totalInt - netInt;

      // ② 限制：退出/折讓金額不得大於「銷售額」
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
   * 依照「原始剩餘總金額」與「本次退回/折讓總金額」判斷：
   *  - totalAmt === originalRemainingAmt → 區別 = 退出 (R)
   *  - 0 < totalAmt < originalRemainingAmt → 區別 = 折讓 (C)
   *  - 其他 (含 0 或缺資料) → 區別空白
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
      creditControl.setValue('R', { emitEvent: false });
    } else if (t < origin) {
      creditControl.setValue('C', { emitEvent: false });
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
  }

  // 四捨五入為整數
  private roundToInt(value: number): number {
    return Math.round(value);
  }

  // 將任意值轉成整數（或 null）
  private toIntOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (isNaN(n)) return null;
    return this.roundToInt(n);
  }

  /** 從後端的值轉成 YearMonthComponent 看的字串，例如 202602 -> 2026/02 */
  private normalizeYYYYMMForControl(input: any): string | null {
    if (!input) return null;

    if (typeof input === 'string') {
      // 已經長得像 "2026/02" 就原樣回傳
      if (/^\d{4}\/\d{2}$/.test(input)) {
        return input;
      }

      // 只抓數字：202602 或 2026-02-01 這類全部只留 202602
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) {
        const y = onlyDigits.slice(0, 4);
        const m = onlyDigits.slice(4, 6);
        return `${y}/${m}`;
      }
    }

    // Date 物件
    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}/${m}`;
    }

    // 其他型別就試著 new Date 看看
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}/${m}`;
    }
    return null;
  }

  /** 給後端的格式：無論控件是 "2026/02" 或 Date，最後都轉成 "202602" */
  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, ''); // '2026/02' -> '202602'
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

  /** 清除表單，但保留指定欄位 */
  clearFormExcept(): void {
    const keepValues = ['PUR_GUINo'];
    const patch: any = {};
    keepValues.forEach((key) => {
      patch[key] = this.dataForm.get(key)?.value;
    });

    this.dataForm.reset();
    this.dataForm.patchValue(patch);
    this.originalRemainingAmt = null;
    this.updateDisabledState();
  }
}
