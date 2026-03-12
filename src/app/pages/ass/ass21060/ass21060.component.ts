import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { ASS21060Service } from '../../../service/api/ass/ass21060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

import { AccordionModule } from 'primeng/accordion';

import { ASS21060Data, ASS21060Query } from './ass21060.model';

@Component({
  selector: 'app-ass21060',
  templateUrl: './ass21060.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    TableReportComponent,
    CalendarComponent,
  ],
})
export class ASS21060Component extends BasicQueryPageComponent<ASS21060Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    ContractYM: [null as Date | string | null, [Validators.required]],
    ENG_Type: [null as string | null, [Validators.required]],
    TLT_NoStart: [null as string | null, [Validators.maxLength(20)]],
    TLT_NoEnd: [null as string | null, [Validators.maxLength(20)]],
    TLT_Name: [null as string | null, [Validators.maxLength(100)]],
    Contract_No: [null as string | null, [Validators.maxLength(20)]],
    Contract_SubNo: [null as string | null, [Validators.maxLength(10)]],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[
      { field: 'TLT_No', order: 1 },
      { field: 'Contract_No', order: 1 },
      { field: 'Contract_SubNo', order: 1 }
    ]]
  });

  ENG_TypeOptions = getSYS1000Options('ENG_Type');

  data: ASS21060Data[] = [];
  totalRecords = 0;
  lastQueryBody: ASS21060Query | null = null;

  columns: ReportColumn[] = [];

  private readonly meterTypeMap: Record<string, { field: keyof ASS21060Data; header: string }> = {
    G01: { field: 'Water_Flag', header: '水錶抄錶' },
    G02: { field: 'Electric_Flag', header: '電錶抄錶' },
    G03: { field: 'Gas_Flag', header: '瓦斯錶抄錶' },
  };

  constructor(
    public readonly service: ASS21060Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21060', '', this.queryForm, this.onSubmit.bind(this));

    this.buildColumns(this.queryForm.getRawValue().ENG_Type);

    this.queryForm.controls.ENG_Type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((engType) => {
        this.buildColumns(engType);
      });
  }

  private buildColumns(engType: string | null): void {
    const meterConfig = this.meterTypeMap[engType ?? ''] ?? {
      field: 'Water_Flag' as keyof ASS21060Data,
      header: '抄錶'
    };

    this.columns = [
      { field: 'TLT_No', header: '專櫃編號' },
      { field: 'TLT_Name', header: '專櫃名稱' },
      { field: 'TLT_BDate', header: '合約起始日期', format: formatDate },
      { field: 'TLT_EDate', header: '合約結束日期', format: formatDate },
      { field: meterConfig.field as string, header: meterConfig.header },
      { field: 'Contract_No', header: '合約編號' },
      { field: 'Contract_SubNo', header: '合約版次' },
    ];
  }

  private formatContractYM(value: Date | string | null): string {
    if (!value) return '';

    if (value instanceof Date && !isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      return `${year}${month}`;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/\D/g, '');
      if (normalized.length >= 6) {
        return normalized.substring(0, 6);
      }
    }

    return '';
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const body: ASS21060Query = {
        ContractYM: this.formatContractYM(raw.ContractYM),
        MeterTypes: raw.ENG_Type ? [raw.ENG_Type] : [],
        TLT_NoStart: raw.TLT_NoStart?.trim() || null,
        TLT_NoEnd: raw.TLT_NoEnd?.trim() || null,
        TLT_Name: raw.TLT_Name?.trim() || null,
        Contract_No: raw.Contract_No?.trim() || null,
        Contract_SubNo: raw.Contract_SubNo?.trim() || null,
        pageSize: raw.pageSize,
        pageIndex: raw.pageIndex,
        SortBy: raw.SortBy
      };

      this.service.queryASS21060(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe((res: BaseQueryResponse<ASS21060Data>) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}