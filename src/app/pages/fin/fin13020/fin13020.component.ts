/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ValidationService } from '@shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import type { AddButton } from '@shared/componentkit/table-report/table-report.model';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-fin13020',
  templateUrl: './fin13020.component.html',
  styleUrls: ['./fin13020.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TranslateModule,
    YearMonthComponent,
    TableReportComponent,
  ],
})
export class FIN13020Component extends BasicQueryPageComponent<any> {
  PUR_VoucherTypeOptions: any[] = [
    { value: '33', label: '33-銷項三聯式銷貨退回或折讓證明單' },
    { value: '34', label: '34-銷項二聯式銷貨退回或折讓證明單' },
  ];

  queryForm = this.formBuilder.group({
    TXN_Ret_NoStart: [null, [Validators.maxLength(20)]],
    TXN_Ret_NoEnd: [null, [Validators.maxLength(20)]],
    GUI_Track: [null, [Validators.maxLength(2)]],

    InvoiceNumberStart: [null, [Validators.maxLength(10)]],
    InvoiceNumberEnd: [null, [Validators.maxLength(10)]],
    InvoiceDateStart: [null],
    InvoiceDateEnd: [null],
    InvoiceType: [null],

    INV_DeclareYM: [null as string | null],

    Source_Doc_NoStart: [null, [Validators.maxLength(16)]],
    Source_Doc_NoEnd: [null, [Validators.maxLength(16)]],
    Voucher_NoStart: [null, [Validators.maxLength(16)]],
    Voucher_NoEnd: [null, [Validators.maxLength(16)]],

    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  /** ✅ table-report 需要：保留最後一次查詢 body */
  lastQueryBody: any = null;

  /** ✅ 給 table-report 用：由它內部 loadMore / sort 時呼叫 */
  queryFIN13020Fn = (body: any) => this.fin13020Service.queryFIN13020(body);

  /**
   * ✅ 完全照後端回傳欄位（不做 mapping）
   * 後端回傳欄位範例：
   *  - ID, InvoiceTrack, InvoiceNumber, InvoiceType, InvoiceDate, Credit_Type, INV_DeclareYM, PUR_Net, PUR_Tax, TXN_Ret_No, Source_Doc_No, Voucher_No, Details...
   */
  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'InvoiceTrack', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '退出/折讓日期', visible: true, format: (v: any) => this.formatDateFromBackend(v) },
    { field: 'InvoiceType', header: '發票格式', visible: true },
    { field: 'Credit_Type', header: '區別', visible: true, format: (v: any) => this.formatCreditType(v) },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true, format: (v: any) => this.formatRepYYYYMM(v) },
    { field: 'PUR_Net', header: '退回/折讓金額', visible: true, format: (v: number) => this.money(v), exportFormat: 'number:comma2' },
    { field: 'PUR_Tax', header: '退回/折讓稅額', visible: true, format: (v: number) => this.money(v), exportFormat: 'number:comma2' },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
  ];

  buttonsLoading = false;

  addButtons: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print',
      action: (rowData: any) => this.onPrintOne(rowData),
      // 你要限制就留，不限制就拿掉 disabled
      disabled: (rowData: any) => this.editDisabled(rowData),
    },
  ];

  constructor(
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', '/FIN/FIN13020CRU');

    const fromCru = !!(history.state && history.state['fromCru']);
    if (fromCru) {
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) => this.onSubmit(f));
    } else {
      this.setDefaultDeclareYMByToday();
    }
  }

  /** ✅ 預設申報年月：偶數月 YYYYMM */
  private setDefaultDeclareYMByToday(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let evenMonth = month % 2 === 0 ? month : month + 1;
    if (evenMonth > 12) evenMonth = 12;

    const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;
    this.queryForm.patchValue({ INV_DeclareYM: repYYYYMM }, { emitEvent: false });
  }

  /* ---------- 顯示用格式 ---------- */

  formatCreditType(value: string): string {
    switch (value) {
      case 'C':
        return '折讓';
      case 'R':
        return '退出';
      default:
        return value;
    }
  }

  formatDateFromBackend(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  formatRepYYYYMM(value: string): string {
    if (!value) return '';
    const only = String(value).replace(/\D/g, '');
    if (only.length < 6) return String(value);
    return `${only.substring(0, 4)}/${only.substring(4, 6)}`;
  }

  money(v: number): string {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------- 查詢 ---------- */

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const raw = form.getRawValue();
    const payload: any = { ...raw };

    // trim + 空字串 => null
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    payload.INV_DeclareYM = this.toYYYYMM(payload.INV_DeclareYM);

    // ✅ table-report 需要：確保分頁/排序存在
    payload.pageIndex = payload.pageIndex ?? 1;
    payload.pageSize = payload.pageSize ?? 30;
    payload.SortBy = payload.SortBy ?? [{ field: 'ID', order: 1 }];

    // ✅ table-report 用來 loadMore / sort 時的基底條件
    this.lastQueryBody = { ...payload };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13020Service.queryFIN13020(payload).subscribe({
      next: (res: any) => {
        // ✅ 完全照後端回傳：不 mapping
        this.data = Array.isArray(res?.Data) ? res.Data : [];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        // ✅ 建議存 raw，還原 UI 最準
        this.queryStateService.setQueryState(this.ProgNo, raw);
      },
      error: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onClearForm(): void {
    this.queryForm.reset();

    // ✅ 保留 table-report 需要的預設分頁/排序
    this.queryForm.patchValue(
      {
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'ID', order: 1 }],
      },
      { emitEvent: false }
    );

    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;

    this.setDefaultDeclareYMByToday();
    (this.queryStateService as any).clearQueryState?.(this.ProgNo);
  }

  /* ---------- 勾選/管理限制：有傳票編號不可操作 ---------- */

  isRowSelectable = (row: any): boolean => {
    const v = row?.Voucher_No ?? row?.voucher_No ?? row?.VOUCHER_NO;
    if (v == null) return true;
    return String(v).trim() === '';
  };

  /** ✅ 你要「有傳票編號也不能編輯/明細」→ 直接共用同條件 */
  editDisabled = (row: any): boolean => !this.isRowSelectable(row);
  // detailDisabled = (row: any): boolean => !this.isRowSelectable(row);

  /* ---------- 刪除 ---------- */

  onDelete(selectedRows: any[]): void {
    if (!selectedRows || !selectedRows.length) {
      this.messageService.warnBubble('請先勾選要刪除的資料');
      return;
    }

    const deletableRows = selectedRows.filter((r) => this.isRowSelectable(r));
    const blockedRows = selectedRows.length - deletableRows.length;

    if (!deletableRows.length) {
      this.messageService.warnBubble('已拋轉有傳票號碼的資料不可刪除');
      return;
    }

    if (blockedRows > 0) {
      this.messageService.infoBubble(`已忽略 ${blockedRows} 筆有傳票號碼的資料，僅刪除其餘未拋轉資料`);
    }

    const idList = deletableRows
      .map((r) => Number(r.ID ?? r.id ?? r.Id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!idList.length) {
      this.messageService.warnBubble('找不到可刪除的資料主鍵（ID）。');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13020Service.deleteFIN13020(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.messageService.errorBubble('刪除失敗');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  /* ---------- 工具：YYYYMM 轉換 ---------- */

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
    private onPrintOne(row: any): void {
    // row 來源就是 queryFIN13020 回傳的那筆
    const invYM = String(row?.INV_DeclareYM ?? '').trim();
    const txn = String(row?.TXN_Ret_No ?? '').trim();
    const track = String(row?.InvoiceTrack ?? '').trim();
    const invNo = String(row?.InvoiceNumber ?? '').trim();

    if (!invYM || !txn) {
      this.messageService.warnBubble('此筆資料缺少申報年月或退出/折讓單號，無法列印');
      return;
    }

    const { mid, SYS_StoreNo } = this.getUserInfoFromLocal();

    const payload = {
      INV_DeclareYM: invYM,
      TXN_Ret_NoS: txn,
      TXN_Ret_NoE: txn,
      InvoiceTrack: track || '',
      InvoiceNumberS: invNo || '',
      InvoiceNumberE: invNo || '',
      Mid: mid,
      STO_No: SYS_StoreNo,
    };

    // this.buttonsLoading = true;

    this.fin13020Service.printFIN15100(payload).subscribe({
      next: (res) => {
        const rawUrl: string | undefined =
          res?.Data?.Print_URL ?? res?.Data?.[0]?.Print_URL;

        if (!rawUrl) {
          this.messageService.warnBubble('取得列印網址失敗（Print_URL 為空）');
          console.error('API 回傳無 Print_URL：', res);
          return;
        }

        const finalUrl = rawUrl.startsWith('http')
          ? rawUrl
          : this.joinUrlNoEncode(environment.ApiUrl, rawUrl);

        window.open(finalUrl, '_blank', 'noopener');
      },
   error: (err) => {
  const msg = err?.error?.Message || err?.message || '列印失敗';
  if (String(msg).includes("Value cannot be null") || String(msg).includes("Parameter 's'")) {
    this.messageService.errorBubble('列印失敗：後端資料的「原始發票日期」為空（ORG_INV_Date），請找後端或確認該筆資料來源。');
  } else {
    this.messageService.errorBubble(msg);
  }
  console.error('PrintFIN15100 error:', err);
},
      complete: () => {
        this.buttonsLoading = false;
      },
    });
  }

  private joinUrlNoEncode(base: string, path: string): string {
    const cleanBase = base.replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  private getUserInfoFromLocal(): { mid: number; SYS_StoreNo: string } {
    let mid = 0;
    let SYS_StoreNo = '';
    try {
      const raw = localStorage.getItem('UserInfo');
      if (raw) {
        const obj = JSON.parse(raw);
        mid = Number(obj?.mid ?? 0);
        SYS_StoreNo = String(obj?.SYS_StoreNo ?? '');
      }
    } catch (e) {
      console.error('解析 localStorage.UserInfo 失敗：', e);
    }
    return { mid, SYS_StoreNo };
  }
}

