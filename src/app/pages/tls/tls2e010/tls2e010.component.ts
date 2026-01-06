import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, convertDateToYYYYMM, formatAmount, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { Tls2e010Data, Tls2e010QueryBody, Tls2e010Service } from './../../../service/api/tls/tls2e010.service';

// 2.2.14.1 專櫃租金結算作業
@Component({
  selector: 'app-tls2e010',
  templateUrl: './tls2e010.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, DropdownComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, CalendarRangeComponent, TranslateModule]
})
export class TLS2E010Component extends BasicQueryPageComponent<Tls2e010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date()], // 租金結算年月
    tlt_no: [null], // 單一專櫃查詢
    sam_yyymm_start: [new Date()], // 起迄年月
    sam_yyymm_end: [new Date()], // 起迄年月
    PageSize: [30],
    PageIndex: [1],
  });
  tlt_noOptions$ = this.dropdown.queryTltTalent();
  totalRecords = 0;
  lastQueryBody: Tls2e010QueryBody | null = null;
  footerData: Tls2e010Data | null = null;
  data: Tls2e010Data[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'sam_yyymm', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'rent_net', header: '未稅金額', visible: true, format: formatAmount },
    { field: 'rent_tax', header: '稅額', visible: true, format: formatAmount },
    { field: 'rent_amt', header: '總金額', visible: true, format: formatAmount },
  ];

  constructor(
    public readonly tls2e010Service: Tls2e010Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E010');
  }

  onSubmit(frm: FormGroup) {
    const sam_yyymm_start = frm.value.sam_yyymm_start;
    const sam_yyymm_end = frm.value.sam_yyymm_end;
    if (!sam_yyymm_start || !sam_yyymm_end) {
      return this.messageService.errorBubble('「起迄年月｣不能為空，請選擇「起迄年月」');
    }
    this.loading = true;
    const body = {
      PageSize: frm.value.PageSize,
      PageIndex: frm.value.PageIndex,
      tlt_no: frm.value.tlt_no,
      sam_yyymm_start: convertDateToYYYYMM(frm.value.sam_yyymm_start),
      sam_yyymm_end: convertDateToYYYYMM(frm.value.sam_yyymm_end),
    }
    this.tls2e010Service.queryTls2e010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.data = res.Data
      this.lastQueryBody = body;
      this.footerData = res.total
      this.totalRecords = res.TotalCount || 0;
    })
  }
  onSettle(frm: FormGroup) {
    const sam_yyymm = frm.value.sam_yyymm;
    if (!sam_yyymm) {
      return this.messageService.errorBubble('「租金結算年月」不能為空，請選擇「租金結算年月」');
    }
    this.loading = true;
    const body = {
      tlt_no: frm.value.tlt_no,
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
    }
    this.tls2e010Service.executeTls2e010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Data.ErrMsg);
    })
  }
  lockLoding = false;
  onLock(frm: FormGroup) {
    this.lockLoding = true;
    const body = {
      ...frm.value,
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      money_type: "30",
      sam_termno: "1"
    }
    this.tls2e010Service.lockTls2e010(body).pipe(finalize(() => this.lockLoding = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message)
    })
  }
}
