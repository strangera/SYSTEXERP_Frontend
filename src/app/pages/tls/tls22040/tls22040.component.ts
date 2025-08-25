import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';

@Component({
  selector: 'app-tls22040',
  templateUrl: './tls22040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    ...createPaginationConfig([{ field: 'PAY_Name', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true },
    { field: 'MIG_Type', header: '發票類型', visible: true },
    { field: 'MIG_Type_Name', header: '發票類型名稱', visible: true },
    { field: 'InvoiceNum', header: '發票筆數', visible: true },
    { field: 'UpMaxNum', header: '上送最大筆數', visible: true },
    { field: 'LastBagTime', header: '最後產檔案時間', visible: true },
    { field: 'LastUpTime', header: '最後上送時間', visible: true },
    { field: 'DiffNum', header: '差異筆數', visible: true },
  ];


  constructor(private tls22040Service: Tls22040Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22040', 'TLS/TLS22040', this.queryForm, (form) =>
      this.onSubmit(form)
    );
  }
  // 格式化函式
  private formatToYMD(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {

      const parts = dateStr.split(' ')[0].replace(/\//g, '-'); // "2025-08-02"
      return parts;
    }
    return d.toISOString().split('T')[0]; // "2025-08-02"
  }

  /** 查詢主表 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const raw = frm.value;

      // 日期轉換 yyyy/MM/dd
      const formatDate = (d: any) =>
        d ? new Date(d).toISOString().split('T')[0].replace(/-/g, '/') : '';

      const payload = {
        PageSize: 0,
        PageIndex: 0,
        OrderBy: 'PAY_Name',
        Offset: 0,
        SortBy: [], // 後端不接受帶值，送空陣列
        TXN_DateStart: formatDate(raw.TXN_DateStart),
        TXN_DateEnd: formatDate(raw.TXN_DateEnd),
      };

      this.tls22040Service.queryTLS22040(payload).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((x: any) => ({
            ...x,
            TXN_Date: this.formatToYMD(x.TXN_Date),
            LastBagTime: this.formatToYMD(x.LastBagTime),
            LastUpTime: this.formatToYMD(x.LastUpTime),
          }));
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('查詢 TLS22040 失敗:', err);
          this.loading = false;
        },
      });
    });
  }

  /** 查詢明細，綁定到 [onDetail] */
  override onDetail(row: any): void {
    if (!row) return;
    this.tls22040Service
      .queryTLS22040_Detail({ PAY_Name: row.PAY_Name })
      .subscribe({
        next: (res) => {
          row.details = res?.Data ?? [];
        },
        error: (err) => {
          console.error('查詢 TLS22040_Detail 失敗:', err);
        },
      });
  }
}
