import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

import { FIN13100Service } from '../../../service/api/fin/fin13100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';

interface FIN13100Row {
  VouNo: string;
  VouDate: string;
  PostFlag: string;
  PostFlagName: string;
  TaxTotal: number;
}

@UntilDestroy()
@Component({
  selector: 'app-fin13100',
  standalone: true,
  templateUrl: './fin13100.component.html',
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    TableReportComponent,
  ],
})
export class FIN13100Component extends BasicQueryPageComponent<FIN13100Row> implements OnInit {
  queryForm = this.formBuilder.group({
    VouNoStart: [null as string | null],
    VouNoEnd: [null as string | null],
    VouDateStart: [null as Date | null],
    VouDateEnd: [null as Date | null],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });

  data: FIN13100Row[] = [];
  totalRecords = 0;
  lastQueryBody: Record<string, unknown> | null = null;

  queryFIN13100Fn = (body: Record<string, unknown>) => this.fin13100Service.queryFIN13100(body);

  columns: Column<FIN13100Row>[] = [
    { field: 'VouNo', header: '傳票編號', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'PostFlagName', header: '傳票狀態', visible: true },
  ];

  constructor(private fin13100Service: FIN13100Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13100', 'FIN/fin13100cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const payload = { ...frm.value };
      payload.VouDateStart = this.toDateString(payload.VouDateStart);
      payload.VouDateEnd = this.toDateString(payload.VouDateEnd);
      this.lastQueryBody = { ...payload };

      this.fin13100Service
        .queryFIN13100(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = Array.isArray(response?.Data) ? response.Data : [];
          this.totalRecords = response?.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  onClearForm(): void {
    this.queryForm.reset({
      VouNoStart: null,
      VouNoEnd: null,
      VouDateStart: null,
      VouDateEnd: null,
      pageIndex: 1,
      pageSize: 30,
      SortBy: [{ field: 'VouNo', order: 1 }],
    });
    this.submitted = false;
  }

  private toDateString(v: Date | string | null | undefined): string | null {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
