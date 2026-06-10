/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';

// 修正後的共通 Table 介面與欄位格式化工具路徑
import {
  formatAmount,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    RadiobuttonComponent, MultiSelectComponent, ButtonComponent, TranslateModule,
    CalendarComponent, ButtonModule, TableReportComponent,
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  footerData: Record<string, number> = {};

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格) =====
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    pageSize: [1000], // ⬅️ 依要求，初始與全域限制大小改為 1000
    pageIndex: [1],   // ⬅️ 依要求，初始頁碼改為 1
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: null, label: '全部' },
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
  ];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23050Service: TLS23050Service,
    private readonly floorService: FloorService,
    private readonly ECRNoService: ECRNoService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));
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
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
    });
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const payload: any = {
        TXN_Date: this.toDateOnly(val?.TXN_Date),
        rece_yn: val?.rece_yn ?? undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val?.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val?.ECR_No.length ? val.ECR_No : undefined,
        pageSize: 1000, // ⬅️ 固定為 1000 規格
        pageIndex: 1,  // pack 型報表固定第一頁
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : [{ field: 'ECR_No', order: 1 }],
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23050Service.queryTLS23050(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          }),
        )
        .subscribe({
          next: (res: any) => {
            const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : res?.Data ?? null;
            const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];

            this.data = details.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            }));

            this.totalRecords = Number(res?.TotalCount ?? res?.TotalRecords ?? first?.totalCount ?? first?.totalRecords ?? this.data.length);
            this.footerData = this.buildFooterFromPack(first);

            if (this.historyRequestBody) {
              this.historyRequestBody = { ...this.historyRequestBody, pageIndex: 1, pageSize: 1000 };
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

  // ========= <app-table-report> 查詢封裝調用（支援 1000 滾動） =========
  public queryTLS23050ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;
    const basePayload: any = {
      TXN_Date: this.toDateOnly(formVal?.TXN_Date),
      rece_yn: formVal?.rece_yn ?? undefined,
      tlt_building: formVal?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
    };

    const sortBy = Array.isArray(body?.SortBy) && body.SortBy.length ? body.SortBy : [{ field: 'ECR_No', order: 1 }];
    const pageIndex = Number(body?.pageIndex ?? 1);
    const pageSize = Number(body?.pageSize ?? 1000); // ⬅️ 固定 1000 分頁大小

    const payload: any = { ...basePayload, pageIndex, pageSize, SortBy: sortBy };

    return this.tls23050Service.queryTLS23050(payload).pipe(
      map((res: any) => {
        const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : res?.Data ?? null;
        const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];

        const rows = details.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${pageIndex}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
        }));

        const totalCount = Number(res?.TotalCount ?? 0);
        const grand = first ? this.buildFooterFromPack(first) : (this.footerData ?? {});

        this.footerData = grand;
        this.totalRecords = totalCount;

        if (this.historyRequestBody) {
          this.historyRequestBody = { ...this.historyRequestBody, ...basePayload, SortBy: sortBy, pageIndex, pageSize };
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );
  };

  // ========= 檔案匯出維護 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.xlsx') });
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

  private toDateOnly(val: any): string | undefined {
    if (!val) return undefined;
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且修正 align 規格) =====
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt10', header: '現金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
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
    { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt54', header: '一卡通非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt84', header: '電子支付非開', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt26', header: '品牌已開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt27', header: '品牌未開票券', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt28', header: '外送平台', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt29', header: 'EC', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PayAmt61', header: 'PayEasy', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_PrePayAmt', header: '預售訂金', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_ExchgAmt', header: '換貨金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];

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
}
