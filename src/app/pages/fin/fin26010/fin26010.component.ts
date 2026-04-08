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
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { forkJoin } from 'rxjs';

// Service & 型別
import {
  Fin26010Service,
  Fin26010Row,
  Fin26010Request,
  Aps1002BankDropDownRow,
  ApiResponse,
  ExportFin26010TxtRequest,
} from '../../../service/api/fin/fin26010.service';

type SortItem = { field: string; order: number };

interface BankDropdownOption {
  label: string; // 顯示：BNK_No-BNK_BRANCHNAME
  value: string; // BNK_DepositAccNo (公司銀行科目代號)
  raw: Aps1002BankDropDownRow;
}

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
    InputTextComponent,
    DropdownComponent,
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

  /* ----------------- 欄位定義（對應 queryFIN26010Response） ----------------- */
  columns: ReportColumn[] = [
    { field: 'WSLIP_NO', header: '匯款單號' },
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
    { field: 'ACCNO', header: '銀行代號' }, // APS3007.BNK_id = GLS1005.ACCNO
    { field: 'ACCCNAME', header: '銀行名稱' }, // GLS1005.ACCCNAME
    { field: 'BNK_No', header: '全省銀行代號' }, // BNK_No + BNK_BranchNo
    { field: 'BNK_BRANCHNAME', header: '全省銀行名稱' }, // BNK_BRANCHNAME
  ];

  /* ----------------- 預設排序（與欄位 WSLIP_NO 一致） ----------------- */
  readonly defaultSort: SortItem[] = [{ field: 'WSLIP_NO', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  // 拋轉傳票：Y=已拋轉, N=未拋轉（後端 Status 單值）
  statusOptions: any[] = [
    { value: 'Y', label: '已拋轉' },
    { value: 'N', label: '未拋轉' },
  ];

  // 銀行代號下拉：用 /queryAPS1002_DropDownList 回傳資料轉成 Dropdown options
  bankOptions: BankDropdownOption[] = [];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    // 匯款單號 WSLIP_NO
    transferSource: [null as string | null],

    // 建立日期(起迄) CRT_DateFrom / CRT_DateTo
    buildDateFrom: [null as Date | null],
    buildDateTo: [null as Date | null],

    // 匯款日期(起迄) RMT_DateFrom / RMT_DateTo ＊業務需求：必填
    transferDateFrom: [null as Date | null, [Validators.required]],
    transferDateTo: [null as Date | null, [Validators.required]],

    // 銀行代號 BNK_id（用 dropdown：值為 BNK_DepositAccNo）
    bankCode: [null as string | null, [Validators.required]],

    // 銀行名稱（純畫面顯示/輸入，後端目前未收）
    bankName: [null as string | null, [Validators.maxLength(40)]],

    // 拋轉傳票 Status (Y/N)
    status: [null as string | null],

    // 傳票編號 VouNo (MaxLength 12)
    SummonNumber: [null as string | null, [Validators.maxLength(12)]],

    // 檔案名稱 File_Name
    fileName: [null as string | null, [Validators.maxLength(100)]],

    // 分頁＋排序（欄位 WSLIP_NO）
    ...createPaginationConfig([{ field: 'WSLIP_NO', order: 1 }]),
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

  /** 將畫面上的值整理成後端需要的 queryFIN26010Request */
  private buildPayload(base: any): Fin26010Request {
    const fromForm = this.queryForm.getRawValue();

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

      // WSLIP_NO
      WSLIP_NO: base?.transferSource ?? fromForm.transferSource ?? undefined,

      // 建立日期
      CRT_DateFrom: this.toYMDOrUndef(
        base?.buildDateFrom ?? fromForm.buildDateFrom
      ),
      CRT_DateTo: this.toYMDOrUndef(
        base?.buildDateTo ?? fromForm.buildDateTo
      ),

      // 匯款日期
      RMT_DateFrom: this.toYMDOrUndef(
        base?.transferDateFrom ?? fromForm.transferDateFrom
      ),
      RMT_DateTo: this.toYMDOrUndef(
        base?.transferDateTo ?? fromForm.transferDateTo
      ),

      // 銀行代號：值為 BNK_DepositAccNo -> 對應 BNK_id
      BNK_id:
        (base?.bankCode ?? fromForm.bankCode ?? '')?.toString().trim() ||
        undefined,

      // 拋轉傳票 Status (Y/N)
      Status:
        (base?.status ?? fromForm.status)?.toString().trim() || undefined,

      // 傳票編號
      VouNo:
        (base?.SummonNumber ?? fromForm.SummonNumber)?.toString().trim() ||
        undefined,

      // 檔案名稱
      File_Name:
        (base?.fileName ?? fromForm.fileName)?.toString().trim() || undefined,
    };

    // 移除空字串 / null / undefined
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) {
        delete (payload as any)[k];
      }
    });

    return payload;
  }

  /** 載入銀行代號下拉（/queryAPS1002_DropDownList） */
  private loadBankOptions(): void {
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.bankOptions = list.map((x) => ({
            label: `${x.BNK_id}-${x.BNK_AccName}`,
            value: x.BNK_id,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入銀行代號下拉失敗', err);
          this.bankOptions = [];
        },
      });
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

  /* ----------------- 儲存查詢條件（還原用） ----------------- */
  private saveQueryState(): void {
    this.queryStateService.setQueryState(this.ProgNo, {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    const today = new Date();
    this.queryForm.patchValue({
      transferDateFrom: today,
      transferDateTo: today,
    });

    // 載入銀行代號下拉
    this.loadBankOptions();

    this.initializePage(
      'FIN26010',
      '/FIN2000/FIN26010CRU',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    // // 🔄 還原查詢條件（參考 FIN64010 寫法）
    // const saved = this.queryStateService.getQueryStateValue('FIN26010');
    // if (saved?.formValue) {
    //   this.queryForm.patchValue(saved.formValue, { emitEvent: false });
    //   this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
    //   this.lastQueryBody = saved.lastQueryBody ?? null;

    //   // 等變更套用後再自動查一次
    //   Promise.resolve().then(() => this.onSubmit(this.queryForm));
    // }
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

    // 更新目前 SortBy 狀態
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

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

            // ✅ 成功查詢後，統一存查詢條件 & 狀態
            this.saveQueryState();
          });

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
      status: null,
      SummonNumber: null,
      fileName: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;

    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;
  }

  /* ----------------- 產生匯款檔 (TXT)：依匯款日期(RMT_Date) 分批 → 多檔 ----------------- */
  generateRemitFile(): void {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      console.warn('產生匯款檔：未選取任何資料');
      return;
    }

    // 依「匯款日期 RMT_Date」分組，把每組內的 WSLIP_NO 集合起來
    const dateGroups = new Map<string, Set<string>>();

    this.selectedItems.forEach((row) => {
      const slipNo = (row.WSLIP_NO ?? '').toString().trim();
      if (!slipNo) return;

      const rawDate = row.RMT_Date ?? ''; // 用匯款日期 RMT_Date 當 key
      let dateKey = 'NO_DATE';

      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = (d.getMonth() + 1).toString().padStart(2, '0');
          const dd = d.getDate().toString().padStart(2, '0');
          // 檔名用 yyyyMMdd 比較好看
          dateKey = `${yyyy}${mm}${dd}`;
        } else {
          // 解析失敗就用原始字串前 10 碼當 key，例如 2025-12-03
          dateKey = rawDate.toString().substring(0, 10) || 'NO_DATE';
        }
      }

      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, new Set<string>());
      }
      dateGroups.get(dateKey)!.add(slipNo);
    });

    if (dateGroups.size === 0) {
      console.warn('產生匯款檔：選取資料沒有可用的 WSLIP_NO');
      return;
    }

    this.btnGenerateFileLoading = true;

    // 每個日期一個 request，WSLIP_NOList 裡面放該日期的所有 WSLIP_NO
    const requests = Array.from(dateGroups.entries()).map(([dateKey, set]) => {
      const payload: ExportFin26010TxtRequest = {
        WSLIP_NOList: Array.from(set),
      };

      return this.fin26010Service
        .exportFIN26010TXT(payload)
        .pipe(map((res: HttpResponse<Blob>) => ({ dateKey, res })));
    });

    forkJoin(requests)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (results) => {
          results.forEach(({ dateKey, res }) => {
            const blob = res.body;
            if (!blob) {
              console.error(
                `FIN26010 TXT 匯出失敗：回傳 body 為空 (Date=${dateKey})`
              );
              return;
            }

            // 預設檔名：FIN26010_{日期}.txt
            let filename = `FIN26010_${dateKey}.txt`;

            // 嘗試從 Content-Disposition 取檔名
            const cd = res.headers.get('Content-Disposition');
            if (cd) {
              const match = /filename\*?=(?:UTF-8''|")?([^"]+)/i.exec(cd);
              if (match && match[1]) {
                filename = decodeURIComponent(match[1].replace(/"/g, ''));
              }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('FIN26010 TXT 匯出完成，檔名：', filename);
          });
        },
        error: (err) => {
          console.error('FIN26010 TXT 匯出 API 錯誤:', err);
        },
      })
      .add(() => {
        this.btnGenerateFileLoading = false;
      });
  }
}
