import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { forkJoin, Observable } from 'rxjs'; // 引入 forkJoin 和 Observable
import { finalize, map } from 'rxjs/operators';
import { TLS2C050Service } from '../../../service/api/tls/tls2c050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls2c050',
  templateUrl: './tls2c050.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TranslateModule,
  ]
})
export class TLS2C050Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    cls_date: [null as Date | null, [Validators.required]],
  });

  closeDate: string | undefined;
  summaryDate: string | undefined;
  loadingDates = false;

  constructor(
    private tls2c050Service: TLS2C050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C050');
    this.fetchDates();
  }

  // 覆寫 onSubmit，將其改為單純的表單驗證
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      return;
    }
    // 不執行任何操作，讓單獨的函數處理按鈕邏輯
  }

  /**
   * 執行發票彙總作業 (轉檔)
   */
  onInvoiceSummary(): void {
    this.handleSubmit(this.queryForm, () => {
      const date = this.queryForm.controls.cls_date.value;
      if (date) {
        const dateStr = formatDateToYYYY_MM_DD(date);
        if (dateStr) {
          // --- 新增提示訊息 ---
          this.messageService.infoBubble('執行轉檔中，請稍後...');

          this.executeApi(this.tls2c050Service.invoiceTLS2C050(dateStr));
        }
      }
    });
  }

  /**
   * 執行發票鎖定
   */
  onLock(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const date = this.queryForm.controls.cls_date.value;
    if (!date) {
      return;
    }

    // 檢查是否小於等於最後關帳日期
    if (this.closeDate && this.closeDate !== 'N/A') {
      const selectedDate = new Date(date);
      const lastCloseDate = new Date(this.closeDate);

      if (selectedDate <= lastCloseDate) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    const dateStr = formatDateToYYYY_MM_DD(date);
    if (dateStr) {
      this.executeApi(this.tls2c050Service.lockTLS2C050(dateStr));
    }
  }

  /**
   * 執行發票反鎖定
   */
  onUnLock(): void {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    const date = this.queryForm.controls.cls_date.value;
    if (!date) {
      return;
    }

    // 檢查是否小於等於最後關帳日期
    if (this.closeDate && this.closeDate !== 'N/A') {
      const selectedDate = new Date(date);
      const lastCloseDate = new Date(this.closeDate);

      if (selectedDate <= lastCloseDate) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    const dateStr = formatDateToYYYY_MM_DD(date);
    if (dateStr) {
      this.executeApi(this.tls2c050Service.unLockTLS2C050(dateStr));
    }
  }

  /**
   * 統一處理 API 呼叫和結果
   * @param api$ 待執行的 Observable
   */
  private executeApi(api$: Observable<any>): void {
    this.loading = true;
    api$.pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        this.messageService.successBubble(res.Message || '操作成功');
        this.fetchDates(); // 操作成功後重新取得日期
      },
    });
  }

  /**
   * 取得最近的關帳日期和匯總日期
   */
  fetchDates(): void {
    this.loadingDates = true;

    const closeDateApi$ = this.tls2c050Service.getTLS2C050Date().pipe(
      map(response => response.Data?.CLS_DATE ?? 'N/A')
    );

    const summaryDateApi$ = this.tls2c050Service.getTLS2C050Date_invoice().pipe(
      map(response => response.Data?.invoice_lock_date ?? 'N/A')
    );

    forkJoin([closeDateApi$, summaryDateApi$])
      .pipe(
        finalize(() => this.loadingDates = false)
      )
      .subscribe({
        next: ([closeDate, summaryDate]) => {
          this.closeDate = closeDate;// 假設 closeDate 已經被正確轉換為一個 Date 物件
          const originalDate = new Date(closeDate);

          // 取得原本的日期，並加上 1 天
          // setDate(getDate() + 1) 是在 JavaScript 中處理日期加減的標準方式
          originalDate.setDate(originalDate.getDate() + 1);

          // 將計算後的新日期更新到表單欄位
          this.queryForm.patchValue({ cls_date: originalDate });
          this.summaryDate = summaryDate;
        },
      });
  }
}
