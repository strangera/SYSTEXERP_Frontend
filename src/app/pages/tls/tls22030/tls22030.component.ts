import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { Tls22030Service } from '../../../service/api/tls/tls22030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls22030.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, AccordionModule, FormsModule, ButtonModule, ReactiveFormsModule, CalendarRangeQuickComponent, MultiSelectComponent, RadiobuttonComponent, ButtonComponent, TableReportComponent, DropdownComponent, TranslateModule],
  styles: [
    `
    :host ::ng-deep {
      .loss-error {
        background-color: #ffcccc !important; // 淺紅背景
        color: #d32f2f !important;           // 深紅文字
        font-weight: bold;
      }
    }
    `
  ]
})
export class TLS22030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [null],
    TLT_NoList: [null],
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    IsLossStatus: [null], // 預設值為 '0000'，表示全部
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });
  data: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  tltNoOptions = this.dropDown.queryTltTalent();
  ECRNoOptions = this.dropDown.queryPos1002();
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '日期' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'MIN_TXN_No', header: '後台交易起號', format: v => v.toString().padStart(6, '0') }, // 不足六位數的交易號前面補零
    { field: 'MAX_TXN_No', header: '後台交易迄號', format: v => v.toString().padStart(6, '0') },
    { field: 'SLE_TxnBegNo', header: '前台清機起號' },
    { field: 'SLE_TxnEndNo', header: '前台清機迄號' },
    { field: 'SLE_GUIBegNo', header: '發票起始(起)' },
    { field: 'SLE_GUIEndNo', header: '發票結束(迄)' },
    {
      field: 'IsPerDayLoss',
      header: '當日是否欠落',
      format: val => val === '1' ? '有' : '無',
      // 新增：判斷如果值為 '1' (有欠落)，則回傳 CSS class 名稱
      cellClass: (rowData) => rowData.IsPerDayLoss === '1' ? 'loss-error' : ''
    },
    {
      field: 'IsCrossDayLoss',
      header: '跨日是否欠落',
      format: val => val === '1' ? '有' : '無',
      // 新增：同理處理跨日欠落
      cellClass: (rowData) => rowData.IsCrossDayLoss === '1' ? 'loss-error' : ''
    }
  ];
  btnLoading = false;
  displayConditionOptions: any[] = [];
  tlt_no?: string;

  constructor(
    public readonly tls22030Service: Tls22030Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22030');
  }

  onExportExcel(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls22030Service.exportTLS22030(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls22030Service.exportTLS22030PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const payload = {
        ...raw,
        TXN_DateStart: this.datePipe.transform(raw.TXN_DateStart, 'yyyy/MM/dd'),
        TXN_DateEnd: this.datePipe.transform(raw.TXN_DateEnd, 'yyyy/MM/dd'),
      };
      this.tls22030Service.queryTLS22030(payload).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.historyRequestBody = payload;
      });
    });
  }
}
