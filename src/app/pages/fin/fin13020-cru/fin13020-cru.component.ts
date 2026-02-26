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
   * 原始剩餘總金額（APS2002.PUR_Amount）
   */
  private originalRemainingAmt: number | null = null;

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null], // 主檔 ID（Update 用）

    GUI_Track: [null as string | null, Validators.required], // 字軌  (送 GUI_Track)
    PUR_GUINo: ['', Validators.required], // 發票號碼 (送 InvoiceNumber)
    InvoiceNumber_Correspond: [''], // 字軌+號碼，查對應用
    PUR_GUIDate: [null as any, Validators.required], // 退出/折讓日期 (送 InvoiceDate)
    // 控制項吃 "YYYY/MM"，送出時再轉 YYYYMM
    PUR_RepYYYYMM: [null as string | null], // 申報年月 (送 INV_DeclareYM)
    PUR_VoucherType: ['', Validators.required], // 發票格式 (送 InvoiceType)
    Credit_Type: ['', Validators.required], // 區別 (送 Credit_Type)
    PUR_TaxType: ['', Validators.required], // 課稅別 (送 PUR_TaxType)
    PUR_Net: [undefined as any], // 退出/折讓金額 (送 PUR_Net)
    PUR_Tax: [undefined as any], // 退出/折讓稅額 (送 PUR_Tax)
    PUR_Amt: [undefined as any], // 退回/折讓總金額 (送 PUR_Amt)
    Inv_Date: [undefined as any], // 發票日期（顯示用）
    Total_hitory_PUR_Amt: [undefined as any], // 已退出/折讓歷史總金額
    Total_Amt: [undefined as any], // 剩餘總金額（原始剩餘 - 本次退回）
    TXN_Ret_No: ['系統自動帶入', Validators.required], // 退出/折讓單號（顯示用）
    Inv_Net: [undefined as any], // 銷售額（顯示用，不送）
    Inv_Tax: [undefined as any], // 稅額（顯示用，不送）
    Source_Doc_No: [''], // 憑證單號 (送 Source_Doc_No)
    Voucher_No: [''], // 傳票編號（disable）
  });

  // ⭐ 明細陣列（對應 APS40235List / Details）
  detailRows: any[] = [];

  constructor(
    private apiService: FIN13010Service,
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    // 會把 crudstatus / rowdata / 權限帶進來
    this.initializePage('FIN13020', this.dataForm);

    // ⭐ 從查詢頁帶進來的資料（BasicCruPageComponent 幫你塞的）
    const row: any = (this as any).rowdata;

    if (row) {
      // 主檔 ID（優先用小寫 id，其次大寫 ID）
      const masterId = row.id ?? row.ID ?? null;

      // 申報年月來源：優先 PUR_RepYYYYMM，其次 INV_DeclareYM
      const repRaw =
        row.PUR_RepYYYYMM ??
        row.INV_DeclareYM ??
        this.dataForm.get('PUR_RepYYYYMM')?.value;

      this.dataForm.patchValue(
        {
          id: masterId,
          TXN_Ret_No: row.TXN_Ret_No ?? this.dataForm.get('TXN_Ret_No')?.value,

          GUI_Track: row.GUI_Track ?? row.InvoiceTrack ?? this.dataForm.get('GUI_Track')?.value,
          PUR_GUINo: row.PUR_GUINo ?? row.InvoiceNumber ?? this.dataForm.get('PUR_GUINo')?.value,
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

      // ⭐ 明細（APS40235List / Details）帶進來，保留每筆自己的 ID
      const details = (row.APS40235List ?? row.Details ?? []) as any[];
      this.detailRows = details.map((d) => ({
        ID: d.ID ?? null, // ⭐ 明細自己的 ID
        PLU_Name: d.PLU_Name,
        TXN_Qty: d.TXN_Qty,
        PLU_SalePrc: d.PLU_SalePrc,
        TXN_SaleAmt: d.TXN_SaleAmt,
      }));

      this.syncPurAmtFromDetails();
    }

    // 狀態控制（Create / Edit / Read）
    this.updateDisabledState();

    // 監聽字軌 / 發票號碼、金額關聯
    this.setupTrackNoWatcher();
    this.setupGuiNoAndCorrespondWatcher();
    this.setupAmountRelations();

    // 不論狀態一律禁止的欄位（再保險一次）
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('Voucher_No')?.disable();

    // ⭐ Create 模式：預設今天 + 當期雙月的 YYYYMM
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

    // ⭐ 編輯 / 檢視：依目前 GUI_Track + PUR_GUINo 撈對應資料
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadInvoiceInfoByCurrentGUINo();
    }
  }

  /* ----------------- 依目前 GUI_Track + PUR_GUINo 撈對應資料 ----------------- */

  private loadInvoiceInfoByCurrentGUINo(): void {
    const trackRaw = this.dataForm.get('GUI_Track')?.value as string | null;
    const guiNoRaw = this.dataForm.get('PUR_GUINo')?.value as string | null;

    const track = trackRaw?.trim();
    const guiNo = guiNoRaw?.trim();

    if (!track || !guiNo) return;

    const full = `${track}${guiNo}`;

    this.dataForm.patchValue({ InvoiceNumber_Correspond: full }, { emitEvent: false });

    this.fin13020Service
      .queryCorrespondByGUINoCorrespond({ InvoiceNumber_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];
        if (detail) {
          const invoiceType = (detail.InvoiceType as string | undefined) ?? '';

          // 31 / 35 -> 33，32 -> 34，顯示+送出都用 33/34
          let voucherType = '';
          if (invoiceType === '31' || invoiceType === '35') voucherType = '33';
          else if (invoiceType === '32') voucherType = '34';
          else voucherType = invoiceType || '';

          // 原始剩餘總金額：APS2002.PUR_Amount
          const rawOriginal =
            (detail as any).PUR_Amount ??
            (detail as any).PUR_Amt ??
            (detail as any).Total_Amt ??
            null;

          const original =
            rawOriginal !== null && rawOriginal !== undefined ? Number(rawOriginal) : null;

          this.originalRemainingAmt = original !== null && !isNaN(original) ? this.roundToInt(original) : null;

          // 目前畫面上的退回/折讓總金額
          const currentAmtRaw = this.dataForm.get('PUR_Amt')?.value;
          const currentTotal =
            currentAmtRaw === null || currentAmtRaw === undefined || currentAmtRaw === ''
              ? null
              : this.roundToInt(Number(currentAmtRaw));

          // 剩餘總金額 = 原始剩餘 - 本次退回
          const remaining =
            this.originalRemainingAmt !== null &&
            !isNaN(this.originalRemainingAmt) &&
            currentTotal !== null &&
            !isNaN(currentTotal)
              ? this.roundToInt(this.originalRemainingAmt - currentTotal)
              : this.originalRemainingAmt;

          this.dataForm.patchValue(
            {
              Inv_Date: detail.InvoiceDate,
              PUR_VoucherType: voucherType,
              PUR_TaxType: detail.PUR_TaxType,
              Inv_Net: detail.PUR_Net,
              Inv_Tax: detail.PUR_Tax,
              Total_hitory_PUR_Amt: (detail as any).Total_hitory_PUR_Amt,
              Total_Amt: remaining,
            },
            { emitEvent: false }
          );

          this.updateCreditTypeByAmount(currentTotal);
        } else {
          this.originalRemainingAmt = null;
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
            { emitEvent: false }
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
          this.fin13020Service.queryINV1000List({ GUI_Track: trackNo.trim() }).subscribe((res) => {
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

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = ['PUR_GUIDate', 'PUR_RepYYYYMM', 'Source_Doc_No', 'PUR_Net', 'PUR_Amt', 'Voucher_No'];
      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) control?.enable();
        else control?.disable();
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable(); // Create 模式
    }

    // 不論狀態一律禁止的欄位
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('TXN_Ret_No')?.disable();
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

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      // 日期檢核：退出/折讓日期不可小於發票日期
      const purDate = formValue.PUR_GUIDate ? new Date(formValue.PUR_GUIDate) : null;
      const invDate = formValue.Inv_Date ? new Date(formValue.Inv_Date) : null;
      if (purDate && invDate && purDate < invDate) {
        this.messageService.errorBubble('退出/折讓日期不可小於發票日期');
        return;
      }

      // 明細金額加總需與退回/折讓總金額相同
      const detailTotalRaw = this.detailRows.reduce((sum, row) => {
        const v = Number(row.TXN_SaleAmt);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
      const detailTotal = this.roundToInt(detailTotalRaw);

      const purAmtInt = this.toIntOrNull(formValue.PUR_Amt);
      if (purAmtInt !== null && purAmtInt !== detailTotal) {
        this.messageService.errorBubble('明細的金額加總必須等於「退回/折讓總金額」');
        return;
      }

      const intNet = this.toIntOrNull(formValue.PUR_Net);
      const intTax = this.toIntOrNull(formValue.PUR_Tax);
      const intAmt = this.toIntOrNull(formValue.PUR_Amt);

      const invoiceDate = formValue.PUR_GUIDate ? new Date(formValue.PUR_GUIDate) : null;
      const invDeclareYM = this.toYYYYMM(formValue.PUR_RepYYYYMM);

      this.loading = true;

      if (this.crudstatus === CRUDStatus.Edit) {
        // ✅ Update：完全照後端 payload（多帶 id）
        const payload: any = {
          id: formValue.id,
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
            ID: typeof row.ID === 'number' ? row.ID : 0,
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
              this.messageService.errorBubble(err?.error?.Message || '更新失敗，請聯絡系統管理員');
            },
            complete: () => {
              this.loading = false;
            },
          });
        } else {
          this.loading = false;
        }
      } else {
        // ✅ Insert：完全照後端 payload（不帶 id / 明細 ID）
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
              this.detailRows = [];
              this.originalRemainingAmt = null;
            },
            error: (err) => {
              this.loading = false;
              this.messageService.errorBubble(err?.error?.Message || '新增失敗，請聯絡系統管理員');
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

  // fin13020-cru.component.ts
  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13020'], {
      state: { fromCru: true },
    });
  }

  /* ------- 金額互算 + 剩餘總金額 + 區別判斷 ------- */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net'); // 退出/折讓金額
    const taxControl = this.dataForm.get('PUR_Tax'); // 退出/折讓稅額（自動）
    const amtControl = this.dataForm.get('PUR_Amt'); // 退回/折讓總金額
    const remainingControl = this.dataForm.get('Total_Amt');
    const invNetControl = this.dataForm.get('Inv_Net'); // 銷售額

    if (!netControl || !taxControl || !amtControl || !remainingControl) return;

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

      // f-2. 退出/折讓金額 不可大於 銷售額
      const invNetRaw = invNetControl?.value;
      const invNet =
        invNetRaw === null || invNetRaw === undefined || invNetRaw === '' ? null : Number(invNetRaw);

      if (invNet !== null && !isNaN(invNet) && netInt > invNet) {
        this.messageService.errorBubble('退出/折讓金額不可大於銷售額');
        netInt = this.roundToInt(invNet);
      }

      // 先算稅額 & 總額
      let taxInt = this.roundToInt(netInt * 0.05);
      let totalInt = this.roundToInt(netInt + taxInt);

      // f-1. 退回/折讓總金額 不可大於 剩餘總金額（原始剩餘）
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

      // 剩餘總金額 = 原始剩餘 - 本次退回/折讓總金額
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

      // f-1. 退回/折讓總金額 不可大於 剩餘總金額（原始剩餘）
      if (
        this.originalRemainingAmt !== null &&
        !isNaN(this.originalRemainingAmt) &&
        totalInt > this.originalRemainingAmt
      ) {
        this.messageService.errorBubble('退回/折讓總金額不可大於剩餘總金額');
        totalInt = this.roundToInt(this.originalRemainingAmt);
      }

      // total = net + tax，tax ≈ 5%
      let approxNet = totalInt / 1.05;
      let netInt = this.roundToInt(approxNet);
      let taxInt = totalInt - netInt;

      // f-2. 退出/折讓金額 不可大於 銷售額
      const invNetRaw = invNetControl?.value;
      const invNet =
        invNetRaw === null || invNetRaw === undefined || invNetRaw === '' ? null : Number(invNetRaw);

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

    if (t === origin) creditControl.setValue('R', { emitEvent: false });
    else if (t < origin) creditControl.setValue('C', { emitEvent: false });
    else creditControl.setValue('', { emitEvent: false });
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

      rowData.TXN_SaleAmt = this.roundToInt(TXN_Qty * PLU_SalePrc);

      // ✅ 每次明細金額變更 → 回寫 PUR_Amt
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

  /** 後端 / rowdata 的 YYYYMM 轉成控制項用的 YYYYMM（YearMonthComponent 吃 6 碼） */
  private normalizeYYYYMMForControl(raw: any): string | null {
    if (!raw) return null;
    const only = String(raw).replace(/\D/g, '');
    if (only.length < 6) return null;
    return only.slice(0, 6);
  }

  get isRead(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  private optionLabelOf(opts: Array<{ label: string; value: any }>, value: any): string {
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

  private syncPurAmtFromDetails(): void {
    if (this.isRead) return;

    const sumRaw = (this.detailRows ?? []).reduce((sum, r) => {
      const v = Number(r?.TXN_SaleAmt);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

    const sum = this.roundToInt(sumRaw);

    // ✅ 回寫「退回/折讓總金額」：emitEvent 要 true，才能觸發 setupAmountRelations() 的 amtControl.valueChanges
    this.dataForm.get('PUR_Amt')?.setValue(this.detailRows?.length ? sum : null, { emitEvent: true });
  }
}