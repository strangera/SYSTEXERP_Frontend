/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize, map, of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import {
  FIN55050Service,
  FIN55050Data,
  QueryFIN55050Payload,
  ExportFIN55050Payload,
} from '../../../service/api/fin/fin55050.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { ButtonModule } from 'primeng/button';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-fin55050',
  templateUrl: './fin55050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    CheckboxModule,
    MultiSelectComponent,
    ButtonModule,
    TableReportComponent,
  ],
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Data> implements OnInit {

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // === 查詢表單 ===
  queryForm = this.formBuilder.group({
    VOUDATE_Start: [this.yesterday, [Validators.required]],
    VOUDATE_End:   [this.yesterday, [Validators.required]],

    ORG_ID: [null],
    ProjectNo: [null],
    AccNo: [null],
    VOUNO: [null, Validators.maxLength(16)],
    DetailNo: [null],
    PTA: [null],
    SubDetailNo: [null],
    AccountKey: [null],
    NoteDesc: [null],
    VOUCHER_KIND: [null],
    PostFlag: [null],
    isSubDetailNo: [null],
    ReportType: [null],
    PrintType: [null],

    ...createPaginationConfig([]),
    pageSize: [30],
    pageIndex: [1],
  });

  // === 資料/狀態 ===
  data: any[] = [];         // 主表（以 AccNo 聚合），含 VouDateRange 與 details
  totalRecords = 0;
  btnLoading = false;
  lastQueryBody: QueryFIN55050Payload | null = null;

  // === 主表欄位（含「傳票日期」= 日期區間） ===
  columns: Column[] = [
    { field: 'AccNo',        header: '科目代號', visible: true },
    { field: 'AccCName',     header: '科目名稱', visible: true },
    { field: 'VouDateRange', header: '傳票日期', visible: true }, // 顯示最早~最晚
  ];

  // === 展開明細欄位（不包含 VouDate） ===
  detailcolumns: Column[] = [
    { field: 'VouNo',      header: '傳票號碼', visible: true },
    { field: 'NoteDesc',   header: '摘要', visible: true },
    { field: 'Ven_Name',   header: '廠商', visible: true },
    { field: 'VouStatus',  header: '狀態', visible: true },
    { field: 'ORG_ID',     header: '部門代號', visible: true },
    { field: 'Org_Name',   header: '部門名稱', visible: true },
    { field: 'ProjectNo',  header: '活動代號', visible: true },
    { field: 'PTA',        header: '立沖代號', visible: true },
    { field: 'AccAmt_D',   header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C',   header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  // === 下拉 ===
  ORG_IDOptions: any[] = [];
  ProjectNoOptions: any[] = [];
  AccNoOptions: any[] = [];
  DetailNoOptions: any[] = [];
  PostFlagOptions: any[] = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' },
  ];
  SubDetailNoOptions: any[] = [];
  VoucherKindOptions: any[] = [];

  constructor(
    private fin55050Service: FIN55050Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN55050', 'fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  // === 工具 ===
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  private ensureArr(v: any) { return Array.isArray(v) ? v : v == null || v === '' ? [] : [v]; }
  private sanitizeSortBy(sortBy: any[] | undefined) {
    if (!Array.isArray(sortBy)) return [];
    return sortBy.filter(s => s && typeof s.field === 'string' && !s.field.startsWith('_'));
  }
  private tryParseDate(d: any): Date | null {
    if (!d) return null;
    const dt = typeof d === 'string' ? new Date(d) : (d as Date);
    return isNaN(dt.getTime()) ? null : dt;
  }
  private fmtDateForDisplay(d: Date | null): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  /** 以 AccNo 聚合，同時計算該 AccNo 的 VouDateRange（最小~最大），明細不含 VouDate */
  private mergeByAccNoWithDateRange(groups: any[]): any[] {
    const map = new Map<string, { AccNo: string; AccCName: string; VouDateMin: Date | null; VouDateMax: Date | null; details: any[] }>();

    groups.forEach((g: any) => {
      const key: string = g?.AccNo ?? '';
      if (!key) return;

      // 這個群組本身的傳票日期
      const gDate = this.tryParseDate(g?.VouDate);

      // 明細：不放 VouDate
      const incomingDetails = Array.isArray(g?._Details) ? g._Details.slice() : [];

      if (map.has(key)) {
        const exist = map.get(key)!;
        // 更新日期區間
        if (gDate) {
          if (!exist.VouDateMin || gDate < exist.VouDateMin) exist.VouDateMin = gDate;
          if (!exist.VouDateMax || gDate > exist.VouDateMax) exist.VouDateMax = gDate;
        }
        // 合併明細
        exist.details.push(...incomingDetails);
      } else {
        map.set(key, {
          AccNo: key,
          AccCName: g?.AccCName ?? '',
          VouDateMin: gDate ?? null,
          VouDateMax: gDate ?? null,
          details: incomingDetails,
        });
      }
    });

    // 投影出主表需要的欄位（含 VouDateRange）
    return Array.from(map.values()).map(x => ({
      AccNo: x.AccNo,
      AccCName: x.AccCName,
      VouDateRange: (x.VouDateMin && x.VouDateMax)
        ? (this.fmtDateForDisplay(x.VouDateMin) === this.fmtDateForDisplay(x.VouDateMax)
            ? this.fmtDateForDisplay(x.VouDateMin)             // 同一天就顯示單日
            : `${this.fmtDateForDisplay(x.VouDateMin)} ~ ${this.fmtDateForDisplay(x.VouDateMax)}`)
        : '',
      details: x.details,
    }));
  }

  // === 組 Query Payload（依 /FIN0000/GLS1000/queryFIN55050 規格） ===
  private buildQueryBody(input?: any): QueryFIN55050Payload | null {
    const raw = input ?? this.queryForm.getRawValue();

    const from = this.toDateOnly(raw?.VOUDATE_Start);
    const to   = this.toDateOnly(raw?.VOUDATE_End);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」。');
      return null;
    }

    const body: QueryFIN55050Payload = {
      pageSize:  Number(raw?.pageSize) || 30,
      pageIndex: Number(raw?.pageIndex) || 1,
      SortBy: this.sanitizeSortBy(raw?.SortBy ?? []),

      DateFrom: from!,
      DateTo: to!,
      OrgIdList:     this.ensureArr(raw?.ORG_ID),
      AccNoList:     this.ensureArr(raw?.AccNo),
      VendorNoList:  this.ensureArr(raw?.DetailNo),
      PTAFrom:       raw?.PTA ?? '',
      PTATo:         raw?.PTA ?? '',
      TargetNoList:  this.ensureArr(raw?.SubDetailNo),
      Notes:         raw?.NoteDesc ?? '',
      VouTypeList:   this.ensureArr(raw?.VOUCHER_KIND),
      VouStatusList: this.ensureArr(raw?.PostFlag),
      IsTarget:      raw?.isSubDetailNo ?? '',
    };

    return body;
  }

  // === 查詢送出（以 AccNo 聚合，主表顯示 VouDateRange） ===
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const body = this.buildQueryBody();
      if (!body) return;

      this.fin55050Service.queryFIN55050(body)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((res: any) => {
          const data = res?.Data ?? [];
          const groups = Array.isArray(data) ? data : (data ? [data] : []);
          const rows = this.mergeByAccNoWithDateRange(groups);

          this.data = rows;
          this.totalRecords = rows.length;
          this.lastQueryBody = { ...body };
        });
    });
  }

  /** 提供 app-table-report 查詢（相同聚合與日期區間邏輯） */
  public queryFIN55050ForReport = (body: any) => {
    const dateFrom =
      this.toDateOnly(body?.DateFrom) ??
      this.lastQueryBody?.DateFrom ??
      this.toDateOnly(this.queryForm.value?.VOUDATE_Start);

    const dateTo =
      this.toDateOnly(body?.DateTo) ??
      this.lastQueryBody?.DateTo ??
      this.toDateOnly(this.queryForm.value?.VOUDATE_End);

    if (!dateFrom || !dateTo) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」。');
      return of({ Data: [], TotalCount: 0 });
    }

    const rawForm = this.queryForm.getRawValue() ?? {};
    const merged  = { ...(this.lastQueryBody ?? {}), ...(rawForm ?? {}), ...(body ?? {}) };

    const payload = {
      DateFrom: dateFrom,
      DateTo:   dateTo,
      SortBy:   this.sanitizeSortBy(merged?.SortBy ?? []),
      pageSize:  Number(merged?.pageSize ?? 30),
      pageIndex: Number(merged?.pageIndex ?? 1),

      OrgIdList:     this.ensureArr(merged?.ORG_ID),
      AccNoList:     this.ensureArr(merged?.AccNo),
      VendorNoList:  this.ensureArr(merged?.DetailNo),
      PTAFrom:       merged?.PTA ?? '',
      PTATo:         merged?.PTA ?? '',
      TargetNoList:  this.ensureArr(merged?.SubDetailNo),
      Notes:         merged?.NoteDesc ?? '',
      VouTypeList:   this.ensureArr(merged?.VOUCHER_KIND),
      VouStatusList: this.ensureArr(merged?.PostFlag),
      IsTarget:      this.ensureArr(merged?.isSubDetailNo)?.[0] ?? '',
    };

    return this.fin55050Service.queryFIN55050(payload).pipe(
      map((res: any) => {
        const data = res?.Data ?? [];
        const groups = Array.isArray(data) ? data : (data ? [data] : []);
        const rows = this.mergeByAccNoWithDateRange(groups);

        const total = rows.length;
        this.totalRecords = total;
        this.data = rows;
        this.lastQueryBody = { ...(this.lastQueryBody ?? {}), ...payload };

        return { Data: rows, TotalCount: total };
      })
    );
  };

  // === 匯出 payload ===
  private buildExportBody(): ExportFIN55050Payload | null {
    const rawForm = this.queryForm.getRawValue();
    const merged = { ...(this.lastQueryBody ?? {}), ...rawForm };

    const from = this.toDateOnly((this.lastQueryBody as any)?.DateFrom ?? rawForm?.VOUDATE_Start);
    const to   = this.toDateOnly((this.lastQueryBody as any)?.DateTo   ?? rawForm?.VOUDATE_End);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」再匯出。');
      return null;
    }

    const payload: ExportFIN55050Payload = {
      SortBy: this.sanitizeSortBy((this.lastQueryBody as any)?.SortBy ?? rawForm?.SortBy ?? []),
      DateFrom: from,
      DateTo: to,
      OrgIdList: this.ensureArr(merged?.ORG_ID ?? (this.lastQueryBody as any)?.OrgIdList),
      AccNoList: this.ensureArr(merged?.AccNo ?? (this.lastQueryBody as any)?.AccNoList),
      VendorNoList: this.ensureArr(merged?.DetailNo ?? (this.lastQueryBody as any)?.VendorNoList),
      PTAFrom: merged?.PTA ?? (this.lastQueryBody as any)?.PTAFrom ?? '',
      PTATo:   merged?.PTA ?? (this.lastQueryBody as any)?.PTATo ?? '',
      TargetNoList: this.ensureArr(merged?.SubDetailNo ?? (this.lastQueryBody as any)?.TargetNoList),
      Notes: merged?.NoteDesc ?? (this.lastQueryBody as any)?.Notes ?? '',
      VouTypeList: this.ensureArr(merged?.VOUCHER_KIND ?? (this.lastQueryBody as any)?.VouTypeList),
      VouStatusList: this.ensureArr(merged?.PostFlag ?? (this.lastQueryBody as any)?.VouStatusList),
      IsTarget: merged?.isSubDetailNo ?? (this.lastQueryBody as any)?.IsTarget ?? '',
    };
    return payload;
  }

  // === 匯出 ===
  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55050Service
      .exportFIN55050PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    this.btnLoading = true;

    this.fin55050Service
      .exportFIN55050Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳'),
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

  // === 下拉資料 ===
  loadOptions() {
    // 部門
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ORG_IDOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 活動代碼（頁面用）
    this.dropDownListService.getActivityOptions({
      mid: 0, str_no: '10', pod_type: ['1', '2', '8'], pod_status: '1',
    })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ProjectNoOptions = response.Data?.map((item: any) => ({
          label: `${item.pod_no} - ${item.pod_desc}`,
          value: item.pod_no,
        })) ?? [];
      });

    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }
}
