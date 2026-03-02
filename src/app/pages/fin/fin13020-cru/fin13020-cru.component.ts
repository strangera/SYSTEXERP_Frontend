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
import { environment } from 'src/environments/environment';

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
    .queryCorrespondByGUINoCorrespond({
      InvoiceNumber_Correspond: full,
      Source: 'APS', // ✅ 預設 APS
    })
    .subscribe((res) => {
      const detail = res?.Data?.[0];
      if (!detail) {
        this.originalRemainingAmt = null;
        this.detailRows = [];
        this.dataForm.patchValue(
          {
            Inv_Date: null,
            PUR_VoucherType: '',
            PUR_TaxType: '',
            Inv_Net: null,
            Inv_Tax: null,
            Total_hitory_PUR_Amt: null,
            Total_Amt: null,
            PUR_Amt: null,
            PUR_Net: null,
            PUR_Tax: null,
            Credit_Type: '',
          },
          { emitEvent: false }
        );
        return;
      }

      const invoiceType = (detail.InvoiceType as string | undefined) ?? '';
      let voucherType = '';
      if (invoiceType === '31' || invoiceType === '35') voucherType = '33';
      else if (invoiceType === '32') voucherType = '34';
      else voucherType = invoiceType || '';

      // ✅ 原始剩餘（後端回 Total_Amt / 或 PUR_Amount 等你原本容錯）
      const rawOriginal =
        (detail as any).PUR_Amount ??
        (detail as any).PUR_Amt ??
        (detail as any).Total_Amt ??
        null;

      const original =
        rawOriginal !== null && rawOriginal !== undefined ? Number(rawOriginal) : null;

      this.originalRemainingAmt =
        original !== null && !isNaN(original) ? this.roundToInt(original) : null;

      // ✅ 先把明細帶進來（新增頁面要直接出現）
      const details = (detail.Details ?? []) as any[];
      this.detailRows = details.map((d) => ({
        // 新增模式：後端通常不會給明細 ID，就先不帶
        ID: d.ID ?? null,
        PLU_Name: d.PLU_Name ?? '',
        TXN_Qty: d.TXN_Qty ?? null,
        PLU_SalePrc: d.PLU_SalePrc ?? null,
        TXN_SaleAmt: d.TXN_SaleAmt ?? null,
      }));

      // ✅ 主檔欄位帶入
      this.dataForm.patchValue(
        {
          Inv_Date: detail.InvoiceDate,
          PUR_VoucherType: voucherType,
          PUR_TaxType: detail.PUR_TaxType,
          Inv_Net: detail.PUR_Net,
          Inv_Tax: detail.PUR_Tax,
          Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt,
        },
        { emitEvent: false }
      );

      // ✅ 用明細金額回寫 PUR_Amt（會觸發 setupAmountRelations 連動計算稅、剩餘、Credit_Type）
      this.syncPurAmtFromDetails();

      // 如果明細沒東西，你也可以選擇把 PUR_Amt 清空
      // this.dataForm.get('PUR_Amt')?.setValue(this.detailRows.length ? ... : null, { emitEvent: true });
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
  const noControl = this.dataForm.get('PUR_GUINo');
  if (!noControl) return;

  noControl.valueChanges.subscribe(() => {
    // ✅ 發票號碼變更：用 API 回來的資料重新填主檔+明細
    this.reloadByInvoiceCorrespond();
  });
}
private reloadByInvoiceCorrespond(): void {
  const track = (this.dataForm.get('GUI_Track')?.value as string | null)?.trim();
  const guiNo = (this.dataForm.get('PUR_GUINo')?.value as string | null)?.trim();
  if (!track || !guiNo) return;

  const full = `${track}${guiNo}`;
  this.dataForm.patchValue({ InvoiceNumber_Correspond: full }, { emitEvent: false });

  // ✅ 先清掉舊資料，避免殘留
  this.detailRows = [];
  this.originalRemainingAmt = null;

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
    },
    { emitEvent: false }
  );

  this.fin13020Service
    .queryCorrespondByGUINoCorrespond({
      InvoiceNumber_Correspond: full,
      Source: 'APS', // ✅ 預設 APS
    })
    .subscribe((res) => {
      const dto = res?.Data?.[0];
      if (!dto) return;

      // ✅ 發票格式 mapping：31/35 -> 33，32 -> 34
      const invoiceType = String(dto.InvoiceType ?? '');
      let voucherType = invoiceType;
      if (invoiceType === '31' || invoiceType === '35') voucherType = '33';
      else if (invoiceType === '32') voucherType = '34';

      // ✅ 原始剩餘總金額（你的 API 回 Total_Amt）
      const original = dto.Total_Amt !== null && dto.Total_Amt !== undefined ? Number(dto.Total_Amt) : null;
      this.originalRemainingAmt =
        original !== null && !isNaN(original) ? this.roundToInt(original) : null;

      // ✅ 主檔欄位一次帶入（emitEvent:false，避免觸發金額互算兩次）
      this.dataForm.patchValue(
        {
          Inv_Date: dto.InvoiceDate,          // 發票日期（顯示）
          PUR_VoucherType: voucherType,       // 發票格式（顯示/送出）
          PUR_TaxType: dto.PUR_TaxType,       // 課稅別（顯示）
          Inv_Net: dto.PUR_Net,               // 銷售額（顯示）
          Inv_Tax: dto.PUR_Tax,               // 稅額（顯示）
          Total_hitory_PUR_Amt: dto.Total_hitory_PUR_Amt,
          Total_Amt: this.originalRemainingAmt, // 先放原始剩餘，後面會被 amtControl 連動改成剩餘
        },
        { emitEvent: false }
      );

      // ✅ 明細表帶入
      const details = Array.isArray(dto.Details) ? dto.Details : [];
      this.detailRows = details.map((d: any) => ({
        ID: d.ID ?? null,
        PLU_Name: d.PLU_Name ?? '',
        TXN_Qty: d.TXN_Qty ?? null,
        PLU_SalePrc: d.PLU_SalePrc ?? null,
        TXN_SaleAmt: d.TXN_SaleAmt ?? null,
      }));

      // ✅ 用明細加總回寫 PUR_Amt（emitEvent:true 才會觸發 setupAmountRelations 連動算 PUR_Net/PUR_Tax/Total_Amt/Credit_Type）
      this.syncPurAmtFromDetails();
    });
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
      const v = Number(row?.TXN_SaleAmt);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    const detailTotal = this.roundToInt(detailTotalRaw);

    const purAmtInt = this.toIntOrNull(formValue.PUR_Amt);
    if (purAmtInt !== null && purAmtInt !== detailTotal) {
      this.messageService.errorBubble('明細的金額加總必須等於「退回/折讓總金額」');
      return;
    }

    // ✅ 新規則基準：銷售額 Inv_Net
    const invNetInt = this.toIntOrNull(formValue.Inv_Net);
    if (invNetInt !== null && purAmtInt !== null && purAmtInt > invNetInt) {
      this.messageService.errorBubble('退回/折讓總金額不可大於銷售額');
      return;
    }

    // ✅ 依規則計算 Credit_Type：PUR_Amt vs Inv_Net
    const creditType = this.calcCreditTypeByInvNet(formValue.PUR_Amt, invNetInt);

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
        TXN_Ret_No: formValue.TXN_Ret_No,
        GUI_Track: formValue.GUI_Track,
        InvoiceNumber: formValue.PUR_GUINo,
        InvoiceDate: invoiceDate,
        InvoiceType: formValue.PUR_VoucherType,
        INV_DeclareYM: invDeclareYM,

        // ✅ 強制依規則送出（不要用 formValue.Credit_Type）
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

        // ✅ 強制依規則送出（不要用 formValue.Credit_Type）
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
  this.fin13020Service.insertFIN13020(payload).subscribe({
next: () => {
  this.messageService.successBubble('新增成功');

  const formValue = this.dataForm.getRawValue();

  const repYM = this.toYYYYMM(formValue.PUR_RepYYYYMM);

  const printPayload = {
    INV_DeclareYM: repYM,

    // ✅ 你指定：兩個都填 PUR_GUINo
    TXN_Ret_NoS: formValue.PUR_GUINo,
    TXN_Ret_NoE: formValue.PUR_GUINo,

    InvoiceTrack: formValue.GUI_Track,

    // 發票號碼區間（同一筆）
    InvoiceNumberS: formValue.PUR_GUINo,
    InvoiceNumberE: formValue.PUR_GUINo,
  };

 this.fin13020Service.printFIN13020(printPayload).subscribe({
  next: (resp) => this.openPrintResponse(resp),
  error: () => this.messageService.warnBubble?.('列印失敗（已新增成功）'),
});

  this.dataForm.reset();
  this.detailRows = [];
  this.originalRemainingAmt = null;
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
private openPrintResponse(resp: import('@angular/common/http').HttpResponse<Blob>) {
  const ct = resp.headers.get('content-type') || '';

  // ✅ 情況 1：後端直接回 PDF
  if (ct.includes('application/pdf')) {
    const url = URL.createObjectURL(resp.body!);
    window.open(url, '_blank');
    return;
  }

  // ✅ 情況 2：後端回 JSON（裡面有 Print_URL）
  // 因為我們用 responseType:'blob'，所以 JSON 會變成 blob，要轉成文字再 parse
  resp.body!.text().then((text) => {
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      // 不像 JSON 就直接開 blob（避免完全沒反應）
      const url = URL.createObjectURL(resp.body!);
      window.open(url, '_blank');
      return;
    }

    const printUrl = json?.Print_URL ?? json?.Data?.Print_URL ?? json?.Data?.[0]?.Print_URL;
    if (!printUrl) {
      this.messageService.warnBubble?.('列印回應未包含 Print_URL');
      return;
    }

    // ✅ 用後端的 host 開啟（不是前端 4200）
    // printUrl 是 "/temp/xxx.pdf" 這種相對路徑
    const base = environment.ApiUrl; // 例如 http://localhost:5142
    const fullUrl = `${base}${printUrl}`;

    window.open(fullUrl, '_blank');
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
        this.updateCreditTypeByInvNet(null);
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

      this.updateCreditTypeByInvNet(totalInt);
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
        this.updateCreditTypeByInvNet(null);
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

      this.updateCreditTypeByInvNet(totalInt);
      updatingFromAmt = false;
    });
  }

  /**
   * 區別：
   *  - totalAmt === originalRemainingAmt → 退出 (R)
   *  - 0 < totalAmt < originalRemainingAmt → 折讓 (C)
   */
/**
 * Credit_Type 規則（依銷售額 Inv_Net）：
 *  - PUR_Amt === Inv_Net -> 退出 (R)
 *  - PUR_Amt <  Inv_Net -> 折讓 (C)
 *  - PUR_Amt >  Inv_Net -> 不合法 -> ''
 */
private updateCreditTypeByInvNet(purAmt: number | null): void {
  const creditControl = this.dataForm.get('Credit_Type');
  const invNetControl = this.dataForm.get('Inv_Net');
  if (!creditControl || !invNetControl) return;

  const invNetRaw = invNetControl.value;
  const invNet =
    invNetRaw === null || invNetRaw === undefined || invNetRaw === ''
      ? null
      : this.roundToInt(Number(invNetRaw));

  if (
    purAmt === null ||
    purAmt === undefined ||
    isNaN(Number(purAmt)) ||
    Number(purAmt) <= 0 ||
    invNet === null ||
    isNaN(invNet) ||
    invNet <= 0
  ) {
    creditControl.setValue('', { emitEvent: false });
    return;
  }

  const p = this.roundToInt(Number(purAmt));
  const s = this.roundToInt(invNet);

  if (p === s) creditControl.setValue('R', { emitEvent: false });
  else if (p < s) creditControl.setValue('C', { emitEvent: false });
  else creditControl.setValue('', { emitEvent: false });
}

/** 給 onSubmit 用：直接回傳 'R' | 'C' | '' */
private calcCreditTypeByInvNet(purAmt: any, invNet: any): 'R' | 'C' | '' {
  const p = this.toIntOrNull(purAmt);
  const s = this.toIntOrNull(invNet);
  if (p === null || s === null || p <= 0 || s <= 0) return '';
  if (p === s) return 'R';
  if (p < s) return 'C';
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
  const sumRaw = (this.detailRows ?? []).reduce((sum, r) => {
    const v = Number(r?.TXN_SaleAmt);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const sum = this.roundToInt(sumRaw);

  const emit = !this.isRead; // ✅ 讀模式不觸發連動
  this.dataForm.get('PUR_Amt')?.setValue(this.detailRows?.length ? sum : null, { emitEvent: emit });

  if (this.isRead) {
    // 讀模式自己補 Total_Amt / Credit_Type（不靠 setupAmountRelations）
    const remaining =
      this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
        ? this.roundToInt(this.originalRemainingAmt - sum)
        : null;
    this.dataForm.patchValue(
      {
        Total_Amt: remaining,
      },
      { emitEvent: false }
    );
    this.updateCreditTypeByInvNet(sum);
  }
}
}