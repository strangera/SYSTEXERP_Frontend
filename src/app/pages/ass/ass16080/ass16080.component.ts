/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
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

import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../others/component/table/table.model';

import {
  ApiResponse,
  ASS16080Service,
  QueryASS16080Response,
  QueryDetailASS16080Result,
} from '../../../service/api/ass/ass16080.service';

interface SortItem {
  field: string;
  order: number;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16080',
  templateUrl: './ass16080.component.html',
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
export class ASS16080Component extends BasicQueryPageComponent<QueryASS16080Response> implements OnInit {
  showTable = true;
  data: QueryASS16080Response[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryASS16080Response[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);
  empIdOptions: { value: string; label: string }[] = [];
  goodsIdOptions: { value: string; label: string }[] = [];
  orgIdOptions: { value: string; label: string }[] = [];
  statusOptions: { value: string; label: string }[] = [];
  private _currentSortBy: SortItem[] = [];

  readonly defaultSort: SortItem[] = [
    { field: 'APPLY_DATE', order: -1 },
    { field: 'WHMOVE_ID', order: -1 },
  ];

  columns: ReportColumn[] = [
    { field: 'WHMOVE_ID', header: '調撥單號' },
    { field: 'EMP_ID', header: '申請人代號' },
    { field: 'ORG_ID', header: '部門代號' },
    {
      field: 'APPLY_DATE',
      header: '申請日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'OUT_WH_ID', header: '調出倉別代碼' },
    { field: 'OutWhName', header: '調出倉別名稱' },
    {
      field: 'OUTGODS_DATE',
      header: '發出日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'IN_WH_ID', header: '調入倉別代碼' },
    { field: 'InWhName', header: '調入倉別名稱' },
    {
      field: 'SUBCHK_DATE',
      header: '調入日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'WHMOVE_STATUS', header: '調撥狀態' },
    { field: 'APRV_EMP_ID', header: '審核人代號' },
    {
      field: 'APRV_DATE',
      header: '審核日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'DetailCount', header: '明細筆數', align: 'right' },
  ];

  expansionColumns: ReportColumn[] = [
    // { field: 'RowNo', header: '序號' },
    { field: 'GOODS_ID', header: '品項編號' },
    { field: 'GOODS_NAME', header: '品項名稱' },
    { field: 'UNIT', header: '單位名稱' },
    { field: 'QTY', header: '調撥數量', align: 'right' },
    { field: 'OUTGODS_QTY', header: '實際出庫數量', align: 'right' },
    { field: 'NOTES', header: '備註' },
  ];

  /** 管理欄位自訂按鈕 */
  actionButtons = [
    {
      icon: 'pi pi-truck',
      label: '調撥出庫',
      action: (row: QueryASS16080Response) => this.onClickOut(row),
      disabled: (row: QueryASS16080Response) =>
        String(row?.WHMOVE_STATUS ?? '') !== '2',
    },
    {
      icon: 'pi pi-download',
      label: '調撥入庫',
      action: (row: QueryASS16080Response) => this.onClickIn(row),
      disabled: (row: QueryASS16080Response) =>
        String(row?.WHMOVE_STATUS ?? '') !== '3',
    },
  ];

  queryForm = this.formBuilder.group({
    OUT_WH_ID: [null as string | null],
    IN_WH_ID: [null as string | null],
    WHMOVE_STATUS: [null as string | null],
    WHMOVE_ID: [null as string | null],
    EMP_ID: [null as string | null],
    GOODS_ID: [null as string | null],
    ORG_ID: [null as string | null],
    APPLY_DATE_S: [null as Date | null],
    APPLY_DATE_E: [null as Date | null],
    APRV_DATE_S: [null as Date | null],
    APRV_DATE_E: [null as Date | null],
    APRV_EMP_ID: [null as string | null],
    ...createPaginationConfig([
      { field: 'APPLY_DATE', order: -1 },
      { field: 'WHMOVE_ID', order: -1 },
    ]),
  });

  constructor(
    private readonly ass16080Service: ASS16080Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly fin11040Service: Fin11040Service,
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage(
      'ASS16080',
      'ass/ass16080cru',
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
          this.tableVer++;
        }
      });

    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
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

    this.fin11040Service
      .queryFIN11040({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') return;
          const data: TDS1008Data[] = res.Data ?? [];
          this.goodsIdOptions = data
            .filter((item) => item.INV_ItemNo != null && item.INV_ItemNo !== '')
            .map((item) => ({
              label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
              value: item.INV_ItemNo,
            }));
        },
      });

    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));


    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'AM_WHMOVE_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.statusOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
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
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));

    return cleaned.length ? cleaned : fallback;
  }

  private initRows(rows: QueryASS16080Response[]): QueryASS16080Response[] {
    for (const [idx, r] of rows.entries()) {
      const moveId = r.WHMOVE_ID ?? `fallback_${idx}`;

      (r as any)._rowKey = `ass16080_${moveId}`;
      (r as any)._detailLoaded = false;
      r.Details = [];
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
      OUT_WH_ID: raw.OUT_WH_ID || null,
      IN_WH_ID: raw.IN_WH_ID || null,
      WHMOVE_STATUS: raw.WHMOVE_STATUS || null,
      WHMOVE_ID: raw.WHMOVE_ID || null,
      EMP_ID: raw.EMP_ID || null,
      GOODS_ID: raw.GOODS_ID || null,
      ORG_ID: raw.ORG_ID || null,
      APPLY_DATE_S: this.toYMDOrNull(raw.APPLY_DATE_S),
      APPLY_DATE_E: this.toYMDOrNull(raw.APPLY_DATE_E),
      APRV_DATE_S: this.toYMDOrNull(raw.APRV_DATE_S),
      APRV_DATE_E: this.toYMDOrNull(raw.APRV_DATE_E),
      APRV_EMP_ID: raw.APRV_EMP_ID || null,
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
    row: QueryASS16080Response
  ): Observable<{ Data: any[]; TotalCount: number }> => {
    const whmoveId = row?.WHMOVE_ID;

    if (!whmoveId) {
      row.Details = [];
      return of({ Data: [], TotalCount: 0 });
    }

    if ((row as any)._detailLoaded) {
      return of({
        Data: Array.isArray(row.Details) ? row.Details : [],
        TotalCount: Array.isArray(row.Details) ? row.Details.length : 0,
      });
    }

    (row as any).expansionLoading = true;

    return this.ass16080Service
      .queryDetailASS16080({ WHMOVE_ID: whmoveId })
      .pipe(
        map((res: ApiResponse<QueryDetailASS16080Result>) => {
          const details = Array.isArray(res?.Data?.Details)
            ? res.Data.Details
            : [];

          row.Details = details;
          (row as any)._detailLoaded = true;
          (row as any).expansionLoading = false;

          this.data = [...this.data];
          this.cdr.detectChanges();

          return {
            Data: details,
            TotalCount: details.length,
          };
        })
      );
  };

  public queryASS16080ForReport = (body: any) =>
    this.ass16080Service.queryASS16080(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<QueryASS16080Response[] | QueryASS16080Response>) => {
        const src = res?.Data as any;
        const rows: QueryASS16080Response[] = Array.isArray(src) ? src : src ? [src] : [];
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

      this.ass16080Service
        .queryASS16080(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res: ApiResponse<QueryASS16080Response[]>) => {
            const rows: QueryASS16080Response[] = Array.isArray(res?.Data) ? res.Data : [];

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
            console.error('ASS16080 query error:', err);
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
        OUT_WH_ID: null,
        IN_WH_ID: null,
        WHMOVE_STATUS: null,
        WHMOVE_ID: null,
        EMP_ID: null,
        GOODS_ID: null,
        ORG_ID: null,
        APPLY_DATE_S: null,
        APPLY_DATE_E: null,
        APRV_DATE_S: null,
        APRV_DATE_E: null,
        APRV_EMP_ID: null,
        ...createPaginationConfig([
          { field: 'APPLY_DATE', order: -1 },
          { field: 'WHMOVE_ID', order: -1 },
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

  onClickOut(row: QueryASS16080Response): void {
    this.saveQueryState();
    this.router.navigate(['account/ass/ass16080cru'], {
      state: {
        rowdata: row,
        crudstatus: CRUDStatus.Edit,
        mode: 'out',
      },
    });
  }

  onClickIn(row: QueryASS16080Response): void {
    this.saveQueryState();
    this.router.navigate(['account/ass/ass16080cru'], {
      state: {
        rowdata: row,
        crudstatus: CRUDStatus.Edit,
        mode: 'in',
      },
    });
  }

  override onDetail(row: QueryASS16080Response, queryConditions?: any): void {
    this.saveQueryState();
    super.onDetail(row, queryConditions);
  }

  override onEdit(row: QueryASS16080Response, queryConditions?: any): void {
    this.saveQueryState();
    super.onEdit(row, queryConditions);
  }

  get canShowEdit(): boolean {
    return this.hasPermission(this.Actions.Edit);
  }
}
