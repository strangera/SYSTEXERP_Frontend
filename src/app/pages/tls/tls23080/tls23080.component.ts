/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/components/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, RadiobuttonComponent, InputTextModule,
    ButtonComponent, TranslateModule, ButtonModule, TableReportComponent,
  ],
})
export class TLS23080Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  // 保留原有固定物件 reference 優化設計
  historyRequestBody: any = {};
  private querying = false;
  private lastQueryKey = '';
  private grandTotal: Record<string, number> = {};

  // ===== 下拉選單資料源 =====
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];

  readonly defaultSort: any[] = [{ field: 'TXN_Date', order: 1 }];

  // 後端與前端欄位對應總計對照表
  private readonly detailTotalFieldMap: Record<string, string> = {
    ACT_PayAmt10: 'TotalPayAmt10', UnionGeneral: 'TotalUnionGeneral', UnionAE: 'TotalUnionAE',
    UnionDiner: 'TotalUnionDiner', CTBCGeneral: 'TotalCTBCGeneral', CTBCAE: 'TotalCTBCAE',
    CTBCDiner: 'TotalCTBCDiner', CTBCParkingGeneral: 'TotalCTBCParkingGeneral', CTBCParkingAE: 'TotalCTBCParkingAE',
    CTBCParkingDiner: 'TotalCTBCParkingDiner', ACT_PayAmt52: 'TotalPayAmt52', ACT_PayAmt82: 'TotalPayAmt82',
    ACT_PayAmt20: 'TotalPayAmt20', ACT_PayAmt62: 'TotalPayAmt62', ACT_PayAmt77: 'TotalPayAmt77',
    ACT_PayAmt71: 'TotalPayAmt71', ACT_PayAmt30: 'TotalPayAmt30', ACT_PayAmt73: 'TotalPayAmt73',
    ACT_PayAmt72: 'TotalPayAmt72', ACT_PayAmt74: 'TotalPayAmt74', ACT_PayAmt75: 'TotalPayAmt75',
    ACT_PayAmt76: 'TotalPayAmt76', ACT_PayAmt24: 'TotalPayAmt24', ACT_PayAmt25: 'TotalPayAmt25',
    ACT_PayAmt07: 'TotalPayAmt07', ACT_PayAmt55: 'TotalPayAmt55', ACT_PayAmt83: 'TotalPayAmt83',
    ACT_PayAmt78: 'TotalPayAmt78', ACT_PayAmt79: 'TotalPayAmt79', ACT_PayAmt21: 'TotalPayAmt21',
    ACT_PayAmt53: 'TotalPayAmt53', ACT_PayAmt56: 'TotalPayAmt56', ACT_PayAmt57: 'TotalPayAmt57',
    ACT_PayAmt58: 'TotalPayAmt58', ACT_PayAmt59: 'TotalPayAmt59', ACT_PayAmt60: 'TotalPayAmt60',
    ACT_PayAmt22: 'TotalPayAmt22', ACT_PayAmt23: 'TotalPayAmt23', ACT_PayAmt26: 'TotalPayAmt26',
    ACT_PayAmt27: 'TotalPayAmt27', ACT_PayAmt28: 'TotalPayAmt28', ACT_PayAmt29: 'TotalPayAmt29',
    ACT_PayAmt61: 'TotalPayAmt61', Tot_ACT_PayAmt: 'TotalTotPayAmt',
  };

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告（符合 1000 規格與頁碼 1 起始） =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_openflag: ['N'],
    ECR_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 調整為 1000 規格
    pageIndex: [1],   // ⬅️ 調整初始頁碼為 1
    SortBy: [[{ field: 'TXN_Date', order: 1 }]],
  });

  constructor(
    private readonly tls23080Service: TLS23080Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));

    // 下拉選單整合 forkJoin 載入
    forkJoin({
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), take(1)),
      buildings: this.tls11010Service.getBuildingOptions().pipe(take(1)),
      orgs: this.dropdownApiService.querySys3100().pipe(take(1)),
      ecrs: this.dropdownApiService.queryPos1002().pipe(take(1)),
      counters: this.dropdownApiService.queryTltTalent().pipe(take(1)),
    }).pipe(untilDestroyed(this)).subscribe({
      next: ({ floors, buildings, orgs, ecrs, counters }) => {
        this.floorOptions = floors ?? [];
        this.BUILDING_NO_Options = buildings ?? [];

        const mapStandardOption = (x: any) => ({
          label: x.label,
          formLabel: `${x.label}`,
          value: x.value,
        });

        this.OrganizationCodeOptions = (orgs ?? []).map(mapStandardOption);
        this.ECRNoOptions = (ecrs ?? []).map(mapStandardOption);
        this.CounterOptions = (counters ?? []).map(mapStandardOption);
      },
    });
  }

  // ========= 查詢（送出） =========
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
        pageSize: 1000, // ⬅️ 調整為全域指定之 1000 規格
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      const compactPayload = this.compactObject(payload);
      const key = JSON.stringify(compactPayload);

      if (this.querying || key === this.lastQueryKey) return;
      this.lastQueryKey = key;

      Object.assign(this.historyRequestBody, compactPayload);
      this.loading = true;
      this.querying = true;
      this.messageService?.blockUi();

      this.tls23080Service.queryTLS23080(compactPayload)
        .pipe(
          untilDestroyed(this),
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

            const first = wrappers[0] ?? {};
            this.grandTotal = this.mapTotalsFromWrapper(first);

            const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
            const hasPaging = apiTotal > rows.length;

            this.data = rows;
            this.totalRecords = hasPaging ? apiTotal : rows.length;

            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = hasPaging ? 1000 : 999999; // ⬅️ 同步更新為 1000 基準
            this.historyRequestBody.SortBy = compactPayload.SortBy ?? this.defaultSort;
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.grandTotal = {};
            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = 999999;
          },
        });
    });
  }

  // ========= <app-table-report> 查詢封裝調用（支援 1000 規格滾動） =========
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
    const sortBy = body?.SortBy && Array.isArray(body.SortBy) && body.SortBy.length ? body.SortBy : Array.isArray(formVal?.SortBy) && formVal.SortBy.length ? formVal.SortBy : this.defaultSort;

    return this.tls23080Service.queryTLS23080({
      ...basePayload,
      pageIndex,
      pageSize: 1000, // ⬅️ 全域更新為 1000 分頁大小
      SortBy: sortBy,
    }).pipe(
      map((res: any) => {
        const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rows = this.extractRows(wrappers);
        const first = wrappers[0] ?? {};
        const grand = this.mapTotalsFromWrapper(first);

        const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
        const hasPaging = apiTotal > rows.length;
        let totalCount = hasPaging ? apiTotal : rows.length;

        if (pageIndex > 1 && rows.length === 0) {
          totalCount = this.data.length;
        }

        this.grandTotal = { ...grand };

        Object.assign(this.historyRequestBody, {
          ...basePayload,
          SortBy: sortBy,
          pageIndex: 1,
          pageSize: hasPaging ? 1000 : 999999, // ⬅️ 同步機制
        });

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檔案匯出維護組件 =========
  private buildExportBody() {
    const src = this.historyRequestBody || {};
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = src;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23080Service.exportTLS23080PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23080Service.exportTLS23080Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.xlsx') });
  }

  private showExportWarn(): void {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
  }

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
      try { return decodeURIComponent(filenameStarMatch[1].trim().replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ======= 表尾總計工廠組合 =======
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

  // ===== 工具群與資料整理機制 =====
  private extractRows(wrappers: any[]): any[] {
    return wrappers
      .flatMap((g: any) => (Array.isArray(g?.tLS23080_Details) ? g.tLS23080_Details : []))
      .map((d: any, i: number) => ({
        ...d,
        TXN_Date: d?.TXN_Date ? this.toDateOnly(d.TXN_Date) : d?.TXN_Date,
        _rowKey: `${d?.TXN_Date ?? ''}|${i}`,
      }));
  }

  onViewTLS23080(row: any): void {
    const dateOnly = this.toDateOnly(row?.TXN_Date);
    this.router.navigate(['/account/tls/tls23080cru'], {
      state: { criteria: { TXN_Date: dateOnly } },
    });
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private compactObject(obj: any): any {
    const out: any = Array.isArray(obj) ? [] : {};
    Object.keys(obj || {}).forEach((k) => {
      const v = obj[k];
      if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) return;
      out[k] = v;
    });
    return out;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '日期', visible: true, align: 'left', format: formatDate },
    { field: 'ACT_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'UnionGeneral', header: '聯信(一般)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'UnionAE', header: '聯信(AE)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'UnionDiner', header: '聯信(DINER)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCGeneral', header: '中信(一般)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCAE', header: '中信(AE)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCDiner', header: '中信(DINER)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCParkingGeneral', header: '中信-停車場(一般)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCParkingAE', header: '中信-停車場(AE)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'CTBCParkingDiner', header: '中信-停車場(DINER)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt52', header: '一卡通', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt82', header: '一卡通-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt20', header: '禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt62', header: '商品提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt77', header: '感熱紙抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt71', header: '商品抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt73', header: '外來禮券(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt72', header: '外來提貨單(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt74', header: '活動券(自營)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt75', header: '折價券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt76', header: '現抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt24', header: '禮券餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt83', header: 'LINE Pay-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt22', header: '外來提貨單-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt23', header: '外來禮券-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'ACT_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'Tot_ACT_PayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];
}
