import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { TLS2C050Service } from '../../../service/api/tls/tls2c050.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { Column, createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';


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
    CustomFooterTableComponent,
    CalendarRangeQuickComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule
  ]
})
export class TLS2A030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SaleDateStart: [yesterday, Validators.required],
    SaleDateEnd: [yesterday, Validators.required],
    ECR_No: [null as string | null],
    ECR_No_Start: [null as string | null],
    ECR_No_End: [null as string | null],
    ...createPaginationConfig([{ field: 'PAY_NO', order: 1 }])
  });

  footerData: any[] = [];
  private skipAutoQueryOnce = false;
  data: SalesRecord[] = [];
  totalRecords = 0;
  selectedItems: SalesRecord[] = [];
  ECRNoOptions: any[] = [];
  btnLoading2 = false;
  closeDate = ''; // 最後關帳日期

  // 緩存完整資料，避免重複 API 呼叫
  private cachedFullData: any[] = [];
  private cachedFooterData: any[] = [];
  private lastQueryParams = '';
  // 表格欄位

  columns: Column[] = [
    { field: 'PAY_NAME', header: '支付工具', visible: true },
    { field: 'OVER_PayAmt', header: '實際溢欠總額 (A)', visible: true, format: formatAmount, isTotal: true },
    { field: 'PreAudit_OVER_PayAmt', header: '審核前溢欠總額 (B)', visible: true, format: formatAmount, isTotal: true },
    { field: 'Actual_ReceivedAmt', header: '實收總額 (C)', visible: true, format: formatAmount, isTotal: true },
    { field: 'BOOK_PayAmt', header: '系統帳 (D)', visible: true, format: formatAmount, isTotal: true },
    {
      field: 'Compare_CD',
      header: '(C) 與 (D) 比較',
      htmlFormat: true,
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    },
    {
      field: 'Compare_AB',
      header: '(A) 與 (B) 比較',
      htmlFormat: true,
      format: (v: any) =>
        v === true || v === 'Y' || v === 'O'
          ? '<span class="circle">〇</span>'
          : '<span class="cross">✖</span>',
      visible: true,
    }
  ];

  constructor(
    private ECRNoService: ECRNoService,
    private tls2a030Service: TLS2A030Service,
    private tls2c050Service: TLS2C050Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A030', '/TLS/TLS2A030cru', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
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

  onExportExcel(): void {
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
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) filename = decodeURIComponent(match[1]);
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
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
      Compare_CD: it?.Compare_CD,
      Compare_AB: it?.Compare_AB
    })));

    this.footerData = [...this.cachedFooterData];
    this.totalRecords = this.cachedFullData.length;
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
    this.footerData = [];

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
            Compare_CD: it?.Compare_CD,
            Compare_AB: it?.Compare_AB
          })));

          if (total) {
            const footerRow = {
              group_name: '總計',
              OVER_PayAmt: total.OVER_Total_PayAmt,
              PreAudit_OVER_PayAmt: total.PreAudit_OVER_Total_PayAmt,
              Actual_ReceivedAmt: total.Actual_ReceivedAmt_Total,
              BOOK_PayAmt: total.BOOK_Total_PayAmt,
              Compare_CD: '',
              Compare_AB: ''
            };
            this.footerData = [footerRow];
            this.cachedFooterData = [footerRow];
          } else {
            this.footerData = [];
            this.cachedFooterData = [];
          }

          // 設定總筆數為原始資料的長度
          this.totalRecords = main.length;
          this.loading = false;
        },
      });
    });
  }


}
