/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

import { CommonModule } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

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
  ]
})
export class TLS23080Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // 匯出用
  btnLoading = false;
  historyRequestBody: any | null = null;

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
    // 現金
    ACT_PayAmt10: 'TotalPayAmt10',

    // 聯信
    UnionGeneral: 'TotalUnionGeneral',
    UnionAE: 'TotalUnionAE',
    UnionDiner: 'TotalUnionDiner',

    // 中信
    CTBCGeneral: 'TotalCTBCGeneral',
    CTBCAE: 'TotalCTBCAE',
    CTBCDiner: 'TotalCTBCDiner',

    // 中信-停車場
    CTBCParkingGeneral: 'TotalCTBCParkingGeneral',
    CTBCParkingAE: 'TotalCTBCParkingAE',
    CTBCParkingDiner: 'TotalCTBCParkingDiner',

    // 其他支付
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

    // 總金額
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
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
  }

  // ===== 查詢（按鈕）— 固定 pageSize=30 =====
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
        pageIndex: Number(val?.pageIndex) || 1,
        pageSize: 30, // ✅ 固定 30
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      // 提供給 app-table-report 的 lastQueryBody
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
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          const rows = this.extractRows(wrappers);

          // 同步總計列（用第一包的 Total* 欄位）
          const first = wrappers[0] ?? {};
          this.grandTotal = this.mapTotalsFromWrapper(first);

          this.data = rows;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.grandTotal = {};
        }
      });
    });
  }

  // ✅ 提供給 app-table-report 的查詢函式 — 固定 pageSize=30，並帶回 GrandTotal
  public queryTLS23080ForReport = (body: any) =>
    this.tls23080Service
      .queryTLS23080({
        ...(body || {}),
        pageSize: 30,
        // ★ 強制 DateOnly（若 body 沒有就抓表單值）
        TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      })
      .pipe(
        map((res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          const rows = this.extractRows(wrappers);
          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // GrandTotal
          const first = wrappers[0] ?? {};
          const grand = this.mapTotalsFromWrapper(first);
          this.grandTotal = { ...grand };

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );


  // ========= 匯出 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest; // ✅ 去除 pageSize/pageIndex（大小寫都保險處理）
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
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
    if (!this.historyRequestBody) {
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
  /** 把 wrapper 內的 Total* 欄位轉成表尾需要的 GrandTotal 結構（用 columns 的 field 名） */
  private mapTotalsFromWrapper(wrapper: any): Record<string, number> {
    const grand: Record<string, number> = {};
    Object.entries(this.detailTotalFieldMap).forEach(([field, apiKey]) => {
      grand[field] = Number(wrapper?.[apiKey] ?? 0);
    });
    return grand;
  }

  /** 提供給 [footerData]，只吐需要的合計欄位鍵值 */
  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    // 只回傳在欄位上標記 isTotal 的欄位，以免多餘鍵值干擾
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) {
        footer[col.field] = this.grandTotal[col.field] ?? 0;
      }
    }
    return footer;
  }

  // ===== 工具 =====
  moneyFormat(value: number): string {
    return value != null ? Number(value || 0).toLocaleString('en-US') : '0';
  }

  private toIso(dateLike: any): string | undefined {
    if (!dateLike) return undefined;
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
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

  // 詳細（若未使用可移除）

  onViewTLS23080(row: any) {
    const dateOnly = this.toDateOnly(row?.TXN_Date);
    this.router.navigate(['/account/tls/tls23080cru'], {
      state: { criteria: { TXN_Date: dateOnly } }
    });
  }

  // 下載工具
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

    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const encoded = filenameStarMatch[1].trim();
      try { return decodeURIComponent(encoded.replace(/^UTF-8''/, '')); } catch { return encoded; }
    }

    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { return filenameMatch[1]; }
    }

    return `download${defaultExtension}`;
  }

  // ===== 欄位（加上 isTotal 以顯示總計列）=====
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

    // 現金
    { field: 'ACT_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 聯信（41/42/12）
    { field: 'UnionGeneral', header: '聯信(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionAE', header: '聯信(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'UnionDiner', header: '聯信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 中信（43/44/14）
    { field: 'CTBCGeneral', header: '中信(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCAE', header: '中信(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCDiner', header: '中信(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 中信-停車場（81）
    { field: 'CTBCParkingGeneral', header: '中信-停車場(一般)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingAE', header: '中信-停車場(AE)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
    { field: 'CTBCParkingDiner', header: '中信-停車場(Diners)', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },

    // 其他付款別
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

    // 總金額
    { field: 'Tot_ACT_PayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this), isTotal: true },
  ];
  // 1) 新增這個工具函式（放在 component 裡即可）
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    // 輸出 yyyy-MM-dd（只有日期、無時間/時區）
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
