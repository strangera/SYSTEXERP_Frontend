import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN73030Service } from '@service/api/fin/fin73030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { createPaginationConfig, formatAmount, formatDate } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import {
  FIN73030FilterBody,
  FIN73030Option,
  FIN73030Query,
  FIN73030TableRow,
  QueryFIN73030SPResponse,
} from './fin73030.model';

@UntilDestroy()
@Component({
  selector: 'app-fin73030',
  templateUrl: './fin73030.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    TableReportComponent,
    CalendarRangeComponent,
  ],
})
export class FIN73030Component extends BasicQueryPageComponent<FIN73030TableRow> implements OnInit {
  readonly queryForm = this.formBuilder.group({
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? null],
    PCS_RqstNo: [null as string | null],
    PCS_RqstDate_S: [null as Date | string | null],
    PCS_RqstDate_E: [null as Date | string | null],
    PCS_Status: [null as string | null],
    printSignOff: [true],
    ...createPaginationConfig(),
  });

  pcsRqstNoOptions: FIN73030Option[] = [];
  readonly statusOptions: FIN73030Option[] = [
    { label: '建立', value: '1' },
    { label: '請款', value: '2' },
    { label: '拋轉傳票', value: '3' },
    { label: '撥補', value: '4' },
  ];

  data: FIN73030TableRow[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73030Query | null = null;

  readonly columns: ReportColumn[] = [
    { field: 'PCS_RqstNo', header: '支付全衡' },
    { field: 'Keep_UsrName', header: '姓名' },
    { field: 'PCS_RqstDate', header: '請款日期', format: formatDate },
    { field: 'PCS_TotNet', header: '小計(未稅)', format: formatAmount, align: 'right' },
    { field: 'PCS_TotTax', header: '稅額', format: formatAmount, align: 'right' },
    { field: 'PCS_TotAmtDisplay', header: '總計', format: formatAmount, align: 'right' },
  ];

  readonly expansionColumns: ReportColumn[] = [
    { field: 'PCS_ItemDesc', header: '名稱/摘要/內容', align: 'left' },
    { field: 'unit', header: '單位' },
    { field: 'quantity', header: '數量', format: (v) => (v == null || v === '' ? '' : String(v)) },
    {
      field: 'unitPrice',
      header: '單價',
      format: (v) => (v == null || v === '' ? '' : formatAmount(Number(v))),
      align: 'right',
    },
    { field: 'PCS_TotAmt', header: '總價', format: formatAmount, align: 'right' },
  ];

  exportPdfLoading = false;
  exportExcelLoading = false;

  constructor(
    public readonly service: FIN73030Service,
    private readonly fileExportService: FileExportService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73030', '', this.queryForm, (f) => this.onSubmit(f));
    this.loadPcsRqstNoOptions();
  }

  private loadPcsRqstNoOptions(): void {
    this.dropdownApiService
      .queryPOS2064MPCS_RqstNoDropDownList()
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            label: String(item.label ?? ''),
            value: String(item.value ?? ''),
          })),
        ),
      )
      .subscribe((opts) => {
        this.pcsRqstNoOptions = opts.filter((o) => o.value);
      });
  }

  /** 表單日期 → ISO（當日 00:00 / 23:59 本地） */
  private toIsoStart(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    const d = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  private toIsoEnd(value: Date | string | null | undefined): string | null {
    if (value == null) return null;
    const d = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  private buildQueryBody(frm: FormGroup): FIN73030Query {
    const raw = frm.getRawValue();
    return {
      SYS_StoreNo: raw.SYS_StoreNo ?? this.authService.currentUserValue?.SYS_StoreNo ?? null,
      PCS_RqstNo: raw.PCS_RqstNo || null,
      PCS_RqstDate_S: this.toIsoStart(raw.PCS_RqstDate_S),
      PCS_RqstDate_E: this.toIsoEnd(raw.PCS_RqstDate_E),
      PCS_Status: raw.PCS_Status || null,
      pageIndex: Number(raw.pageIndex) || 1,
      pageSize: Number(raw.pageSize) || 30,
      SortBy: raw.SortBy ?? [],
    };
  }

  /** 匯出用：僅五欄，不含分頁／列印簽核 */
  private buildExportBody(): FIN73030FilterBody | null {
    const raw = this.queryForm.getRawValue();
    const store = raw.SYS_StoreNo ?? this.authService.currentUserValue?.SYS_StoreNo ?? null;
    if (!store) {
      this.messageService.warnBubble('無法取得店號，請重新登入後再試。');
      return null;
    }
    return {
      SYS_StoreNo: store,
      PCS_RqstNo: raw.PCS_RqstNo || null,
      PCS_RqstDate_S: this.toIsoStart(raw.PCS_RqstDate_S),
      PCS_RqstDate_E: this.toIsoEnd(raw.PCS_RqstDate_E),
      PCS_Status: raw.PCS_Status || null,
    };
  }

  private mapRows(items: QueryFIN73030SPResponse[], baseIndex: number): FIN73030TableRow[] {
    return items.map((item, i) => this.service.toTableRow(item, baseIndex + i));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = this.buildQueryBody(frm);
      this.service
        .queryFIN73030(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe((res) => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message || '查詢失敗');
            this.data = [];
            this.totalRecords = 0;
            this.lastQueryBody = null;
            return;
          }
          this.data = this.mapRows(res.Data ?? [], 0);
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExportPdf(): void {
    if (!this.data?.length) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.fileExportService
      .executeFileExport(this.service.exportPDFFIN73030(payload), '.pdf', (v) => (this.exportPdfLoading = v))
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  onExportExcel(): void {
    if (!this.data?.length) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.fileExportService
      .executeFileExport(this.service.exportExcelFIN73030(payload), '.xlsx', (v) => (this.exportExcelLoading = v))
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  exportDisabled(): boolean {
    return !this.data?.length || !this.hasPermission('60');
  }
}
