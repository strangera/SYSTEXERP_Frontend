import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN62040Data, FIN62040Service, QueryFIN62040Request } from '@service/api/fin/fin62040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin62040',
  templateUrl: './fin62040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule,
    CalendarComponent
  ]
})
export class FIN62040Component extends BasicQueryPageComponent<FIN62040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    StartDate: [null, Validators.required],
    EndDate: [null, Validators.required],
    pageSize: [30],
    pageIndex: [1],
  });

  data: FIN62040Data[] = [];
  selectedItems: FIN62040Data[] = [];
  lastQueryBody: QueryFIN62040Request | null = null;
  totalRecords = 0;

  columns: Column[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目代稱' },
    { field: 'BNK_AccNo', header: '帳號' },
    { field: 'BNK_NAME', header: '銀行名稱' },
    { field: 'BNK_AccName', header: '戶名' },
    { field: 'BegAmt', header: '前期結餘', format: formatAmount },
    { field: 'DebitAmt', header: '本期借方金額', format: formatAmount },
    { field: 'CreditAmt', header: '本期貸方金額', format: formatAmount },
    { field: 'EndAmt', header: '結餘', format: formatAmount }
  ];

  constructor(
    public readonly fin62040Service: FIN62040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN62040', '', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin62040Service.queryFIN62040(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.lastQueryBody = form.getRawValue();
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }
}