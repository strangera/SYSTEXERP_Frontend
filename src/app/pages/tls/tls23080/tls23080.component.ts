/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
  ],
})
export class TLS23080Component extends BasicQueryPageComponent<any> implements OnInit {
  data: any[] = [];
  totalRecords = 0;

  // 匯出用
  btnLoading = false;

  /**
   * ✅ 給 TableReport 的 lastQueryBody：固定 reference
   * ⚠️ 禁止用 this.historyRequestBody = {...} 換新物件（會觸發 TableReport 反覆判斷/重打）
   */
  historyRequestBody: any = {};

  // ✅ 防止重複查詢（同 payload、或查詢中）
  private querying = false;
  private lastQueryKey = '';

  // 總計列來源（由 query 回來的 GrandTotal 同步）
  private grandTotal: Record<string, number> = {};

  // 下拉來源
  WhetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  // 預設排序
  readonly defaultSort: any[] = [{ field: 'TXN_Date', order: 1 }];

  // 後端 Total* 欄位對應到前端欄位（用於組 GrandTotal/表尾）
  private detailTotalFieldMap: Record<string, string> = {
    ACT_PayAmt10: 'TotalPayAmt10',

    UnionGeneral: 'TotalUnionGeneral',
    UnionAE: 'TotalUnionAE',
    UnionDiner: 'TotalUnionDiner',

    CTBCGeneral: 'TotalCTBCGeneral',
    CTBCAE: 'TotalCTBCAE',
    CTBCDiner: 'TotalCTBCDiner',

    CTBCParkingGeneral: 'TotalCTBCParkingGeneral',
    CTBCParkingAE: 'TotalCTBCParkingAE',
    CTBCParkingDiner: 'TotalCTBCParkingDiner',

    ACT_PayAmt52: 'TotalPayAmt52',
    ACT_PayAmt82: 'TotalPayAmt82',
    ACT_PayAmt20: 'TotalPayAmt20',
    ACT_PayAmt62: 'TotalPayAmt62',
    ACT_PayAmt77: 'TotalPayAmt77',
    ACT_PayAmt71: 'TotalPayAmt71',
    ACT_PayAmt30: 'TotalPayAmt30',
    ACT_PayAmt73: 'TotalPayAmt73',
    ACT_PayAmt72: 'TotalPayAmt72',
    ACT_PayAmt74: 'TotalPayAmt74',
    ACT_PayAmt75: 'TotalPayAmt75',
    ACT_PayAmt76: 'TotalPayAmt76',
    ACT_PayAmt24: 'TotalPayAmt24',
    ACT_PayAmt25: 'TotalPayAmt25',
    ACT_PayAmt07: 'TotalPayAmt07',
    ACT_PayAmt55: 'TotalPayAmt55',
    ACT_PayAmt83: 'TotalPayAmt83',
    ACT_PayAmt78: 'TotalPayAmt78',
    ACT_PayAmt79: 'TotalPayAmt79',
    ACT_PayAmt21: 'TotalPayAmt21',
    ACT_PayAmt53: 'TotalPayAmt53',
    ACT_PayAmt56: 'TotalPayAmt56',
    ACT_PayAmt57: 'TotalPayAmt57',
    ACT_PayAmt58: 'TotalPayAmt58',
    ACT_PayAmt59: 'TotalPayAmt59',
    ACT_PayAmt60: 'TotalPayAmt60',
    ACT_PayAmt22: 'TotalPayAmt22',
    ACT_PayAmt23: 'TotalPayAmt23',
    ACT_PayAmt26: 'TotalPayAmt26',
    ACT_PayAmt27: 'TotalPayAmt27',
    ACT_PayAmt28: 'TotalPayAmt28',
    ACT_PayAmt29: 'TotalPayAmt29',
    ACT_PayAmt61: 'TotalPayAmt61',

    Tot_ACT_PayAmt: 'TotalTotPayAmt',
  };

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_openflag: ['N'],
    ECR_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private tls23080Service: TLS23080Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 下拉一次性載入（避免多次訂閱重打）
    forkJoin({
      floors: this.floorService.getFloors().pipe(take(1)),
      buildings: this.tls11010Service.getBuildingOptions().pipe(take(1)),
      orgs: this.tls11010Service.getOrgOptions().pipe(take(1)),
      ecrs: this.ECRNoService.getECRNo().pipe(take(1)),
      counters: this.counterNameService.getCounters().pipe(take(1)),
    }).subscribe({
      next: ({ floors, buildings, orgs, ecrs, counters }) => {
        this.floorOptions = floors ?? [];
        this.BUILDING_NO_Options = buildings ?? [];

        this.OrganizationCodeOptions = (orgs ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));

        this.ECRNoOptions = (ecrs ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));

        this.CounterOptions = (counters ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      },
    });
  }

  // ===== 查詢（按鈕）=====
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        tlt_openflag: val?.tlt_openflag ?? undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_building: Array.isArray(val?.tlt_building) && val.tlt_building.length ? val.tlt_building : undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val.org_id.length ? val.org_id : undefined,
        pageIndex: 1,
        pageSize: 30,
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      const compactPayload = this.compactObject(payload);
      const key = JSON.stringify(compactPayload);

      // ✅ 防重：同 payload 或正在查詢中就不再打
      if (this.querying || key === this.lastQueryKey) return;
      this.lastQueryKey = key;

      // ✅ 固定 reference：只用 assign
      Object.assign(this.historyRequestBody, compactPayload);

      this.loading = true;
      this.querying = true;
      this.messageService?.blockUi();

      this.tls23080Service
        .queryTLS23080(compactPayload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.querying = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
            const rows = this.extractRows(wrappers);

            // GrandTotal（用第一包的 Total* 欄位）
            const first = wrappers[0] ?? {};
            this.grandTotal = this.mapTotalsFromWrapper(first);

            // ✅ 核心：判斷後端是否真的有分頁
            const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
            const hasPaging = apiTotal > rows.length;

            this.data = rows;
            this.totalRecords = hasPaging ? apiTotal : rows.length;

            /**
             * ✅ 核心：只要「沒有分頁」，就把 pageSize 撐到很大
             * TableReport 的 onScroll 條件：
             *   if (data.length < totalRecords && data.length >= pageSize) { loadMoreData() }
             * 沒分頁時：
             *   totalRecords = rows.length  => data.length < totalRecords 為 false
             * 再保險：
             *   pageSize = 999999           => data.length >= pageSize 為 false
             */
            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = hasPaging ? 30 : 999999;
            this.historyRequestBody.SortBy = compactPayload.SortBy ?? this.defaultSort;
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.grandTotal = {};
            // 防止錯誤狀態下 table 還一直想 loadMore
            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = 999999;
          },
        });
    });
  }

  /**
   * ✅ 提供給 app-table-report 的查詢函式
   * - pageSize 固定 30（若真分頁才會用到）
   * - 若「非分頁」，回傳 TotalCount=rows.length，且把 historyRequestBody.pageSize 撐大
   * - 若第二頁開始拿不到資料：回傳 TotalCount = 已載入筆數，避免無限打
   */
  public queryTLS23080ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;

    const basePayload: any = {
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      tlt_openflag: formVal?.tlt_openflag ?? undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
      tlt_building: Array.isArray(formVal?.tlt_building) && formVal.tlt_building.length ? formVal.tlt_building : undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
    };

    const pageIndex = body?.pageIndex != null ? Number(body.pageIndex) : 1;

    const sortBy =
      body?.SortBy && Array.isArray(body.SortBy) && body.SortBy.length
        ? body.SortBy
        : Array.isArray(formVal?.SortBy) && formVal.SortBy.length
          ? formVal.SortBy
          : this.defaultSort;

    return this.tls23080Service
      .queryTLS23080({
        ...basePayload,
        pageIndex,
        pageSize: 30,
        SortBy: sortBy,
      })
      .pipe(
        map((res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
          const rows = this.extractRows(wrappers);

          const first = wrappers[0] ?? {};
          const grand = this.mapTotalsFromWrapper(first);

          // ✅ 判斷是否真分頁
          const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
          const hasPaging = apiTotal > rows.length;

          // ✅ 給 TableReport 的 TotalCount：沒分頁就用 rows.length，避免無限 loadMore
          let totalCount = hasPaging ? apiTotal : rows.length;

          // ✅ 防呆：第二頁以上如果空資料，視為到底（避免一直打下一頁）
          if (pageIndex > 1 && rows.length === 0) {
            totalCount = this.data.length; // 已載入的筆數（父層主資料）
          }

          // 同步頁面 footer
          this.grandTotal = { ...grand };

          // ✅ 一樣用「固定 reference」更新 historyRequestBody
          Object.assign(this.historyRequestBody, {
            ...basePayload,
            SortBy: sortBy,
            pageIndex: 1,
            pageSize: hasPaging ? 30 : 999999,
          });

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );
  };

  // ========= 匯出 =========
  private buildExportBody() {
    const src = this.historyRequestBody || {};
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = src;
    return rest;
  }

  onExportPDF() {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23080Service
      .exportTLS23080PDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.pdf'),
      });
  }

  onExportXLSX() {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23080Service
      .exportTLS23080Excel(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.xlsx'),
      });
  }

  // ======= 總計列 Footer 組裝 =======
  private mapTotalsFromWrapper(wrapper: any): Record<string, number> {
    const grand: Record<string, number> = {};
    Object.entries(this.detailTotalFieldMap).forEach(([field, apiKey]) => {
      grand[field] = Number(wrapper?.[apiKey] ?? 0);
    });
    return grand;
  }

  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    return footer;
  }

  // ===== 工具 =====
  moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  private extractRows(wrappers: any[]): any[] {
    return wrappers
      .flatMap((g: any) => (Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []))
      .map((d: any, i: number) => ({
        ...d,
        TXN_Date: d?.TXN_Date ? this.toDateOnly(d.TXN_Date) : d?.TXN_Date,
        _rowKey: `${d?.TXN_Date ?? ''}|${i}`,
      }));
  }

  onViewTLS23080(row: any) {
    const dateOnly = this.toDateOnly(row?.TXN_Date);
    this.router.navigate(['/account/tls/tls23080cru'], {
      state: { criteria: { TXN_Date: dateOnly } },
    });
  }

  // 下載工具
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
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

  columns = [
    { field: 'TXN_Date', header: '日期', visible: true, style: 'text-left', format: this.formatDate },

    { field: 'ACT_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'UnionGeneral', header: '聯信(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionAE', header: '聯信(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionDiner', header: '聯信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'CTBCGeneral', header: '中信(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCAE', header: '中信(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCDiner', header: '中信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'CTBCParkingGeneral', header: '中信-停車場(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingAE', header: '中信-停車場(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingDiner', header: '中信-停車場(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'ACT_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'ACT_PayAmt26', header: '品牌已開票券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt27', header: '品牌未開票券', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt28', header: '外送平台', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt29', header: 'EC', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'ACT_PayAmt61', header: 'PayEasy', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    { field: 'Tot_ACT_PayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];

  // ===== utils =====
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /** 去掉 undefined / null / 空陣列，讓 payload/key 穩定 */
  private compactObject(obj: any): any {
    const out: any = Array.isArray(obj) ? [] : {};
    Object.keys(obj || {}).forEach((k) => {
      const v = obj[k];
      if (v === undefined || v === null) return;
      if (Array.isArray(v) && v.length === 0) return;
      out[k] = v;
    });
    return out;
  }
}
