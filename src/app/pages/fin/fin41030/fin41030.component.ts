import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41030Service } from '@service/api/fin/fin41030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, createPaginationConfig } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { FIN41030QueryRow, QueryFIN41030Request } from './fin41030.model';

@Component({
  selector: 'app-fin41030',
  templateUrl: './fin41030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class FIN41030Component extends BasicQueryPageComponent<FIN41030QueryRow> implements OnInit {
  queryForm = this.formBuilder.group({
    BudgetYear: [null as string | null],
    BudgetVersion: [null as string | null],
    BudgetStatus: [null as string | null],
    ...createPaginationConfig(),
  });

  budgetStatusOptions = [
    { value: 'Y', label: '已審核' },
    { value: 'N', label: '未審核' },
  ];

  data: FIN41030QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryFIN41030Request | null = null;
  queryFIN41030Fn = (body: QueryFIN41030Request) => this.fin41030Service.queryFIN41030(body);

  columns: Column[] = [
    { field: 'BudgetYear', header: '年度', visible: true },
    { field: 'BudgetVersion', header: '版本', visible: true },
    {
      field: 'BudgetStatus',
      header: '審核狀態',
      visible: true,
      format: (value: string) => (value === 'Y' ? '已審核' : value === 'N' ? '未審核' : value),
    },
  ];

  constructor(public readonly fin41030Service: FIN41030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41030', 'fin/fin41030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload: QueryFIN41030Request = {
        BudgetYear: raw.BudgetYear ?? null,
        BudgetVersion: raw.BudgetVersion ?? null,
        BudgetStatus: raw.BudgetStatus ?? null,
        PageSize: raw.PageSize,
        PageIndex: raw.PageIndex,
        SortBy: raw.SortBy,
      };

      this.fin41030Service
        .queryFIN41030(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false)),
        )
        .subscribe((response) => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = payload;
          this.queryStateService.setQueryState(this.ProgNo, raw);
        });
    });
  }
}
