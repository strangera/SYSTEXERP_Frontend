import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { formatAmount } from 'src/app/others/component/table/table.model';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { TLS2C050Service } from '../../../service/api/tls/tls2c050.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../others/component/table/table.model';
import { TLS2A030TableReportComponent } from './tls2a030-table-report.component';
import { ReportColumn } from './tls2a030-table-report.model';


interface SalesRecord {
  PAY_NAME: string;
  OVER_PayAmt: number;
  PreAudit_OVER_PayAmt: number;
  Actual_ReceivedAmt: number;
  BOOK_PayAmt: number;
  Compare_CD: 'Y' | 'N' | 'O' | 'X';
  Compare_AB: 'Y' | 'N' | 'O' | 'X';
}

@Component({
  selector: 'app-tls2a030',
  templateUrl: './tls2a030.component.html',
  styleUrls: ['./tls2a030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TLS2A030TableReportComponent
  ]
})
export class TLS2A030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SaleDateStart: [yesterday, Validators.required],
    SaleDateEnd: [yesterday, Validators.required],
    ECR_No: [null as string | null],
    ECR_No_Start: [null as string | null],
    ECR_No_End: [null as string | null],
    ...createPaginationConfig([{ field: 'PAY_NO', order: 1 }]),
    pageSize: [1000]
  });

  footerData: any = null;
  historyRequestBody: any;
  data: SalesRecord[] = [];
  totalRecords = 0;
  ECRNoOptions: any[] = [];
  btnLoading2 = false;
  closeDate = ''; // 最後關帳日期

  // 緩存完整資料，避免重複 API 呼叫
  private cachedFullData: any[] = [];
  private cachedFooterData: any = null;
  private lastQueryParams = '';
  // 表格欄位

  columns: ReportColumn[] = [
    { field: 'PAY_NAME', header: '支付工具', visible: true },
    { field: 'OVER_PayAmt', header: '實際溢欠總額 (A)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'PreAudit_OVER_PayAmt', header: '審核前溢欠總額 (B)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Actual_ReceivedAmt', header: '實收總額 (C)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'BOOK_PayAmt', header: '系統帳 (D)', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    {
      field: 'Compare_CD',
      header: '(C) 與 (D) 比較',
      type: 'html',
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    },
    {
      field: 'Compare_AB',
      header: '(A) 與 (B) 比較',
      type: 'html',
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    }
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    public tls2a030Service: TLS2A030Service,
    private tls2c050Service: TLS2C050Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A030', '/TLS/TLS2A030cru', this.queryForm, (form) => this.onSubmit(form));

    this.dropdownApiService.queryPos1002().subscribe((data) => {
      this.ECRNoOptions = data ?? [];
    });

    // 取得最後關帳日期
    this.tls2c050Service.getTLS2C050Date()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.closeDate = response?.Data?.CLS_DATE || '';
        },
        error: () => {
          this.closeDate = '';
        }
      });
  }

  onQueryByDay(): void {
    const raw = this.queryForm.getRawValue();

    if (!raw.SaleDateStart || !raw.SaleDateEnd) {
      this.messageService.warnBubble('請先選擇銷售日期');
      return;
    }

    this.router.navigate(['/account/tls/tls2a030byday'], {
      state: {
        SaleDateStart: this.datePipe.transform(raw.SaleDateStart, 'yyyy-MM-dd'),
        SaleDateEnd: this.datePipe.transform(raw.SaleDateEnd, 'yyyy-MM-dd'),
        ECR_No_Start: raw.ECR_No_Start?.trim() ?? '',
        ECR_No_End: raw.ECR_No_End?.trim() ?? '',
        fromRoute: this.router.url,
      },
    });
  }

  onExportExcel(): void {
    // 1. 取得查詢表單中的日期
    const startDate = this.queryForm.get('SaleDateStart')?.value;
    const endDate = this.queryForm.get('SaleDateEnd')?.value;

    // 2. 格式化日期 (假設是 Date 物件或可格式化的字串)
    // 如果您的日期格式已經是字串 YYYY/MM/DD，可直接使用，否則建議用 DatePipe 或簡單處理
    const formattedStart = startDate ? this.formatDateToYYYYMMDD(startDate) : '';
    const formattedEnd = endDate ? this.formatDateToYYYYMMDD(endDate) : '';

    // 3. 設定新的檔案名稱
    const customFilename = `溢欠彙總表_${formattedStart}_${formattedEnd}.xlsx`;

    const raw = this.queryForm.getRawValue();

    const payload = {
      SaleDateStart:
        raw.SaleDateStart instanceof Date
          ? raw.SaleDateStart.toISOString()
          : raw.SaleDateStart ?? null,
      SaleDateEnd:
        raw.SaleDateEnd instanceof Date
          ? raw.SaleDateEnd.toISOString()
          : raw.SaleDateEnd ?? null,
      ECR_No_Start: raw.ECR_No_Start?.trim() ?? '',
      ECR_No_End: raw.ECR_No_End?.trim() ?? '',
      PageSize: 999999,
      PageIndex: 1,
      SortBy: [],
      IsExcel: true,
    };

    this.btnLoading2 = true;

    this.tls2a030Service.exportTLS2A030(payload).subscribe({
      next: (res) => {
        const blob = new Blob([res.body], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const contentDisposition = res.headers.get('content-disposition');
        let filename = '溢欠彙總表.xlsx';
        if (contentDisposition) {
          // const match = contentDisposition.match(/filename="?([^"]+)"?/);
          // if (match) filename = decodeURIComponent(match[1]);
          // 優先找 filename*= (UTF-8 編碼格式)
          const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
          if (filenameStarMatch) {
            filename = decodeURIComponent(filenameStarMatch[1]);
          } else {
            // 如果沒有 filename*，再找一般的 filename=
            const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
            if (filenameMatch) {
              filename = decodeURIComponent(filenameMatch[1]);
            }
          }
        }
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = customFilename;
        a.click();
        globalThis.URL.revokeObjectURL(url);
        this.btnLoading2 = false;
      },
    });
  }

  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup) {
    // 更新表單控制項的值
    form.patchValue({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      SortBy: event.SortBy
    });

    // 檢查是否為純分頁操作（查詢條件沒變）
    const raw = form.getRawValue();
    const currentQueryParams = JSON.stringify({
      SaleDateStart: raw.SaleDateStart,
      SaleDateEnd: raw.SaleDateEnd,
      ECR_No_Start: raw.ECR_No_Start,
      ECR_No_End: raw.ECR_No_End
    });

    if (currentQueryParams === this.lastQueryParams && this.cachedFullData.length > 0) {
      // 使用緩存資料進行前端分頁
      this.performClientSidePaging(event.pageIndex, event.pageSize);
    } else {
      // 查詢條件改變，需要重新呼叫 API
      this.onSubmit(form);
    }
  }

  private performClientSidePaging(pageIndex: number, pageSize: number) {
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedData = this.cachedFullData.slice(startIndex, endIndex);

    this.data = structuredClone(pagedData.map((it: any) => ({
      ...it,
      Compare_CD: this.formatCompare(it?.Compare_CD),
      Compare_AB: this.formatCompare(it?.Compare_AB)
    })));

    this.footerData = this.cachedFooterData;
    this.totalRecords = this.cachedFullData.length;
  }
  private formatCompare(v: any): string {
    return v === true || v === 'Y' || v === 'O'
      ? '<span class="circle">〇</span>'
      : '<span class="cross">✖</span>';
  }
  private buildLockBody() {
    const raw = this.queryForm.getRawValue();

    return {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [
        {
          field: '',
          order: 0
        }
      ],
      SaleDateStart: this.datePipe.transform(raw.SaleDateStart, 'yyyy-MM-dd') ?? null,
      SaleDateEnd: this.datePipe.transform(raw.SaleDateEnd, 'yyyy-MM-dd') ?? null,
      ECR_No_Start: raw.ECR_No_Start?.trim() ?? '',
      ECR_No_End: raw.ECR_No_End?.trim() ?? '',
      isPrint: ''
    };
  }
  onLock(): void {
    const raw = this.queryForm.getRawValue();

    // 檢查銷售日期起迄是否為同一天
    if (!raw.SaleDateStart || !raw.SaleDateEnd) {
      this.messageService.warnBubble('請先選擇銷售日期');
      return;
    }

    const startDate = raw.SaleDateStart instanceof Date
      ? raw.SaleDateStart.toDateString()
      : new Date(raw.SaleDateStart).toDateString();
    const endDate = raw.SaleDateEnd instanceof Date
      ? raw.SaleDateEnd.toDateString()
      : new Date(raw.SaleDateEnd).toDateString();

    if (startDate !== endDate) {
      this.messageService.warnBubble('銷售日期起迄必須為同一天才能執行鎖定操作');
      return;
    }

    // 檢查是否小於等於最後關帳日期
    if (this.closeDate) {
      const selectedDate = new Date(raw.SaleDateStart instanceof Date ? raw.SaleDateStart : raw.SaleDateStart!);
      const lastCloseDate = new Date(this.closeDate);

      if (selectedDate <= lastCloseDate) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    const body = this.buildLockBody();
    this.loading = true;

    this.tls2a030Service.lockTLS2A030(body)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.messageService.successBubble('鎖定成功');
          this.onSubmit(this.queryForm); // 重新查詢
          this.loading = false;
        },

      });
  }

  onUnLock(): void {
    const raw = this.queryForm.getRawValue();

    // 檢查銷售日期起迄是否為同一天
    if (!raw.SaleDateStart || !raw.SaleDateEnd) {
      this.messageService.warnBubble('請先選擇銷售日期');
      return;
    }

    const startDate = raw.SaleDateStart instanceof Date
      ? raw.SaleDateStart.toDateString()
      : new Date(raw.SaleDateStart).toDateString();
    const endDate = raw.SaleDateEnd instanceof Date
      ? raw.SaleDateEnd.toDateString()
      : new Date(raw.SaleDateEnd).toDateString();

    if (startDate !== endDate) {
      this.messageService.warnBubble('銷售日期起迄必須為同一天才能執行反鎖定操作');
      return;
    }

    // 檢查是否小於等於最後關帳日期
    if (this.closeDate) {
      const selectedDate = new Date(raw.SaleDateStart instanceof Date ? raw.SaleDateStart : raw.SaleDateStart!);
      const lastCloseDate = new Date(this.closeDate);

      if (selectedDate <= lastCloseDate) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    const body = this.buildLockBody();
    this.loading = true;

    this.tls2a030Service.UnLockTLS2A030(body)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.messageService.successBubble('反鎖定成功');
          this.onSubmit(this.queryForm); // 重新查詢
          this.loading = false;
        },

      });
  }

  onSubmit(form: FormGroup): void {
    this.data = [];
    this.footerData = null;

    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      // 構建 API 請求參數，確保包含分頁資訊
      const payload = {
        SaleDateStart:
          raw.SaleDateStart instanceof Date
            ? raw.SaleDateStart.toISOString()
            : raw.SaleDateStart ?? null,
        SaleDateEnd:
          raw.SaleDateEnd instanceof Date
            ? raw.SaleDateEnd.toISOString()
            : raw.SaleDateEnd ?? null,
        ECR_No_Start: raw.ECR_No_Start?.trim() ?? '',
        ECR_No_End: raw.ECR_No_End?.trim() ?? '',
        PageSize: raw.pageSize ?? 20,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy ?? [],
        IsExcel: false,
      };

      // 更新查詢參數緩存
      this.lastQueryParams = JSON.stringify({
        SaleDateStart: payload.SaleDateStart,
        SaleDateEnd: payload.SaleDateEnd,
        ECR_No_Start: payload.ECR_No_Start,
        ECR_No_End: payload.ECR_No_End
      });

      // 保存最後查詢條件供 app-table-report 使用
      this.historyRequestBody = payload;

      this.tls2a030Service.queryTLS2A030(payload).subscribe({
        next: (res) => {
          const main = res?.Data?.mainData ?? [];
          const total = res?.Data?.totalData?.[0] ?? null;

          // 緩存完整資料
          this.cachedFullData = [...main];

          // 因為後端沒有實作分頁，在前端實作分頁邏輯
          const pageSize = payload.PageSize;
          const pageIndex = payload.PageIndex;
          const startIndex = (pageIndex - 1) * pageSize;
          const endIndex = startIndex + pageSize;

          // 取得當前頁面的資料
          const pagedData = main.slice(startIndex, endIndex);

          this.data = structuredClone(pagedData.map((it: any) => ({
            ...it,
            Compare_CD: this.formatCompare(it?.Compare_CD),
            Compare_AB: this.formatCompare(it?.Compare_AB)
          })));

          if (total) {
            const footerRow = {
              group_name: '總計',
              OVER_PayAmt: total.OVER_Total_PayAmt,
              PreAudit_OVER_PayAmt: total.PreAudit_OVER_Total_PayAmt,
              Actual_ReceivedAmt: total.Actual_ReceivedAmt_Total,
              BOOK_PayAmt: total.BOOK_Total_PayAmt,
              // 傳入原始值，讓 column 的 format 函數處理
              Compare_CD: total.Compare_CD_Total,
              Compare_AB: total.Compare_AB_Total
            };
            this.footerData = footerRow;
            this.cachedFooterData = footerRow;
          } else {
            this.footerData = null;
            this.cachedFooterData = null;
          }

          // 設定總筆數為原始資料的長度
          this.totalRecords = main.length;
          this.loading = false;
        },
      });
    });
  }

  private formatDateToYYYYMMDD(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // 防止無效日期

    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}${month}${day}`;
  }
}
