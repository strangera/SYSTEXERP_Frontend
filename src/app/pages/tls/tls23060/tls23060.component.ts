/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrls: ['./tls23060.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
    DialogComponent,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  // ===== 主表 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  historyRequestBody: any | null = null; // 匯出用 last query
  footerData: Record<string, number> = {}; // 主表 Footer

  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  // ===== 下拉 =====
  typeOptions: any[] = [
    { value: 1, label: '使用業主發票' },
    { value: 2, label: '非使用業主發票' },
  ];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [
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
  dialogHistoryRequestBody: any | null = null; // 給明細 table 的 lastQueryBody
  selectedMainRow: any | null = null;

  constructor(
    private tls23060Service: TLS23060Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls23060cru', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((s) => ({ ...s }));

    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));

    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((data) => {
      this.OrganizationCodeOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((data) => {
      this.CounterOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // ===== 主表查詢（按查詢按鈕）=====
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

        pageSize: 30,
        pageIndex: Number(val?.pageIndex) || 1,
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23060Service
        .queryTLS23060(payload)
        .pipe(
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

            this.totalRecords =
              typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

            this.footerData = this.buildFooterFromPack(wrapper);

            // ⭐ 調整 historyRequestBody.pageSize：讓 TableReport 的排序/虛擬捲動判斷用「實際筆數」
            if (this.historyRequestBody) {
              const realPageSize =
                this.data.length || this.historyRequestBody.pageSize || 30;
              this.historyRequestBody = {
                ...this.historyRequestBody,
                pageSize: realPageSize,
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

  // ===== 主表：提供給 app-table-report 的查詢函式 =====
  public queryTLS23060ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;

    // 1. 固定從表單取查詢條件（避免 body 裡殘留舊條件）
    const basePayload: any = {
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,
      ECR_No:
        Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length
          ? formVal.ECR_No
          : undefined,
      tlt_no:
        Array.isArray(formVal?.tlt_no) && formVal.tlt_no.length
          ? formVal.tlt_no
          : undefined,
      tlt_building: formVal?.tlt_building ?? undefined,
      tlt_floor:
        Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length
          ? formVal.tlt_floor
          : undefined,
      org_id:
        Array.isArray(formVal?.org_id) && formVal.org_id.length
          ? formVal.org_id
          : undefined,
    };

    // 2. pageIndex / SortBy（優先 body，其次 form，再來 default）
    const formPageIndex = Number(formVal?.pageIndex) || 1;
    const pageIndex =
      body?.pageIndex != null ? Number(body.pageIndex) : formPageIndex;

    const sortBy =
      body?.SortBy && body.SortBy.length
        ? body.SortBy
        : Array.isArray(formVal?.SortBy) && formVal.SortBy.length
          ? formVal.SortBy
          : this.defaultSort;

    const pagingAndSort = {
      pageSize: 30,
      pageIndex,
      SortBy: sortBy,
    };

    return this.tls23060Service
      .queryTLS23060({
        ...basePayload,
        ...pagingAndSort,
      })
      .pipe(
        map((res: any) => {
          const wrapper = this.pickWrapper(res?.Data);
          const details = this.pickDetails(wrapper);

          const rows = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));

          let totalCount =
            typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // ⭐ 如果是第二頁以上，但這一頁一筆都沒有，視為「到底了」
          //   把 totalCount 壓成目前已載入的筆數，避免一直打 pageIndex=2
          if (pageIndex > 1 && rows.length === 0) {
            totalCount = this.data.length;
          }

          const grand = this.buildFooterFromPack(wrapper);
          this.footerData = grand;

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        }),
      );
  };

  // ===== 點主表「明細」→ 組明細查詢 body，打 /queryTLS23060_Detail =====
  override onDetail(row: any): void {
    if (!row) return;

    this.selectedMainRow = row;
    this.dialogVisible = true;

    const formVal = this.queryForm.getRawValue() as any;

    // 依你給的 Request 規格組 body
    const body: any = {
      PageSize: 0,
      PageIndex: 0,
      SortBy: [{ field: 'TXN_Date', order: 1 as 1 }],

      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,

      // 用被點那列的值
      ECR_No: row?.ECR_No ?? undefined,
      tlt_no: row?.tlt_no ?? undefined,

      // 下面三個是陣列型別
      tlt_building: formVal?.tlt_building ?? [],
      tlt_floor: Array.isArray(formVal?.tlt_floor) ? formVal.tlt_floor : [],
      org_id: Array.isArray(formVal?.org_id) ? formVal.org_id : [],
    };

    // 給 app-table-report 的 lastQueryBody 用
    this.dialogHistoryRequestBody = body;

    // 先查一次明細，開 Dialog 就有資料
    this.dialogLoading = true;
    this.queryTLS23060DetailForReport(body)
      .pipe(finalize(() => (this.dialogLoading = false)))
      .subscribe({
        error: () => {
          this.dialogData = [];
          this.dialogTotalRecords = 0;
          this.dialogFooterData = {};
        },
      });
  }

  // ===== 明細：提供給 Dialog 內 app-table-report 的查詢函式 → 打 /queryTLS23060_Detail，以日期為主 =====
  public queryTLS23060DetailForReport = (body: any) =>
    this.tls23060Service
      .queryTLS23060Detail({
        ...(this.dialogHistoryRequestBody ?? {}),
        ...body,
        // 保底 pageIndex / pageSize / SortBy
        pageSize: Number(body?.pageSize) || 30,
        pageIndex: Number(body?.pageIndex) || 1,
        SortBy:
          Array.isArray(body?.SortBy) && body.SortBy.length
            ? body.SortBy
            : [{ field: 'TXN_Date', order: 1 as 1 }],
        TXN_DateStart: this.toDateOnly(
          body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart,
        ),
        TXN_DateEnd: this.toDateOnly(
          body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd,
        ),
      })
      .pipe(
        map((res: any) => {
          const wrapper = this.pickWrapper(res?.Data);
          const details = this.pickDetails(wrapper);

          const rows = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));

          // 以日期排序
          rows.sort((a, b) => {
            const ad = a.TXN_Date ?? '';
            const bd = b.TXN_Date ?? '';
            return ad > bd ? 1 : ad < bd ? -1 : 0;
          });

          const totalCount =
            typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
          const grand = this.buildFooterFromPack(wrapper);

          // 給 dialog 綁定用
          this.dialogFooterData = grand;
          this.dialogTotalRecords = totalCount;
          this.dialogData = rows;

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

  // ===== 匯出：主表 PDF =====
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23060Service
      .exporttls23060PDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      });
  }

  // ===== 匯出：明細表 PDF =====
  onExportDetailPDF(): void {
    if (!this.dialogHistoryRequestBody) {
      this.messageService?.warnBubble?.('請先點選主表資料開啟明細。');
      return;
    }
    this.btnLoading = true;
    const body = this.dialogHistoryRequestBody;
    this.tls23060Service
      .exportTLS23060DetailPDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      });
  }

  // ===== 下載工具 =====
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

  // ===== 工具 =====
  private pickWrapper(data: any): any {
    return Array.isArray(data) ? (data[0] ?? {}) : (data ?? {});
  }

  private pickDetails(wrapper: any): any[] {
    return (
      wrapper?.tLS23060Details ??
      wrapper?.TLS23060Details ??
      wrapper?.tls23060Details ??
      []
    ) as any[];
  }

  /** 建立表尾總計（把後端 total* 映射到欄位名） */
  private buildFooterFromPack(first: any): Record<string, number> {
    const n = (x: any) => Number(x ?? 0);
    return {
      TXN_TotPayAmt: n(first?.totalPayAmt),

      TXN_PayAmt10: n(first?.totalPayAmt10),
      TXN_PayAmt41: n(first?.totalPayAmt41),
      TXN_PayAmt42: n(first?.totalPayAmt42),
      TXN_PayAmt12: n(first?.totalPayAmt12),

      TXN_PayAmt81: n(first?.totalPayAmt81),
      TXN_PayAmt43: n(first?.totalPayAmt43),
      TXN_PayAmt44: n(first?.totalPayAmt44),
      TXN_PayAmt14: n(first?.totalPayAmt14),

      TXN_PayAmt82: n(first?.totalPayAmt82),
      TXN_PayAmt52: n(first?.totalPayAmt52),

      TXN_PayAmt20: n(first?.totalPayAmt20),
      TXN_PayAmt62: n(first?.totalPayAmt62),

      TXN_PayAmt77: n(first?.totalPayAmt77),
      TXN_PayAmt71: n(first?.totalPayAmt71),

      TXN_PayAmt30: n(first?.totalPayAmt30),

      TXN_PayAmt73: n(first?.totalPayAmt73),
      TXN_PayAmt72: n(first?.totalPayAmt72),

      TXN_PayAmt74: n(first?.totalPayAmt74),
      TXN_PayAmt75: n(first?.totalPayAmt75),
      TXN_PayAmt76: n(first?.totalPayAmt76),

      TXN_PayAmt24: n(first?.totalPayAmt24),
      TXN_PayAmt25: n(first?.totalPayAmt25),

      TXN_PayAmt07: n(first?.totalPayAmt07),

      TXN_PayAmt55: n(first?.totalPayAmt55),
      TXN_PayAmt83: n(first?.totalPayAmt83),

      TXN_PayAmt78: n(first?.totalPayAmt78),
      TXN_PayAmt79: n(first?.totalPayAmt79),
      TXN_PayAmt21: n(first?.totalPayAmt21),

      TXN_PayAmt53: n(first?.totalPayAmt53),
      TXN_PayAmt56: n(first?.totalPayAmt56),
      TXN_PayAmt57: n(first?.totalPayAmt57),
      TXN_PayAmt58: n(first?.totalPayAmt58),
      TXN_PayAmt59: n(first?.totalPayAmt59),
      TXN_PayAmt60: n(first?.totalPayAmt60),

      TXN_PayAmt22: n(first?.totalPayAmt22),
      TXN_PayAmt23: n(first?.totalPayAmt23),

      TXN_PrePayAmt: n(first?.totalPrePayAmt),
      TXN_OverAmt: n(first?.totalOverAmt),
      TXN_ReturnAmt: n(first?.totalReturnAmt),
      TXN_CancelAmt: n(first?.totalCancelAmt),
      TXN_ExchgAmt: n(first?.totalExchgAmt),
    };
  }

  /** 轉成 yyyy-MM-dd（DateOnly） */
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /** 日期顯示 yyyy/MM/dd（如果你要在欄位 format 用到） */
  private formatYMD(val: unknown): string {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).
        padStart(2, '0');
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
  }

  // 金額格式
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // 主表欄位
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];

  // Dialog 明細欄位（以日期為主）
  detailColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: any) => this.formatYMD(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];
}
