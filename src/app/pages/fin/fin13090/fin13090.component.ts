import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { createPaginationConfig, formatDate } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-fin13090',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextRangeComponent,
    TableComponent,
    ButtonModule,
  ],
  templateUrl: './fin13090.component.html'
})
export class FIN13090Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    VoucherNo_No_S: [null], // 傳票編號_起
    VoucherNo_No_E: [null], // 傳票編號_迄
    VoucherDate_S: [null], // 傳票日期_起
    VoucherDate_E: [null], // 傳票日期_迄

    ...createPaginationConfig([{ field: 'VoucherNo', order: 1 }]),
  });

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'VoucherNo', header: '傳票編號', visible: true },
    { field: 'VoucherDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'VoucherStatus', header: '傳票狀態', visible: true },
    // { field: 'SaleAmt', header: '折讓金額', visible: true, align: 'right', format: (v: number | string) => formatAmount(v) },
    // { field: 'INV_Cancel', header: '折讓狀態', visible: true, format: (v: string) => v === 'Y' ? '作廢' : v === 'N' ? '開立' : v }
  ];

  constructor(
    private fin13080Service: Fin13080Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13090', '/FIN/FIN13090cru', this.queryForm, (form) => this.onSubmit(form));

    // 操作說明:
    // 1.輸入查詢條件後,按查詢
    // 2.點選列表資料後,顯示列表明細畫面進行輸入
  }

  onSubmit(form: FormGroup): void {
    console.log('補登進項稅額作業_request:', JSON.stringify(form.value, null, 2));
    this.handleSubmit(form, () => {
      this.loading = false;
      // this.fin29030Service.queryFIN29030(frm.value).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
      //   this.lastQueryBody = frm.value;
      //   this.data = response.Data;
      //   this.footerData = response.Totals;
      //   this.subtotalData = response.SubTotals;
      //   this.totalRecords = response.TotalCount ?? this.data.length;
      // });
    });
  }
}
