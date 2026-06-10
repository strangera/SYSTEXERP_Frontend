/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';

// 修正後的共通 Table 介面與欄位格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeQuickComponent, RadiobuttonComponent, MultiSelectComponent, ButtonComponent,
    TranslateModule, ButtonModule, TableReportComponent, DialogComponent,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 主表狀態 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  footerData: Record<string, number> = {};
  sortMeta: any[] = [];

  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告（符合 1000 規格與 1 起始頁） =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 調整為 1000 規格
    pageIndex: [1],   // ⬅️ 調整為初始頁碼 1
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
    { value: null, label: '全部' },
  ];

  // ===== 明細 Dialog 狀態 =====
  dialogVisible = false;
  dialogLoading = false;
  dialogData: any[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Record<string, number> = {};
  dialogHistoryRequestBody: any | null = null;
  selectedMainRow: any | null = null;

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23060Service: TLS23060Service,
    private readonly floorService: FloorService,
    private readonly ECRNoService: ECRNoService,
    private readonly counterNameService: CounterNameService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls/tls23060cru', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((s) => ({ ...s }));
    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 最佳實踐)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      floors: this.floorService.getFloors().pipe(catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.tls11010Service.getOrgOptions().pipe(catchError(() => of([]))),
      ecrs: this.ECRNoService.getECRNo().pipe(catchError(() => of([]))),
      counters: this.counterNameService.getCounters().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res: { floors: never[]; buildings: never[]; orgs: any; ecrs: any; counters: any; }) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
    });
  }

  // ========= 主表查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        rece_yn: val?.rece_yn ?? undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_no: Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        pageSize: 1000, // ⬅️ 全域設定轉為 1000
        pageIndex: 1,
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23060Service.queryTLS23060(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          }),
        )
        .subscribe({
          next: (res: any) => {
            const wrapper = this.pickWrapper(res?.Data);
            const details = this.pickDetails(wrapper);

            this.data = details.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            }));

            const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
            const hasPaging = apiTotal > this.data.length;
            this.totalRecords = hasPaging ? apiTotal : this.data.length;
            this.footerData = this.buildFooterFromPack(wrapper);

            if (this.historyRequestBody) {
              this.historyRequestBody = {
                ...this.historyRequestBody,
                pageIndex: 1,
                pageSize: hasPaging ? 1000 : 999999, // ⬅️ 滾動或一包載入機制同步 1000 基準
              };
            }
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
          },
        });
    });
  }

  // ========= 主表：提供給 app-table-report 的查詢函式 =========
  public queryTLS23060ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;
    const basePayload: any = {
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
      tlt_no: Array.isArray(formVal?.tlt_no) && formVal.tlt_no.length ? formVal.tlt_no : undefined,
      tlt_building: formVal?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
    };

    const formPageIndex = Number(formVal?.pageIndex) || 1;
    const pageIndex = body?.pageIndex != null ? Number(body.pageIndex) : formPageIndex;
    const sortBy = body?.SortBy && Array.isArray(body.SortBy) && body.SortBy.length ? body.SortBy : Array.isArray(formVal?.SortBy) && formVal.SortBy.length ? formVal.SortBy : this.defaultSort;

    return this.tls23060Service.queryTLS23060({
      ...basePayload,
      pageSize: 1000, // ⬅️ 固定採用 1000 規格
      pageIndex,
      SortBy: sortBy,
    }).pipe(
      map((res: any) => {
        const wrapper = this.pickWrapper(res?.Data);
        const details = this.pickDetails(wrapper);
        const rows = (details ?? []).map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
        }));

        const apiTotal = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : 0;
        const hasPaging = apiTotal > rows.length;
        let totalCount = hasPaging ? apiTotal : rows.length;

        if (pageIndex > 1 && rows.length === 0) {
          totalCount = this.data.length;
        }

        const grand = this.buildFooterFromPack(wrapper);
        this.footerData = grand;

        if (this.historyRequestBody) {
          this.historyRequestBody = {
            ...this.historyRequestBody,
            ...basePayload,
            SortBy: sortBy,
            pageIndex: 1,
            pageSize: hasPaging ? 1000 : 999999,
          };
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );
  };

  // ========= 彈窗明細觸發器 =========
  override onDetail(row: any): void {
    if (!row) return;
    this.selectedMainRow = row;
    this.dialogVisible = true;
    const formVal = this.queryForm.getRawValue() as any;

    const body: any = {
      PageSize: 0,
      PageIndex: 0,
      SortBy: [{ field: 'TXN_Date', order: 1 }],
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,
      ECR_No: row?.ECR_No ?? undefined,
      tlt_no: row?.tlt_no ?? undefined,
      tlt_building: formVal?.tlt_building ?? [],
      tlt_floor: Array.isArray(formVal?.tlt_floor) ? formVal.tlt_floor : [],
      org_id: Array.isArray(formVal?.org_id) ? formVal.org_id : [],
    };

    this.dialogHistoryRequestBody = { ...body, pageIndex: 1, pageSize: 999999 };
    this.dialogLoading = true;

    this.queryTLS23060DetailForReport({ ...body, pageIndex: 1, pageSize: 1000 })
      .pipe(finalize(() => (this.dialogLoading = false)))
      .subscribe({
        error: () => {
          this.dialogData = [];
          this.dialogTotalRecords = 0;
          this.dialogFooterData = {};
        },
      });
  }

  // ========= 明細：提供給 Dialog 內 app-table-report 的查詢函式 =========
  public queryTLS23060DetailForReport = (body: any) =>
    this.tls23060Service.queryTLS23060Detail({
      ...(this.dialogHistoryRequestBody ?? {}),
      ...body,
      pageSize: 1000, // ⬅️ 明細表也同步為 1000
      pageIndex: 1,
      SortBy: Array.isArray(body?.SortBy) && body.SortBy.length ? body.SortBy : [{ field: 'TXN_Date', order: 1 }],
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        const wrapper = this.pickWrapper(res?.Data);
        const details = this.pickDetails(wrapper);

        const rows = details.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
        }));

        rows.sort((a, b) => (a.TXN_Date ?? '') > (b.TXN_Date ?? '') ? 1 : -1);

        const totalCount = rows.length;
        const grand = this.buildFooterFromPack(wrapper);

        this.dialogFooterData = grand;
        this.dialogTotalRecords = totalCount;
        this.dialogData = rows;

        if (this.dialogHistoryRequestBody) {
          this.dialogHistoryRequestBody = { ...this.dialogHistoryRequestBody, pageIndex: 1, pageSize: 999999 };
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );

  onDialogClose(v: boolean): void {
    this.dialogVisible = v;
    if (!v) {
      this.selectedMainRow = null;
      this.dialogData = [];
      this.dialogTotalRecords = 0;
      this.dialogFooterData = {};
      this.dialogHistoryRequestBody = null;
    }
  }

  // ========= 檔案匯出功能群 =========
  onExportExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23060Service.exporttls23060Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx') });
  }

  onExportDetailExcel(): void {
    if (!this.dialogHistoryRequestBody) return this.showDetailWarn();
    this.btnLoading = true;
    const { pageSize, pageIndex, PageSize, PageIndex, ...body } = this.dialogHistoryRequestBody;
    this.tls23060Service.exportTLS23060DetailExcel(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx') });
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23060Service.exporttls23060PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf') });
  }

  onExportDetailPDF(): void {
    if (!this.dialogHistoryRequestBody) return this.showDetailWarn();
    this.btnLoading = true;
    const { pageSize, pageIndex, PageSize, PageIndex, ...body } = this.dialogHistoryRequestBody;
    this.tls23060Service.exportTLS23060DetailPDF(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf') });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }
  private showDetailWarn(): void { this.messageService?.warnBubble?.('請先點選主表資料開啟明細。'); }

  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest;
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
    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 輔助解包小工具 =========
  private pickWrapper = (data: any): any => Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});
  private pickDetails = (wrapper: any): any[] => (wrapper?.tLS23060Details ?? wrapper?.TLS23060Details ?? wrapper?.tls23060Details ?? []) as any[];
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** 建立表尾總計（映射到欄位名） */
  private buildFooterFromPack(first: any): Record<string, number> {
    const n = (x: any) => Number(x ?? 0);
    return {
      TXN_TotPayAmt: n(first?.totalPayAmt), TXN_PayAmt10: n(first?.totalPayAmt10), TXN_PayAmt41: n(first?.totalPayAmt41),
      TXN_PayAmt42: n(first?.totalPayAmt42), TXN_PayAmt12: n(first?.totalPayAmt12), TXN_PayAmt81: n(first?.totalPayAmt81),
      TXN_PayAmt43: n(first?.totalPayAmt43), TXN_PayAmt44: n(first?.totalPayAmt44), TXN_PayAmt14: n(first?.totalPayAmt14),
      TXN_PayAmt82: n(first?.totalPayAmt82), TXN_PayAmt52: n(first?.totalPayAmt52), TXN_PayAmt20: n(first?.totalPayAmt20),
      TXN_PayAmt62: n(first?.totalPayAmt62), TXN_PayAmt77: n(first?.totalPayAmt77), TXN_PayAmt71: n(first?.totalPayAmt71),
      TXN_PayAmt30: n(first?.totalPayAmt30), TXN_PayAmt73: n(first?.totalPayAmt73), TXN_PayAmt72: n(first?.totalPayAmt72),
      TXN_PayAmt74: n(first?.totalPayAmt74), TXN_PayAmt75: n(first?.totalPayAmt75), TXN_PayAmt76: n(first?.totalPayAmt76),
      TXN_PayAmt24: n(first?.totalPayAmt24), TXN_PayAmt25: n(first?.totalPayAmt25), TXN_PayAmt07: n(first?.totalPayAmt07),
      TXN_PayAmt55: n(first?.totalPayAmt55), TXN_PayAmt83: n(first?.totalPayAmt83), TXN_PayAmt78: n(first?.totalPayAmt78),
      TXN_PayAmt79: n(first?.totalPayAmt79), TXN_PayAmt21: n(first?.totalPayAmt21), TXN_PayAmt53: n(first?.totalPayAmt53),
      TXN_PayAmt54: n(first?.totalPayAmt54), TXN_PayAmt84: n(first?.totalPayAmt84), TXN_PayAmt56: n(first?.totalPayAmt56),
      TXN_PayAmt57: n(first?.totalPayAmt57), TXN_PayAmt58: n(first?.totalPayAmt58), TXN_PayAmt59: n(first?.totalPayAmt59),
      TXN_PayAmt60: n(first?.totalPayAmt60), TXN_PayAmt22: n(first?.totalPayAmt22), TXN_PayAmt23: n(first?.totalPayAmt23),
      TXN_PayAmt26: n(first?.totalPayAmt26), TXN_PayAmt27: n(first?.totalPayAmt27), TXN_PayAmt28: n(first?.totalPayAmt28),
      TXN_PayAmt29: n(first?.totalPayAmt29), TXN_PayAmt61: n(first?.totalPayAmt61), TXN_PrePayAmt: n(first?.totalPrePayAmt),
      TXN_OverAmt: n(first?.totalOverAmt), TXN_ReturnAmt: n(first?.totalReturnAmt), TXN_CancelAmt: n(first?.totalCancelAmt),
      TXN_ExchgAmt: n(first?.totalExchgAmt),
    };
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt54', header: '一卡通非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt84', header: '電子支付非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];

  detailColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt54', header: '一卡通非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt84', header: '電子支付非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];
}
