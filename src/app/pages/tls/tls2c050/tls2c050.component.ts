import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { formatDateToYYYY_MM_DD } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { forkJoin, Observable } from 'rxjs'; // 引入 forkJoin 和 Observable
import { finalize, map } from 'rxjs/operators';
import { TLS2C010Service } from '@service/api/tls/tls2-c010.service';
import { TLS2C050Service } from '../../../service/api/tls/tls2c050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-tls2c050',
  templateUrl: './tls2c050.component.html',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
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
  lastCloseDate: string | null = null; // 最近關帳日期 (同 TLS2C030)
  importDate: string | undefined; // 新增：存儲匯入日期
  loadingDates = false;

  constructor(
    private tls2c050Service: TLS2C050Service,
    private tls2c010Service: TLS2C010Service,
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
          // 發票日期須已日結 (<= 最近關帳日期) 才可轉檔
          const lastCloseStr = this.lastCloseDate ? formatDateToYYYY_MM_DD(this.lastCloseDate) : null;
          if (!lastCloseStr || dateStr > lastCloseStr) {
            this.messageService.warnBubble('請先日結，再執行轉檔');
            this.loading = false; // handleSubmit 已先設 loading=true，提前 return 需自行還原
            return;
          }

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
  * 改為直接使用最近執行鎖定時間 (summaryDate)
  */
  onUnLock(): void {
    // 1. 檢查是否有最近執行鎖定時間
    if (!this.closeDate || this.closeDate === 'N/A') {
      this.messageService.warnBubble('目前無最後發票鎖定日期，無法執行反鎖定。');
      return;
    }

    // 3. 直接使用 summaryDate 執行 API
    // 假設 summaryDate 的格式已經是 YYYY-MM-DD，若不是，請視情況使用 formatDateToYYYY_MM_DD
    this.executeApi(this.tls2c050Service.unLockTLS2C050(this.closeDate));
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
   * 取得最近的關帳日期、彙總日期以及建議的匯入日期
   */
  fetchDates(): void {
    this.loadingDates = true;

    // 1. 取得關帳日期
    const closeDateApi$ = this.tls2c050Service.getTLS2C050Date().pipe(
      map(response => response.Data?.CLS_DATE ?? 'N/A')
    );

    // 2. 取得最近關帳日期 (同 TLS2C030)
    const lastCloseDateApi$ = this.tls2c010Service.getTLS2C010Date().pipe(
      map((response: { Data?: { CLS_DATE?: string } }) => response.Data?.CLS_DATE || null)
    );

    // 3. 取得原匯檔發票日期 (新 API)
    const importDateApi$ = this.tls2c050Service.GetTLS2C050ImportDate().pipe(
      map(response => response.Data?.CLS_DATE ?? null)
    );

    forkJoin([closeDateApi$, lastCloseDateApi$, importDateApi$])
      .pipe(finalize(() => (this.loadingDates = false)))
      .subscribe({
        next: ([closeDate, lastCloseDate, importDate]) => {
          this.closeDate = closeDate;
          this.lastCloseDate = lastCloseDate;
          this.importDate = importDate ?? 'N/A';

          // 如果有取得 importDate，則將其設為表單預設值
          if (importDate) {
            const targetDate = new Date(importDate);
            this.queryForm.patchValue({
              cls_date: targetDate
            });
          } else {
            // 若沒抓到 importDate 的備案：清空或維持原樣
            this.queryForm.patchValue({ cls_date: null });
          }
        },
        error: (err) => {
          console.error('Fetch dates failed', err);
          this.messageService.errorBubble('取得日期資訊失敗');
        }
      });
  }
}
