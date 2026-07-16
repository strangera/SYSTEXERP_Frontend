import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

import { FIN13100Service } from '../../../service/api/fin/fin13100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../others/component/table/table.model';

interface FIN13100Row {
  VouNo: string;
  VouDate: string;
  PostFlag: string;
  PostFlagName: string;
  INV_DeclareYM?: string | null;
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
    ReactiveFormsModule,
    TranslateModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class FIN13100Component extends BasicQueryPageComponent<FIN13100Row> implements OnInit {
  queryForm = this.formBuilder.group({
    VouNoStart: [null as string | null],
    VouNoEnd: [null as string | null],
    VouDateStart: [new Date() as Date | null],
    VouDateEnd: [new Date() as Date | null],
    InvoiceStatus: [[]], // 發票狀態多選：Y=發票已入 N=發票未入 空=全部
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });

  invoiceStatusOptions = [
    { label: '發票已入', value: 'Y' },
    { label: '發票未入', value: 'N' },
  ];

  data: FIN13100Row[] = [];
  totalRecords = 0;
private getCurrentDeclareYM(): string {
  const now = new Date();
  const year = now.getFullYear();

  let month = now.getMonth() + 1;

  // 單數月歸到下一個雙數月
  if (month % 2 !== 0) {
    month++;
  }

  return `${year}${String(month).padStart(2, '0')}`;
}

editDisabled = (row: FIN13100Row): boolean => {
  const declareYM = row?.INV_DeclareYM;

  return !declareYM || declareYM < this.getCurrentDeclareYM();
};
  columns: Column[] = [
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

  private toDateString(v: Date | string | null | undefined): string | null {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
