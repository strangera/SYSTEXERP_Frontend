/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { PaymentTypeService } from '../../../service/basic/queryPOS1006.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { HttpResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { finalize, map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent, // ✅ 使用 app-table-report
  ]
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  // 資料
  data: any[] = [];
  totalRecords = 0;

  // ✅ 總計列暫存
  private grandTotal: Record<string, number> = {};
  // ① 總計欄位對應（之後可擴充）
  private readonly totalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'totalPayAmt',
  };

  // 預設日期（昨天）
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 匯出/查詢用
  btnLoading = false;
  historyRequestBody: any | null = null;

  // 排序狀態（保留原本預設）
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'tlt_no', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [[]],
    TLT_No: [[]],
    Pay_No: [[]],
    CRD_No: [],
    tlt_building: [],
    tlt_floor: [[]],
    org_id: [[]],
    ...createPaginationConfig([
      { field: 'tlt_no', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];

  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  // 頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));

    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    // 下拉載入
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.paymentTypeService.getPaymentTypes().subscribe((data) => (this.paymentTypeOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 欄位（總計欄位加上 isTotal）
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.money(val),
      isTotal: true,
    },
  ];

  // ====== 查詢（按鈕）— 固定 pageSize=30；日期改用 DateOnly ======
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const sortByArr =
        Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy :
          (this.sortMeta.length ? this.sortMeta : this.defaultSort);

      // ✅ 固定 30（同時帶大小寫鍵避免後端鍵名差異）；日期 → yyyy-MM-dd
      const payload: any = this.prune({
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd ?? this.yesterday),

        ECR_No: this.ensureArr(val?.ECR_No),
        TLT_No: this.ensureArr(val?.TLT_No),
        Pay_No: this.ensureArr(val?.Pay_No),
        CRD_No: (val?.CRD_No ?? '') || undefined,
        tlt_building: (val?.tlt_building ?? '') || undefined,
        tlt_floor: this.ensureArr(val?.tlt_floor),
        org_id: this.ensureArr(val?.org_id),

        pageSize: 30,
        PageSize: 30,
        pageIndex: Number(val?.pageIndex) || 1,
        PageIndex: Number(val?.pageIndex) || 1,
        SortBy: sortByArr,
      });

      // 提供給 app-table-report
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23100Service.queryTLS23100(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

          const rows = wrappers
            .flatMap((w: any) =>
              w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details ?? []
            )
            .map((row: any, idx: number) => ({
              ...row,
              _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
            }));

          this.data = rows;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // ✅ 同步整體總計到頁尾（以 wrapper 的 totalPayAmt 為準；沒有就用這一頁加總）
          const totalFromWrapper = wrappers.reduce(
            (s: number, w: any) => s + Number(w?.totalPayAmt ?? 0),
            0
          );
          const fallbackPageSum = rows.reduce(
            (s: number, r: any) => s + Number(r?.TXN_PayAmt ?? 0),
            0
          );
          this.grandTotal = { TXN_PayAmt: totalFromWrapper || fallbackPageSum };
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
        },
      });
    });
  }

  // ===== 匯出：PDF（不帶 pageSize/pageIndex/大小寫） =====
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    const body = this.buildExportBody();
    this.tls23100Service.exporttls23100PDF(body).pipe(
      finalize(() => (this.btnLoading = false))
    ).subscribe({
      next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf'),
      error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
    });
  }

  // ===== 通用下載處理 =====
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

    // RFC 5987: filename*
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      const encoded = filenameStarMatch[1].trim();
      try {
        return decodeURIComponent(encoded.replace(/^UTF-8''/, ''));
      } catch {
        return encoded;
      }
    }

    // filename="xxx"
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

  // ====== 小工具 ======
  private ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if (Array.isArray(v) && v.length === 0) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }
  money = (val: any) => Number(val || 0).toLocaleString('en-US');
  private padTxnNo(v: any): string {
    const s = String(v ?? '').trim();
    return s ? s.padStart(6, '0') : '';
  }

  // ✅ 提供給 [footerData] 的資料，只輸出有 isTotal 的欄位
  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    // 想在某欄顯示「總計」字樣可加：例如 footer['tlt_name'] = '總計';
    return footer;
  }

  public queryTLS23100ForReport = (body: any) =>
    this.tls23100Service
      .queryTLS23100({
        ...(body || {}),
        // ✅ 報表查詢一樣固定 30；若外部 body 傳了日期，沿用；否則從 form 取並轉 DateOnly
        TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
        pageSize: 30,
        PageSize: 30,
      })
      .pipe(
        map((res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);

          const rows = wrappers
            .flatMap((w: any) => w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details ?? [])
            .map((row: any, idx: number) => ({
              ...row,
              _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
            }));

          const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

          // ✅ 以 API 的 totalPayAmt 為準（多 wrapper 相加），沒有就用當頁加總做後援
          const totalFromWrapper = wrappers.reduce(
            (s: number, w: any) => s + Number(w?.totalPayAmt ?? 0),
            0
          );
          const fallbackPageSum = rows.reduce(
            (s: number, r: any) => s + Number(r?.TXN_PayAmt ?? 0),
            0
          );
          const grand = { TXN_PayAmt: totalFromWrapper || fallbackPageSum };

          // ✅ 僅在第一頁同步到 component 狀態，避免捲動載入把整體總計覆蓋成分頁值
          const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
          if (isFirstPage) {
            this.grandTotal = { ...grand };
          }

          return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
        })
      );

  /** 只回 YYYY-MM-DD（本地時區，不含時間/時區） */
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
