import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS45030Request, QueryTLS45030ResponseData, Tls45030Service } from '@service/api/tls/tls45030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs'; // 加入 finalize
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

// 2.4.5.3 收銀機開關機時間表
@Component({
  selector: 'app-tls45030',
  templateUrl: './tls45030.component.html',
  standalone: true,
  imports: [CalendarRangeQuickComponent, MultiSelectComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, ButtonComponent, TableReportComponent, TranslateModule]
})
export class TLS45030Component extends BasicQueryPageComponent<QueryTLS45030ResponseData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Txn_Date_Start: [new Date()],
    Txn_Date_End: [new Date()],
    ECR_No_List: [[]], // 多選清單使用陣列 []
    TLT_No_List: [[]], // 多選清單使用陣列 []
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'TXN_Date', order: -1 }]],
  });
  totalRecords = 0;
  data: QueryTLS45030ResponseData[] = [];
  lastQueryBody: QueryTLS45030Request | null = null;
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'USR_No', header: '收銀員編號', visible: true },
    { field: 'user_Name', header: '收銀員姓名', visible: true },
    { field: 'EOS_StartUpTime', header: '開機時間', visible: true, format: formatDateTime },
    { field: 'EOS_CloseTime', header: '清機時間', visible: true, format: formatDateTime },
  ];
  ECR_NoOptions: { No: string, Name: string, label: string; }[] = [];
  TLTTALENT_DropDownList: { No: string, Name: string, label: string; }[] = [];
  constructor(
    private readonly dropDownList: DropDownListService,
    public readonly tls45030Service: Tls45030Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS45030', 'tls/tls45030cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownList.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLTTALENT_DropDownList = res.Data.map(item => ({
        ...item, label: `${item.No} - ${item.Name}`
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const formattedStartDate = this.datePipe.transform(formValue.Txn_Date_Start, 'yyyy-MM-dd');
      const formattedEndDate = this.datePipe.transform(formValue.Txn_Date_End, 'yyyy-MM-dd');
      const request: QueryTLS45030Request = {
        Txn_Date_Start: formattedStartDate,
        Txn_Date_End: formattedEndDate,
        ECR_No_List: formValue.ECR_No_List,
        TLT_No_List: formValue.TLT_No_List,
        PageIndex: formValue.pageIndex,
        PageSize: formValue.pageSize,
        SortBy: formValue.SortBy,
      };
      this.tls45030Service.queryTLS45030(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        if (res.Status === '0000') {
          this.data = res.Data;
          this.totalRecords = res.TotalCount || 0;
          this.lastQueryBody = request;
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble(res.Message);
        }
      });
    });
  }
}
