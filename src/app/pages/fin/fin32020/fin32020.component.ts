/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../others/component/table/table.model';

import {
  ApiResponse,
  FIN32020Service,
  Fin32020DetailRow,
  Fin32020Row,
} from '../../../service/api/fin/fin32020.service';

interface SortItem {
  field: string;
  order: number;
}

@UntilDestroy()
@Component({
  selector: 'app-fin32020',
  templateUrl: './fin32020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    TableReportComponent,
  ],
})
export class FIN32020Component extends BasicQueryPageComponent<Fin32020Row> implements OnInit {
  data: Fin32020Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin32020Row[] = [];
  tableVisible = true;
  lastQueryBody: any = null;
  private _currentSortBy: SortItem[] = [];
  footerData: any = undefined;

  moneyFormat = (value: any): string => {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString('en-US');
  };
  columns: ReportColumn[] = [
    { field: 'ADJ_No', header: '調整單號' },
    {
      field: 'ADJ_Date',
      header: '調整日期',
      format: (v: string) => this.formatDate(v),
    },
    {
      field: 'TotalAmt',
      header: '調整金額',
      align: 'right',
      format: this.moneyFormat,
    },
    { field: 'Remark', header: '備註' },
  ];

  expansionColumns: ReportColumn[] = [
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'AccNo', header: '調整科目' },
    { field: 'AccCName', header: '科目名稱' },
    {
      field: 'ADJ_Amt',
      header: '調整金額',
      align: 'right',
      format: this.moneyFormat,
    },
    { field: 'Detail_Remark', header: '備註' },
    { field: 'VouNo', header: '傳票單號' },
  ];

  readonly defaultSort: SortItem[] = [
    { field: 'ADJ_Date', order: -1 },
    { field: 'ADJ_No', order: 1 },
  ];;

  queryForm = this.formBuilder.group({
    adjust_ID: [null as string | null, [Validators.maxLength(14)]],
    adjust_Date_From: [null as Date | null],
    adjust_Date_To: [null as Date | null],
    remark: ['', [Validators.maxLength(30)]],
    summons_ID_From: [null as string | null],
    summons_ID_To: [null as string | null],
    ...createPaginationConfig([
      { field: 'ADJ_Date', order: -1 },
      { field: 'ADJ_No', order: 1 },
    ]),
  });

  constructor(
    private readonly fin32020Service: FIN32020Service,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage(
      'FIN32020',
      'fin/fin32020cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    this._currentSortBy = this.defaultSort;

    const fromCru = !!(history.state?.['fromCru']);

    this.formStatusService
      .waitForReady(this.ProgNo)
      .pipe(untilDestroyed(this), take(1))
      .subscribe(() => {
        if (fromCru) {
          this.handleQueryRestore(this.queryForm, this.ProgNo, (f) =>
            this.onSubmit(f)
          );
        } else {
          this.onClear(this.queryForm);
          this.data = [];
          this.selectedItems = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.lastQueryBody = null;
    
        }
      });
  }

private resetTableBeforeQuery(): void {
  this.tableVisible = false;

  this.data = [];
  this.selectedItems = [];
  this.footerData = undefined;
  this.totalRecords = 0;
  this.viewTotalRecords = 0;
  this.lastQueryBody = null;

  this.cdr.detectChanges();
}
  private formatDate(val: string | null | undefined): string {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  private toYMDOrNull(d: Date | string | null | undefined): string | null {
    if (d == null) return null;
    const s = formatDateToYYYY_MM_DD(d) as
      | string
      | null
      | undefined;
    return s || null;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x &&
          typeof x.field === 'string' &&
          typeof x.order === 'number'
      )
      .map((x) => ({ field: String(x.field), order: x.order as number }));

    return cleaned.length ? cleaned : fallback;
  }
  private initRows(rows: Fin32020Row[]): Fin32020Row[] {
    for (const [idx, r] of rows.entries()) {
      const adjNo = r.ADJ_No ?? `fallback_${idx}`;

      (r as any)._rowKey = `fin32020_${adjNo}`;
      r._Details = [];
      (r as any)._detailLoaded = false;
      (r as any).expansionLoading = false;
    }
    return rows;
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

  private buildPayload(base: any): any {
    const raw = this.queryForm.getRawValue();

    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const req: any = {
      pageIndex,
      pageSize: 30,
      SortBy: sort,
      ADJ_No: raw.adjust_ID ? String(raw.adjust_ID) : null,
      ADJ_Date_From: this.toYMDOrNull(raw.adjust_Date_From),
      ADJ_Date_To: this.toYMDOrNull(raw.adjust_Date_To),
      Remark: raw.remark || null,
      VouNo_From: raw.summons_ID_From ? String(raw.summons_ID_From) : null,
      VouNo_To: raw.summons_ID_To ? String(raw.summons_ID_To) : null,
    };

    for (const k of Object.keys(req)) {
      const v = req[k];
      if (v === '' || v === null || v === undefined) {
        delete req[k];
      }
    }

    return req;
  }

  public loadDetailForExpansion = (
    row: Fin32020Row
  ): Observable<{ Data: Fin32020DetailRow[]; TotalCount: number }> => {
    if (!row?.ADJ_No) {
      row._Details = [];
      (row as any)._detailLoaded = true;
      return of({ Data: [], TotalCount: 0 });
    }

    if ((row as any)._detailLoaded) {
      return of({
        Data: Array.isArray(row._Details) ? row._Details : [],
        TotalCount: Array.isArray(row._Details) ? row._Details.length : 0,
      });
    }

    return this.fin32020Service.queryFIN32020Detail(row.ADJ_No).pipe(
      map((res: ApiResponse<Fin32020DetailRow[]>) => {
        const details = Array.isArray(res?.Data) ? res.Data : [];
        row._Details = details;
        (row as any)._detailLoaded = true;

        this.data = [...this.data];
        this.cdr.detectChanges();

        return {
          Data: details,
          TotalCount: details.length,
        };
      })
    );
  };

  public queryFIN32020ForReport = (body: any) =>
    this.fin32020Service.queryFIN32020(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin32020Row[] | Fin32020Row>) => {
        const src = res?.Data as any;
        const rows: Fin32020Row[] = Array.isArray(src) ? src : src ? [src] : [];
        const totalCount =
          Number((res as any)?.TotalCount ?? rows.length) || rows.length;

        this.initRows(rows);

        return {
          Data: rows,
          TotalCount: totalCount,
          GrandTotal: null,
        };
      })
    );

  onSubmit(frm: FormGroup): void {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    if (!this.hasPermission(this.Actions.Query)) return;

    const raw: any = this.queryForm.getRawValue();

    const payload = this.buildPayload({
      pageIndex: 1,
      pageSize: 30,
      SortBy: raw.SortBy || this._currentSortBy || this.defaultSort,
    });

    
    this.resetTableBeforeQuery();

    setTimeout(() => {
      this.tableVisible = true;
      this.loading = true;
      this.cdr.detectChanges();

      this.fin32020Service
        .queryFIN32020(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: ApiResponse<Fin32020Row[]>) => {
            const rows: Fin32020Row[] = Array.isArray(res?.Data) ? res.Data : [];

            this.initRows(rows);

            const realTotal =
              Number((res as any)?.TotalCount ?? rows.length) || rows.length;

            this.lastQueryBody = { ...payload };
            this._currentSortBy = payload.SortBy ?? this.defaultSort;
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.data = rows;

            this.saveQueryState();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('FIN32020 API error:', err);
            this.data = [];
            this.totalRecords = 0;
            this.viewTotalRecords = 0;
            this.footerData = undefined;
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
    });
  }

  onClear(frm: FormGroup): void {
    frm.reset(
      {
        adjust_ID: null,
        adjust_Date_From: null,
        adjust_Date_To: null,
        remark: '',
        summons_ID_From: null,
        summons_ID_To: null,
        ...createPaginationConfig([
          { field: 'ADJ_Date', order: -1 },
          { field: 'ADJ_No', order: 1 },

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

    this.queryStateService.clearQueryState(this.ProgNo);
    this.queryStateService.clearQueryState(`${this.ProgNo}_ext`);
   
    this.cdr.detectChanges();
  }

  onClickCreate(): void {
    this.saveQueryState();
    this.onCreate(undefined, this.queryForm.value);
  }

  override onDetail(row: Fin32020Row, queryConditions?: any): void {
    this.saveQueryState();
    super.onDetail(row, this.queryForm.value);
  }

  get canShowEdit(): boolean {
    return (
      Array.isArray(this.data) &&
      this.data.some((r) => (r as any)?.['CanEdit'] === true)
    );
  }

  override onEdit(row: Fin32020Row, queryConditions?: any): void {
    this.saveQueryState();

    if ((row as any)?.['CanEdit'] !== true) {
      super.onDetail(row, this.queryForm.value);
      return;
    }

    if (!row?.ADJ_No) {
      super.onEdit(row, this.queryForm.value);
      return;
    }

    this.loading = true;

    this.fin32020Service
      .queryFIN32020Detail(row.ADJ_No)
      .pipe(untilDestroyed(this), take(1))
      .subscribe({
        next: (res) => {
          const details = Array.isArray(res?.Data) ? res.Data : [];

          const rowWithDetails: Fin32020Row = {
            ...row,
            _Details: details,
          };

          this.loading = false;
          super.onEdit(rowWithDetails, this.queryForm.value);
        },
        error: (err) => {
          console.error('queryFIN32020Detail error before edit:', err);
          this.loading = false;
        },
      });
  }
  editDisabledFn = (row: any) => {
    return !row?.CanEdit;
  };
}
