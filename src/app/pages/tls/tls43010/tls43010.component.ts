import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { QueryTls43010Response, Tls43010Service } from '@service/api/tls/tls43010.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';

// 2.4.3.1 訊息登錄作業
@Component({
  selector: 'app-tls43010',
  templateUrl: './tls43010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    CalendarRangeComponent
  ]
})
export class TLS43010Component extends BasicQueryPageComponent<QueryTls43010Response> implements OnInit {
  queryForm = this.formBuilder.group({
    // POS50011 廣告資訊設定檔
    NOT_No: ['', [Validators.maxLength(20)]], // 通告編號
    NOT_Date: [null as null | Date], // 建立日期
    NOT_BegDate_Start: [null as null | Date], // 有效開始日期
    NOT_BegDate_End: [null as null | Date], // 有效開始日期
    NOT_EndDate_Start: [null as null | Date], // 有效結束日期
    NOT_EndDate_End: [null as null | Date], // 有效結束日期
    NOT_File: ['', [Validators.maxLength(200)]], // 媒體檔案名稱
    NOT_Status: [null, [Validators.maxLength(1)]], // 狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    ...createPaginationConfig([{ field: 'NOT_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: QueryTls43010Response[] = [];
  selectedItems: QueryTls43010Response[] = [];
  columns: Column[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '建立日期', visible: true },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
  ];
  NOT_Status_Options: { value: string, label: string }[] = [ // 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];
  constructor(
    private tls43010Service: Tls43010Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS43010', '/TLS/TLS43010CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }
      this.tls43010Service.queryTls43010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
}
