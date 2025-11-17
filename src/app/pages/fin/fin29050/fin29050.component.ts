/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import {
  FIN29050Service,
  QueryFIN29050Response,
} from '../../../service/api/fin/fin29050.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';

@Component({
  selector: 'app-fin29050',
  templateUrl: './fin29050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    TableSubheaderComponent,
    DropdownRangeComponent,
    InputNumberRangeComponent
  ]
})
export class FIN29050Component extends BasicQueryPageComponent<QueryFIN29050Response> implements OnInit {

  constructor(
    private fin29050Service: FIN29050Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  /** 記住上一次查詢的 payload */
  private lastQueryBody: any | null = null;

  queryForm = this.formBuilder.group({
    VendorNoFrom: [null],
    VendorNoTo: [null],
    BillingDateFrom: [null, Validators.required],
    BillingDateTo: [null, Validators.required],
    PayableAmountFrom: [null],
    PayableAmountTo: [null],
    AccNoFrom: [null],
    AccNoTo: [null],
    ShowZeroBalance: ['ALL'],
    ShowRetentionInUnpaid: ['ALL'],
    ...createPaginationConfig([])
  });

  data: QueryFIN29050Response[] = [];
  selectedItems: QueryFIN29050Response[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'VendorNo', header: '廠客代號', visible: true },
    { field: 'VendorName', header: '廠客名稱', visible: true },
    { field: 'Notes', header: '摘要', visible: true },
    { field: 'BillingDate', header: '立帳日期', visible: true },
    { field: 'VouNo', header: '傳票編號', visible: true, type: 'detail' },
    { field: 'PayableAmount', header: '應付金額', visible: true, format: formatAmount },
    { field: 'ClearedAmount', header: '沖帳金額', visible: true, format: formatAmount },
    { field: 'RetentionAmount', header: '保留款金額', visible: true, format: formatAmount },
    { field: 'ClearedRetentionAmount', header: '沖保留款金額', visible: true, format: formatAmount },
    { field: 'UnpaidAmount', header: '未付金額', visible: true, format: formatAmount },
  ];

  // 下拉選項
  VendorNoOptions: any[] = []; // 廠客代號選項
  AccNoOptions: any[] = []; // 科目代號選項

  loadingStates: Map<number, boolean> = new Map();
  addButton: AddButton[] = [
    {
      label: '匯出',
      icon: 'pi pi-file-export text-green-500',
      action: (rowData: QueryFIN29050Response) => { this.onExport(rowData); },
      loading: (rowData: QueryFIN29050Response) => this.getLoadingState(rowData.id),
    },
  ];

  ngOnInit(): void {
    this.initializePage('FIN29050', 'account/fin/fin29050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();

    // 預先把 ProgNo 寫入一次，避免你從其它地方直開 CRU
    try {
      localStorage.setItem('FIN29050_CRU_PROGNO', 'FIN29050');
    } catch { }

    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    if (saved) {
      this.queryForm.patchValue(this.coerceDates(saved), { emitEvent: false });
      this.lastQueryBody = saved;
    }

    this.queryForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      });
  }

  private coerceDates(raw: any) {
    const fix = (v: any) => {
      if (!v) return v;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    };
    return {
      ...raw,
      BillingDateFrom: fix(raw?.BillingDateFrom),
      BillingDateTo: fix(raw?.BillingDateTo),
    };
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryPayload(form.getRawValue());

      this.fin29050Service.queryFIN29050(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;

          // 記住本次查詢
          this.lastQueryBody = form.getRawValue();

          // 保存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
        });
    });
  }

  override onLazyLoadData(event: any, form: FormGroup) {
    form.patchValue({
      pageSize: event?.pageSize,
      pageIndex: event?.pageIndex,
      SortBy: event?.SortBy
    }, { emitEvent: false });

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
  }

  /** 清單 → 明細（CRU）：使用 localStorage 交接資料 */
  override onDetail(row: QueryFIN29050Response) {
    const vouNo = row?.VouNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    // 儲存交接資料到 localStorage（含 ProgNo）
    try {
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN29050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN29050_CRU_PROGNO', 'FIN29050');
      console.log('[FIN29050] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN29050] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    // 開新分頁
    window.open('/account/fin/fin29050cru', '_blank', 'noopener');
  }

  /** 產生查詢 payload */
  private buildQueryPayload(raw: any): any {
    const from = this.toDateOnly(raw?.BillingDateFrom);
    const to = this.toDateOnly(raw?.BillingDateTo);

    return {
      ...raw,
      BillingDateFrom: from,
      BillingDateTo: to,
    };
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  // 載入下拉選項
  private loadOptions(): void {
    // 廠客代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }

  // 匯出
  onExport(rowData: QueryFIN29050Response): void {
    this.setLoadingState(rowData.id, true);

    // TODO: 待實作
    // this.tls53010Service.exportTLS53010Detail(this.createDetailQueryRequest(rowData))
    //   .pipe(
    //     untilDestroyed(this),
    //     finalize(() => {
    //       this.setLoadingState(rowData.id, 'export', false);
    //     })
    //   )
    //   .subscribe({
    //     next: (response: HttpResponse<Blob>) => {
    //       this.downloadFile(response, '盤點單明細報表.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //     },
    //     error: (err: any) => {
    //       console.error('匯出失敗:', err);
    //     }
    //   });
  }

  // 取得 loading 狀態
  getLoadingState(id: number): boolean {
    return this.loadingStates.get(id) || false;
  }

  // 設定 loading 狀態
  setLoadingState(id: number, loading: boolean): void {
    if (!this.loadingStates.has(id)) {
      this.loadingStates.set(id, false);
    }
    this.loadingStates.set(id, loading);
  }
}