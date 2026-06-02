/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs/operators';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// UI
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

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
  lastQueryBody: any = null;
  editDisabledFn = (row: any) => !row?.CanEdit;

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

  constructor(private fin13010Service: FIN13010Service) {
    super();
  }

  /* ---------- 顯示用格式 ---------- */

  formatCreditType(value: string): string {
    if (value === 'C') return '折讓';
    if (value === 'R') return '退出';
    return value;
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

  /* ---------- Init ---------- */

  ngOnInit(): void {
    this.initializePage('FIN13010', '/FIN/FIN13010CRU');

    const fromCru = !!(history.state?.fromCru);
    if (fromCru) {
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) => this.onSubmit(f));
    } else {
      this.setDefaultRepYYYYMMByToday();
    }
  }

  private setDefaultRepYYYYMMByToday(): void {
    const now = new Date();
    const month = now.getMonth() + 1;
    let evenMonth = month % 2 === 0 ? month : month + 1;
    if (evenMonth > 12) evenMonth = 12;
    const repYYYYMM = `${now.getFullYear()}${String(evenMonth).padStart(2, '0')}`;
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

    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim() || null;
      }
    }

    payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);
    payload.pageIndex = payload.pageIndex ?? 1;
    payload.pageSize = payload.pageSize ?? 30;
    payload.SortBy = payload.SortBy ?? [{ field: 'id', order: 1 }];
    this.lastQueryBody = { ...payload };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.queryFIN13010(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res: any) => {
          this.data = res?.Data || [];
          this.totalRecords = res?.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, raw);
        },
      });
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.queryForm.patchValue(
      { pageIndex: 1, pageSize: 30, SortBy: [{ field: 'id', order: 1 }] },
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
    }
    const d = input instanceof Date ? input : new Date(input);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    return null;
  }

  /* ---------- Checkbox ---------- */

  isRowSelectable = (row: any): boolean => !!row?.CanDel;

  /* ---------- 刪除 ---------- */

  Delete(selectedRows: any[]): void {
    if (!selectedRows?.length) {
      this.messageService.warnBubble('請先選取要刪除的資料');
      return;
    }

    const deletableRows = selectedRows.filter((r) => r?.CanDel);
    if (!deletableRows.length) {
      this.messageService.warnBubble('所選資料已審核或已建立傳票，無法刪除');
      return;
    }

    const idList = deletableRows
      .map((r) => Number(r.id ?? r.ID ?? r.Id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!idList.length) {
      this.messageService.warnBubble('找不到可刪除的資料主鍵（id）。');
      return;
    }

    const retNoList = deletableRows
      .map((r) => r.TXN_Ret_No)
      .filter((n) => !!n)
      .join('、');

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除折讓單號【${retNoList}】？`,
      accept: () => {
        this.loading = true;
        this.messageService.blockUi();

        this.fin13010Service.deleteFIN13010(idList)
          .pipe(finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
          }))
          .subscribe({
            next: () => {
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }
}
