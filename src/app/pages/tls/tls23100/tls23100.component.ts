/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component, // ✅ 使用 table2 才能顯示總計/小計
  ]
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  // 資料
  data: any[] = [];
  totalRecords = 0;

  // 預設日期（昨天）
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 群組欄位（小計依此欄位）
  readonly groupByField = 'tlt_no';

  // --- 排序狀態（群組欄位一定放第一個，避免切段）---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 }, // ⬅️ 一定要第一個
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  /** 去抖動 + 防重複查詢 */
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  /** 後端需要分頁/排序參數（✅ 不傳 Offset / OrderBy） */
  private readonly includePagingAndSorting = true;

  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No:        [[]],
    TLT_No:        [[]],
    Pay_No:        [[]],
    CRD_No:        [], // 若未使用可移除
    tlt_building:  [],
    tlt_floor:     [[]],
    org_id:        [[]],

    // ✅ 預設排序：群組欄位優先
    ...createPaginationConfig([
      { field: this.groupByField, order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];

  // ====== 總計 / 小計容器與對應關係 ======
  /** 表尾總計容器（來自 wrapper.totalPayAmt 聚合） */
  detailTotals: Record<string, number> = {};
  /** 欄位 -> 總計鍵對應 */
  detailTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'totalPayAmt',
  };
  /** 群組小計容器（前端依當頁 rows 計算） */
  detailSubtotals: Record<string, Record<string, number>> = {};
  /** 欄位 -> 小計鍵對應 */
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Subtotal_TXN_PayAmt',
  };

  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  // 頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));

    // 初始化 Sort 狀態
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    // 下拉載入
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.paymentTypeService.getPaymentTypes().subscribe((data) => (this.paymentTypeOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 欄位（把要計算總/小計的欄位加上 isTotal / isSubTotal）
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.money(val),
      isTotal: true,
      isSubTotal: true,
    },
  ];

  /** 表格 lazy 事件（分頁/排序） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    // 強制把群組欄位放第一順位
    const nextSort = this.ensureGroupFirst(event.SortBy ?? []);
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSortStr = JSON.stringify(nextSort);
    const nextPageIndex = currSort !== nextSortStr ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    // 同步回表單（不觸發 valueChanges）
    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : nextSort,
    }, { emitEvent: false });

    // 更新表頭排序狀態
    this.sortMeta = nextSort.map(s => ({ ...s }));

    // 去重簽章
    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  // 送出查詢
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      // 分頁鍵（✅ 不再計算也不傳 Offset）
      const pageSize  = Number.isFinite(val?.pageSize)  ? Number(val.pageSize)  : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

      // 排序：表單 → sortMeta → defaultSort
      const sortByArr = (Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy
        : (this.sortMeta.length ? this.sortMeta : this.defaultSort)
      ).map((s: any) => ({ ...s }));

      // 組 payload（✅ 僅保留 pageIndex/pageSize/SortBy）
      const payload: any = this.prune({
        TXN_DateStart: this.toIso(val?.TXN_DateStart),
        TXN_DateEnd  : this.toIso(val?.TXN_DateEnd),
        ECR_No       : this.ensureArr(val?.ECR_No),
        TLT_No       : this.ensureArr(val?.TLT_No),
        Pay_No       : this.ensureArr(val?.Pay_No),
        CRD_No       : (val?.CRD_No ?? '') || undefined,
        tlt_building : (val?.tlt_building ?? '') || undefined,
        tlt_floor    : this.ensureArr(val?.tlt_floor),
        org_id       : this.ensureArr(val?.org_id),

        pageSize,
        pageIndex,
        SortBy: sortByArr,
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23100Service.queryTLS23100(payload).subscribe({
        next: (res: any) => {
          // 期待：{ Data: [{ totalPayAmt, tLS23100Details: [...] }, ...], TotalCount?, ... }
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

          // 當頁明細
          const details = wrappers.flatMap((w: any) =>
            Array.isArray(w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details)
              ? (w.tLS23100Details ?? w.TLS23100Details ?? w.tls23100Details)
              : [],
          );
          this.data = details.map((row: any, idx: number) => ({
            ...row,
            _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
          }));

          // 總計（聚合所有 wrapper 的 totalPayAmt；若缺少則回退為當頁加總）
          const totalFromWrapper = wrappers
            .map((w: any) => Number(w?.totalPayAmt ?? 0))
            .reduce((a: number, b: number) => a + b, 0);

          const fallbackPageSum = this.data
            .map((r: any) => Number(r?.TXN_PayAmt ?? 0))
            .reduce((a: number, b: number) => a + b, 0);

          this.detailTotals = { totalPayAmt: totalFromWrapper || fallbackPageSum };

          // 小計（前端依當頁資料，以 tlt_no 分組）
          this.detailSubtotals = this.buildSubtotals(this.data);

          // 總筆數
          this.totalRecords = (typeof res?.TotalCount === 'number')
            ? res.TotalCount
            : this.data.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // ====== 工具 ======
  private toIso(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  private ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));

  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if (Array.isArray(v) && v.length === 0) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

private buildSubtotals(rows: any[]): Record<string, Record<string, number>> {
  const sub: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const key = String(r?.tlt_no ?? 'UNKNOWN');
    const curr = sub[key] ?? {};
    // 用中括號避免 TS4111
    curr['Subtotal_TXN_PayAmt'] = (curr['Subtotal_TXN_PayAmt'] ?? 0) + Number(r?.TXN_PayAmt ?? 0);
    sub[key] = curr;
  }
  return sub;
}


  money = (val: any) => Number(val || 0).toLocaleString('en-US');
}
