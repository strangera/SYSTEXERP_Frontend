import { DatePipe, NgStyle } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTls43020Request, QueryTls43020Response, Tls43020Service } from '@service/api/tls/tls43020.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AddButton, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
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
    Button,
    TooltipModule,
    NgStyle
  ]
})
export class TLS43020Component extends BasicQueryPageComponent<QueryTls43020Response> implements OnInit {
  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;

  queryForm = this.formBuilder.nonNullable.group({
    NOT_No: ['', [Validators.maxLength(20)]],
    NOT_Date: [null as null | Date],
    NOT_BegDate: [null as null | Date],
    NOT_EndDate: [null as null | Date],
    NOT_File: ['', [Validators.maxLength(200)]],
    NOT_Status: ['0'],
    pageSize: [500],
    pageIndex: [1],
    SortBy: [[{ field: 'NOT_No', order: 1 }]],
  });

  totalRecords = 0;
  data: QueryTls43020Response[] = [];
  lastQueryBody: QueryTls43020Request | null = null;

  selectedRows: QueryTls43020Response[] = [];

  // 各按鈕的獨立 Loading 狀態
  downloadLoading = false;
  verifyLoading = false;
  unverifyLoading = false;

  /**
   * 控制批次審核按鈕是否要 disabled
   * 規則：沒選資料，或者選中的資料中只要有任何一筆「不是未審核(0)」，就禁用。
   */
  get isVerifyDisabled(): boolean {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      return true;
    }
    // 必須全部都是 0 (未審核) 才能按審核
    return !this.selectedRows.every(row => row.NOT_Status === '0');
  }

  /**
   * 控制批次反審核按鈕是否要 disabled
   * 規則：沒選資料，或者選中的資料中只要有任何一筆「不是已審核(1)」，就禁用。
   */
  get isUnverifyDisabled(): boolean {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      return true;
    }
    // 必須全部都是 1 (已審核) 才能按反審核
    return !this.selectedRows.every(row => row.NOT_Status === '1');
  }

  /**
   * 控制補下傳按鈕是否要 disabled
   * 規則：沒選資料就禁用（下傳通常不限狀態，只要有選就能補傳，或是已審核才能傳，這裡比照你原本的邏輯：只要有選就能按）
   */
  get isDownloadDisabled(): boolean {
    return !this.selectedRows || this.selectedRows.length === 0;
  }

  columns: ReportColumn[] = [
    { field: 'NOT_No', header: '通告編號', visible: true },
    { field: 'NOT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'NOT_BegDate', header: '有效開始日期時間', visible: true, format: formatDate },
    { field: 'NOT_EndDate', header: '有效結束日期時間', visible: true, format: formatDate },
    { field: 'NOT_File', header: '媒體檔案名稱', visible: true },
    { field: 'NOT_Status', header: '狀態', visible: true, format: (v: string) => this.NOT_Status_Options.find(o => o.value == v)?.label || v },
    { field: 'NOT_Priority', header: '優先順序', visible: true },
  ];

  NOT_Status_Options: { value: string, label: string }[] = [
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
    { value: '2', label: '已刪除' },
  ];

  // 改為批次多選後，清空 row-level 的操作按鈕
  addButton: AddButton[] = [];

  constructor(
    public readonly tls43020Service: Tls43020Service,
    private readonly datePipe: DatePipe,
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
        NOT_Date: this.datePipe.transform(frm.value.NOT_Date, 'yyyy-MM-dd') || null,
        NOT_BegDate: this.datePipe.transform(frm.value.NOT_BegDate, 'yyyy-MM-dd') || null,
        NOT_EndDate: this.datePipe.transform(frm.value.NOT_EndDate, 'yyyy-MM-dd') || null
      };
      this.tls43020Service.queryTls43020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount || 0;
        this.selectedRows = [];
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  /**
   * 批次審核 / 反審核功能處理函式 (完全對標後端傳入規格)
   * @param action 'verify' | 'unverify'
   */
  onAction(action: 'verify' | 'unverify') {
    let params: any = {};
    const isAll = this.tableReport?.isAllSelected;

    if (isAll) {
      params = {
        IsAllSelected: true,
        QueryConditions: this.lastQueryBody
      };
    } else {
      params = {
        IsAllSelected: false,
        // 後端接收的是 ActionDetailItem 陣列
        ExportDetails: this.selectedRows.map((item) => ({
          ID: item.ID,
          STO_No: item.STO_No,
          NOT_No: item.NOT_No
        }))
      };
    }

    let serviceCall: Observable<any>;
    if (action === 'verify') {
      this.verifyLoading = true;
      serviceCall = this.tls43020Service.verifyTls43020(params).pipe(finalize(() => this.verifyLoading = false));
    } else {
      this.unverifyLoading = true;
      serviceCall = this.tls43020Service.unverifyTls43020(params).pipe(finalize(() => this.unverifyLoading = false));
    }

    serviceCall.pipe(untilDestroyed(this)).subscribe((response) => {
      this.messageService.successBubble(response.Message || `${action === 'verify' ? '審核' : '反審核'}作業處理完畢`);
      this.selectedRows = [];
      this.onSubmit(this.queryForm);
    });
  }

  // 下傳功能處理函式保持不變
  onDownload() {
    let params: any = {};
    if (this.tableReport?.isAllSelected) {
      params = {
        IsAllSelected: true,
        QueryConditions: this.lastQueryBody
      };
    } else {
      params = {
        IsAllSelected: false,
        ExportDetails: this.selectedRows.map((item) => ({ ID: item.ID, STO_No: item.STO_No, NOT_No: item.NOT_No }))
      };
    }
    this.downloadLoading = true;
    this.tls43020Service.downloadTls43020(params)
      .pipe(finalize(() => this.downloadLoading = false), untilDestroyed(this))
      .subscribe((response) => {
        this.messageService.successBubble(response.Message || '下傳成功');
        this.selectedRows = [];
        this.onSubmit(this.queryForm);
      });
  }
}
