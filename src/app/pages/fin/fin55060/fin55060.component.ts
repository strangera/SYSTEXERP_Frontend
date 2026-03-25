/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

import {
  ExportFIN55060Payload,
  FIN55060Service,
  QueryFIN55060Payload,
} from 'src/app/service/api/fin/fin55060.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService } from 'src/app/service/utility/dropDownList.service';

interface ApiGroup {
  AccNo4: string;
  AccNo4Name: string;
  _Details: ApiDetail[];
}

interface ApiDetail {
  AccNo: string;
  AccCName: string;
  DetailNo: string | null;
  ORG_ID: string | null;
  Org_Name: string | null;
  ProjectNo: string | null;
  Debit_Amt: number | null;
  Credit_Amt: number | null;
  Balance: number | null;
}

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
    DropdownComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TranslateModule,
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
    OrgId: [null],
    PTAFrom: [null],
    PTATo: [null],
    AccNoFrom: [null, [Validators.required]],
    AccNoTo: [null, [Validators.required]],
    VendorFrom: [null],
    VendorTo: [null],
    ...createPaginationConfig([]), // pageIndex/pageSize/SortBy
  });

  data: TableRow[] = [];
  totalRecords = 0;
  PDFBtnLoading = false;
  XLSXBtnLoading = false;
  lastQueryBody: QueryFIN55060Payload | null = null;

  columns: Column[] = [
    { field: 'AccNo4', header: '科目', visible: true },
    { field: 'AccNo4Name', header: '科目名稱', visible: true },
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'DetailNo', header: '廠商編號/名稱', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動代號', visible: true },
    { field: 'Debit_Amt', header: '借方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'Credit_Amt', header: '貸方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'Balance', header: '餘額', visible: true, format: formatAmount, style: 'text-right' },
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
    const to = this.toDateOnly(raw?.TXN_EDATE);
    if (!from || !to) return null;

    const body: QueryFIN55060Payload = {
      AccNoFrom: raw?.AccNoFrom || '',
      AccNoTo: raw?.AccNoTo || '',
      DateFrom: from,
      DateTo: to,
      OrgId: raw?.OrgId || '',
      Notes: '',
      VendorFrom: raw?.VendorFrom || '',
      VendorTo: raw?.VendorTo || '',
      PTAFrom: raw?.PTAFrom || '',
      PTATo: raw?.PTATo || '',
      VouType: '',
      VouStatus: '',
      TargetNo: '',
    };

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

  override onLazyLoadData(event: any, form: FormGroup) {
    if (!event) return;
    form.patchValue({
      pageSize: event?.pageSize ?? event?.rows ?? form.value.pageSize,
      pageIndex: event?.pageIndex ?? (event?.first != null
        ? Math.floor((event.first) / (event.rows ?? event.pageSize ?? form.value.pageSize ?? 30)) + 1
        : form.value.pageIndex),
      SortBy: event?.SortBy ?? (Array.isArray(event?.multiSortMeta) && event.multiSortMeta.length
        ? event.multiSortMeta.map((s: any) => ({ field: s.field, order: s.order }))
        : (event?.sortField ? [{ field: event.sortField, order: event.sortOrder }] : [])),
    }, { emitEvent: false });
  }

  // ========= 匯出（不含分頁/排序） =========
  private buildExportBody(): ExportFIN55060Payload | null {
    const rawForm = this.queryForm.getRawValue();
    const from = this.toDateOnly((this.lastQueryBody as any)?.DateFrom ?? rawForm?.TXN_BDATE);
    const to = this.toDateOnly((this.lastQueryBody as any)?.DateTo ?? rawForm?.TXN_EDATE);
    if (!from || !to) return null;

    const payload: ExportFIN55060Payload = {
      AccNoFrom: rawForm?.AccNoFrom || '',
      AccNoTo: rawForm?.AccNoTo || '',
      DateFrom: from,
      DateTo: to,
      OrgId: rawForm?.OrgId || '',
      Notes: '',
      VendorFrom: rawForm?.VendorFrom || '',
      VendorTo: rawForm?.VendorTo || '',
      PTAFrom: rawForm?.PTAFrom || '',
      PTATo: rawForm?.PTATo || '',
      VouType: '',
      VouStatus: '',
      TargetNo: '',
    };
    return payload;
  }

  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.PDFBtnLoading = true;

    this.fin55060Service
      .exportFIN55060PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳_科目'),
        error: (e) => console.error('Export PDF failed', e),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return;
    const payload = this.buildExportBody();
    if (!payload) return;
    this.XLSXBtnLoading = true;

    this.fin55060Service
      .exportFIN55060Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.XLSXBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳_科目'),
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

  override onDetail(row: TableRow) {
    if (!row?.AccNo4) return;
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
        //前端規格新增 (下拉選擇, 只顯示統制科目或取會計科目長度為4碼的資料)
        this.AccNoListOptions = response?.Data?.filter((item: any) => item.No?.length === 4)
          .map((item: any) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          })) ?? [];
      });

    // 廠商編號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.DetailNoListOptions = response?.Data?.map((item: any) => ({
          label: `${item.VEN_No} - ${item.Name}`,
          value: item.VEN_No,
        })) ?? [];
      });
  }

  getAccNoLabel(accNo: string): string {
    const found = this.AccNoListOptions.find(option => option.value === accNo);
    return found ? found.label : '';
  }
}
