/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

import {
  ApiResponse,
  DropDownListResponse,
  OptionItem,
  QueryTLS25030Request,
  QueryTLS25030Row,
  TLS25030Service,
} from '../../../service/api/tls/tls25030.service';

type SortItem = { field: string; order: number };

@UntilDestroy()
@Component({
  selector: 'app-tls25030',
  templateUrl: './tls25030.component.html',
  styleUrls: ['./tls25030.component.scss'],
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

    TableReportComponent,
  ],
})
export class TLS25030Component extends BasicQueryPageComponent<any> {
  data: QueryTLS25030Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryTLS25030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'UPD_Date', order: -1 }];

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
    { field: 'payment_status_Name', header: '狀態' },
    { field: 'violation_otherdesc', header: '備註' },
  ];

  /** ✅ 下拉 options */
  violationTypeOptions: OptionItem[] = [];
  capItemOptions: OptionItem[] = [];
  orgOptions: OptionItem[] = [];
  floorOptions: OptionItem[] = [];
  payTypeOptions: OptionItem[] = [];

  private mapDropDownToOptions(resp: DropDownListResponse | null | undefined): OptionItem[] {
    const rows = Array.isArray(resp?.Data) ? resp!.Data! : [];
    return rows
      .filter((x) => x && x.No != null && x.Name != null)
      .map((x) => {
        const no = String(x.No).trim();
        const name = String(x.Name).trim();
        return { value: no, label: `${no}-${name}` };
      });
  }

  queryForm = this.formBuilder.group({
    tlt_no: ['' as string],
    tlt_name: ['' as string],
    fine_no: ['' as string],

    // 日期區間（用 Date）
    fine_date_s: [null as Date | null],
    fine_date_e: [null as Date | null],
    deduct_date_s: [null as Date | null],
    deduct_date_e: [null as Date | null],

    // 金額
    amount_s: [null as number | null],
    amount_e: [null as number | null],

    // 下拉/多選
    violation_type: ['' as string],
    cap_item: ['' as string],
    org_id: ['' as string],
    fine_status: ['' as string],

    floors: [[] as string[]], // ✅ 多選 floors => string[]，送出時 join 成字串

    crt_usr_no: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(private tls25030Service: TLS25030Service, private cdr: ChangeDetectorRef) {
    super();
  }

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

  ngOnInit(): void {
    this.initializePage('TLS25030', '/tls/tls25030cru', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 下拉：共用快取
    this.loading = true;
    this.tls25030Service
      .getDropdownsOnce()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ violationType, capItem, org, floors, payType }) => {
          this.violationTypeOptions = this.mapDropDownToOptions(violationType);
          this.capItemOptions = this.mapDropDownToOptions(capItem);
          this.orgOptions = this.mapDropDownToOptions(org);
          this.floorOptions = this.mapDropDownToOptions(floors);
          this.payTypeOptions = this.mapDropDownToOptions(payType);
        },
        error: (err) => {
          console.error('TLS25030 dropdown load error:', err);
          this.violationTypeOptions = [];
          this.capItemOptions = [];
          this.orgOptions = [];
          this.floorOptions = [];
          this.payTypeOptions = [];
        },
      });
  }

  onSubmit(_frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.tls25030Service
      .queryTLS25030(payload)
      .pipe(untilDestroyed(this))
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
          });

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('TLS25030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
          this.cdr.detectChanges();
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
      floors: [],
      crt_usr_no: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }


}
