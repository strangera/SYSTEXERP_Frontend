import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Tls2e060Data, Tls2e060Service } from '@service/api/tls/tls2e060.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';

// 2.2.14.6 專櫃結帳前調整作業
@Component({
  selector: 'app-tls2e060',
  templateUrl: './tls2e060.component.html',
  standalone: true,
  imports: [InputTextComponent, TableComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class TLS2E060Component extends BasicQueryPageComponent<Tls2e060Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    adj_no: [null, [Validators.maxLength(12)]],
    adj_date: [null],
    sam_yyymm: [null],
    ...createPaginationConfig([{ field: 'adj_no', order: 1 }]),
  });
  adj_taxtypeOptions = getSYS1000Options('adj_taxtype'); // 調整稅別選項
  totalRecords = 0;
  data: Tls2e060Data[] = [];
  columns: Column[] = [
    { field: 'adj_no', header: '調整單號', visible: true },
    { field: 'adj_date', header: '調整日期', visible: true },
    { field: 'sam_yyymm', header: '調整年月', visible: true, format: formatYYYYMM },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'contract_no', header: '契約編號', visible: true },
    { field: 'contrace_subno', header: '版次', visible: true },
    { field: 'adj_taxtype', header: '調整稅別', visible: true }, // 0=免稅, 1=應稅
    { field: 'adj_amount', header: '調整金額', visible: true },
  ];
  constructor(
    private readonly tls2e060Service: Tls2e060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E060', '/tls/tls2e060cru', this.queryForm, () => this.onSubmit(this.queryForm));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const adjDateValue: Date | null = frm.get('adj_date')?.value;
      let formattedAdjDate: string | null = null;

      if (adjDateValue) {
        // 關鍵步驟：
        // 1. 確保 value 是一個 Date 物件 (通常來自 datepicker)
        // 2. 將本地時間調整為 00:00:00 (通常不是必須，但更安全)
        adjDateValue.setHours(0, 0, 0, 0);

        // 3. 使用 formatDate 函式，指定格式 'yyyy-MM-dd' 和時區 'UTC'
        //    這強制將該日期物件視為 UTC 日期進行格式化，忽略本地時區。
        formattedAdjDate = formatDate(adjDateValue, 'yyyy-MM-dd', 'en-US', 'UTC');
      }

      const body = {
        ...frm.getRawValue(),
        sam_yyymm: convertDateToYYYYMM(frm.get('sam_yyymm')?.value),
        adj_date: formattedAdjDate, // 使用已校正的日期字串
      }

      this.tls2e060Service.queryTls2e060(body).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || 0;
      });
    });
  }
}
