import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { FIN15070Service } from '../../../service/api/fin/fin15070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { QueryYearMonthComponent } from './query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin15070',
  standalone: true,
  templateUrl: './fin15070.component.html',
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
export class FIN15070Component extends BasicQueryPageComponent<any> implements OnInit {

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  queryForm = this.formBuilder.group({
    DeclareMonth: [null, Validators.required],
    SaleDateStart: [this.yesterday, Validators.required],
    SaleDateEnd: [this.yesterday, Validators.required],
    ...createPaginationConfig,
  });

  columnGroup = [
    { header: '銷售日期', field: 'SaleDate' },
    { header: '折扣別報表(A)', field: 'A' },
    { header: 'A-(B-B2)', field: 'A-B+B2', visible: true, style: 'text-right', format: this.moneyFormat },
    { header: '日結傳票(B)', field: 'B' },
    { header: '已開券類溢收', field: 'B5Group' },
    { header: '(B+B1)-(C+C2)-C3', field: 'B+B1-C-C2-C3', visible: true, style: 'text-right', format: this.moneyFormat },
    { header: '型態別報表(C)', field: 'C' },
    { field: 'C4', header: '無發票號碼(C1)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '已開支付(C2)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '--(C3)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '(C-C1)-D', visible: true, style: 'text-right', format: this.moneyFormat },
    { header: '二電/二收/二手(D)', field: 'D1Group' },
    { header: '三電/三手(D)', field: 'D3Group' },
    { header: '二收跨日作廢(D)', field: 'D5Group' },
    { header: '二收退貨(D)', field: 'D7Group' },
  ];

  columns = [
    { field: 'SaleDate', header: '銷售日期', visible: true },

    { field: 'A1', header: '應稅未稅金額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'A2', header: '稅額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'A3', header: '免稅金額', groupField: 'A', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'A-B+B2', header: 'A-(B-B2)', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'B1', header: '銷貨收入', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'B2', header: '銷項稅額', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'B3', header: '備抵稅額', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'B4', header: '預售貨款', groupField: 'B', visible: true, style: 'text-right', format: this.moneyFormat },


    { field: 'B5', header: '未稅B1', groupField: 'B5Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'B6', header: '稅額B2', groupField: 'B5Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'B+B1-C-C2-C3', header: '(B+B1)-(C+C2)-C3', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'C1', header: '應稅未稅金額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C2', header: '稅額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C3', header: '免稅金額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C4', header: '零稅金額', groupField: 'C', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'C4', header: '無發票號碼(C1)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '已開支付(C2)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '--(C3)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'C5', header: '(C-C1)-D', visible: true, style: 'text-right', format: this.moneyFormat },


    { field: 'D1', header: '應稅', groupField: 'D1Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D2', header: '免稅', groupField: 'D1Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D2', header: '零稅', groupField: 'D1Group', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'D1', header: '應稅未稅', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D2', header: '應稅', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D3', header: '免稅', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D4', header: '零稅', groupField: 'D3Group', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'D5', header: '應稅', groupField: 'D5Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D6', header: '免稅', groupField: 'D5Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D4', header: '零稅', groupField: 'D5Group', visible: true, style: 'text-right', format: this.moneyFormat },

    { field: 'D7', header: '應稅', groupField: 'D7Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D8', header: '免稅', groupField: 'D7Group', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'D4', header: '零稅', groupField: 'D7Group', visible: true, style: 'text-right', format: this.moneyFormat },
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

      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
}
