/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
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

@Component({
  selector: 'app-fin13010',
  templateUrl: './fin13010.component.html',
  styleUrls: ['./fin13010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    YearMonthComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class FIN13010Component extends BasicQueryPageComponent<any> {
  PUR_VoucherTypeOptions: any[] = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '23', label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    { value: '26', label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  queryForm = this.formBuilder.group({
    TXN_Ret_NoStart: [null, [Validators.maxLength(20)]],
    TXN_Ret_NoEnd: [null, [Validators.maxLength(20)]],
    GUI_Track: [null, [Validators.maxLength(2)]],
    PUR_GUINoStart: [null, [Validators.maxLength(10)]],
    PUR_GUINoEnd: [null, [Validators.maxLength(10)]],
    PUR_GUIDateStart: [null],
    PUR_GUIDateEnd: [null],
    PUR_VoucherType: [null],
    PUR_RepYYYYMM: [null as string | null],
    Source_Doc_NoStart: [null, [Validators.maxLength(16)]],
    Source_Doc_NoEnd: [null, [Validators.maxLength(16)]],
    Voucher_NoStart: [null, [Validators.maxLength(16)]],
    Voucher_NoEnd: [null, [Validators.maxLength(16)]],
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  /** ✅ table-report 需要：保留最後一次查詢 body */
  lastQueryBody: any = null;

  /** ✅ 給 table-report 使用的 query function */
  queryFIN13010Fn = (body: any) => this.fin13010Service.queryFIN13010(body);

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'PUR_GUINo', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '發票日期', visible: true, format: (v: any) => this.formatDateFromBackend(v) },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    { field: 'Credit_Type', header: '區別', visible: true, format: (v: any) => this.formatCreditType(v) },
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true, format: (v: any) => this.formatRepYYYYMM(v) },
    { field: 'PUR_Amt', header: '銷售額', visible: true, format: (v: number) => this.money(v), exportFormat: 'number:comma2' },
    { field: 'PUR_Tax', header: '稅額', visible: true, format: (v: number) => this.money(v), exportFormat: 'number:comma2' },
    { field: 'PUR_Net', header: '退回/折讓金額', visible: true, format: (v: number) => this.money(v), exportFormat: 'number:comma2' },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
  ];

  constructor(
    private fin13010Service: FIN13010Service,
    private validationService: ValidationService
  ) {
    super();
  }

  /* ---------- 顯示用格式 ---------- */

  formatCreditType(value: string): string {
    switch (value) {
      case 'C': return '折讓';
      case 'R': return '退出';
      default: return value;
    }
  }

  formatDateFromBackend(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  formatRepYYYYMM(value: string): string {
    if (!value || value.length !== 6) return value;
    return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
  }

  money(v: number): string {
    return Number(v ?? 0).toLocaleString('en-US');
  }

  /* ---------- Init：只從 CRU 回來才還原 ---------- */

  ngOnInit(): void {
    this.initializePage('FIN13010', '/FIN/FIN13010CRU');

    const fromCru = !!(history.state && history.state['fromCru']);
    if (fromCru) {
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) => this.onSubmit(f));
    } else {
      this.setDefaultRepYYYYMMByToday();
    }
  }

  private setDefaultRepYYYYMMByToday(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let evenMonth = month % 2 === 0 ? month : month + 1;
    if (evenMonth > 12) evenMonth = 12;

    const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;

    this.queryForm.patchValue({ PUR_RepYYYYMM: repYYYYMM }, { emitEvent: false });
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

    // trim & 空白轉 null
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    // 申報年月轉成六碼 YYYYMM
    payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);

    // ✅ table-report 之後要用它來滾動載入更多/排序重查
    payload.pageIndex = payload.pageIndex ?? 1;
    payload.pageSize = payload.pageSize ?? 30;
    payload.SortBy = payload.SortBy ?? [{ field: 'id', order: 1 }];
    this.lastQueryBody = { ...payload };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.queryFIN13010(payload).subscribe({
      next: (res: any) => {
        this.data = res?.Data || [];
        this.totalRecords = res?.TotalCount || this.data.length;

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

    // 保留分頁/排序預設（避免 table-report 下次 loadMore 用到 undefined）
    this.queryForm.patchValue(
      {
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'id', order: 1 }],
      },
      { emitEvent: false }
    );

    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;

    this.setDefaultRepYYYYMMByToday();
    this.queryStateService.clearQueryState(this.ProgNo);
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

  /* ---------- Checkbox 禁勾：已有傳票號不可選 ---------- */

  isRowSelectable = (row: any): boolean => {
    const v = row?.Voucher_No ?? row?.voucher_No ?? row?.VOUCHER_NO;
    if (v == null) return true;
    return String(v).trim() === '';
  };

  /* ---------- 刪除：已有傳票編號不可刪 ---------- */

  Delete(selectedRows: any[]): void {
    if (!selectedRows || !selectedRows.length) {
      this.messageService.warnBubble('請先選取要刪除的資料');
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
      .map((r) => Number(r.id ?? r.ID ?? r.Id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!idList.length) {
      this.messageService.warnBubble('找不到可刪除的資料主鍵（id）。');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.deleteFIN13010(idList).subscribe({
      next: () => {
        // 刪完重新查（用目前 form）
        this.onSubmit(this.queryForm);
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
}
