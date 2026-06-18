/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

import {
  ApiResponse,
  OptionItem,
  QueryTLS25030Request,
  QueryTLS25030Row,
  TLS25030Service,
  UpdateTLS25030StatusRequest,
} from '../../../service/api/tls/tls25030.service';

import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

interface SortItem { field: string; order: number }

@UntilDestroy()
@Component({
  selector: 'app-tls25030',
  templateUrl: './tls25030.component.html',
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
    DropdownComponent,
    MultiSelectComponent,
    InputTextRangeComponent,

    TableReportComponent,
  ],
})
export class TLS25030Component extends BasicQueryPageComponent<any> implements OnInit {
  @ViewChild('tableReport') tableReport?: TableReportComponent;

  data: QueryTLS25030Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryTLS25030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'UPD_Date', order: -1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  isEditDisabled = (row: QueryTLS25030Row): boolean => {
    return Number(row.fine_status) === 0;
  };

  columns: ReportColumn[] = [
    { field: 'fine_no', header: '單據編號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'fine_date', header: '違規日期', format: (v: string) => this.formatDate(v) },
    { field: 'deduct_date', header: '扣款日期', format: (v: string) => this.formatDate(v) },
    { field: 'Violation_type_Name', header: '違規類別' },
    { field: 'CAP_Name', header: '扣款項目' },
    { field: 'fine_amount', header: '金額' },
    { field: 'Org_Name', header: '開立單位' },
    { field: 'CRT_USR_Name', header: '建立者' },
    { field: 'UPD_Date', header: '維護日', format: (v: string) => this.formatDate(v) },
    { field: 'fine_status_Name', header: '狀態' },
    { field: 'violation_otherdesc', header: '備註' },
  ];



  /** ✅ 下拉 options */
  violationTypeOptions: OptionItem[] = getSYS1000Options('Violation_type') as any;
  capItemOptions: OptionItem[] = [];
  floorOptions: OptionItem[] = [];
  payTypeOptions: OptionItem[] = [
    { value: '1', label: '1-扣款' },
    { value: '2', label: '2-現金' },
    { value: '9', label: '9-其他' },
  ];
  orgOptions = this.dropdown.querySys3100();
  CounterOptions: OptionItem[] = [];

  queryForm = this.formBuilder.group({
    tlt_no: ['' as string],
    tlt_name: ['' as string],
    fine_no: ['' as string],

    fine_date_s: [null as Date | null],
    fine_date_e: [null as Date | null],
    deduct_date_s: [null as Date | null],
    deduct_date_e: [null as Date | null],

    amount_s: [null as number | null],
    amount_e: [null as number | null],

    violation_type: ['' as string],
    cap_item: ['' as string],
    org_id: ['' as string],
    fine_status: ['' as string],
    pay_type: ['' as string],

    floors: [[] as string[]], // 多選 => join CSV
    crt_usr_no: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private tls25030Service: TLS25030Service,
    private cdr: ChangeDetectorRef,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  // =========================
  // ✅ 還原/保存查詢條件（比照 FIN64010）
  // =========================
  private saveQueryState(): void {
    this.queryStateService.setQueryState('TLS25030', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  private restoreQueryStateAndAutoQuery(): void {
    const saved = this.queryStateService.getQueryStateValue('TLS25030');

    // 兼容舊格式：以前可能直接存 formValue（不是物件）
    const formValue = (saved as any)?.formValue ?? (saved && typeof saved === 'object' && !(saved as any)?.formValue ? saved : null);

    if (formValue) {
      this.queryForm.patchValue(formValue, { emitEvent: false });
      this._currentSortBy = (saved as any)?.currentSortBy ?? this.defaultSort;
      this.lastQueryBody = (saved as any)?.lastQueryBody ?? null;

      Promise.resolve().then(() => this.onSubmit(this.queryForm));
    }
  }

  // =========================
  // utils
  // =========================
  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private toIso(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private cleanStr(v: any): string | undefined {
    const s = String(v ?? '').trim();
    return s ? s : undefined;
  }

  private cleanNum(v: any): number | undefined {
    if (v === '' || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private cleanArrayToCsv(arr: any): string | undefined {
    const a = Array.isArray(arr) ? arr : [];
    const cleaned = a.map((x) => String(x ?? '').trim()).filter((x) => !!x);
    return cleaned.length ? cleaned.join(',') : undefined;
  }

  private buildQueryPayload(base: any): QueryTLS25030Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryTLS25030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      tlt_no: this.cleanStr(base?.tlt_no),
      tlt_name: this.cleanStr(base?.tlt_name),
      fine_no: this.cleanStr(base?.fine_no),

      violation_type: this.cleanStr(base?.violation_type),
      cap_item: this.cleanStr(base?.cap_item),
      org_id: this.cleanStr(base?.org_id),
      fine_status: this.cleanStr(base?.fine_status),
      pay_type: this.cleanStr(base?.pay_type),
      crt_usr_no: this.cleanStr(base?.crt_usr_no),

      amount_s: this.cleanNum(base?.amount_s),
      amount_e: this.cleanNum(base?.amount_e),

      fine_date_s: this.toIso(base?.fine_date_s),
      fine_date_e: this.toIso(base?.fine_date_e),
      deduct_date_s: this.toIso(base?.deduct_date_s),
      deduct_date_e: this.toIso(base?.deduct_date_e),

      floors: this.cleanArrayToCsv(base?.floors),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** ✅ 給 table-report 用 */
  public queryTLS25030ForReport = (body: any) =>
    this.tls25030Service.queryTLS25030(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<QueryTLS25030Row[] | QueryTLS25030Row>) => {
        const src = (res as any)?.Data;
        const rows: QueryTLS25030Row[] = Array.isArray(src) ? src : src ? [src] : [];
        const totalCount = Number((res as any)?.TotalCount ?? rows.length) || rows.length;
        rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));
        return { Data: rows, TotalCount: totalCount, GrandTotal: null };
      })
    );
  private resetToDefault(): void {
    this.queryForm.reset(
      {
        tlt_no: '',
        tlt_name: '',
        fine_no: '',

        fine_date_s: null,
        fine_date_e: null,
        deduct_date_s: null,
        deduct_date_e: null,

        amount_s: null,
        amount_e: null,

        violation_type: '',
        cap_item: '',
        org_id: '',
        fine_status: '',
        pay_type: '',
        floors: [],
        crt_usr_no: '',

        // ✅ 這三個要給「值」不是給 control config
        pageIndex: 1,
        pageSize: 30,
        SortBy: this.defaultSort as any, // 或下面那個 cast 寫法
      },
      { emitEvent: false }
    );

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;

    this.tableVer++;
  }


  ngOnInit(): void {
    this.initializePage('TLS25030', '/tls/tls25030cru', this.queryForm, (form) => this.onSubmit(form));

    const fromCru = !!history.state?.fromCru;

    // ✅ 先載入下拉 options，再決定是否 restore
    this.loading = true;

    const floors$ = this.dropdown.querySys3900().pipe(
      map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))),
      take(1),
      catchError((err) => {
        console.error('getFloors error:', err);
        return of([] as OptionItem[]);
      })
    );

    const counters$ = this.dropdown.queryTltTalent().pipe(
      take(1),
      catchError((err) => {
        console.error('getCounters error:', err);
        return of([] as any[]);
      })
    );

    const capItems$ = this.dropdown.queryAps1003({ cap_typeList: ['Z'] }).pipe(
      take(1),
      catchError((err) => {
        console.error('APS1003 dropdown load error:', err);
        return of([] as any[]);
      })
    );

    forkJoin([floors$, counters$, capItems$])
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe(([floors, counters, capList]) => {
        this.floorOptions = floors || [];

        this.CounterOptions = (counters || []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.label}`,
          value: x.value,
        }));

        this.capItemOptions = (capList || []).map((x: any) => ({
          value: String(x.value),
          label: x.label,
        }));

        // ✅ 下拉完成後：只有從 CRU 回來才 restore + auto query
        if (fromCru) {
          this.restoreQueryStateAndAutoQuery();
        } else {
          // ✅ 其他頁回來：回預設 + 清掉保存狀態（避免下次誤還原）
          this.resetToDefault();
          try {
            this.queryStateService.clearQueryState('TLS25030');
          } catch { }
        }
      });
  }


  onSubmit(_frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();

    // ✅ 送出時：固定查第一頁，排序用目前記住的
    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: 1,
      SortBy: this._currentSortBy?.length ? this._currentSortBy : this.defaultSort,
    });

    this.btnLoading = true;
    this.loading = true;

    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.tls25030Service
      .queryTLS25030(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.btnLoading = false;
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (response: ApiResponse<QueryTLS25030Row[]>) => {
          const rows: QueryTLS25030Row[] = Array.isArray(response?.Data) ? response.Data : [];
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;

          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;

            this.lastQueryBody = { ...payload };
            this._currentSortBy = payload.SortBy ?? this.defaultSort;

            // ✅ 保存查詢條件（比照 FIN64010）
            this.saveQueryState();
          });
        },
        error: (err: any) => {
          console.error('TLS25030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
        },
      });
  }

  /** ✅ lazyload（分頁/排序） */
  override onLazyLoadData(e: any) {
    const raw = this.queryForm.getRawValue();

    const sortBy = this.normalizeSort(e?.SortBy, this._currentSortBy?.length ? this._currentSortBy : this.defaultSort);

    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: e?.pageIndex,
      pageSize: e?.pageSize,
      SortBy: sortBy,
    });

    this.loading = true;

    this.tls25030Service
      .queryTLS25030(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (response: ApiResponse<QueryTLS25030Row[]>) => {
          const rows: QueryTLS25030Row[] = Array.isArray(response?.Data) ? response.Data : [];
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;

          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          // ✅ 保存查詢條件（比照 FIN64010）
          this.saveQueryState();
        },
        error: (err: any) => {
          console.error('TLS25030 lazy query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
        },
      });
  }

  /** ✅ 點編輯/明細：先存查詢條件（回來可還原） */
  override onEdit(row: QueryTLS25030Row) {
    const id = String((row as any)?.fine_no ?? '').trim();
    if (!id) return;

    this.saveQueryState();

    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { fine_no: id }, // ⚠️ 若你 CRU 用別的 key（如 Id / FineNo）這裡改一下
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: row,
        fromRoute: this.router.url,
      },
    });
  }

  override onDetail(row: QueryTLS25030Row) {
    const id = String((row as any)?.fine_no ?? '').trim();
    if (!id) return;

    this.saveQueryState();

    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { fine_no: id },
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: row,
        fromRoute: this.router.url,
      },
    });
  }

  onClear(frm: any) {
    frm.reset({
      tlt_no: '',
      tlt_name: '',
      fine_no: '',

      fine_date_s: null,
      fine_date_e: null,
      deduct_date_s: null,
      deduct_date_e: null,

      amount_s: null,
      amount_e: null,

      violation_type: '',
      cap_item: '',
      org_id: '',
      fine_status: '',
      pay_type: '',
      floors: [],
      crt_usr_no: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;

    // ✅ 清掉保存的狀態（可選；如果你希望清除後回來也清空，就保留）
    this.saveQueryState();
  }


  // =========================
  // ✅ 作廢按鈕（含 confirm）
  // =========================

  // ⚠️ 請改成你們系統「作廢」實際的權限碼（跟 TableReport 的 '10'/'30' 同格式）
  private readonly INVALIDATE_PERMISSION = '40'; // <== 例：請自行改成正確代碼

  private canInvalidate(): boolean {
    return this.hasPermission(this.INVALIDATE_PERMISSION);
  }

  private isVoided(row: QueryTLS25030Row): boolean {
    const s: any = (row as any)?.fine_status;
    // fine_status 可能是 '0' / 0
    return String(s ?? '').trim() === '0';
  }

  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-ban', // ✅ 不用垃圾桶，改禁止符號

      action: (rowData: QueryTLS25030Row, _event?: any) => {
        const fineNo = String((rowData as any)?.fine_no ?? '').trim();
        if (!fineNo) return;

        // 已作廢不允許再作廢
        if (this.isVoided(rowData)) return;

        // 權限不足
        if (!this.canInvalidate()) {
          this.messageService.warnBubble('您沒有作廢權限');
          return;
        }

        this.messageService.confirm({
          header: '作廢確認',
          message: `確定要作廢單據【${fineNo}】嗎？`,
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: '確定',
          rejectLabel: '取消',
          accept: () => {
            const req: UpdateTLS25030StatusRequest = {
              fine_status: '0',
              fine_noList: [fineNo],
            };
            this.statusChange(req);
          },
        });
      },

      disabled: (rowData: QueryTLS25030Row) => {
        // ✅ 已作廢 or 沒權限 => disable
        return this.isVoided(rowData) || !this.canInvalidate();
      },
    },
  ];

  // =========================
  // ✅ 作廢 API 呼叫 + 作廢後刷新列表（維持原查詢條件）
  // =========================
  private statusChange(req: UpdateTLS25030StatusRequest): void {
    if (!req?.fine_noList?.length) return;

    this.btnLoading = true;
    this.loading = true;

    this.tls25030Service
      .updateTLS25030Status(req)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.btnLoading = false;
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.messageService.successBubble(res?.Message ?? '作廢成功');

          // ✅ 作廢後刷新：維持原條件/頁碼/排序
          const payload = this.buildQueryPayload({
            ...(this.lastQueryBody || this.queryForm.getRawValue()),
            SortBy: this._currentSortBy?.length ? this._currentSortBy : this.defaultSort,
          });

          this.tls25030Service
            .queryTLS25030(payload)
            .pipe(
              untilDestroyed(this),
              finalize(() => this.cdr.detectChanges())
            )
            .subscribe({
              next: (response: ApiResponse<QueryTLS25030Row[]>) => {
                const rows: QueryTLS25030Row[] = Array.isArray(response?.Data) ? response.Data : [];

                rows.forEach((r, idx) => {
                  (r as any)._rowKey = idx + 1;
                });

                this.data = rows;

                const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;
                this.totalRecords = realTotal;
                this.viewTotalRecords = realTotal;

                this.lastQueryBody = { ...payload };
                this._currentSortBy = payload.SortBy ?? this.defaultSort;

                this.saveQueryState();
                this.tableVer++;
              },
              error: (err) => {
                console.error('TLS25030 refresh after invalidate error:', err);
              },
            });
        },
        error: (err: any) => {
          console.error('updateTLS25030Status error:', err);
          this.messageService.errorBubble('作廢失敗，請稍後再試');
        },
      });
  }


}
