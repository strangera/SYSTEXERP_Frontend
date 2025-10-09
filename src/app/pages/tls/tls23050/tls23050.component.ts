/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  styleUrls: ['./tls23050.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    ButtonModule,
    TableReportComponent, // ✅ 使用 app-table-report
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // 匯出
  btnLoading = false;
  historyRequestBody: any | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 表單：單日 + 多個條件
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    // 分頁/排序（交給 app-table-report，但 pageSize 固定 30）
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  // 下拉
  WhetherOptions: any[] = [
    { value: null, label: '全部' },
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
  ];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  // 表尾總計（依欄位名稱直接餵值）
  footerData: Record<string, number> = {};

  constructor(
    private tls23050Service: TLS23050Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));

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
  }

  // === 查詢（送出）===
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      const payload: any = {
        TXN_Date: this.toDateOnly(val?.TXN_Date), // 單日
        rece_yn: val?.rece_yn ?? undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val?.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val?.ECR_No.length ? val.ECR_No : undefined,

        // 固定 30
        pageSize: 30,
        pageIndex: Number(val?.pageIndex) || 1,
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : [{ field: 'ECR_No', order: 1 }],
      };

      // 匯出時要拿掉 pageSize/pageIndex，所以另存
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23050Service
        .queryTLS23050(payload)
        .pipe(finalize(() => { this.loading = false; this.messageService?.unblockUi(); }))
        .subscribe({
          next: (res: any) => {
            const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : (res?.Data ?? null);

            // 明細
            const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];
            this.data = details.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            }));
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

            // 表尾總計（依欄位名稱直接餵值）
            this.footerData = this.buildFooterFromPack(first);
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
          },
        });
    });
  }

  // === 提供給 app-table-report 的查詢函式（支援分頁/排序；固定 pageSize:30）===
  public queryTLS23050ForReport = (body: any) =>
    this.tls23050Service
      .queryTLS23050({ ...body, pageSize: 30 })
      .pipe(
        map((res: any) => {
          const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : (res?.Data ?? null);
          const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];

          const rows = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // 回傳 GrandTotal 讓 table 也能使用；同時同步到 this.footerData
          const grand = this.buildFooterFromPack(first);
          this.footerData = grand;

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );

  // === 匯出（PDF / Excel）— 不傳 pageSize / pageIndex ===
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
    this.tls23050Service
      .exportTLS23050PDF(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23050Service
      .exportTLS23050Excel(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx'),
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

  // === 欄位定義（總計列會以 footerData 顯示）===
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
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

    { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];

  /** 建立表尾總計（把後端 total* 映到欄位名） */
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

      TXN_PrePayAmt:  n(first?.totalPrePayAmt),
      TXN_OverAmt:    n(first?.totalOverAmt),
      TXN_ReturnAmt:  n(first?.totalReturnAmt),
      TXN_CancelAmt:  n(first?.totalCancelAmt),
    };
  }

  /** 只回 YYYY-MM-DD（本地時區） */
  private toDateOnly(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
