/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { HttpResponse } from '@angular/common/http';

import {
  FIN55060Service,
  QueryFIN55060Payload,
  ExportFIN55060Payload,
} from 'src/app/service/api/fin/fin55060.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';

type ApiGroup = {
  AccNo4: string;
  AccNo4Name: string;
  _Details: ApiDetail[];
};

type ApiDetail = {
  AccNo: string;
  AccCName: string;
  DetailNo: string | null;
  ORG_ID: string | null;
  Org_Name: string | null;
  ProjectNo: string | null;
  Debit_Amt: number | null;
  Credit_Amt: number | null;
  Balance: number | null;
};

type TableRow = ApiDetail & {
  AccNo4: string;
  AccNo4Name: string;
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
    ButtonComponent,
    TranslateModule,
    MultiSelectComponent,
    TableSubheaderComponent,
  ],
})
export class FIN55060Component extends BasicQueryPageComponent<TableRow> implements OnInit {
  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_BDATE: [this.today, [Validators.required]],
    TXN_EDATE: [this.today, [Validators.required]],
    org_idList: [null],
    ProjectNoList: [null],
    AccNoList: [null],
    DetailNoList: [null],
    ...createPaginationConfig([]), // pageIndex/pageSize/SortBy
  });

  data: TableRow[] = [];
  totalRecords = 0;
  btnLoading = false;
  lastQueryBody: QueryFIN55060Payload | null = null;

  /** 和 FIN55050 一樣：用 detail 欄位作為可點擊連結（這裡用 AccNo4） */
  columns: Column[] = [
    { field: 'AccNo4',     header: '四級科目',       visible: true,  }, // ← 可點
    // { field: 'AccNo4',     header: '四級科目',       visible: true,  type: 'detail' }, // ← 可點
    { field: 'AccNo4Name', header: '四級科目名稱',   visible: true },

    { field: 'AccNo',      header: '科目代號',       visible: true },
    { field: 'AccCName',   header: '科目名稱',       visible: true },
    { field: 'DetailNo',   header: '廠商代號/名稱',  visible: true },
    { field: 'ORG_ID',     header: '部門代號',       visible: true },
    { field: 'Org_Name',   header: '部門名稱',       visible: true },
    { field: 'ProjectNo',  header: '活動代號',       visible: true },
    { field: 'Debit_Amt',  header: '借方金額',       visible: true, format: formatAmount },
    { field: 'Credit_Amt', header: '貸方金額',       visible: true, format: formatAmount },
    { field: 'Balance',    header: '餘額',           visible: true, format: formatAmount },
  ];

  org_idListOptions: any[] = [];
  ProjectNoListOptions: any[] = [];
  AccNoListOptions: any[] = [];
  DetailNoListOptions: any[] = [];

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

  // ========= 工具 =========
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

  /** 以 AccNo4 群組的資料 -> 展平成平面列，並依 AccNo4 排序，利於群組呈現 */
  private flattenGroupsToRows(groups: ApiGroup[] | null | undefined): TableRow[] {
    if (!Array.isArray(groups)) return [];
    const rows: TableRow[] = [];
    for (const g of groups) {
      const details = Array.isArray(g?._Details) ? g._Details : [];
      for (const d of details) {
        rows.push({
          ...d,
          AccNo4: g.AccNo4,
          AccNo4Name: g.AccNo4Name,
        });
      }
    }
    rows.sort((a, b) =>
      (a.AccNo4 ?? '').localeCompare(b.AccNo4 ?? '') ||
      (a.AccNo4Name ?? '').localeCompare(b.AccNo4Name ?? '') ||
      (a.AccNo ?? '').localeCompare(b.AccNo ?? '') ||
      (a.AccCName ?? '').localeCompare(b.AccCName ?? '')
    );
    return rows;
  }

  // ========= 組查詢 payload =========
  private buildQueryBody(input?: any): QueryFIN55060Payload | null {
    const raw = input ?? this.queryForm.getRawValue();

    const from = this.toDateOnly(raw?.TXN_BDATE);
    const to   = this.toDateOnly(raw?.TXN_EDATE);
    if (!from || !to) return null;

    const body: QueryFIN55060Payload = {
      TXN_BDATE: from,
      TXN_EDATE: to,
      org_idList:    this.ensureArr(raw?.org_idList),
      ProjectNoList: this.ensureArr(raw?.ProjectNoList),
      AccNoList:     this.ensureArr(raw?.AccNoList),
      DetailNoList:  this.ensureArr(raw?.DetailNoList),
      pageIndex: raw?.pageIndex,
      pageSize: raw?.pageSize,
      SortBy: this.sanitizeSortBy(raw?.SortBy),
    } as any;

    return body;
  }

  // ========= 查詢 =========
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryBody();
      if (!payload) {
        this.loading = false;
        return;
      }

      this.fin55060Service.queryFIN55060(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((res: any) => {
          const groups: ApiGroup[] = res?.Data ?? [];
          const flat = this.flattenGroupsToRows(groups);
          const total: number = res?.TotalCount ?? flat.length;

          this.data = flat;
          this.totalRecords = total;
          this.lastQueryBody = { ...payload };
        });
    });
  }

  /** lazy 分頁事件（由 app-table-subheader 觸發）—和 FIN55050 一樣的處理方式 */
  override onLazyLoadData(event: any, form: FormGroup) {
    if (!event) return;
    // FIN55050 風格：直接套用 event 的 pageIndex/pageSize/SortBy 到表單；不觸發 valueChanges
    form.patchValue({
      pageSize: event?.pageSize ?? event?.rows ?? form.value.pageSize,
      pageIndex: event?.pageIndex ?? (event?.first != null
        ? Math.floor((event.first) / (event.rows ?? event.pageSize ?? form.value.pageSize ?? 30)) + 1
        : form.value.pageIndex),
      SortBy: event?.SortBy ?? (Array.isArray(event?.multiSortMeta) && event.multiSortMeta.length
        ? event.multiSortMeta.map((s: any) => ({ field: s.field, order: s.order }))
        : (event?.sortField ? [{ field: event.sortField, order: event.sortOrder }] : [])),
    }, { emitEvent: false });

    // FIN55050 範例也會在 lazy 時立即查詢
    // （HTML 已呼叫 onSubmit(queryForm)，這裡就不再主動呼叫以免重複）
  }

  // ========= 匯出（不含分頁/排序） =========
  private buildExportBody(): ExportFIN55060Payload | null {
    const rawForm = this.queryForm.getRawValue();
    const from = this.toDateOnly((this.lastQueryBody as any)?.TXN_BDATE ?? rawForm?.TXN_BDATE);
    const to   = this.toDateOnly((this.lastQueryBody as any)?.TXN_EDATE  ?? rawForm?.TXN_EDATE);
    if (!from || !to) return null;

    const payload: ExportFIN55060Payload = {
      TXN_BDATE: from,
      TXN_EDATE: to,
      org_idList:    this.ensureArr(rawForm?.org_idList ?? (this.lastQueryBody as any)?.org_idList),
      ProjectNoList: this.ensureArr(rawForm?.ProjectNoList ?? (this.lastQueryBody as any)?.ProjectNoList),
      AccNoList:     this.ensureArr(rawForm?.AccNoList ?? (this.lastQueryBody as any)?.AccNoList),
      DetailNoList:  this.ensureArr(rawForm?.DetailNoList ?? (this.lastQueryBody as any)?.DetailNoList),
    };
    return payload;
  }

  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55060Service
      .exportFIN55060PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳_四級科目'),
        error: (e) => console.error('Export PDF failed', e),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55060Service
      .exportFIN55060Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳_四級科目'),
        error: (e) => console.error('Export Excel failed', e),
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

  // ========= 點擊 AccNo4（detail）導到 CRU =========
  override onDetail(row: TableRow) {
    if (!row?.AccNo4) return;
    // 依你們慣例，將整列 row 與目前查詢條件都帶到 CRU
    this.navigateWithState(CRUDStatus.Read, row, this.queryForm.getRawValue());
  }

  // ========= 下拉載入 =========
  private loadOptions() {
    // 部門
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.org_idListOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 活動
    this.dropDownListService.getActivityOptions({
      mid: 0,
      str_no: '10',
      pod_type: ['1', '2', '8'],
      pod_status: '1',
    })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ProjectNoListOptions = response?.Data?.map((item: any) => ({
          label: `${item.pod_no} - ${item.pod_desc}`,
          value: item.pod_no,
        })) ?? [];
      });

    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoListOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoListOptions = response?.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }
}
