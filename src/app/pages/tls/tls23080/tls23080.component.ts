import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';

import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component, // ✅ 改用 table2
    ButtonModule,
  ]
})
export class TLS23080Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // ===== 總計容器（小計目前不需要就不帶）=====
  detailTotals: Record<string, number> = {};
  // 將欄位(field)對到 API 總計鍵 (Total*)
  detailTotalFieldMap: Record<string, string> = {
    TXN_PayAmt10: 'TotalPayAmt10',

    // 聯信
    UnionGeneral: 'TotalUnionGeneral',
    UnionAE:      'TotalUnionAE',
    UnionDiner:   'TotalUnionDiner',

    // 中信
    CTBCGeneral: 'TotalCTBCGeneral',
    CTBCAE:      'TotalCTBCAE',
    CTBCDiner:   'TotalCTBCDiner',

    // 中信-停車場
    CTBCParkingGeneral: 'TotalCTBCParkingGeneral',
    CTBCParkingAE:      'TotalCTBCParkingAE',
    CTBCParkingDiner:   'TotalCTBCParkingDiner',

    // 其他支付
    TXN_PayAmt52: 'TotalPayAmt52',
    TXN_PayAmt82: 'TotalPayAmt82',
    TXN_PayAmt20: 'TotalPayAmt20',
    TXN_PayAmt62: 'TotalPayAmt62',
    TXN_PayAmt77: 'TotalPayAmt77',
    TXN_PayAmt71: 'TotalPayAmt71',
    TXN_PayAmt30: 'TotalPayAmt30',
    TXN_PayAmt73: 'TotalPayAmt73',
    TXN_PayAmt72: 'TotalPayAmt72',
    TXN_PayAmt74: 'TotalPayAmt74',
    TXN_PayAmt75: 'TotalPayAmt75',
    TXN_PayAmt76: 'TotalPayAmt76',
    TXN_PayAmt24: 'TotalPayAmt24',
    TXN_PayAmt25: 'TotalPayAmt25',
    TXN_PayAmt07: 'TotalPayAmt07',
    TXN_PayAmt55: 'TotalPayAmt55',
    TXN_PayAmt83: 'TotalPayAmt83',
    TXN_PayAmt78: 'TotalPayAmt78',
    TXN_PayAmt79: 'TotalPayAmt79',
    TXN_PayAmt21: 'TotalPayAmt21',
    TXN_PayAmt53: 'TotalPayAmt53',
    TXN_PayAmt56: 'TotalPayAmt56',
    TXN_PayAmt57: 'TotalPayAmt57',
    TXN_PayAmt58: 'TotalPayAmt58',
    TXN_PayAmt59: 'TotalPayAmt59',
    TXN_PayAmt60: 'TotalPayAmt60',
    TXN_PayAmt22: 'TotalPayAmt22',
    TXN_PayAmt23: 'TotalPayAmt23',

    // 總金額
    TXN_TotPayAmt: 'TotalTotPayAmt',
  };

  WhetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  // --- 匯出用 ---
  btnLoading = false;
  historyRequestBody: any | null = null;

  // --- 排序狀態 ---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: 1 }, // 近到遠
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    tlt_openflag:  ['N'],
    ECR_No:        [],
    tlt_building:  [],
    tlt_floor:     [],
    org_id:        [],
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private whetherService: WhetherService,
    private tls23080Service: TLS23080Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    // 下拉選單
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.WhetherOptions = (data || []).filter((opt: any) => opt.value !== null);
    });
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 提供給 Table2 的 lazy 載入函式（HTML 綁 [fetchData]="fetchTLS23080"）
fetchTLS23080 = (evt: LazyLoadEvent) => {
  const formVal = this.queryForm.getRawValue() as any;

  // 事件優先，其次沿用表單/預設
  const pageIndex =
    Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(formVal?.pageIndex ?? 1);
  const pageSize =
    Number.isFinite(evt?.pageSize) ? Number(evt!.pageSize) : Number(formVal?.pageSize ?? 20);
  const sortBy =
    Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
      ? (evt as any).SortBy
      : (Array.isArray(formVal?.SortBy) && formVal.SortBy.length ? formVal.SortBy : this.defaultSort);

  // 用既有 buildPayload 組參數（不帶 Offset/OrderBy），但覆寫分頁/排序
  const payload = this.buildPayload({
    ...formVal,
    pageIndex,
    pageSize,
    SortBy: sortBy,
  });

  return this.tls23080Service.queryTLS23080(payload).pipe(
    map((res: any) => {
      // Data 可能是陣列或單一物件
      const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

      // ===== 明細 rows =====
      const rows = wrappers
        .flatMap((g: any) => (Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []))
        .map((d: any, i: number) => ({
          ...d,
          TXN_Date: d?.TXN_Date ? formatDateToYYYY_MM_DD(d.TXN_Date) : d?.TXN_Date,
          _rowKey: `${d?.TXN_Date ?? ''}|${i}`,
        }));

      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      // ===== 表尾總計（取第一包的 Total* 欄位）=====
      const first = wrappers[0] ?? {};
      const externalTotals: Record<string, number> = {};
      Object.values(this.detailTotalFieldMap).forEach((apiKey) => {
        externalTotals[apiKey] = Number(first?.[apiKey] ?? 0);
      });

      // 本頁不需要小計
      const externalSubtotals: Record<string, Record<string, number>> = {};

      return { rows, totalRecords, externalTotals, externalSubtotals };
    })
  );
};


  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = this.buildPayload(this.queryForm.getRawValue());

      // 匯出沿用同一包參數
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23080Service.queryTLS23080(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          // 兼容 Data 可能是陣列或物件
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

          // ====== 明細 ======
          const details = wrappers.flatMap((g: any) =>
            Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []
          ).map((d: any, i: number) => ({
            ...d,
            TXN_Date: d?.TXN_Date ? formatDateToYYYY_MM_DD(d.TXN_Date) : d?.TXN_Date,
            _rowKey: `${d?.TXN_Date ?? ''}|${i}`,
          }));

          this.data = details;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;

          // ====== 總計（表尾）======
          const first = wrappers[0] ?? {};
          const totals: Record<string, number> = {};
          Object.values(this.detailTotalFieldMap).forEach((apiKey) => {
            totals[apiKey] = Number(first?.[apiKey] ?? 0);
          });
          this.detailTotals = totals;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
        }
      });
    });
  }

  /** 組查詢 payload（不再帶 Offset / OrderBy） */
  private buildPayload(val: any) {
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    };

    const pageSize  = Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 10;
    const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

    const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
      ? val.SortBy
      : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

    const o: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      tlt_openflag:  val?.tlt_openflag,
      ECR_No:        val?.ECR_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
    };

    if (this.includePagingAndSorting) {
      Object.assign(o, {
        PageSize:  pageSize,
        PageIndex: pageIndex,
        SortBy:    sortByArr,
      });
    }

    Object.keys(o).forEach(k => {
      const v = o[k];
      if (v === undefined || v === '') delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });

    return o;
  }

  // ===== 工具 =====
  moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  formatDate = (val: string | Date | number): string => {
    if (!val) return '';
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  // ========= 匯出 =========
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23080Service
      .exportTLS23080PDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.pdf'),
      });
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23080Service
      .exportTLS23080Excel(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.xlsx'),
      });
  }

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

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  // ===== 欄位（加上 isTotal 以顯示表尾加總）=====
  columns = [
    { field: 'TXN_Date', header: '日期', visible: true, style: 'text-left', format: this.formatDate },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 聯信（41/42/12）
    { field: 'UnionGeneral', header: '聯信(一般)',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionAE',      header: '聯信(AE)',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionDiner',   header: '聯信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 中信（43/44/14）
    { field: 'CTBCGeneral', header: '中信(一般)',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCAE',      header: '中信(AE)',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCDiner',   header: '中信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 中信-停車場（81）
    { field: 'CTBCParkingGeneral', header: '中信-停車場(一般)',   visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingAE',      header: '中信-停車場(AE)',     visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingDiner',   header: '中信-停車場(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 其他付款別（與 Swagger 一致）
    { field: 'TXN_PayAmt52', header: '一卡通',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單',            visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券',          visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券',            visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)',  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)',      visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)',    visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)',          visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵',                  visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡',            visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡',          visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵',              visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay',              visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券',             visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單',             visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券',               visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY',visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay',               visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包',              visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券',                visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢',       visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢',         visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];
}
