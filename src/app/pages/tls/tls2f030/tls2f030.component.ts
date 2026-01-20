import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { QueryTLS2F030Response, Tls2f030Service } from '../../../service/api/tls/tls2f030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmount, formatYYYYMM } from '../../../shared/componentkit/table/table.model';

// 2.2.15.3 專櫃進項發票未開立查詢作業
@Component({
  selector: 'app-tls2f030',
  templateUrl: './tls2f030.component.html',
  styleUrl: './tls2f030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class TLS2F030Component extends BasicQueryPageComponent<QueryTLS2F030Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null as Date | null, [Validators.required]], // 結帳年月
    money_type: [null as string | null], // 結帳方式
    floor_no: [[] as string[]], // 樓層
    // 分頁欄位
    pageSize: [20],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  // 表格資料
  data: QueryTLS2F030Response[] = [];
  totalRecords = 0;

  // 總計資料
  footerData: Partial<QueryTLS2F030Response> = {};

  // 表格欄位定義
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃代碼', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'sam_yyymm', header: '結帳年月', visible: true, format: formatYYYYMM },
    { field: 'money_type_desc', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'sam_ap_namt', header: '未稅金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'sam_ap_tax', header: '稅額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'sam_ap_amt', header: '應開立發票金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'balance', header: '餘額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'status', header: '狀況', visible: true },
  ];

  // 下拉選項
  money_typeOptions = getSYS1000Options('money_type');
  floor_noOptions = this.dropdown.querySys3900();

  constructor(
    private readonly tls2f030Service: Tls2f030Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F030', undefined, this.queryForm, (form) => this.onSubmit(form));
  }

  private formatYearMonth(value: Date | null): string | null {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();

      const payload = {
        PageSize: rawValue.pageSize,
        PageIndex: rawValue.pageIndex,
        SortBy: rawValue.SortBy,
        sam_yyymm: this.formatYearMonth(rawValue.sam_yyymm),
        money_type: rawValue.money_type,
        floor_no: rawValue.floor_no || [],
      };

      this.tls2f030Service.queryTLS2F030(payload)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => {
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

          // 計算總計
          this.calculateFooterData();
        });
    });
  }

  // 計算總計資料
  private calculateFooterData(): void {
    this.footerData = {
      sam_ap_namt: this.data.reduce((sum, item) => sum + (item.sam_ap_namt || 0), 0),
      sam_ap_tax: this.data.reduce((sum, item) => sum + (item.sam_ap_tax || 0), 0),
      sam_ap_amt: this.data.reduce((sum, item) => sum + (item.sam_ap_amt || 0), 0),
      balance: this.data.reduce((sum, item) => sum + (item.balance || 0), 0),
    };
  }
}
