/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../shared/componentkit/table/table.model';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';

// ✅ 你的 app-table
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, RowEditSaveEvent } from '../../../shared/componentkit/table/table.model';

// Service & 型別
import {
  ApiResponse,
  Cpm11030Request,
  Cpm11030Row,
  Cpm11030Service,
} from '../../../service/api/cpm/cpm11030.service';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { Dropdown } from 'primeng/dropdown';

type SortItem = { field: string; order: number };

type DailyRow = {
  _rowKey: string;        // app-table dataKey
  equipmentCode: string;  // 設備代號
  equipmentName: string;  // 設備名稱
  lendableQty: number;    // 可借出量
};

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
    InputTextComponent,
    MultiSelectComponent,
    DropdownComponent,
    TableReportComponent,
    DialogComponent,
    CalendarModule,
    CalendarComponent,
   

    // ✅ app-table
    TableComponent,
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
    { field: 'Loan_No', header: '紀錄編號' },
    {
      field: 'Loan_Date',
      header: '出借日期',
      format: (v: string) => this.formatDate(v),
    },
    {
      field: 'Loan_Date',
      header: '出借時間',
      format: (v: string) => this.formatTime(v),
    },
     { field: 'Service_Id', header: '服務台位置' },
    { field: 'USER_NAME', header: '姓名' },
    { field: 'Loan_phone', header: '連絡電話' },
    { field: 'Loan_USR_Name', header: '出借處理人員' },
    { field: 'CertTypeName', header: '證件類型' },
    { field: 'Cert_No', header: '證件編號' },
    { field: 'Device_Name', header: '設備名稱' },
  ];

  readonly defaultSort: SortItem[] = [{ field: 'Loan_Date', order: -1 }];

  /* ----------------- 下拉選項 ----------------- */
  paperTypeOptions = getSYS1000Options('Cert_Type');

  // ✅ Dialog 圖上的設備（代號/名稱）
  equipmentOptions: { code: string; name: string }[] = [
    { code: '01', name: '嬰兒車' },
    { code: '02', name: '愛心輪椅' },
  ];

  equipmentNameOptions: { value: string; label: string }[] = [
    { value: '01', label: '奇哥Joie輕便娃娃車' },
    { value: '02', label: '愛心輪椅' },
  ];

  counterCodeOptions: { value: string; label: string }[] = [
    { value: '11A001', label: '11A001/服務諮詢台' },
    { value: '12A001', label: '12A001/VIP室' },
    { value: '12D001', label: '12D001/總機' },
    { value: '15A001', label: '15A001/顧客服務中心' },
  ];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    recordCode: [null as string | null, [Validators.maxLength(14)]],
    borrowDateFrom: [null as Date | null],
    borrowDateTo: [null as Date | null],
    name: ['', [Validators.maxLength(20)]],
    staffName: ['', [Validators.maxLength(10)]],
    phone: ['', [Validators.maxLength(20)]],
    paperType: [[] as string[]],
    paperCode: ['', [Validators.maxLength(20)]],
    equipmentName: [[] as string[]],
    deviceCode: ['', [Validators.maxLength(10)]],
    counterCode: [null as string | null],
    ...createPaginationConfig([{ field: 'Loan_Date', order: -1 }]),
  });

  /* ============================================================
   * Dialog：每日設備可出借量維護（app-table）
   * ============================================================ */
  dailyDialogVisible = false;
  dailyLoading = false;
  dailySaving = false;
  dailySubmitted = false;

  dailyTableVer = 0;

  dailyForm = this.formBuilder.group({
    counterCode: ['' as string, [Validators.maxLength(20)]],
    bizDate: [null as Date | null, [Validators.required]],
  });

  dailyRows: DailyRow[] = [];

  // ✅ app-table 欄位配置（依你圖）
  dailyColumns: Column[] = [
    {
      field: 'equipmentCode',
      header: '設備代號',
      visible: true,
      // 如果你們 Column 有 align/width，可加；沒有也沒關係
      // width: '140px',
      // align: 'center',
      readonly: true, // 若你們 model 支援
    } as any,
    {
      field: 'equipmentName',
      header: '設備名稱',
      visible: true,
      readonly: true,
    } as any,
    {
      field: 'lendableQty',
      header: '可借出量',
      visible: true,
      type: 'inputNumber',     // ✅ 這個名稱依你們 table template 可能不同
      // 若你們用 inputText 也行：type: 'inputText'
      // validators: [{ type: 'min', value: 0 }], // 若你們 model 支援欄位驗證
    } as any,
  ];

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

  private formatTime(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  }

  private toYMDOrUndef(d: Date | string | null | undefined): string | undefined {
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
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildPayload(base: any): Cpm11030Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 30;

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
      PaperTypeList: (base?.paperType as (string | number)[])?.map((x) => String(x)) || undefined,
      PaperCode: base?.paperCode || undefined,
      EquipmentNameList:
        (base?.equipmentName as (string | number)[])?.map((x) => String(x)) || undefined,
      DeviceCode: base?.deviceCode || undefined,
      CounterCode: base?.counterCode || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  public queryCPM11030ForReport = (body: any) =>
    this.cpm11030Service.queryCPM11030(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Cpm11030Row[] | Cpm11030Row>) => {
        const src = res?.Data as any;
        const rows: Cpm11030Row[] = Array.isArray(src) ? src : src ? [src] : [];

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

  ngOnInit(): void {
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

  onSubmit(frm: any) {
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
          const rows: Cpm11030Row[] = Array.isArray(response?.Data) ? response.Data : [];
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

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
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

  onClear(frm: any) {
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

  /* ----------------- Dialog 行為 ----------------- */
  openDailyDialog() {
    this.dailyDialogVisible = true;

    const today = new Date();
    this.dailyForm.patchValue({ bizDate: today });

    this.onDailyQuery();
  }

  onDailyDialogVisibleChange(visible: boolean) {
    this.dailyDialogVisible = visible;

    if (!visible) {
      this.dailySubmitted = false;
      this.dailyLoading = false;
      this.dailySaving = false;
      this.dailyRows = [];
    }
  }

  onDailyQuery() {
    this.dailySubmitted = true;

    if (this.dailyForm.invalid) {
      this.dailyForm.markAllAsTouched();
      return;
    }

    const raw = this.dailyForm.getRawValue();
    const bizDate = this.toYMDOrUndef(raw.bizDate) ?? '';
    const counterCode = (raw.counterCode ?? '').trim();

    this.dailyLoading = true;

    // ✅ 先用 mock，之後接 API 用 counterCode + bizDate 查回 lendableQty
    const rows: DailyRow[] = this.equipmentOptions.map((x) => ({
      _rowKey: `${bizDate}_${counterCode}_${x.code}`,
      equipmentCode: x.code,
      equipmentName: x.name,
      lendableQty: 0,
    }));

    setTimeout(() => {
      this.dailyRows = rows;
      this.dailyTableVer++; // 強制 tableKey 變化 -> 讓 app-table 狀態刷新
      this.dailyLoading = false;
      this.cdr.detectChanges();
    }, 150);
  }

  /** app-table rowEditSave 事件：你要做即時驗證或標記 Modified 可以在這裡 */
  onDailyRowEditSave(e: RowEditSaveEvent) {
    // e.newData / e.oldData / e.ri / e.data
    // 這裡先不做事情，確認按「確定」才整批 save
    // console.log('rowEditSave', e);
  }

  onDailySave() {
    this.dailySubmitted = true;

    if (this.dailyForm.invalid) {
      this.dailyForm.markAllAsTouched();
      return;
    }

    const raw = this.dailyForm.getRawValue();
    const payload = {
      counterCode: (raw.counterCode ?? '').trim(),
      bizDate: this.toYMDOrUndef(raw.bizDate),
      items: this.dailyRows.map((r) => ({
        equipmentCode: r.equipmentCode,
        lendableQty: Number.isFinite(r.lendableQty) ? r.lendableQty : 0,
      })),
    };

    this.dailySaving = true;

    // ✅ 之後改打 API
    console.log('save daily payload:', payload);

    setTimeout(() => {
      this.dailySaving = false;
      this.dailyDialogVisible = false;
      this.cdr.detectChanges();
    }, 250);
  }
}
