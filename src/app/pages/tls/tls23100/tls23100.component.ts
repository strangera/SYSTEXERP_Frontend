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
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, InputTextModule, ButtonComponent,
    TranslateModule, ButtonModule, TableReportComponent,
  ],
})
export class TLS23100Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  sortMeta: any[] = [];

  private grandTotal: Record<string, number> = {};

  readonly defaultSort: any[] = [
    { field: 'tlt_no', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [[]],
    TLT_No: [[]],
    Pay_No: [[]],
    CRD_No: [],
    tlt_building: [],
    tlt_floor: [[]],
    org_id: [[]],
    pageSize: [1000],  // ⬅️ 調整為 1000 規格
    PageSize: [1000],  // 大寫保底
    pageIndex: [1],    // ⬅️ 調整初始頁碼為 1
    PageIndex: [1],    // 大寫保底
    SortBy: [[{ field: 'tlt_no', order: 1 }, { field: 'ECR_No', order: 1 }, { field: 'TXN_No', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls23100Service: TLS23100Service,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 打包載入優化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      ecrs: this.dropdownApiService.queryPos1002().pipe(catchError(() => of([]))),
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
      paymentTypes: this.dropdownApiService.queryPos1006().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name, PAY_Type: item.PAY_Type }))), catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.paymentTypeOptions = res.paymentTypes || [];
      this.BUILDING_NO_Options = res.buildings || [];
      this.floorOptions = res.floors || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      });

      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
    });
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

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
        pageSize: 1000,  // ⬅️ 調整為全域指定之 1000 規格
        PageSize: 1000,
        pageIndex: Number(val?.pageIndex) || 1,
        PageIndex: Number(val?.pageIndex) || 1,
        SortBy: sortByArr,
      });

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23100Service.queryTLS23100(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
            const rows = wrappers
              .flatMap((w: any) => w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details ?? [])
              .map((row: any, idx: number) => ({
                ...row,
                _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
              }));

            this.data = rows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

            const totalFromWrapper = wrappers.reduce((s: number, w: any) => s + Number(w?.totalPayAmt ?? 0), 0);
            const fallbackPageSum = rows.reduce((s: number, r: any) => s + Number(r?.TXN_PayAmt ?? 0), 0);
            this.grandTotal = { TXN_PayAmt: totalFromWrapper || fallbackPageSum };
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.grandTotal = {};
          },
        });
    });
  }

  // ========= <app-table-report> 查詢封裝調用（支援 1000 規格分頁滾動） =========
  public queryTLS23100ForReport = (body: any) => {
    const pageIndex = body?.pageIndex ?? 1;

    return this.tls23100Service.queryTLS23100({
      ...(body || {}),
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      pageSize: body?.pageSize ?? 1000, // ⬅️ 固定 1000 規格
      PageSize: body?.pageSize ?? 1000,
    }).pipe(
      map((res: any) => {
        const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
        const rows = wrappers
          .flatMap((w: any) => w?.tLS23100Details ?? w?.TLS23100Details ?? w?.tls23100Details ?? [])
          .map((row: any, idx: number) => ({
            ...row,
            _rowKey: `row|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
          }));

        let totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

        if (pageIndex > 1 && rows.length === 0) {
          totalCount = this.data.length;
        }

        const totalFromWrapper = wrappers.reduce((s: number, w: any) => s + Number(w?.totalPayAmt ?? 0), 0);
        const fallbackPageSum = rows.reduce((s: number, r: any) => s + Number(r?.TXN_PayAmt ?? 0), 0);
        const grand = { TXN_PayAmt: totalFromWrapper || fallbackPageSum };

        if (Number(pageIndex) === 1) {
          this.grandTotal = { ...grand };
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檔案匯出維護機制 =========
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
    this.tls23100Service.exporttls23100PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
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

  // ===== 小工具整理流 =====
  private readonly ensureArr = (v: any) => Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]);
  private readonly padTxnNo = (v: any): string => String(v ?? '').trim().padStart(6, '0');

  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) footer[col.field] = this.grandTotal[col.field] ?? 0;
    }
    return footer;
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];
}
