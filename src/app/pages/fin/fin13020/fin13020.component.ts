/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { createPaginationConfig } from '../../../others/component/table/table.model';
import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

// UI
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import type { AddButton } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { environment } from 'src/environments/environment';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin13020',
  templateUrl: './fin13020.component.html',
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
export class FIN13020Component extends BasicQueryPageComponent<any> implements OnInit {
  PUR_VoucherTypeOptions: { label: string; value: string }[] = [];

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

  /** table-report 需要：保留最後一次查詢 body */
  lastQueryBody: any = null;

  /** 給 table-report 用：由它內部 loadMore / sort 時呼叫 */
  queryFIN13020Fn = (body: any) => this.fin13020Service.queryFIN13020(body);

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
      disabled: (rowData: any) => this.editDisabled(rowData),
    },
  ];

  constructor(
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', '/FIN/FIN13020CRU');
    this.loadDropdownOptions();

    const fromCru = !!(history.state && history.state['fromCru']);
    if (fromCru) {
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) => this.onSubmit(f));
    } else {
      this.setDefaultDeclareYMByToday();
    }
  }

  private loadDropdownOptions(): void {
    // 載入發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe((r) => {
      this.PUR_VoucherTypeOptions = r.Data.INV_GUITypes
        .filter((item) => ['33', '34'].includes(item.INV_GUIType))
        .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
        .map((item) => ({ label: `${item.INV_GUIType}-${item.INV_GUIName}`, value: item.INV_GUIType }));
    });
  }

  private setDefaultDeclareYMByToday(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let evenMonth = month % 2 === 0 ? month : month + 1;
    if (evenMonth > 12) evenMonth = 12;

    const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;
    this.queryForm.patchValue({ INV_DeclareYM: repYYYYMM }, { emitEvent: false });
  }

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

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const raw = form.getRawValue();
    const payload: any = { ...raw };

    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    payload.INV_DeclareYM = this.toYYYYMM(payload.INV_DeclareYM);
    payload.pageIndex = payload.pageIndex ?? 1;
    payload.pageSize = payload.pageSize ?? 30;
    payload.SortBy = payload.SortBy ?? [{ field: 'ID', order: 1 }];

    this.lastQueryBody = { ...payload };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13020Service.queryFIN13020(payload).subscribe({
      next: (res: any) => {
        this.data = Array.isArray(res?.Data) ? res.Data : [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
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

  isRowSelectable = (row: any): boolean => {
    const v = row?.Voucher_No ?? row?.voucher_No ?? row?.VOUCHER_NO;
    if (v == null) return true;
    return String(v).trim() === '';
  };

  editDisabled = (row: any): boolean => !this.isRowSelectable(row);

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
    const invYM = String(row?.INV_DeclareYM ?? '').trim();
    const txn = String(row?.TXN_Ret_No ?? '').trim();
    const track = String(row?.InvoiceTrack ?? '').trim();
    const invNo = String(row?.InvoiceNumber ?? '').trim();

    if (!invYM || !txn) {
      this.messageService.warnBubble('此筆資料缺少申報年月或退出/折讓單號，無法列印');
      return;
    }

    const payload = {
      INV_DeclareYM: invYM,
      TXN_Ret_NoS: txn,
      TXN_Ret_NoE: txn,
      InvoiceTrack: track || '',
      InvoiceNumberS: invNo || '',
      InvoiceNumberE: invNo || '',
    };

    this.buttonsLoading = true;

    this.fin13020Service.printFIN13020(payload).subscribe({
      next: (resp: HttpResponse<Blob>) => this.openPrintResponse(resp),
      error: (err) => {
        const msg = err?.error?.Message || err?.message || '列印失敗';
        this.messageService.errorBubble(msg);
        console.error('printFIN13020 error:', err);
      },
      complete: () => {
        this.buttonsLoading = false;
      },
    });
  }

  private openPrintResponse(resp: HttpResponse<Blob>) {
    const ct = resp.headers.get('content-type') || '';

    if (ct.includes('application/pdf')) {
      const url = URL.createObjectURL(resp.body!);
      globalThis.open(url, '_blank');
      return;
    }

    resp.body!.text().then((text) => {
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        const url = URL.createObjectURL(resp.body!);
        globalThis.open(url, '_blank');
        return;
      }

      const printUrl = json?.Print_URL ?? json?.Data?.Print_URL ?? json?.Data?.[0]?.Print_URL;
      if (!printUrl) {
        this.messageService.warnBubble?.('列印回應未包含 Print_URL');
        return;
      }

      const base = environment.ApiUrl;
      const fullUrl = `${base}${printUrl}`;

      globalThis.open(fullUrl, '_blank');
    });
  }
}