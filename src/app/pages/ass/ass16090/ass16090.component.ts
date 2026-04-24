/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import {
  ApiResponse,
  ASS16090Service,
  Ass16090DetailResponse,
  Ass16090Row,
} from '../../../service/api/ass/ass16090.service';

interface SortItem {
  field: string;
  order: number;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16090',
  templateUrl: './ass16090.component.html',
  styleUrl: './ass16090.component.scss',
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
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class ASS16090Component extends BasicQueryPageComponent<Ass16090Row> {
  showTable = true;
  data: Ass16090Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Ass16090Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  /** 倉別 */
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);

  /** 申請人 / 審核者 */
  empIdOptions: { value: string; label: string }[] = [];

  /** 品項 */
  goodsIdOptions: { value: string; label: string }[] = [];

  /** 部門 */
  orgIdOptions: { value: string; label: string }[] = [];

  /** 報廢狀態 */
  scrapStatusOptions: { value: string; label: string }[] = [];

  private _currentSortBy: SortItem[] = [];

  readonly defaultSort: SortItem[] = [
    { field: 'APPLY_DATE', order: -1 },
    { field: 'DAMAGEM_ID', order: -1 },
  ];

  columns: ReportColumn[] = [
    { field: 'DAMAGEM_ID', header: '報廢單號' },
    { field: 'EMP_ID', header: '申請人代號' },
    { field: 'EMP_NAME', header: '申請人名稱' },
    { field: 'ORG_NAME', header: '部門名稱' },
    { field: 'WH_NAME', header: '倉別名稱' },
    {
      field: 'APPLY_DATE',
      header: '申請日期',
      format: (v: string) => this.formatDate(v),
    },
    {
      field: 'APRV_DATE',
      header: '審核日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'DAMAGEM_STATUS_NAME', header: '狀態' },
    { field: 'DETAIL_COUNT', header: '明細筆數', align: 'right' },
  ];

  expansionColumns: ReportColumn[] = [
    // { field: 'LINE_NUM', header: '行號' },
    { field: 'GOODS_ID', header: '品項編號' },
    { field: 'GOODS_NAME', header: '品項名稱' },
    { field: 'GOODS_UNIT_NAME', header: '單位' },
    { field: 'QTY', header: '報廢數量', align: 'right' },
    { field: 'NOTES', header: '明細說明' },
  ];

  /** 管理欄位按鈕 */
  actionButtons = [
    {
      icon: 'pi pi-pencil',
      label: '編輯',
      action: (row: Ass16090Row) => this.onClickEdit(row),
      disabled: (row: Ass16090Row) =>
        String(row?.DAMAGEM_STATUS ?? '') !== '1',
    },
    {
      icon: 'pi pi-check',
      label: '確認審核',
      action: (row: Ass16090Row) => this.onClickApprove(row),
      disabled: (row: Ass16090Row) =>
        String(row?.DAMAGEM_STATUS ?? '') !== '1',
    },
    {
      icon: 'pi pi-times',
      label: '作廢',
      action: (row: Ass16090Row) => this.onClickVoid(row),
      disabled: (row: Ass16090Row) =>
        String(row?.DAMAGEM_STATUS ?? '') !== '1',
    },
  ];

  queryForm = this.formBuilder.group({
    DAMAGEM_ID: [null as string | null],
    EMP_ID: [null as string | null],
    GOODS_ID: [null as string | null],
    ORG_ID: [null as string | null],
    WH_ID: [null as string | null],
    DAMAGEM_STATUS: [null as string | null],
    APRV_EMP_ID: [null as string | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    ...createPaginationConfig([
      { field: 'APPLY_DATE', order: -1 },
      { field: 'DAMAGEM_ID', order: -1 },
    ]),
  });

  constructor(
    private readonly ass16090Service: ASS16090Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage(
      'ASS16090',
      'ass/ass16090cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    this._currentSortBy = this.defaultSort;

    const fromCru = !!(history.state && history.state['fromCru']);

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
          this.tableVer++;
        }
      });

    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    /** 倉別 */
    this.ass11100Service
      .queryASS11100({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') return;
          const options = (res.Data ?? [])
            .filter((item) => item.WH_ID != null && item.WH_ID !== '')
            .map((item) => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
              value: item.WH_ID!,
            }));
          this.whIdOptions.set(options);
        },
      });

    /** 申請人 / 審核者 */
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.empIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });

    /** 品項 */
    this.dropdownApiService
      .queryAss11040Dropdown()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.goodsIdOptions = (res ?? []).map((item: any) => ({
          value: item.No ?? item.value ?? '',
          label: item.Name
            ? `${item.No ?? ''} - ${item.Name ?? ''}`
            : item.label ?? '',
        }));
      });

    /** 部門 */
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });

    /** 報廢狀態 */
    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'AM_DAMAGEM_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.scrapStatusOptions = list.map(
          (item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          })
        );
      });
  }

  private formatDate(val: string | null | undefined): string {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private toYMDOrNull(d: Date | string | null | undefined): string | null {
    if (d == null) return null;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;
    return !s ? null : s;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));

    return cleaned.length ? cleaned : fallback;
  }

 private initRows(rows: Ass16090Row[]): Ass16090Row[] {
  const seed = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  rows.forEach((r, idx) => {
    (r as any)._rowKey = `${seed}_${idx}`;
    r.Details = [];
    (r as any)._detailLoaded = false;
  });

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
      DAMAGEM_ID: raw.DAMAGEM_ID || null,
      EMP_ID: raw.EMP_ID || null,
      GOODS_ID: raw.GOODS_ID || null,
      ORG_ID: raw.ORG_ID || null,
      WH_ID: raw.WH_ID || null,
      DAMAGEM_STATUS: raw.DAMAGEM_STATUS || null,
      APRV_EMP_ID: raw.APRV_EMP_ID || null,
      APPLY_DATE_S: this.toYMDOrNull(raw.APPLY_DATE_S),
      APPLY_DATE_E: this.toYMDOrNull(raw.APPLY_DATE_E),
      APRV_DATE_S: this.toYMDOrNull(raw.APRV_DATE_S),
      APRV_DATE_E: this.toYMDOrNull(raw.APRV_DATE_E),
    };

    Object.keys(req).forEach((k) => {
      const v = req[k];
      if (v === '' || v === null || v === undefined) {
        delete req[k];
      }
    });

    return req;
  }

  public loadDetailForExpansion = (
    row: Ass16090Row
  ): Observable<{ Data: any[]; TotalCount: number }> => {
    if (!row?.ID && !row?.DAMAGEM_ID) {
      row.Details = [];
      (row as any)._detailLoaded = true;
      return of({ Data: [], TotalCount: 0 });
    }

    if ((row as any)._detailLoaded) {
      return of({
        Data: Array.isArray(row.Details) ? row.Details : [],
        TotalCount: Array.isArray(row.Details) ? row.Details.length : 0,
      });
    }

    return this.ass16090Service
      .queryDetailASS16090({
        MID: 0,
        ID: row?.ID ?? null,
        DAMAGEM_ID: row?.DAMAGEM_ID ?? null,
      })
      .pipe(
        map((res: ApiResponse<Ass16090DetailResponse>) => {
          const details = Array.isArray(res?.Data?.Details)
            ? res.Data.Details
            : [];

          row.Details = details;
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

  public queryASS16090ForReport = (body: any) =>
    this.ass16090Service.queryASS16090(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Ass16090Row[] | Ass16090Row>) => {
        const src = res?.Data as any;
        const rows: Ass16090Row[] = Array.isArray(src) ? src : src ? [src] : [];
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

    if (frm.invalid) {
      frm.markAllAsTouched();
      return;
    }

    if (!this.hasPermission(this.Actions.Query)) return;

    const raw: any = this.queryForm.getRawValue();

    const payload = this.buildPayload({
      pageIndex: 1,
      pageSize: 30,
      SortBy: raw.SortBy || this._currentSortBy || this.defaultSort,
    });

    this.loading = true;
    this.showTable = false;

    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.lastQueryBody = null;
    this.tableVer++;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.showTable = true;
      this.cdr.detectChanges();

      this.ass16090Service
        .queryASS16090(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: ApiResponse<Ass16090Row[]>) => {
            const rows: Ass16090Row[] = Array.isArray(res?.Data) ? res.Data : [];

            this.initRows(rows);
            this.data = rows;
            this.cdr.detectChanges();

            const realTotal =
              Number((res as any)?.TotalCount ?? rows.length) || rows.length;

            setTimeout(() => {
              this.totalRecords = realTotal;
              this.viewTotalRecords = realTotal;
              this.lastQueryBody = { ...payload };
              this._currentSortBy = payload.SortBy ?? this.defaultSort;
              this.saveQueryState();
            });

            this.loading = false;
          },
          error: (err: any) => {
            console.error('ASS16090 query error:', err);
            this.data = [];
            this.totalRecords = 0;
            this.viewTotalRecords = 0;
            this.footerData = undefined;
            this.loading = false;
          },
        });
    });
  }

  onClear(frm: FormGroup): void {
    frm.reset(
      {
        DAMAGEM_ID: null,
        EMP_ID: null,
        GOODS_ID: null,
        ORG_ID: null,
        WH_ID: null,
        DAMAGEM_STATUS: null,
        APRV_EMP_ID: null,
        APPLY_DATE_S: null,
        APPLY_DATE_E: null,
        APRV_DATE_S: null,
        APRV_DATE_E: null,
        ...createPaginationConfig([
          { field: 'APPLY_DATE', order: -1 },
          { field: 'DAMAGEM_ID', order: -1 },
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
  }

  onClickCreate(): void {
    this.saveQueryState();
    this.onCreate(undefined, this.queryForm.value);
  }

  onClickEdit(row: Ass16090Row): void {
    if (String(row?.DAMAGEM_STATUS ?? '') !== '1') return;

    this.saveQueryState();
    super.onEdit(row, this.queryForm.getRawValue());
  }

  onClickApprove(row: Ass16090Row): void {
    if (String(row?.DAMAGEM_STATUS ?? '') !== '1') return;

    this.loading = true;

    this.ass16090Service
      .approveASS16090({
        ID: Number(row?.ID ?? 0),
      } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.onSubmit(this.queryForm);
        },
        error: (err) => {
          console.error('ASS16090 approve error:', err);
          this.loading = false;
        },
      });
  }

  onClickVoid(row: Ass16090Row): void {
    if (String(row?.DAMAGEM_STATUS ?? '') !== '1') return;

    this.loading = true;

    this.ass16090Service
      .voidASS16090({
        ID: Number(row?.ID ?? 0),
      } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.onSubmit(this.queryForm);
        },
        error: (err) => {
          console.error('ASS16090 void error:', err);
          this.loading = false;
        },
      });
  }

  override onDetail(row: Ass16090Row, queryConditions?: any): void {
    this.saveQueryState();
    super.onDetail(row, queryConditions);
  }

  get canShowEdit(): boolean {
    /** 內建 edit 拿掉，改用自訂 actionButtons 的編輯按鈕 */
    return false;
  }
}