import { formatDate } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, ReportColumn, formatAmount, formatDate as reportFormatYMD } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs';
import {
  ApiResponseTLS2A050,
  QueryTLS2A050Request,
  Tls2A050Service
} from 'src/app/service/api/tls/tls2a050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

type FlatDataRow = Record<string, string | number | null>;

const DATE_FMT = 'yyyy/MM/dd';
const LOCALE = 'en-US';

@Component({
  selector: 'app-tls2a050',
  templateUrl: './tls2a050.component.html',
  styles: [`
    :host ::ng-deep .p-datatable .OVER_PayAmt_RED {
      color: red !important;
    }
  `],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    MultiSelectComponent,
  ],
})
export class TLS2A050Component extends BasicQueryPageComponent<FlatDataRow> implements OnInit {
  private readonly tls2A050Service = inject(Tls2A050Service);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly emptyFooter: FlatDataRow = { TXN_Date: null };

  queryForm = this.formBuilder.group({
    POS_TypeList: [[] as string[]],
    salesDate: [new Date()],
    TXN_DateStart: [yesterday as Date | null],
    TXN_DateEnd: [yesterday as Date | null],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
    pageSize: [1000],
  });

  data: FlatDataRow[] = [];
  totalRecords = 0;
  POS_TypeListOptions = [
    { label: '一般', value: '' },
    { label: '停管', value: 'PKNG' },
  ];
  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  sumData: Record<string, number> = {};
  footerData: FlatDataRow | null = null;
  lastQueryBody: QueryTLS2A050Request | null = null;
  exportExcelLoading = false;

  ngOnInit(): void {
    this.initializePage('TLS2A050', 'TLS/TLS2A050cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.controls.salesDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (!val) return;
        const selected = val instanceof Date ? val : new Date(val);
        if (Number.isNaN(selected.getTime())) return;
        const year = selected.getFullYear();
        const month = selected.getMonth();
        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);
        this.queryForm.patchValue({
          TXN_DateStart: this.salesMinDate,
          TXN_DateEnd: this.salesMaxDate,
        });
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.value as {
        pageIndex: number;
        pageSize: number;
        SortBy: { field: string; order: number }[];
        TXN_DateStart: Date | string | null;
        TXN_DateEnd: Date | string | null;
        POS_TypeList: string[] | null;
      };
      const params: QueryTLS2A050Request = {
        pageIndex: raw.pageIndex,
        pageSize: raw.pageSize,
        SortBy: raw.SortBy ?? [],
        TXN_DateStart: raw.TXN_DateStart ? formatDate(raw.TXN_DateStart, DATE_FMT, LOCALE) : null,
        TXN_DateEnd: raw.TXN_DateEnd ? formatDate(raw.TXN_DateEnd, DATE_FMT, LOCALE) : null,
        POS_TypeList: raw.POS_TypeList?.includes('all') ? [] : raw.POS_TypeList,
      };
      this.tls2A050Service.queryTLS2A050(params)
        .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false))
        .subscribe((res) => {
          const { flatData, payNames } = this.buildFlatData(res);
          const { columns, columnGroup } = this.buildColumnsAndGroups(payNames);
          this.lastQueryBody = params;
          this.columns = columns;
          this.columnGroup = columnGroup;
          this.data = flatData;
          this.sumData = res.Data?.SumData ?? {};
          this.footerData = this.buildFooterData(payNames, this.sumData);
          this.totalRecords = res.TotalCount ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  public queryTLS2A050ForReport = (body: QueryTLS2A050Request) =>
    this.tls2A050Service.queryTLS2A050({
      pageSize: body.pageSize ?? 1000,
      pageIndex: body.pageIndex ?? 1,
      SortBy: body.SortBy ?? [],
      TXN_DateStart: body.TXN_DateStart ?? null,
      TXN_DateEnd: body.TXN_DateEnd ?? null,
      POS_TypeList: body.POS_TypeList?.includes('all') ? [] : body.POS_TypeList,
    }).pipe(map((res) => {
      const { flatData, payNames } = this.buildFlatData(res);
      const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
      if (isFirstPage) {
        const { columns, columnGroup } = this.buildColumnsAndGroups(payNames);
        this.columns = columns;
        this.columnGroup = columnGroup;
        this.sumData = res.Data?.SumData ?? {};
        this.footerData = this.buildFooterData(payNames, this.sumData);
      }
      return { Data: flatData, TotalCount: res.TotalCount ?? flatData.length };
    }));

  exportReport = (): void => {
    const raw = this.queryForm.getRawValue();
    const payload = {
      FileName: `Report_${formatDate(new Date(), 'yyyyMMddHHmmss', LOCALE)}.xlsx`,
      ReportTitle: '第三方支付帳差報表',
      queryTLS2A050Request: {
        TXN_DateStart: raw.TXN_DateStart ? formatDate(raw.TXN_DateStart, DATE_FMT, LOCALE) : null,
        TXN_DateEnd: raw.TXN_DateEnd ? formatDate(raw.TXN_DateEnd, DATE_FMT, LOCALE) : null,
        POS_TypeList: raw.POS_TypeList?.includes('all') ? [] : raw.POS_TypeList,
        pageIndex: raw.pageIndex ?? 1,
        pageSize: raw.pageSize ?? 1000,
        SortBy: raw.SortBy ?? [],
      },
    };
    this.exportExcelLoading = true;
    this.tls2A050Service.exportTLS2A050(payload)
      .pipe(finalize(() => this.exportExcelLoading = false))
      .subscribe((res: HttpResponse<Blob>) => {
        if (!res.body) return;
        const contentDisposition = res.headers.get('content-disposition');
        let filename = 'unknown.xlsx';
        if (contentDisposition) {
          const matches = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/.exec(contentDisposition);
          if (matches) {
            filename = decodeURIComponent(matches[1] || matches[2] || filename).replace(/["']/g, '');
          }
        }
        saveAs(new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
      });
  };

  private buildFlatData(res: ApiResponseTLS2A050): { flatData: FlatDataRow[]; payNames: string[] } {
    const flatData: FlatDataRow[] = [];
    const payNameSet = new Set<string>();
    for (const entry of res.Data?.QueryData ?? []) {
      const row: FlatDataRow = { TXN_Date: entry.TXN_Date };
      entry._DetailList.forEach((detail, index) => {
        payNameSet.add(detail.PAY_Name);
        const formattedAmt = formatAmount(detail.OVER_PayAmt);
        row[`${index}_BOOK_PayCnt`] = detail.BOOK_PayCnt;
        row[`${index}_ACT_PayCnt`] = detail.ACT_PayCnt;
        row[`${index}_BOOK_PayAmt`] = detail.BOOK_PayAmt;
        row[`${index}_ACT_PayAmt`] = detail.ACT_PayAmt;
        row[`${index}_OVER_PayAmt`] = detail.OVER_PayAmt !== 0
          ? `<span class="OVER_PayAmt_RED">${formattedAmt}</span>`
          : `<span>${formattedAmt}</span>`;
      });
      flatData.push(row);
    }
    return { flatData, payNames: Array.from(payNameSet) };
  }

  private buildColumnsAndGroups(payNames: string[]): { columns: ReportColumn[]; columnGroup: ColumnGroup[] } {
    const columns: ReportColumn[] = [{ field: 'TXN_Date', header: '交易日期', visible: true, format: reportFormatYMD }];
    const columnGroup: ColumnGroup[] = [];
    payNames.forEach((name, index) => {
      columns.push(
        { field: `${index}_BOOK_PayCnt`, header: '系統筆數', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_ACT_PayCnt`, header: '實收筆數', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_BOOK_PayAmt`, header: '系統金額', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_ACT_PayAmt`, header: '實收金額', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_OVER_PayAmt`, header: '帳差 (實收-系統)', visible: true, groupField: name, format: formatAmount, align: 'right', type: 'html' },
      );
      columnGroup.push({ field: name, header: `[${name}] 行動支付` });
    });
    return { columns, columnGroup };
  }

  private buildFooterData(payNames: string[], sumData: Record<string, number>): FlatDataRow | null {
    if (!sumData) return null;
    const footer: FlatDataRow = { ...TLS2A050Component.emptyFooter };
    payNames.forEach((name, index) => {
      footer[`${index}_BOOK_PayCnt`] = sumData[`BOOK_PayCnt_${name}`] ?? 0;
      footer[`${index}_ACT_PayCnt`] = sumData[`ACT_PayCnt_${name}`] ?? 0;
      footer[`${index}_BOOK_PayAmt`] = sumData[`BOOK_PayAmt_${name}`] ?? 0;
      footer[`${index}_ACT_PayAmt`] = sumData[`ACT_PayAmt_${name}`] ?? 0;
      footer[`${index}_OVER_PayAmt`] = sumData[`OVER_PayAmt_${name}`] ?? 0;
    });
    return footer;
  }
}
