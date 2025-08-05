import { Component } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { HttpClient } from '@angular/common/http';
import { FIN15070Service } from '../../../service/api/fin/fin15070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { QueryYearMonthComponent } from '@shared/componentkit/query-year-month/query-year-month.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';

@Component({
  selector: 'app-fin15070',
  standalone: true,
  templateUrl: './fin15070.component.html',
  styleUrls: ['./fin15070.component.scss'],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    QueryYearMonthComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    CalendarRangeComponent
  ],
})
export class FIN15070Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    DeclareMonth: [null, Validators.required],
    SaleDateStart: [new Date('2024-01-01'), Validators.required],
    SaleDateEnd: [new Date('2024-01-31'), Validators.required],
    ...createPaginationConfig,
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
columnGroup = [
  { header: '銷售日期', field: 'SaleDate' },
  { header: '折扣後稅收(A)', field: 'A' },
  { header: '日結發票(B)', field: 'B' },
  { header: '已帳銷貨收入', field: 'B5Group' },
  { header: '差異稅務稅收(C)', field: 'C' },
  { header: '零用金票據(C1)', field: 'C1Group' },
  { header: '三聯二收/三手(D)', field: 'D1Group' },
  { header: '三聯三手(D)', field: 'D3Group' },
  { header: '三收據自備(D)', field: 'D5Group' },
  { header: '三收據(D)', field: 'D7Group' },
];

columns = [
  { field: 'SaleDate', header: '銷售日期', visible: true },

  { field: 'A1', header: '應稅未稅金額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'A2', header: '稅額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'A3', header: '免稅金額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'A4', header: 'A-(B2)', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'B1', header: '發票收入', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'B2', header: '發票稅額', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'B3', header: '應稅發票', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'B4', header: '免稅發票', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'B5', header: '應稅收入', groupField: 'B5Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'B6', header: '免稅收入', groupField: 'B5Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'B7', header: '稅額B2', groupField: 'B5Group', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'C1', header: '應稅未稅金額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'C2', header: '稅額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'C3', header: '免稅金額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'C4', header: '已帳支付(C2)', groupField: 'C1Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'C5', header: '(C-C1)-D', groupField: 'C1Group', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'D1', header: '應稅', groupField: 'D1Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'D2', header: '免稅', groupField: 'D1Group', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'D3', header: '應稅未稅', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'D4', header: '稅額', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'D5', header: '應稅', groupField: 'D5Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'D6', header: '免稅', groupField: 'D5Group', visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'D7', header: '應稅', groupField: 'D7Group', visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'D8', header: '免稅', groupField: 'D7Group', visible: true, style: 'text-right', format: this.moneyFormat },
];



  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  constructor(
    private fin15070Service: FIN15070Service,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15070', '', this.queryForm, () => this.onSubmit());
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const formValue = this.queryForm.value;
const payload = {
  DeclareMonth:
    (formValue as any).DeclareMonth instanceof Date
      ? (formValue as any).DeclareMonth.toISOString().slice(0, 7)
      : '',

  SaleDateStart:
    (formValue as any).SaleDateStart instanceof Date
      ? (formValue as any).SaleDateStart.toISOString()
      : '',

  SaleDateEnd:
    (formValue as any).SaleDateEnd instanceof Date
      ? (formValue as any).SaleDateEnd.toISOString()
      : '',
};


    this.loading = true;
    this.messageService.blockUi();

    this.fin15070Service.queryFIN15070({ request: payload }).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
}
