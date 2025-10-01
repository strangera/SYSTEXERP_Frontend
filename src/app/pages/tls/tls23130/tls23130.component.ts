/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23130Service } from '../../../service/api/tls/tls23130.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import {finalize, catchError, map } from 'rxjs/operators';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { HttpResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  styleUrls: ['./tls23130.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component,
    ButtonModule,
  ],
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;
      btnLoading = false;
  historyRequestBody: any | null = null;


  // ---- 排序狀態（先按群組欄位 tlt_no，再日期/序號）----
  sortMeta: any[] = [];
  readonly groupByField = 'tlt_no';
  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 },
    { field: 'TXN_Date', order: 1 },
    { field: 'CRD_No', order: 1 },
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // 是否要顯示小計（有分組時才開）
  hasSubtotals = false;

  // 總計容器 & 對映
  detailTotals: Record<string, number> = {};
  detailTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Total_TXN_PayAmt',
    EDC_InstHeadAmt: 'Total_EDC_InstHeadAmt',
    EDC_InstEachAmt: 'Total_EDC_InstEachAmt',
  };

  // 小計容器 & 對映（by tlt_no）
  detailSubtotals: Record<string, Record<string, number>> = {};
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Subtotal_TXN_PayAmt',
    EDC_InstHeadAmt: 'Subtotal_EDC_InstHeadAmt',
    EDC_InstEachAmt: 'Subtotal_EDC_InstEachAmt',
  };

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],

    // 單選：string（必填）
    BNK_No: this.formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tlt_building: [],
    tlt_floor:    [],
    org_id:       [],
    ...createPaginationConfig([
      { field: this.groupByField, order: 1 },
      { field: 'TXN_Date', order: 1 },
      { field: 'CRD_No', order: 1 },
    ]),
  });

  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  CounterOptions: any[] = [];
  bus_typeOptions: any[] = [];

  constructor(
    private tls23130Service: TLS23130Service,
    private regionService: RegionService,
    private cardTypeService: CardTypeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private floorService: FloorService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', 'tls/tls23130', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(res => {
      this.bus_typeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: x.label, value: x.value,
      }));
    });
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });

    // 銀行下拉（單選字串）— 預設帶入第一筆
    this.tls23130Service
      .queryAPS1001_DropDownList({ SearchKeyword: '' })
      .pipe(
        map(res => (Array.isArray(res?.Data) ? res.Data : [])),
        map(list => list.map((x: any) => {
          const v = String(x.No ?? x.BNK_No ?? '');
          const l = String(x.Name ?? x.BankName ?? '');
          return { label: `${v} - ${l}`, value: v, formLabel: `${v} - ${l}` };
        })),
        catchError(err => {
          console.error('queryAPS1001_DropDownList 失敗', err);
          return of([] as any[]);
        })
      )
      .subscribe(opts => {
        this.cardTypeOptions = opts;
        if (opts.length > 0) {
          const ctrl = this.queryForm.get('BNK_No') as FormControl<string>;
          ctrl.setValue(opts[0].value);
          ctrl.updateValueAndValidity({ onlySelf: true });
        }
      });
  }

// 提供給 Table2 的 lazy 載入函式（HTML 綁 [fetchData]="fetchTLS23130"）
fetchTLS23130 = (evt: LazyLoadEvent) => {
  const val = this.queryForm.getRawValue() as any;

  // 小工具
  const toIso = (x: any) => {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  };
  const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

  // 排序（事件優先），確保群組欄位在第一順位
  const sortByRaw =
    (Array.isArray(evt?.SortBy) && evt!.SortBy!.length) ? evt!.SortBy! :
    (Array.isArray(val?.SortBy) && val!.SortBy!.length) ? val!.SortBy! :
    this.defaultSort;
  const sortBy = this.ensureGroupFirst(sortByRaw);

  // 分頁（事件優先）
  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(val?.pageIndex ?? 1);
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt!.pageSize)  : Number(val?.pageSize  ?? 20);

  // 與 onSubmit 相同的 payload（✅ 不送 Offset / OrderBy）
  const payload: any = {
    TXN_DateStart: toIso(val?.TXN_DateStart),
    TXN_DateEnd:   toIso(val?.TXN_DateEnd),
    BNK_No:        (typeof val?.BNK_No === 'string' && val.BNK_No !== '') ? val.BNK_No : undefined,
    tlt_building:  val?.tlt_building ?? undefined,
    tlt_floor:     asArr(val?.tlt_floor),
    org_id:        asArr(val?.org_id),
    pageSize,
    pageIndex,
    SortBy: sortBy,
  };
this.historyRequestBody = { ...payload };
  return this.tls23130Service.queryTLS23130(payload).pipe(
    map((res: any) => {
      // 包裝層
      const wrappers: any[] = Array.isArray(res?.Data)
        ? res.Data
        : (res?.Data ? [res.Data] : []);

      const rows: any[] = [];
      const subMap: Record<string, Record<string, number>> = {};
      let wrapTotalPay = 0;
      let sumPay = 0, sumHead = 0, sumEach = 0;

      for (const w of wrappers) {
        wrapTotalPay += Number(w?.TotalPayAmt ?? 0);

        const details = Array.isArray(w?.tLS23130_Details) ? w.tLS23130_Details : [];
        for (const it of details) {
          const rec = { ...it } as any;

          // 穩定 rowKey
          const dateKey = String(rec.TXN_Date ?? '').slice(0, 19);
          rec._rowKey = `${dateKey}|${rec.TXN_Date ?? ''}|${rec.CRD_No ?? ''}`;

          // 累加總計
          const pay  = Number(rec.TXN_PayAmt ?? 0);
          const head = Number(rec.EDC_InstHeadAmt ?? 0);
          const each = Number(rec.EDC_InstEachAmt ?? 0);
          sumPay  += Number.isFinite(pay)  ? pay  : 0;
          sumHead += Number.isFinite(head) ? head : 0;
          sumEach += Number.isFinite(each) ? each : 0;

          // 小計（by tlt_no）
          const gk = String(rec.tlt_no ?? 'UNKNOWN');
          const g  = subMap[gk] ?? {
            Subtotal_TXN_PayAmt: 0,
            Subtotal_EDC_InstHeadAmt: 0,
            Subtotal_EDC_InstEachAmt: 0,
          };
          g['Subtotal_TXN_PayAmt']      += Number.isFinite(pay)  ? pay  : 0;
          g['Subtotal_EDC_InstHeadAmt'] += Number.isFinite(head) ? head : 0;
          g['Subtotal_EDC_InstEachAmt'] += Number.isFinite(each) ? each : 0;
          subMap[gk] = g;

          rows.push(rec);
        }
      }

      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      // 外部總計（優先採用後端 TotalPayAmt，沒有就用加總）
      const externalTotals = {
        Total_TXN_PayAmt: (wrapTotalPay > 0 ? wrapTotalPay : sumPay),
        Total_EDC_InstHeadAmt: sumHead,
        Total_EDC_InstEachAmt: sumEach,
      };

      // 外部小計
      const externalSubtotals = subMap;
      this.hasSubtotals = Object.keys(subMap).length > 0;

      return { rows, totalRecords, externalTotals, externalSubtotals };
    })
  );
};


  // 送出查詢（⚠️ 不送 Offset / OrderBy）
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 19);
      };
      const asArr = (x: any) => Array.isArray(x) ? x : (x == null || x === '' ? undefined : [x]);

      const payload: any = {
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd:   toIso(val?.TXN_DateEnd),
        BNK_No:        (typeof val?.BNK_No === 'string' && val.BNK_No !== '') ? val.BNK_No : undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     asArr(val?.tlt_floor),
        org_id:        asArr(val?.org_id),
        pageSize:      val?.pageSize ?? 20,
        pageIndex:     val?.pageIndex ?? 1,
        SortBy:        Array.isArray(val?.SortBy) ? val.SortBy : this.defaultSort,
      };
this.historyRequestBody = { ...payload };
      // 清除空值
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23130Service.queryTLS23130(payload).subscribe({
        next: (res: any) => {
          // 包裝層
          const wrappers: any[] = Array.isArray(res?.Data)
            ? res.Data
            : (res?.Data ? [res.Data] : []);

          // 明細
          const rows: any[] = [];
          // 小計 map（by tlt_no）
          const subMap: Record<string, Record<string, number>> = {};
          // 總計
          let wrapTotalPay = 0;
          let sumPay = 0;
          let sumHead = 0;
          let sumEach = 0;

          for (const w of wrappers) {
            wrapTotalPay += Number(w?.TotalPayAmt ?? 0);

            const details = Array.isArray(w?.tLS23130_Details) ? w.tLS23130_Details : [];
            for (const it of details) {
              const rec = { ...it } as any;

              // 產生穩定的 dataKey
              const dateKey = String(rec.TXN_Date ?? '').slice(0, 19);
              rec._rowKey = `${dateKey}|${rec.TXN_Date ?? ''}|${rec.CRD_No ?? ''}`;

              // 聚合總計
              const pay  = Number(rec.TXN_PayAmt ?? 0);
              const head = Number(rec.EDC_InstHeadAmt ?? 0);
              const each = Number(rec.EDC_InstEachAmt ?? 0);
              sumPay  += Number.isFinite(pay)  ? pay  : 0;
              sumHead += Number.isFinite(head) ? head : 0;
              sumEach += Number.isFinite(each) ? each : 0;

              // 聚合小計（by tlt_no）
              const gk = String(rec.tlt_no ?? 'UNKNOWN');
              const g  = subMap[gk] ?? {
                Subtotal_TXN_PayAmt: 0,
                Subtotal_EDC_InstHeadAmt: 0,
                Subtotal_EDC_InstEachAmt: 0,
              };
              g['Subtotal_TXN_PayAmt']     += Number.isFinite(pay)  ? pay  : 0;
              g['Subtotal_EDC_InstHeadAmt']+= Number.isFinite(head) ? head : 0;
              g['Subtotal_EDC_InstEachAmt']+= Number.isFinite(each) ? each : 0;
              subMap[gk] = g;

              rows.push(rec);
            }
          }

          // 套資料
          this.data = rows;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // 組外部總計（優先採用後端 TotalPayAmt，沒有就用加總）
          this.detailTotals = {
            Total_TXN_PayAmt: (wrapTotalPay > 0 ? wrapTotalPay : sumPay),
            Total_EDC_InstHeadAmt: sumHead,
            Total_EDC_InstEachAmt: sumEach,
          };

          // 外部小計
          this.detailSubtotals = subMap;
          this.hasSubtotals = Object.keys(subMap).length > 0;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
          this.hasSubtotals = false;
          this.loading = false;
          this.messageService?.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // ===== 小工具 =====
  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.groupByField;
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  };

  moneyFormat = (value: any): string =>
    value == null || value === '' ? '' : Number(value).toLocaleString('en-US');

  formatISOToHHMMSS = (val: string): string => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
  };

  // ===== 表格欄位（標記 isTotal / isSubTotal）=====
  columns = [
    { field: 'CRD_No', header: '卡號', visible: true },
    // { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'EDC_InstEachAmt', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatYMD },
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '銷售時間', visible: true, format: this.formatISOToHHMMSS },
    { field: 'TERM_No', header: '分期數', visible: true },
  ];
// ===== 匯出：PDF =====
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23130Service.exporttls23130PDF(this.historyRequestBody).pipe(
      finalize(() => (this.btnLoading = false))
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
    });
  }

  // ===== 通用下載處理 =====
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    // RFC 5987: filename*
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    // filename="xxx"
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch && filenameMatch[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
