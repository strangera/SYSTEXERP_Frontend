import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { TypeService } from '../../../service/basic/type.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { finalize, map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ButtonModule } from 'primeng/button';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  styleUrls: ['./tls23050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    ButtonModule,
    Table2Component, // ✅ 使用 table2 支援小計/總計
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // 匯出
  btnLoading = false;
  historyRequestBody: any | null = null;

  // 分頁/排序（不傳 offset / OrderBy）
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 表單：單日日期 + 多個條件
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  WhetherOptions: any[] = [
    { value: null, label: '全部' },
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
  ];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  constructor(
    private tls23050Service: TLS23050Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.typeService.getTypeOptions().subscribe(data => this.typeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(data => {
      this.OrganizationCodeOptions = (data ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe(data => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({
        label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
      }));
    });
  }

// 提供給 Table2 的 lazy 載入
fetchTLS23050 = (evt: LazyLoadEvent) => {
  const val = this.queryForm.getRawValue() as any;

  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(val?.pageIndex ?? 1);
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt!.pageSize)  : Number(val?.pageSize  ?? 20);
  const sortBy    = Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
    ? (evt as any).SortBy
    : (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort);

  // ⭐ 只取單日
  const TXN_Date = this.toDateOnly(val?.TXN_Date);

  const payload: any = {
    TXN_Date,                                 // ⭐ 改這裡
    rece_yn      : val?.rece_yn ?? undefined,
    tlt_building : val?.tlt_building ?? undefined,
    tlt_floor    : (Array.isArray(val?.tlt_floor) && val.tlt_floor.length) ? val.tlt_floor : undefined,
    org_id       : (Array.isArray(val?.org_id) && val.org_id.length) ? val.org_id : undefined,
    ECR_No       : (Array.isArray(val?.ECR_No) && val.ECR_No.length) ? val.ECR_No : undefined,

    pageIndex,
    pageSize,
    SortBy: sortBy,
  };

  Object.keys(payload).forEach((k) => {
    const v = payload[k];
    if (v === '' || v === null || v === undefined) delete payload[k];
    if (Array.isArray(v) && v.length === 0) delete payload[k];
  });

  return this.tls23050Service.queryTLS23050(payload).pipe(
    map((res: any) => {
      const first =
        Array.isArray(res?.Data) && res.Data.length > 0
          ? res.Data[0]
          : (res?.Data ?? null);

      // ① rows（明細）
      const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];
      const rows = details.map((r: any, i: number) => ({
        ...r,
        _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
      }));

      // ② externalTotals（總計：直接吃後端 total* 欄位）
      const externalTotals: Record<string, number> = {
        totalPayAmt   : Number(first?.totalPayAmt   ?? 0),
        totalPayAmt10 : Number(first?.totalPayAmt10 ?? 0),
        totalPayAmt41 : Number(first?.totalPayAmt41 ?? 0),
        totalPayAmt42 : Number(first?.totalPayAmt42 ?? 0),
        totalPayAmt12 : Number(first?.totalPayAmt12 ?? 0),
        totalPayAmt81 : Number(first?.totalPayAmt81 ?? 0),
        totalPayAmt43 : Number(first?.totalPayAmt43 ?? 0),
        totalPayAmt44 : Number(first?.totalPayAmt44 ?? 0),
        totalPayAmt14 : Number(first?.totalPayAmt14 ?? 0),
        totalPayAmt82 : Number(first?.totalPayAmt82 ?? 0),
        totalPayAmt52 : Number(first?.totalPayAmt52 ?? 0),
        totalPayAmt20 : Number(first?.totalPayAmt20 ?? 0),
        totalPayAmt62 : Number(first?.totalPayAmt62 ?? 0),
        totalPayAmt77 : Number(first?.totalPayAmt77 ?? 0),
        totalPayAmt71 : Number(first?.totalPayAmt71 ?? 0),
        totalPayAmt30 : Number(first?.totalPayAmt30 ?? 0),
        totalPayAmt73 : Number(first?.totalPayAmt73 ?? 0),
        totalPayAmt72 : Number(first?.totalPayAmt72 ?? 0),
        totalPayAmt74 : Number(first?.totalPayAmt74 ?? 0),
        totalPayAmt75 : Number(first?.totalPayAmt75 ?? 0),
        totalPayAmt76 : Number(first?.totalPayAmt76 ?? 0),
        totalPayAmt24 : Number(first?.totalPayAmt24 ?? 0),
        totalPayAmt25 : Number(first?.totalPayAmt25 ?? 0),
        totalPayAmt07 : Number(first?.totalPayAmt07 ?? 0),
        totalPayAmt55 : Number(first?.totalPayAmt55 ?? 0),
        totalPayAmt83 : Number(first?.totalPayAmt83 ?? 0),
        totalPayAmt78 : Number(first?.totalPayAmt78 ?? 0),
        totalPayAmt79 : Number(first?.totalPayAmt79 ?? 0),
        totalPayAmt21 : Number(first?.totalPayAmt21 ?? 0),
        totalPayAmt53 : Number(first?.totalPayAmt53 ?? 0),
        totalPayAmt56 : Number(first?.totalPayAmt56 ?? 0),
        totalPayAmt57 : Number(first?.totalPayAmt57 ?? 0),
        totalPayAmt58 : Number(first?.totalPayAmt58 ?? 0),
        totalPayAmt59 : Number(first?.totalPayAmt59 ?? 0),
        totalPayAmt60 : Number(first?.totalPayAmt60 ?? 0),
        totalPayAmt22 : Number(first?.totalPayAmt22 ?? 0),
        totalPayAmt23 : Number(first?.totalPayAmt23 ?? 0),
        totalPrePayAmt: Number(first?.totalPrePayAmt ?? 0),
        totalOverAmt  : Number(first?.totalOverAmt   ?? 0),
        totalReturnAmt: Number(first?.totalReturnAmt ?? 0),
        totalCancelAmt: Number(first?.totalCancelAmt ?? 0),
      };

      // ③ externalSubtotals（以 ECR_No 群組的小計）
      const moneyFields = [
        'TXN_TotPayAmt',
        'TXN_PayAmt10','TXN_PayAmt41','TXN_PayAmt42','TXN_PayAmt12','TXN_PayAmt81',
        'TXN_PayAmt43','TXN_PayAmt44','TXN_PayAmt14','TXN_PayAmt82','TXN_PayAmt52',
        'TXN_PayAmt20','TXN_PayAmt62','TXN_PayAmt77','TXN_PayAmt71','TXN_PayAmt30',
        'TXN_PayAmt73','TXN_PayAmt72','TXN_PayAmt74','TXN_PayAmt75','TXN_PayAmt76',
        'TXN_PayAmt24','TXN_PayAmt25','TXN_PayAmt07','TXN_PayAmt55','TXN_PayAmt83',
        'TXN_PayAmt78','TXN_PayAmt79','TXN_PayAmt21','TXN_PayAmt53','TXN_PayAmt56',
        'TXN_PayAmt57','TXN_PayAmt58','TXN_PayAmt59','TXN_PayAmt60','TXN_PayAmt22',
        'TXN_PayAmt23',
        'TXN_PrePayAmt','TXN_OverAmt','TXN_ReturnAmt','TXN_CancelAmt',
      ];

      const externalSubtotals: Record<string, Record<string, number>> = {};
      for (const row of details) {
        const g = String(row?.ECR_No ?? 'UNKNOWN');
        const bucket = (externalSubtotals[g] = externalSubtotals[g] || {} as Record<string, number>);
        for (const f of moneyFields) {
          const key = `Subtotal_${f}`;
          const n = Number(row?.[f] ?? 0);
          bucket[key] = (bucket[key] || 0) + n; // 中括號避免 TS4111
        }
      }

      const totalRecords =
        typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

      return { rows, totalRecords, externalTotals, externalSubtotals };
    })
  );
};


  // 送出查詢
 onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.value as any;

    // ⭐ 只取單日
    const TXN_Date = this.toDateOnly(val?.TXN_Date);

    const payload: any = {
      TXN_Date,                               // ⭐ 改這裡
      rece_yn: val?.rece_yn ?? undefined,
      tlt_building: val?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(val?.tlt_floor) && val?.tlt_floor.length ? val.tlt_floor : undefined,
      org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
      ECR_No: Array.isArray(val?.ECR_No) && val?.ECR_No.length ? val.ECR_No : undefined,

      pageSize : val?.pageSize,
      pageIndex: val?.pageIndex,
      SortBy   : Array.isArray(val?.SortBy) ? val.SortBy : this.defaultSort,
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    // ⭐ 匯出用參數一起更新
    this.historyRequestBody = { ...payload };

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23050Service.queryTLS23050(payload).pipe(
      finalize(() => {
        this.loading = false;
        this.messageService?.unblockUi();
      })
    ).subscribe({
      next: (res) => {
          // 取第一個包（你的回傳格式 Data[0]）
          const first = Array.isArray(res?.Data) && res.Data.length > 0 ? res.Data[0] : null;

          // ① 明細
          const details = Array.isArray(first?.tLS23050Details) ? first.tLS23050Details : [];
          this.data = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

          // ② 總計（直接吃後端 total* 欄位）
          this.detailTotals = {
            totalPayAmt:   Number(first?.totalPayAmt ?? 0),
            totalPayAmt10: Number(first?.totalPayAmt10 ?? 0),
            totalPayAmt41: Number(first?.totalPayAmt41 ?? 0),
            totalPayAmt42: Number(first?.totalPayAmt42 ?? 0),
            totalPayAmt12: Number(first?.totalPayAmt12 ?? 0),
            totalPayAmt81: Number(first?.totalPayAmt81 ?? 0),
            totalPayAmt43: Number(first?.totalPayAmt43 ?? 0),
            totalPayAmt44: Number(first?.totalPayAmt44 ?? 0),
            totalPayAmt14: Number(first?.totalPayAmt14 ?? 0),
            totalPayAmt82: Number(first?.totalPayAmt82 ?? 0),
            totalPayAmt52: Number(first?.totalPayAmt52 ?? 0),
            totalPayAmt20: Number(first?.totalPayAmt20 ?? 0),
            totalPayAmt62: Number(first?.totalPayAmt62 ?? 0),
            totalPayAmt77: Number(first?.totalPayAmt77 ?? 0),
            totalPayAmt71: Number(first?.totalPayAmt71 ?? 0),
            totalPayAmt30: Number(first?.totalPayAmt30 ?? 0),
            totalPayAmt73: Number(first?.totalPayAmt73 ?? 0),
            totalPayAmt72: Number(first?.totalPayAmt72 ?? 0),
            totalPayAmt74: Number(first?.totalPayAmt74 ?? 0),
            totalPayAmt75: Number(first?.totalPayAmt75 ?? 0),
            totalPayAmt76: Number(first?.totalPayAmt76 ?? 0),
            totalPayAmt24: Number(first?.totalPayAmt24 ?? 0),
            totalPayAmt25: Number(first?.totalPayAmt25 ?? 0),
            totalPayAmt07: Number(first?.totalPayAmt07 ?? 0),
            totalPayAmt55: Number(first?.totalPayAmt55 ?? 0),
            totalPayAmt83: Number(first?.totalPayAmt83 ?? 0),
            totalPayAmt78: Number(first?.totalPayAmt78 ?? 0),
            totalPayAmt79: Number(first?.totalPayAmt79 ?? 0),
            totalPayAmt21: Number(first?.totalPayAmt21 ?? 0),
            totalPayAmt53: Number(first?.totalPayAmt53 ?? 0),
            totalPayAmt56: Number(first?.totalPayAmt56 ?? 0),
            totalPayAmt57: Number(first?.totalPayAmt57 ?? 0),
            totalPayAmt58: Number(first?.totalPayAmt58 ?? 0),
            totalPayAmt59: Number(first?.totalPayAmt59 ?? 0),
            totalPayAmt60: Number(first?.totalPayAmt60 ?? 0),
            totalPayAmt22: Number(first?.totalPayAmt22 ?? 0),
            totalPayAmt23: Number(first?.totalPayAmt23 ?? 0),
            totalPrePayAmt: Number(first?.totalPrePayAmt ?? 0),
            totalOverAmt:   Number(first?.totalOverAmt ?? 0),
            totalReturnAmt: Number(first?.totalReturnAmt ?? 0),
            totalCancelAmt: Number(first?.totalCancelAmt ?? 0),
          };

          // ③ 小計（依 ECR_No 群組）
          const groupMap: Record<string, Record<string, number>> = {};
          const moneyFields = [
            'TXN_TotPayAmt',
            'TXN_PayAmt10','TXN_PayAmt41','TXN_PayAmt42','TXN_PayAmt12','TXN_PayAmt81',
            'TXN_PayAmt43','TXN_PayAmt44','TXN_PayAmt14','TXN_PayAmt82','TXN_PayAmt52',
            'TXN_PayAmt20','TXN_PayAmt62','TXN_PayAmt77','TXN_PayAmt71','TXN_PayAmt30',
            'TXN_PayAmt73','TXN_PayAmt72','TXN_PayAmt74','TXN_PayAmt75','TXN_PayAmt76',
            'TXN_PayAmt24','TXN_PayAmt25','TXN_PayAmt07','TXN_PayAmt55','TXN_PayAmt83',
            'TXN_PayAmt78','TXN_PayAmt79','TXN_PayAmt21','TXN_PayAmt53','TXN_PayAmt56',
            'TXN_PayAmt57','TXN_PayAmt58','TXN_PayAmt59','TXN_PayAmt60','TXN_PayAmt22',
            'TXN_PayAmt23',
            'TXN_PrePayAmt','TXN_OverAmt','TXN_ReturnAmt','TXN_CancelAmt',
          ];

          for (const row of details) {
            const g = String(row?.ECR_No ?? 'UNKNOWN');
            const bucket = (groupMap[g] = groupMap[g] || {} as Record<string, number>);
            for (const f of moneyFields) {
              const key = `Subtotal_${f}`;
              const n = Number(row?.[f] ?? 0);
              bucket[key] = (bucket[key] || 0) + n;      // ← 中括號避免 TS4111
            }
          }
          this.detailSubtotals = groupMap;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
        }
      });
    });
  }

  /** 將單日欄位轉成本地時區 ISO；endOfDay=true 會設成 23:59:59.999 */
  private toIso(val: any, endOfDay = false): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // ===== 匯出 =====
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050PDF(this.historyRequestBody).pipe(
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf')
    });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050Excel(this.historyRequestBody).pipe(
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx')
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

  // ===== 欄位定義（isTotal + isSubTotal） =====
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt41', header: '聯合連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt42', header: '聯合離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt12', header: '聯合紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt81', header: '[信用卡]中信停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt82', header: '[一卡通]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt24', header: '禮券餘額代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt83', header: '[LINE Pay]停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt22', header: '[外來提貨單]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt23', header: '[外來禮券]高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_OverAmt', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
  ];

  // ① 後端總計（表尾）：欄位 => 後端 total* 鍵名
  detailTotals: Record<string, number> = {};
  detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalPayAmt',
    TXN_PayAmt10: 'totalPayAmt10',
    TXN_PayAmt41: 'totalPayAmt41',
    TXN_PayAmt42: 'totalPayAmt42',
    TXN_PayAmt12: 'totalPayAmt12',
    TXN_PayAmt81: 'totalPayAmt81',
    TXN_PayAmt43: 'totalPayAmt43',
    TXN_PayAmt44: 'totalPayAmt44',
    TXN_PayAmt14: 'totalPayAmt14',
    TXN_PayAmt82: 'totalPayAmt82',
    TXN_PayAmt52: 'totalPayAmt52',
    TXN_PayAmt20: 'totalPayAmt20',
    TXN_PayAmt62: 'totalPayAmt62',
    TXN_PayAmt77: 'totalPayAmt77',
    TXN_PayAmt71: 'totalPayAmt71',
    TXN_PayAmt30: 'totalPayAmt30',
    TXN_PayAmt73: 'totalPayAmt73',
    TXN_PayAmt72: 'totalPayAmt72',
    TXN_PayAmt74: 'totalPayAmt74',
    TXN_PayAmt75: 'totalPayAmt75',
    TXN_PayAmt76: 'totalPayAmt76',
    TXN_PayAmt24: 'totalPayAmt24',
    TXN_PayAmt25: 'totalPayAmt25',
    TXN_PayAmt07: 'totalPayAmt07',
    TXN_PayAmt55: 'totalPayAmt55',
    TXN_PayAmt83: 'totalPayAmt83',
    TXN_PayAmt78: 'totalPayAmt78',
    TXN_PayAmt79: 'totalPayAmt79',
    TXN_PayAmt21: 'totalPayAmt21',
    TXN_PayAmt53: 'totalPayAmt53',
    TXN_PayAmt56: 'totalPayAmt56',
    TXN_PayAmt57: 'totalPayAmt57',
    TXN_PayAmt58: 'totalPayAmt58',
    TXN_PayAmt59: 'totalPayAmt59',
    TXN_PayAmt60: 'totalPayAmt60',
    TXN_PayAmt22: 'totalPayAmt22',
    TXN_PayAmt23: 'totalPayAmt23',
    TXN_PrePayAmt: 'totalPrePayAmt',
    TXN_OverAmt: 'totalOverAmt',
    TXN_ReturnAmt: 'totalReturnAmt',
    TXN_CancelAmt: 'totalCancelAmt',
  };

  // ② 後端小計（群組尾）：以 ECR_No 群組；欄位 => Subtotal_鍵名
  detailSubtotals: Record<string, Record<string, number>> = {};
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'Subtotal_TXN_TotPayAmt',
    TXN_PayAmt10: 'Subtotal_TXN_PayAmt10',
    TXN_PayAmt41: 'Subtotal_TXN_PayAmt41',
    TXN_PayAmt42: 'Subtotal_TXN_PayAmt42',
    TXN_PayAmt12: 'Subtotal_TXN_PayAmt12',
    TXN_PayAmt81: 'Subtotal_TXN_PayAmt81',
    TXN_PayAmt43: 'Subtotal_TXN_PayAmt43',
    TXN_PayAmt44: 'Subtotal_TXN_PayAmt44',
    TXN_PayAmt14: 'Subtotal_TXN_PayAmt14',
    TXN_PayAmt82: 'Subtotal_TXN_PayAmt82',
    TXN_PayAmt52: 'Subtotal_TXN_PayAmt52',
    TXN_PayAmt20: 'Subtotal_TXN_PayAmt20',
    TXN_PayAmt62: 'Subtotal_TXN_PayAmt62',
    TXN_PayAmt77: 'Subtotal_TXN_PayAmt77',
    TXN_PayAmt71: 'Subtotal_TXN_PayAmt71',
    TXN_PayAmt30: 'Subtotal_TXN_PayAmt30',
    TXN_PayAmt73: 'Subtotal_TXN_PayAmt73',
    TXN_PayAmt72: 'Subtotal_TXN_PayAmt72',
    TXN_PayAmt74: 'Subtotal_TXN_PayAmt74',
    TXN_PayAmt75: 'Subtotal_TXN_PayAmt75',
    TXN_PayAmt76: 'Subtotal_TXN_PayAmt76',
    TXN_PayAmt24: 'Subtotal_TXN_PayAmt24',
    TXN_PayAmt25: 'Subtotal_TXN_PayAmt25',
    TXN_PayAmt07: 'Subtotal_TXN_PayAmt07',
    TXN_PayAmt55: 'Subtotal_TXN_PayAmt55',
    TXN_PayAmt83: 'Subtotal_TXN_PayAmt83',
    TXN_PayAmt78: 'Subtotal_TXN_PayAmt78',
    TXN_PayAmt79: 'Subtotal_TXN_PayAmt79',
    TXN_PayAmt21: 'Subtotal_TXN_PayAmt21',
    TXN_PayAmt53: 'Subtotal_TXN_PayAmt53',
    TXN_PayAmt56: 'Subtotal_TXN_PayAmt56',
    TXN_PayAmt57: 'Subtotal_TXN_PayAmt57',
    TXN_PayAmt58: 'Subtotal_TXN_PayAmt58',
    TXN_PayAmt59: 'Subtotal_TXN_PayAmt59',
    TXN_PayAmt60: 'Subtotal_TXN_PayAmt60',
    TXN_PayAmt22: 'Subtotal_TXN_PayAmt22',
    TXN_PayAmt23: 'Subtotal_TXN_PayAmt23',
    TXN_PrePayAmt: 'Subtotal_TXN_PrePayAmt',
    TXN_OverAmt: 'Subtotal_TXN_OverAmt',
    TXN_ReturnAmt: 'Subtotal_TXN_ReturnAmt',
    TXN_CancelAmt: 'Subtotal_TXN_CancelAmt',
  };
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
