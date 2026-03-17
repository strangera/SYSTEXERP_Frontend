import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41030Service } from '@service/api/fin/fin41030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { FIN41030QueryRow, QueryFIN41030Request } from './fin41030.model';

@Component({
  selector: 'app-fin41030',
  templateUrl: './fin41030.component.html',
  styleUrl: './fin41030.component.scss',
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
    budget_version: [null as string | null],
    budget_yy: [null as string | null],
    budget_status: [null as string | null],
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
    { field: 'budget_yy', header: '年度', visible: true },
    { field: 'budget_version', header: '版本', visible: true },
    {
      field: 'budget_status',
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
      this.fin41030Service
        .queryFIN41030(form.getRawValue())
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false)),
        )
        .subscribe((response) => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = form.getRawValue();
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }
}
