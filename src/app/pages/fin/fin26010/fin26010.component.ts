/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
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
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

// Service & 型別
import {
  Fin26010Service,
  Fin26010Row,
  Fin26010Request,
  Fin26010GenerateRequest,
  ApiResponse,
} from '../../../service/api/fin/fin26010.service';

type SortItem = { field: string; order: number };

@UntilDestroy()
@Component({
  selector: 'app-fin26010',
  templateUrl: './fin26010.component.html',
  styleUrls: ['./fin26010.component.scss'],
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
    DropdownComponent,
    MultiSelectComponent,
    TableReportComponent,
  ],
})
export class FIN26010Component extends BasicQueryPageComponent<any> {
  /* ----------------- 主表狀態 ----------------- */
  data: Fin26010Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin26010Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  /* ----------------- 匯款檔產生 loading ----------------- */
  btnGenerateFileLoading = false;

  /* ----------------- 欄位定義 (APS3007) ----------------- */
  columns: ReportColumn[] = [
    { field: 'PAM_No', header: '匯款單號' },
    {
      field: 'CRT_Date',
      header: '建立日期',
      format: (v: string) => this.formatDateTime(v),
    },
    {
      field: 'RMT_Date',
      header: '匯款日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'BNK_id', header: '銀行代號' },
    { field: 'BNK_No', header: '匯款銀行代碼' },
    { field: 'BNK_BranchNo', header: '匯款銀行分行代號' },
    { field: 'BNK_AccNo', header: '匯款帳號' },
    { field: 'Status', header: '狀態' },
    { field: 'VouNo', header: '傳票編號' },
    { field: 'File_Name', header: '檔案名稱' },
  ];

  /* ----------------- 預設排序 ----------------- */
  readonly defaultSort: SortItem[] = [{ field: 'PAM_No', order: 1 }];

  /* ----------------- 下拉選項（暫時 mock） ----------------- */
  transferSourceOptions: any[] = [
    { value: 'D20140106001', label: 'D20140106001/2014/0106/Y' },
    { value: 'D20140106002', label: 'D20140106002/2014/0106/Y' },
    { value: 'D20140106003', label: 'D20140106003/2014/0106/Y' },
  ];

  // 拋轉傳票：依實際需求再調整
  whetherOptions: any[] = [
    { value: 'Y', label: '已拋轉' },
    { value: 'N', label: '未拋轉' },
  ];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 匯款單號
    transferSource: [null as string | null],

    // 建立日期(起訖)
    buildDateFrom: [null as Date | null],
    buildDateTo: [null as Date | null],

    // 匯款日期(起訖) ＊必填
    transferDateFrom: [
      null as Date | null,
      [Validators.required],
    ],
    transferDateTo: [
      null as Date | null,
      [Validators.required],
    ],

    // 銀行代號 ＊必填
    bankCode: [
      null as string | null,
      [Validators.required, Validators.maxLength(8)],
    ],

    // 銀行名稱
    bankName: [null as string | null, [Validators.maxLength(40)]],

    // 拋轉傳票 (多選 / 單選依實際需求)
    tossSummon: [null as string | null],

    // 傳票編號
    SummonNumber: [null as string | null, [Validators.maxLength(11)]],

    // 檔案名稱
    fileName: [null as string | null, [Validators.maxLength(100)]],

    ...createPaginationConfig([{ field: 'PAM_No', order: 1 }]),
  });

  constructor(
    private fin26010Service: Fin26010Service,
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

  private formatDateTime(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const ymd = `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    const hms = `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    return `${ymd} ${hms}`;
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

  /** 將畫面上的值整理成後端需要的 Fin26010Request */
  private buildPayload(base: any): Fin26010Request {
    const payload: Fin26010Request = {
      PageIndex:
        Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
          ? base.pageIndex
          : 1,
      PageSize:
        Number.isFinite(base?.pageSize) && base.pageSize > 0
          ? base.pageSize
          : 30,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),

      PAM_No: base?.transferSource || undefined,
      CRT_DateFrom: this.toYMDOrUndef(
        base?.buildDateFrom ?? this.queryForm.get('buildDateFrom')?.value
      ),
      CRT_DateTo: this.toYMDOrUndef(
        base?.buildDateTo ?? this.queryForm.get('buildDateTo')?.value
      ),
      RMT_DateFrom:
        this.toYMDOrUndef(
          base?.transferDateFrom ??
            this.queryForm.get('transferDateFrom')?.value
        ) || '', // 必填
      RMT_DateTo:
        this.toYMDOrUndef(
          base?.transferDateTo ??
            this.queryForm.get('transferDateTo')?.value
        ) || '', // 必填
      BNK_id:
        (base?.bankCode ??
          this.queryForm.get('bankCode')?.value ??
          '') + '', // 必填
      BNK_Name: base?.bankName || this.queryForm.get('bankName')?.value || undefined,
      TossSummon:
        base?.tossSummon ?? this.queryForm.get('tossSummon')?.value ?? null,
      VouNo:
        base?.SummonNumber ??
        this.queryForm.get('SummonNumber')?.value ??
        undefined,
      File_Name:
        base?.fileName ?? this.queryForm.get('fileName')?.value ?? undefined,
    };

    // 移除空字串/null/undefined
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** 產生匯款檔 payload：從目前查詢條件 + 已選資料組出 */
  private buildGeneratePayload(): Fin26010GenerateRequest | null {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      return null;
    }

    const base = this.queryForm.getRawValue();
    const rmtFrom =
      this.toYMDOrUndef(base.transferDateFrom) ||
      this.toYMDOrUndef(base.transferDateTo) ||
      '';
    const rmtTo =
      this.toYMDOrUndef(base.transferDateTo) ||
      this.toYMDOrUndef(base.transferDateFrom) ||
      '';

    const bankCode = (base.bankCode || '').toString().trim();
    if (!rmtFrom || !rmtTo || !bankCode) {
      return null;
    }

    const ids = this.selectedItems
      .map((r) => r.id)
      .filter((x) => x != null) as number[];

    if (!ids.length) return null;

    const payload: Fin26010GenerateRequest = {
      IdList: ids,
      RMT_DateFrom: rmtFrom,
      RMT_DateTo: rmtTo,
      BNK_id: bankCode,
    };

    return payload;
  }

  /* ----------------- 給 <app-table-report> 用的查詢函式 ----------------- */
  public queryFIN26010ForReport = (body: any) =>
    this.fin26010Service.queryFIN26010(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin26010Row[]>) => {
        const rows: Fin26010Row[] = Array.isArray(res?.Data) ? res.Data : [];
        const totalCount =
          Number(res?.TotalCount ?? rows.length) || rows.length;

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
    const today = new Date();
    this.queryForm.patchValue({
      transferDateFrom: today,
      transferDateTo: today,
    });

    this.initializePage(
      'FIN26010',
      '/FIN2000/FIN26010CRU',
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

    this.fin26010Service
      .queryFIN26010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin26010Row[]>) => {
          const rows: Fin26010Row[] = Array.isArray(response?.Data)
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
          console.error('FIN26010 API error:', err);
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
      transferSource: null,
      buildDateFrom: null,
      buildDateTo: null,
      transferDateFrom: today,
      transferDateTo: today,
      bankCode: null,
      bankName: null,
      tossSummon: null,
      SummonNumber: null,
      fileName: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }

  /* ----------------- 產生匯款檔 ----------------- */
  generateRemitFile(): void {
    const payload = this.buildGeneratePayload();
    if (!payload) {
      // 這裡可以依你的 NotificationService 改成友善提示
      console.warn('產生匯款檔條件不足或沒有選取任何資料');
      return;
    }

    this.btnGenerateFileLoading = true;

    this.fin26010Service
      .generateRemitFile(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          // 後端負責：
          // 1. 產生檔名 yyyyMMddSSS_TSBRT.txt
          // 2. 寫入匯款明細檔(APS3008)的 File_Name
          // 3. 回應成功/失敗訊息
          console.log('Remit file generated:', res);
        },
        error: (err: any) => {
          console.error('FIN26010 generate remit file error:', err);
        },
      })
      .add(() => {
        this.btnGenerateFileLoading = false;
      });
  }
}
