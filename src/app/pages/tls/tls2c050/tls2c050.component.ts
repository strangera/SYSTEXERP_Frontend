import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS2C050Service } from '../../../service/api/tls/tls2-c050.service';
import { TLS2B020Service } from '../../../service/api/tls/tls2-b020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tls2c050',
  templateUrl: './tls2c050.component.html',
  styleUrls: ['./tls2c050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TranslateModule
  ]
})
export class TLS2C050Component extends BasicQueryPageComponent<any> {

  queryForm = this.formBuilder.group({
    onedatedd: [null, [Validators.required]], // 匯檔發票日期
  });



  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  closeDate: string = '查詢中...';
  summaryDate: string = '查詢中...';

  constructor(
    private tls2c050Service: TLS2C050Service,
    private tls2b020Service: TLS2B020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C050', '/tls2000/tls2C050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim() || null;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    forkJoin({
      dataRes: this.tls2c050Service.queryTLS2C050(payload),
      closeDateRes: this.tls2b020Service.queryCloseDate(payload),
      summaryDateRes: this.tls2c050Service.querySummaryDate(payload)
    }).subscribe({
      next: ({ dataRes, closeDateRes, summaryDateRes }) => {
        this.data = dataRes?.Data ?? [];
        this.totalRecords = dataRes?.TotalCount ?? this.data.length;
        this.closeDate = closeDateRes?.Data ?? '-';
        this.summaryDate = summaryDateRes?.Data ?? '-';

        this.queryStateService.setQueryState(this.ProgNo, payload);

        this.closeDate = closeDateRes?.Data ?? '-';

        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗，請稍後再試');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }
}
