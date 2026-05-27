import { NgStyle } from '@angular/common'; // <-- 確保引入，HTML 的按鈕有用到
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTls43020Request, QueryTls43020Response, Tls43020Service } from '@service/api/tls/tls43020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AddButton, formatDate, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button'; // <-- 確保引入 p-button
import { TooltipModule } from 'primeng/tooltip'; // <-- 確保引入 pTooltip
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
    TableReportComponent,
    TranslateModule,
    CalendarRangeComponent,
    Button,        // <-- 新增
    TooltipModule, // <-- 新增
    NgStyle        // <-- 新增
  ]
})
export class TLS43020Component extends BasicQueryPageComponent<QueryTls43020Response> implements OnInit {
  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;
  queryForm = this.formBuilder.nonNullable.group({
    NOT_No: ['', [Validators.maxLength(20)]],
    NOT_Date: [null as null | Date],
    NOT_BegDate_Start: [null as null | Date],
    NOT_BegDate_End: [null as null | Date],
    NOT_EndDate_Start: [null as null | Date],
    NOT_EndDate_End: [null as null | Date],
    NOT_File: ['', [Validators.maxLength(200)]],
    NOT_Status: [null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'NOT_No', order: 1 }]],
  });

  totalRecords = 0;
  data: QueryTls43020Response[] = [];
  lastQueryBody: QueryTls43020Request | null = null;

  // 新增：用來記錄勾選的資料與按鈕 Loading 狀態
  selectedRows: QueryTls43020Response[] = [];
  downloadLoading = false;

  columns: ReportColumn[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true, format: formatDateTime },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true, format: formatDateTime },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true, format: (v: string) => this.NOT_Status_Options.find(o => o.value == v)?.label || v },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
  ];

  NOT_Status_Options: { value: string, label: string }[] = [
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];

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
    public readonly tls43020Service: Tls43020Service,
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
      this.tls43020Service.queryTls43020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount || 0;
        this.selectedRows = []; // 重新查詢時清空已選取欄位
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  btnLoading = false;
  statusChange(rowData: QueryTls43020Response, status: string) {
    this.btnLoading = true;
    const requestBody = { ID: rowData.ID, NOT_No: rowData.NOT_No, NOT_Status: status };
    let serviceCall: Observable<any>;
    if (status === "1") {
      serviceCall = this.tls43020Service.verifyTls43020(requestBody);
    } else {
      serviceCall = this.tls43020Service.unverifyTls43020(requestBody);
    }
    serviceCall.pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message || '更新成功');
      this.onSubmit(this.queryForm);
    });
  }

  // 新增：下傳功能處理函式
  onDownload() {
    let params: any = {};

    // 判斷使用者是否勾選了「全選」
    if (this.tableReport && this.tableReport.isAllSelected) {
      params = {
        IsAllSelected: true,
        // 將上一次成功的查詢條件解構進來 (包含通告編號、日期、起迄時間等)
        QueryConditions: this.lastQueryBody
      };
    } else {
      params = {
        IsAllSelected: false,
        ExportDetails: this.selectedRows.map((item) => ({
          ID: item.ID,
          STO_No: item.STO_No,
          NOT_No: item.NOT_No
        }))
      };
    }

    this.downloadLoading = true;
    this.tls43020Service.downloadTls43020(params)
      .pipe(
        finalize(() => this.downloadLoading = false),
        untilDestroyed(this)
      )
      .subscribe((response) => {
        this.messageService.successBubble(response.Message || '下傳成功');
        this.selectedRows = []; // 清空選取
        this.onSubmit(this.queryForm); // 重新整理查詢畫面
      });
  }
}
