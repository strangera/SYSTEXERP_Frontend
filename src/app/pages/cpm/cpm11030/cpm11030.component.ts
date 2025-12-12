/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

// Service & 型別
import {
  Cpm11030Service,
  Cpm11030Row,
  Cpm11030Request,
  ApiResponse,
} from '../../../service/api/cpm/cpm11030.service';

// 如果要吃 SYS1000 的證件類型，可以用這個 helper（你已經有這支）
import { getSYS1000Options } from '@service/system/sys1000.service';

type SortItem = { field: string; order: number };

@UntilDestroy()
@Component({
  selector: 'app-cpm11030',
  templateUrl: './cpm11030.component.html',
  styleUrls: ['./cpm11030.component.scss'],
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
    InputNumberComponent,
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    TableReportComponent,
  ],
})
export class CPM11030Component extends BasicQueryPageComponent<any> {
  /* ----------------- 主表狀態 ----------------- */
  data: Cpm11030Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Cpm11030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  /* ----------------- 欄位定義（列表） ----------------- */
  columns: ReportColumn[] = [
    { field: 'Loan_No', header: '出借編號' },
    {
      field: 'Loan_Date',
      header: '出借日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'Service_Id', header: '服務台位置' },
    { field: 'USER_NAME', header: '借用人姓名' },
    { field: 'Loan_phone', header: '電話' },
    { field: 'Loan_USR_Name', header: '出借處理人員' },
    { field: 'CertTypeName', header: '證件類型' },
    { field: 'Cert_No', header: '證件編號' },
    { field: 'Device_Name', header: '設備名稱' },
  ];

  /* ----------------- 預設排序 ----------------- */
  readonly defaultSort: SortItem[] = [{ field: 'Loan_Date', order: -1 }];

  /* ----------------- 下拉選項 ----------------- */

  // 證件類型：用 SYS1000（Cert_Type），如果 localStorage 沒載好就會是空陣列，之後你可以在 App 啟動時先 load
  paperTypeOptions = getSYS1000Options('Cert_Type');

  // 設備名稱：目前先寫死，之後可以改成從 CSS2001 來
  equipmentNameOptions: { value: string; label: string }[] = [
    { value: '01', label: '奇哥Joie輕便娃娃車' },
    { value: '02', label: '愛心輪椅' },
  ];

  // 服務台位置：目前寫死，之後可改打 API 取 CSS1001
  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 記錄編號（出借編號）
    recordCode: [null as string | null, [Validators.maxLength(14)]],

    // 出借日期區間
    borrowDateFrom: [null as Date | null],
    borrowDateTo: [null as Date | null],

    // 借用人姓名
    name: ['', [Validators.maxLength(20)]],

    // 出借處理人員
    staffName: ['', [Validators.maxLength(10)]],

    // 連絡電話
    phone: ['', [Validators.maxLength(20)]],

    // 證件類型（多選，SYS1000 Cert_Type）
    paperType: [[] as string[]],

    // 證件編號
    paperCode: ['', [Validators.maxLength(20)]],

    // 設備名稱（多選）
    equipmentName: [[] as string[]],

    // 設備編號
    deviceCode: ['', [Validators.maxLength(10)]],

    // 服務台位置編號
    counterCode: [null as string | null],

    // 分頁 / 排序
    ...createPaginationConfig([{ field: 'Loan_Date', order: -1 }]),
  });

  constructor(
    
    private cpm11030Service: Cpm11030Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /* ----------------- 工具函式 ----------------- */

  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  private toYMDOrUndef(
    d: Date | string | null | undefined
  ): string | undefined {
    if (d == null) return undefined;
    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;
    return !s ? undefined : s;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && typeof x.order === 'number'
      )
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  /** 將畫面上的值整理成後端需要的 Cpm11030Request */
  private buildPayload(base: any): Cpm11030Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const orderBy =
      sort && sort.length
        ? sort
            .map((s) => `${s.field} ${s.order === -1 ? 'DESC' : 'ASC'}`)
            .join(', ')
        : null;

    const payload: Cpm11030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,
      OrderBy: orderBy,
      Offset: (pageIndex - 1) * pageSize,

      RecordCode: base?.recordCode || undefined,
      BorrowDateFrom: this.toYMDOrUndef(base?.borrowDateFrom),
      BorrowDateTo: this.toYMDOrUndef(base?.borrowDateTo),
      Name: base?.name || undefined,
      StaffName: base?.staffName || undefined,
      Phone: base?.phone || undefined,
      PaperTypeList:
        (base?.paperType as (string | number)[])?.map((x) => String(x)) ||
        undefined,
      PaperCode: base?.paperCode || undefined,
      EquipmentNameList:
        (base?.equipmentName as (string | number)[])?.map((x) =>
          String(x)
        ) || undefined,
      DeviceCode: base?.deviceCode || undefined,
      CounterCode: base?.counterCode || undefined,
    };

    // 把 '' / null / undefined 的欄位砍掉，避免送空字串
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /* ----------------- 給 <app-table-report> 用的查詢函式 ----------------- */
  public queryCPM11030ForReport = (body: any) =>
    this.cpm11030Service
      .queryCPM11030(this.buildPayload(body || {}))
      .pipe(
        map((res: ApiResponse<Cpm11030Row[] | Cpm11030Row>) => {
          const src = res?.Data as any;
          const rows: Cpm11030Row[] = Array.isArray(src)
            ? src
            : src
            ? [src]
            : [];

          const totalCount =
            Number((res as any)?.TotalCount ?? rows.length) || rows.length;

          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          return {
            Data: rows,
            TotalCount: totalCount,
            GrandTotal: null,
          };
        })
      );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    // 預設：出借日期 = 今天
    const today = new Date();
    this.queryForm.patchValue({
      borrowDateFrom: today,
      borrowDateTo: today,
    });

    this.initializePage(
      'CPM11030',
      '/cpm/cpm11030cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  /* ----------------- Submit（主表查詢） ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.cpm11030Service
      .queryCPM11030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Cpm11030Row[]>) => {
          const rows: Cpm11030Row[] = Array.isArray(response?.Data)
            ? response.Data
            : [];

          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          this.viewTotalRecords = this.data.length;
          this.cdr.detectChanges();

          const realTotal =
            Number(response?.TotalCount ?? rows.length) || rows.length;
          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );
          this.loading = false;
        },
        error: (err: any) => {
          console.error('CPM11030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  /* ----------------- 清除 ----------------- */
  onClear(frm: FormGroup) {
    const today = new Date();
    frm.reset({
      recordCode: null,
      borrowDateFrom: today,
      borrowDateTo: today,
      name: '',
      staffName: '',
      phone: '',
      paperType: [],
      paperCode: '',
      equipmentName: [],
      deviceCode: '',
      counterCode: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

 
}
