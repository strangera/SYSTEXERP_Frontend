/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

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
    TableReportComponent, // ✅ 使用 app-table-report
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  // 匯出時沿用的最後查詢參數（送出查詢時會更新）
  historyRequestBody: any | null = null;

  // 表尾總計（直接用欄位名對應值）
  footerData: Record<string, number> = {};

  // 排序
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列型欄位使用空陣列，避免 undefined
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    rece_yn:       [null],
    ECR_No:        [],
    tlt_no:        [],
    tlt_building:  [],
    tlt_floor:     [],
    org_id:        [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  // 下拉資料
  typeOptions: any[] = [];
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

  constructor(
    private tls23060Service: TLS23060Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private whetherService: WhetherService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls23060cru', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((s) => ({ ...s }));

    this.typeService.getTypeOptions().subscribe((data) => (this.typeOptions = data));
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

  // === 送出查詢：固定 pageSize=30；保存 historyRequestBody ===
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const payload: any = {
        TXN_DateStart: this.toIso(val?.TXN_DateStart, false),
        TXN_DateEnd:   this.toIso(val?.TXN_DateEnd, true),
        rece_yn:       val?.rece_yn ?? undefined,
        ECR_No:        Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_no:        Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id:        Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,

        // 固定 30（且保留 pageIndex / SortBy）
        pageSize : 30,
        pageIndex: Number(val?.pageIndex) || 1,
        SortBy   : Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      // 給 app-table-report 的 lastQueryBody 以及匯出沿用
      this.historyRequestBody = { ...payload };

      // UI 狀態
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23060Service
        .queryTLS23060(payload)
        .pipe(finalize(() => { this.loading = false; this.messageService?.unblockUi(); }))
        .subscribe({
          next: (res: any) => {
            const wrapper = this.pickWrapper(res?.Data);

            // 明細
            const details = this.pickDetails(wrapper);
            this.data = details.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            }));

            // 總筆數
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

            // 表尾總計
            this.footerData = this.buildFooterFromPack(wrapper);
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
          },
        });
    });
  }

  // === 提供給 app-table-report 的查詢函式：強制 pageSize=30 ===
  public queryTLS23060ForReport = (body: any) =>
    this.tls23060Service
      .queryTLS23060({ ...body, pageSize: 30 })
      .pipe(
        map((res: any) => {
          const wrapper = this.pickWrapper(res?.Data);
          const details = this.pickDetails(wrapper);

          const rows = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // 同步總計到 footerData，同時回傳給 table 當 GrandTotal
          const grand = this.buildFooterFromPack(wrapper);
          this.footerData = grand;

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );

  // === 匯出（PDF / Excel）— 會移除 pageSize / pageIndex ===
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

  onExportXLSX(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23060Service
      .exporttls23060Excel(body)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx'),
      });
  }

  // === 下載工具：補上這兩個方法，解決 handleFileExport 未定義 ===
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

  // === 工具 ===
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
      TXN_OverAmt:   n(first?.totalOverAmt),
      TXN_ReturnAmt: n(first?.totalReturnAmt),
      TXN_CancelAmt: n(first?.totalCancelAmt),
    };
  }

  /** 轉換日期：以本地時間作 offset 校正；endOfDay=true -> 23:59:59.999 */
  private toIso(val: any, endOfDay = false): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  // 金額格式
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // 欄位（isTotal 會用在 footerData）
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
}
