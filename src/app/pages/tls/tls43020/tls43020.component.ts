import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTls43020Response, Tls43020Service } from '@service/api/tls/tls43020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig, formatDate, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-tls43020',
  templateUrl: './tls43020.component.html',
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
export class TLS43020Component extends BasicQueryPageComponent<QueryTls43020Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
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
  data: QueryTls43020Response[] = [];
  columns: Column[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true, format: formatDateTime },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true, format: formatDateTime },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true, format: (v: string) => this.NOT_Status_Options.find(o => o.value == v)?.label || v },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
  ];
  NOT_Status_Options: { value: string, label: string }[] = [ // 0=未確認(未審核) 1=已確認(已審核) 2=已刪除
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];
  // 加入審核 反審核按鈕
  addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: QueryTls43020Response) => { this.statusChange(rowData, "1"); },
      disabled: (rowData: QueryTls43020Response) => rowData.NOT_Status == "1" || rowData.NOT_Status == "2"
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: QueryTls43020Response) => { this.statusChange(rowData, "0"); },
      disabled: (rowData: QueryTls43020Response) => rowData.NOT_Status == "0" || rowData.NOT_Status == "2"
    },
  ];

  constructor(
    private tls43020Service: Tls43020Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS43020', '/TLS/TLS43020CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        NOT_Date: frm.value.NOT_Date ? frm.value.NOT_Date.toISOString() : null,
        NOT_BegDate_Start: frm.value.NOT_BegDate_Start ? frm.value.NOT_BegDate_Start.toISOString() : null,
        NOT_BegDate_End: frm.value.NOT_BegDate_End ? frm.value.NOT_BegDate_End.toISOString() : null,
        NOT_EndDate_Start: frm.value.NOT_EndDate_Start ? frm.value.NOT_EndDate_Start.toISOString() : null,
        NOT_EndDate_End: frm.value.NOT_EndDate_End ? frm.value.NOT_EndDate_End.toISOString() : null
      };

      this.loading = true;
      this.tls43020Service.queryTls43020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = Array.isArray(res.Data) ? res.Data.flat() : [];
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  btnLoading = false;
  statusChange(rowData: QueryTls43020Response, status: string) {
    this.btnLoading = true;
    const requestBody = {
      ID: rowData.ID,
      NOT_No: rowData.NOT_No,
      NOT_Status: status
    };

    let serviceCall: Observable<any>;
    if (status === "1") {
      serviceCall = this.tls43020Service.verifyTls43020(requestBody);
    } else {
      serviceCall = this.tls43020Service.unverifyTls43020(requestBody);
    }

    serviceCall.pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message || '更新成功');
      this.onSubmit(this.queryForm); // 更新成功後重新查詢
    });
  }
}
