/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, map, take } from 'rxjs/operators';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { FIN73020Service } from '../../../service/api/fin/fin73020.service';

import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

import {
  FIN73020Data,
  FIN73020ExportRequest,
  FIN73020Option,
  FIN73020Query,
} from './fin73020.model';

interface SortItem {
  field: string;
  order: number;
}

@UntilDestroy()
@Component({
  selector: 'app-fin73020',
  templateUrl: './fin73020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    TableReportComponent,
  ],
})
export class FIN73020Component extends BasicQueryPageComponent<FIN73020Data> implements OnInit {
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly defaultSort: SortItem[] = [
    { field: 'PCS_RqstDate', order: -1 },
    { field: 'PCS_RqstNo', order: 1 },
  ];

  private _currentSortBy: SortItem[] = [];

  public readonly queryForm = this.formBuilder.group({
    PCS_RqstNo: [null as string | null],
    RqstDate_S: [this.yesterday as Date | null, [Validators.required]],
    RqstDate_E: [this.yesterday as Date | null, [Validators.required]],
    PCS_UsrNo: [null as string | null],
    Keep_UsrNo: [null as string | null],
    PCS_Status: [null as string | null],
    Keep_OrgID: [null as string | null],
    ...createPaginationConfig([
      { field: 'PCS_RqstDate', order: -1 },
      { field: 'PCS_RqstNo', order: 1 },
    ]),
  });

  applicantOptions: FIN73020Option[] = [];
  custodianOptions: FIN73020Option[] = [];
  custodianDeptOptions: FIN73020Option[] = [];

  statusOptions: FIN73020Option[] = [
    { label: '請選擇', value: '' },
    { label: '建立', value: '1' },
    { label: '請款', value: '2' },
    { label: '拋轉傳票', value: '3' },
    { label: '撥補', value: '4' },
    { label: '作廢', value: '9' },
  ];

  data: FIN73020Data[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: FIN73020Data[] = [];
  lastQueryBody: FIN73020Query | null = null;
  footerData: any = undefined;
  tableVer = 0;
  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'SeqNo', header: '序號' },
    { field: 'PCS_RqstNo', header: '支出請款單號' },
    { field: 'PCS_RqstDate', header: '產生日期', format: v => this.formatDate(v) },
    { field: 'PCS_StatusName', header: '狀態' },

    { field: 'PCS_No', header: '零用金單號' },
    { field: 'PCS_Date', header: '零用金申請日期', format: v => this.formatDate(v) },
    { field: 'PCS_UsrNo', header: '申請人代碼' },
    { field: 'PCS_UsrName', header: '申請人姓名' },
    { field: 'PCS_OrgID', header: '申請人組織代號' },

    { field: 'Keep_UsrNo', header: '保管人代碼' },
    { field: 'Keep_UsrName', header: '保管人姓名' },
    { field: 'Keep_OrgID', header: '保管人組織代碼' },
    { field: 'Keep_OrgName', header: '組織名稱' },

    { field: 'EXP_ACC', header: '費用會計科目' },
    { field: 'ORG_ID', header: '費用科目組織代號' },
    { field: 'NOTeDesc', header: '項目摘要' },
    { field: 'PCS_DtlTypeName', header: '明細類別' },
    { field: 'PCS_GUINo', header: '發票/收據號碼' },
    { field: 'PUR_Date', header: '消費日期', format: v => this.formatDate(v) },

    { field: 'PCS_Net', header: '未稅金額', align: 'right', format: v => this.money(v) },
    { field: 'PCS_Tax', header: '稅額', align: 'right', format: v => this.money(v) },
    { field: 'PCS_Amt', header: '總額', align: 'right', format: v => this.money(v) },

    { field: 'Voucher_No', header: '傳票號碼' },
  ];

  constructor(
    public readonly service: FIN73020Service,
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN73020', '', this.queryForm, this.onSubmit.bind(this));

    this._currentSortBy = this.defaultSort;

    this.formStatusService
      .waitForReady(this.ProgNo)
      .pipe(untilDestroyed(this), take(1))
      .subscribe(() => {
        this.onClear(this.queryForm);
      });

    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];

        const opts = list.map((x: any) => ({
          value: x.No ?? '',
          label: `${x.No ?? ''} - ${x.Name ?? ''}`,
        }));

        this.applicantOptions = opts;
        this.custodianOptions = opts;
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.custodianDeptOptions = (res.Data ?? []).map((x: any) => ({
          value: x.No ?? '',
          label: `${x.No ?? ''} - ${x.Name ?? ''}`,
        }));
      });
  }

  formatDate(val: any): string {
    if (!val) return '';

    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);

    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  money(val: number): string {
    return Number(val ?? 0).toLocaleString('en-US');
  }

  private toYMDOrNull(d: Date | string | null | undefined): string | null {
    if (d == null) return null;

    const s = formatDateToYYYY_MM_DD(d) as string | null | undefined;
    return s || null;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];

    const cleaned = asArr
      .filter(x => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map(x => ({
        field: String(x.field),
        order: x.order as number,
      }));

    return cleaned.length ? cleaned : fallback;
  }

  private cleanPayload<T extends Record<string, any>>(payload: T): T {
    for (const key of Object.keys(payload)) {
      const value = payload[key];

      if (value === '' || value === null || value === undefined) {
        delete payload[key];
      }

      if (Array.isArray(value) && value.length === 0) {
        delete payload[key];
      }
    }

    return payload;
  }

  private initRows(rows: FIN73020Data[]): FIN73020Data[] {
    for (const [index, row] of rows.entries()) {
      const rqstNo = row.PCS_RqstNo ?? 'NORQST';
      const pcsNo = row.PCS_No ?? 'NOPCS';
      const seqNo = row.SeqNo ?? index;
      const note = row.NOTeDesc ?? 'NONOTE';

      row.dataKey = `key_${rqstNo}_${pcsNo}_${seqNo}_${note}`;
    }

    return rows;
  }

  private buildPayload(base: any): FIN73020Query {
    const raw = this.queryForm.getRawValue();

    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;

    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    return this.cleanPayload({
      PCS_RqstNo: raw.PCS_RqstNo || null,
      RqstDate_S: this.toYMDOrNull(raw.RqstDate_S),
      RqstDate_E: this.toYMDOrNull(raw.RqstDate_E),
      PCS_UsrNo: raw.PCS_UsrNo || null,
      Keep_UsrNo: raw.Keep_UsrNo || null,
      PCS_Status: raw.PCS_Status || null,
      Keep_OrgID: raw.Keep_OrgID || null,
      pageIndex,
      pageSize,
      SortBy: sort,
    });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState(
      this.ProgNo,
      this.queryForm.getRawValue()
    );

    this.queryStateService.setQueryState(`${this.ProgNo}_ext`, {
      currentSortBy: this._currentSortBy?.length
        ? this._currentSortBy
        : this.defaultSort,
      lastQueryBody: this.lastQueryBody,
    } as any);
  }

  public queryFIN73020ForReport = (body: any) =>
    this.service.queryFIN73020(this.buildPayload(body || {})).pipe(
      map((res: any) => {
        const src = res?.Data;
        const apiRows: FIN73020Data[] = Array.isArray(src) ? src : src ? [src] : [];
        const rows = this.normalizeDisplayRows(apiRows);

        this.initRows(rows);

        const totalCount = rows.length === 0
          ? 0
          : Number(res?.TotalCount ?? rows.length) || rows.length;

        return {
          Data: rows,
          TotalCount: totalCount,
          GrandTotal: null,
        };
      })
    );

  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (frm.invalid) {
      frm.markAllAsTouched();
      return;
    }

    if (!this.hasPermission(this.Actions.Query)) return;

    const raw: any = this.queryForm.getRawValue();

    const payload = this.buildPayload({
      pageIndex: 1,
      pageSize: raw.pageSize || 30,
      SortBy: raw.SortBy || this._currentSortBy || this.defaultSort,
    });

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.lastQueryBody = null;
    this.tableVer++;

    this.service
      .queryFIN73020(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          const apiRows: FIN73020Data[] = Array.isArray(res?.Data) ? res.Data : [];
          const rows = this.normalizeDisplayRows(apiRows);

          this.initRows(rows);

          const realTotal = rows.length === 0
            ? 0
            : Number(res?.TotalCount ?? rows.length) || rows.length;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;
          this.data = rows;

          this.cdr.detectChanges();
          this.saveQueryState();
        },
        error: err => {
          console.error('FIN73020 API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
        },
      });
  }

  onClear(frm: FormGroup): void {
    frm.reset(
      {
        PCS_RqstNo: null,
        RqstDate_S: this.yesterday,
        RqstDate_E: this.yesterday,
        PCS_UsrNo: null,
        Keep_UsrNo: null,
        PCS_Status: null,
        Keep_OrgID: null,
        ...createPaginationConfig([
          { field: 'PCS_RqstDate', order: -1 },
          { field: 'PCS_RqstNo', order: 1 },
        ]),
      } as any,
      { emitEvent: false }
    );

    this.submitted = false;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;
    this.tableVer++;

    this.queryStateService.clearQueryState(this.ProgNo);
    this.queryStateService.clearQueryState(`${this.ProgNo}_ext`);
  }

  private buildExportBody(): FIN73020ExportRequest | null {
    if (!this.lastQueryBody) return null;

    const { pageIndex, pageSize, SortBy, ...rest } = this.lastQueryBody as any;
    return this.cleanPayload({ ...rest }) as FIN73020ExportRequest;
  }

  onExportPDF(): void {
    const body = this.buildExportBody();

    if (!body) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.service.exportPDFFIN73020(body)
      .pipe(untilDestroyed(this), finalize(() => this.btnLoading = false))
      .subscribe(res => this.downloadFile(res, '.pdf'));
  }

  onExportXLSX(): void {
    const body = this.buildExportBody();

    if (!body) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.service.exportExcelFIN73020(body)
      .pipe(untilDestroyed(this), finalize(() => this.btnLoading = false))
      .subscribe(res => this.downloadFile(res, '.xlsx'));
  }

  private downloadFile(res: HttpResponse<Blob>, ext: string): void {
    const blob = res.body;

    if (!blob || blob.size === 0) {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
      return;
    }

    const fileName = this.getFilenameFromHeader(res.headers.get('Content-Disposition'), ext);
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    globalThis.URL.revokeObjectURL(url);
    a.remove();
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExt: string): string {
    if (!contentDisposition) return `FIN73020${defaultExt}`;

    const filenameStar = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStar?.[1]) {
      try {
        return decodeURIComponent(filenameStar[1].replace(/^UTF-8''/, ''));
      } catch {
        return filenameStar[1];
      }
    }

    const filename = /filename="([^"]+)"/.exec(contentDisposition);
    if (filename?.[1]) {
      try {
        return decodeURIComponent(filename[1].replaceAll('+', ' '));
      } catch {
        return filename[1];
      }
    }

    return `FIN73020${defaultExt}`;
  }
  private isOnlyGrandTotalRow(rows: FIN73020Data[]): boolean {
    if (rows.length !== 1) return false;

    const row = rows[0];

    return String(row?.NOTeDesc ?? '').trim() === '總計'
      && !row.PCS_RqstNo
      && !row.PCS_No
      && row.PCS_Amt == null;
  }

  private normalizeDisplayRows(rows: FIN73020Data[]): FIN73020Data[] {
    return this.isOnlyGrandTotalRow(rows) ? [] : rows;
  }
}
