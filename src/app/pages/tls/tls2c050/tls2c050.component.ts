import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS2C050Service } from '../../../service/api/tls/tls2c050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs'; // 引入 forkJoin
import { finalize, map } from 'rxjs/operators';
import { NgIf } from '@angular/common';

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
    cls_date: [new Date(), [Validators.required]],
  });

  // 使用新的 Observable 型別
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

  onSubmit(form: FormGroup): void {
    // 轉檔按鈕的邏輯
    this.handleSubmit(form, () => {
      if (form.value.cls_date) {
        this.tls2c050Service.invoiceTLS2C050(form.value.cls_date).pipe(finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.fetchDates();
        });
      }
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
      .subscribe(([closeDate, summaryDate]) => {
        // 直接賦值給 string 變數
        this.closeDate = closeDate;
        this.summaryDate = summaryDate;
      });
  }
}
