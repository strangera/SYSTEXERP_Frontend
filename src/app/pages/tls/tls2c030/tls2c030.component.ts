import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2C010Service } from '@service/api/tls/tls2-c010.service';
import { TLS2C030Data, TLS2C030QueryRequest, TLS2C030Service } from '@service/api/tls/tls2-c030.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls2c030',
  templateUrl: './tls2c030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, TableReportComponent]
})
export class TLS2C030Component extends BasicQueryPageComponent<TLS2C030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    onedatedd: ['', Validators.required], // 結帳日期
    ...createPaginationConfig([{ field: 'cls_date', order: -1 }]) // 分頁和排序參數
  });

  closeDate = ''; // 最近關帳日期

  readonly tableData = signal<TLS2C030Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: TLS2C030QueryRequest;

  readonly columns: ReportColumn[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'mid', header: 'MID', visible: false },
    { field: 'cls_date', header: '關帳日期', visible: true, format: formatDate },
    { field: 'day_lock_date', header: '日關帳鎖定日期', visible: true, format: formatDate },
    { field: 'day_USR_No', header: '日關帳鎖定人員', visible: true },
    { field: 'day_USR_Name', header: '日關帳鎖定人員姓名', visible: true },
  ];

  constructor(
    private datePipe: DatePipe,
    private tls2c030Service: TLS2C030Service,
    private tls2c010Service: TLS2C010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C030', 'tls/tls2c030cru', this.queryForm, (form) => this.onSubmit(form));

    // 取得最近關帳日期
    this.tls2c010Service.getTLS2C010Date()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.closeDate = response.Data.CLS_DATE || '';
        // cls_date 為 closeDate + 1 天
        const nextDate = new Date(this.closeDate);
        nextDate.setDate(nextDate.getDate() + 1);
        this.queryForm.patchValue({ onedatedd: this.datePipe.transform(nextDate, 'yyyy/MM/dd') || '' });
      });
  }

  onTableDataChange(data: TLS2C030Data[]) {
    this.tableData.set(data ?? []);
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? raw?.pageSize ?? 30;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? raw?.pageIndex ?? 1;
    const payload: TLS2C030QueryRequest = {
      onedatedd: this.datePipe.transform(this.queryForm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || '',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body?.SortBy ?? raw?.SortBy,
    };
    return this.tls2c030Service.queryTLS2C030(payload);
  };

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        onedatedd: this.datePipe.transform(frm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || '',
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      } as TLS2C030QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: response => {
            this.tableData.set(response.Data ?? []);
            this.totalRecords.set(response.TotalCount ?? 0);
          }
        });
    });
  }

  defineDateCheckout() {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    // 檢查是否小於等於最後關帳日期
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (selectedDate && this.closeDate) {
      const selected = new Date(selectedDate);
      const lastClose = new Date(this.closeDate);

      if (selected <= lastClose) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    // 呼叫 definedatecheckoutTLS2C030
    this.tls2c030Service.definedatecheckoutTLS2C030(this.params)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // 處理回應
        this.messageService.successBubble(response.Message);
        this.refreshCloseDate();
        this.onSubmit(this.queryForm); // 重新查詢資料
      });
  }

  undefineDateCheckout() {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    // 檢查是否小於等於最後關帳日期
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (selectedDate && this.closeDate) {
      const selected = new Date(selectedDate);
      const lastClose = new Date(this.closeDate);

      if (selected < lastClose) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    // 進行反日結的邏輯
    this.tls2c030Service.undefinedatecheckoutTLS2C030(this.params)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // 處理回應
        this.messageService.successBubble(response.Message);
        this.refreshCloseDate();
        this.onSubmit(this.queryForm); // 重新查詢資料
      });
  }

  private refreshCloseDate() {
    this.tls2c010Service.getTLS2C010Date()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        // 1. 更新最新的關帳日期變數
        this.closeDate = res.Data.CLS_DATE || '';

        // 2. 自動計算並更新表單中的日期 (預設為最新關帳日 + 1 天)
        if (this.closeDate) {
          const nextDate = new Date(this.closeDate);
          nextDate.setDate(nextDate.getDate() + 1);

          this.queryForm.patchValue({
            onedatedd: this.datePipe.transform(nextDate, 'yyyy/MM/dd') || ''
          });
        }
      });
  }

  /** 本日重算（呼叫後端 reCalculateTLS2C030） */
  recalculateToday() {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: this.lastQueryBody?.SortBy ?? [],
      onedatedd: this.datePipe.transform(this.queryForm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || ''
    };

    this.tableLoading.set(true);
    this.messageService.blockUi();

    this.tls2c030Service.reCalculateTLS2C030(payload)
      .pipe(finalize(() => {
        this.tableLoading.set(false);
        this.messageService.unblockUi();
      }), untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.messageService.successBubble(res?.Message || '重算完成');
          // 重新查詢以更新畫面
          this.onSubmit(this.queryForm);
        },
        error: (err) => {
          console.error('reCalculateTLS2C030 failed', err);
          this.messageService.errorBubble('重算失敗');
        }
      });
  }

  get params() {
    return {
      onedatedd: this.datePipe.transform(this.queryForm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || ''
    };
  }

  get isDateClosed(): boolean {
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (!selectedDate || !this.closeDate) {
      return false;
    }

    const selected = new Date(selectedDate);
    const lastClose = new Date(this.closeDate);
    return selected <= lastClose;
  }
}
