import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { QueryTLS45030Request, QueryTLS45030ResponseData, Tls45030Service } from '@service/api/tls/tls45030.service';
import { take, finalize } from 'rxjs'; // 加入 finalize
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DatePipe } from '@angular/common';

// 2.4.5.3 收銀機開關機時間表
@Component({
  selector: 'app-tls45030',
  templateUrl: './tls45030.component.html',
  standalone: true,
  imports: [CalendarRangeQuickComponent, MultiSelectComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS45030Component extends BasicQueryPageComponent<QueryTLS45030ResponseData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Txn_Date_Start: [new Date()],
    Txn_Date_End: [new Date()],
    ECR_No_List: [[]], // 多選清單使用陣列 []
    TLT_No_List: [[]], // 多選清單使用陣列 []
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }]), // 預設排序為交易日期 DESC
  });
  totalRecords = 0;
  data: QueryTLS45030ResponseData[] = [];
  columns: Column[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'USR_No', header: '收銀員編號', visible: true },
    { field: 'user_Name', header: '收銀員姓名', visible: true },
    { field: 'EOS_StartUpTime', header: '開機時間', visible: true, format: formatDate },
    { field: 'EOS_CloseTime', header: '清機時間', visible: true, format: formatDate },
  ];
  ECR_NoOptions: { No: string, Name: string, label: string; }[] = [];
  TLTTALENT_DropDownList: { No: string, Name: string, label: string; }[] = [];
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tls45030Service: Tls45030Service,
    private datePipe: DatePipe
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

      this.loading = true; // 顯示載入狀態
      this.tls45030Service.queryTLS45030(request).pipe(
        untilDestroyed(this),
        take(1), // 只取一次值就取消訂閱
        finalize(() => this.loading = false) // 無論成功或失敗都關閉載入
      ).subscribe(res => {
        if (res.Status === '0000') {
          this.data = res.Data;
          this.totalRecords = res.TotalCount || 0;
          this.messageService.successBubble(res.Message);
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.errorBubble(res.Message);
        }
      });
    });
  }
}
