/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize, map, of } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { HttpResponse } from '@angular/common/http';

import {
  FIN55060Service,
  FIN55060DetailRow,
  QueryFIN55060Payload,
  ExportFIN55060Payload,
} from 'src/app/service/api/fin/fin55060.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';


import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

type FIN55060MainRow = {
  AccNo4: string;
  AccNo4Name: string;
  details: FIN55060DetailRow[];
};

@Component({
  selector: 'app-fin55060',
  templateUrl: './fin55060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    MultiSelectComponent,
  ],
})
export class FIN55060Component extends BasicQueryPageComponent<FIN55060MainRow> implements OnInit {

  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // === 查詢表單 ===
  queryForm = this.formBuilder.group({
    TXN_BDATE: [this.today, [Validators.required]],
    TXN_EDATE: [this.today, [Validators.required]],

    ORG_ID: [null],
    ProjectNo: [null],
    AccNo: [null],
    DetailNo: [null],

    ...createPaginationConfig([]),
    pageSize: [30],
    pageIndex: [1],
  });

  // === 畫面資料 ===
  data: FIN55060MainRow[] = [];
  totalRecords = 0;
  btnLoading = false;
  lastQueryBody: QueryFIN55060Payload | null = null;

  // === 主表欄位（用 AccNo4 作為唯一碼、顯示科目四級 + 名稱） ===
  columns: Column[] = [
    { field: 'AccNo4', header: '科目代號', visible: true },
    { field: 'AccNo4Name', header: '科目名稱', visible: true },
  ];

  // === 明細欄位（detailcolumn 展開使用） ===
  detailcolumns: Column[] = [
    { field: 'AccNo',      header: '科目代號', visible: true },
    { field: 'AccCName',   header: '科目名稱', visible: true },
    { field: 'DetailNo',   header: '廠商代號/名稱', visible: true },
    { field: 'ORG_ID',     header: '部門代號', visible: true },
    { field: 'Org_Name',   header: '部門名稱', visible: true },
    { field: 'ProjectNo',  header: '活動代號', visible: true },
    { field: 'Debit_Amt',  header: '借方金額', visible: true, format: formatAmount },
    { field: 'Credit_Amt', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額',     visible: true, format: formatAmount },
  ];

  // === 下拉資料（與 FIN55050 相同來源與映射） ===
  ORG_IDOptions: any[] = [];
  ProjectNoOptions: any[] = [];
  AccNoOptions: any[] = [];
  DetailNoOptions: any[] = [];

  constructor(
    private fin55060Service: FIN55060Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN55060', 'fin/fin55060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  // === 小工具 ===
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private ensureArr(v: any) {
    return Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  }

  private sanitizeSortBy(sortBy: any[] | undefined) {
    if (!Array.isArray(sortBy)) return [];
    return sortBy.filter(s => s && typeof s.field === 'string' && !s.field.startsWith('_'));
  }

  /** 從 API 回傳（AccNo4 群組）的 Data 轉為主表 + details 結構 */
  private mapToMainRows(data: any[]): FIN55060MainRow[] {
    if (!Array.isArray(data)) return [];
    return data.map(g => ({
      AccNo4: g?.AccNo4 ?? '',
      AccNo4Name: g?.AccNo4Name ?? '',
      details: Array.isArray(g?._Details) ? g._Details : [],
    }));
  }

  // === 組查詢 payload ===
  private buildQueryBody(input?: any): QueryFIN55060Payload | null {
    const raw = input ?? this.queryForm.getRawValue();

    const from = this.toDateOnly(raw?.TXN_BDATE);
    const to   = this.toDateOnly(raw?.TXN_EDATE);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請選擇日期起訖。');
      return null;
    }

    const body: QueryFIN55060Payload = {
      TXN_BDATE: from,
      TXN_EDATE: to,
      org_idList:    this.ensureArr(raw?.ORG_ID),
      ProjectNoList: this.ensureArr(raw?.ProjectNo),
      AccNoList:     this.ensureArr(raw?.AccNo),
      DetailNoList:  this.ensureArr(raw?.DetailNo),
    };
    return body;
  }

  // === 查詢送出（主表 + 展開明細）===
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryBody();
      if (!payload) return;

      this.fin55060Service.queryFIN55060(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(res => {
          const rows = this.mapToMainRows(res?.Data ?? []);
          this.data = rows;
          this.totalRecords = rows.length;
          this.lastQueryBody = { ...payload };
        });
    });
  }

  // === 給 app-table-report 使用的查詢函式（保持同樣結構）===
  public queryFIN55060ForReport = (body: any) => {
    const bdate =
      this.toDateOnly(body?.TXN_BDATE) ??
      this.lastQueryBody?.TXN_BDATE ??
      this.toDateOnly(this.queryForm.value?.TXN_BDATE);

    const edate =
      this.toDateOnly(body?.TXN_EDATE) ??
      this.lastQueryBody?.TXN_EDATE ??
      this.toDateOnly(this.queryForm.value?.TXN_EDATE);

    if (!bdate || !edate) {
      this.messageService?.warnBubble?.('請選擇日期起訖。');
      return of({ Data: [], TotalCount: 0 });
    }

    // 允許沿用上次查詢條件 + 覆蓋本次 body
    const merged = { ...(this.lastQueryBody ?? {}), ...(body ?? {}) };
    const payload: QueryFIN55060Payload = {
      TXN_BDATE: bdate,
      TXN_EDATE: edate,
      org_idList:    this.ensureArr(merged?.ORG_ID ?? merged?.org_idList),
      ProjectNoList: this.ensureArr(merged?.ProjectNo ?? merged?.ProjectNoList),
      AccNoList:     this.ensureArr(merged?.AccNo ?? merged?.AccNoList),
      DetailNoList:  this.ensureArr(merged?.DetailNo ?? merged?.DetailNoList),
    };

    return this.fin55060Service.queryFIN55060(payload).pipe(
      map((res: any) => {
        const rows = this.mapToMainRows(res?.Data ?? []);
        const total = rows.length;

        this.totalRecords = total;
        this.data = rows;
        this.lastQueryBody = { ...(this.lastQueryBody ?? {}), ...payload };

        return { Data: rows, TotalCount: total };
      })
    );
  };

  // === 匯出 Payload（不含分頁與排序）===
  private buildExportBody(): ExportFIN55060Payload | null {
    const rawForm = this.queryForm.getRawValue();
    const from = this.toDateOnly((this.lastQueryBody as any)?.TXN_BDATE ?? rawForm?.TXN_BDATE);
    const to   = this.toDateOnly((this.lastQueryBody as any)?.TXN_EDATE  ?? rawForm?.TXN_EDATE);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」再匯出。');
      return null;
    }

    const payload: ExportFIN55060Payload = {
      TXN_BDATE: from,
      TXN_EDATE: to,
      org_idList:    this.ensureArr(rawForm?.ORG_ID ?? (this.lastQueryBody as any)?.org_idList),
      ProjectNoList: this.ensureArr(rawForm?.ProjectNo ?? (this.lastQueryBody as any)?.ProjectNoList),
      AccNoList:     this.ensureArr(rawForm?.AccNo ?? (this.lastQueryBody as any)?.AccNoList),
      DetailNoList:  this.ensureArr(rawForm?.DetailNo ?? (this.lastQueryBody as any)?.DetailNoList),
    };
    return payload;
  }

  // === 匯出 ===
  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55060Service
      .exportFIN55060PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳_四級科目'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55060Service
      .exportFIN55060Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳_四級科目'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  private handleFileExport(response: HttpResponse<Blob>, ext: string, defaultBaseName: string): void {
    const cd = response.headers.get('Content-Disposition');
    const def = `${defaultBaseName}${ext}`;
    const name = this.getFilenameFromHeader(cd, def);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有資料可供匯出。');
    }
  }
  private getFilenameFromHeader(cd: string | null, def: string): string {
    if (!cd) return def;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) { try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); } catch { return star[1]; } }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) { try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch { return m[1]; } }
    return def;
  }

  // === 下拉載入（與 FIN55050 相同邏輯/來源）===
  private loadOptions() {
    // 部門
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ORG_IDOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 活動代碼
    this.dropDownListService.getActivityOptions({
      mid: 0,
      str_no: '10',
      pod_type: ['1', '2', '8'],
      pod_status: '1',
    })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ProjectNoOptions = response?.Data?.map((item: any) => ({
          label: `${item.pod_no} - ${item.pod_desc}`,
          value: item.pod_no,
        })) ?? [];
      });

    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }
}
