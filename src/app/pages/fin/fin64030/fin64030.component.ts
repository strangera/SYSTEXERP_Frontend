import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize, map } from 'rxjs';
import { Fin64030Service, Fin64030UpdateRequest, QueryFIN64030Request, QueryFIN64030Row } from '../../../service/api/fin/fin64030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin64030',
  templateUrl: './fin64030.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    MenubarComponent, AccordionModule, ButtonModule, DialogModule,
    CalendarComponent,
    InputTextComponent, ButtonComponent, TableReportComponent,
    DialogComponent, MultiSelectComponent, CalendarRangeQuickComponent
  ],
  providers: [DatePipe]
})
export class FIN64030Component extends BasicQueryPageComponent<QueryFIN64030Row> implements OnInit {
  queryForm = this.formBuilder.group({
    CompanyAccNoList: [null, [Validators.required]],
    CashDateFrom: [null],
    CashDateTo: [null],
    ExpireDateFrom: [null],
    ExpireDateTo: [null],
    ChkNo: [null, [Validators.maxLength(10)]],
    pageSize: [30],
    pageIndex: [1],
  });

  // 兌現彈窗表單
  dialogQueryForm = this.formBuilder.group({
    CashDate: [this.datePipe.transform(new Date(), 'yyyy/MM/dd'), [Validators.required]]
  });

  data: QueryFIN64030Row[] = [];

  // 別忘了同步更新總筆數
  totalRecords = 0;
  selectedItems: QueryFIN64030Row[] = [];
  dialogVisible = false;
  dialogLoading = false;

  // 防呆：僅「託收(2)」狀態可勾選
  isRowSelectable = (row: QueryFIN64030Row) => row.IsSelectable === 'Y';

  columns: ReportColumn[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'BNK_No', header: '全省銀行代碼(含分行)' },
    { field: 'BNK_Name', header: '票面銀行名稱' },
    { field: 'CHK_ExpireDate', header: '到期日', format: formatDate },
    { field: 'CHK_Amt', header: '票面金額', format: formatAmount },
    { field: 'CHK_BNK_No', header: '託收銀行代碼(含分行)' },
    { field: 'VouNo_Expire', header: '到期傳票編號' },
    { field: 'CHK_Status_Name', header: '支票狀態' },
  ];

  companyAccOptions$ = this.dropDown.queryAps1002().pipe(
    map(options => options ? options.filter(opt => opt['BNK_AccType'] === '1') : null)
  );

  chkStatusOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
  ];

  constructor(
    private readonly fin64030Service: Fin64030Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN64030');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const raw = this.queryForm.getRawValue();
      const body: QueryFIN64030Request = { ...raw };

      this.fin64030Service.queryFIN64030(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount || 0;
        this.selectedItems = []; // 重新查詢後清空勾選
      });
    });
  }

  /** 執行兌現存檔 */
  saveDialog(frm: FormGroup) {
    if (frm.invalid || this.selectedItems.length === 0) return;
    const cashDate = frm.getRawValue().CashDate;
    // 額外檢查：兌現日需大於等於勾選資料中的最大到期日
    const invalidDate = this.selectedItems.some(item => {
      const expireDate = item.CHK_ExpireDate ? new Date(item.CHK_ExpireDate) : null;
      return expireDate && new Date(cashDate) < expireDate;
    });
    if (invalidDate) {
      this.messageService.errorBubble('兌現日需大於等於勾選資料中的最大到期日');
      return;
    }
    this.dialogLoading = true;
    const updateBody: Fin64030UpdateRequest = {
      IdList: this.selectedItems.map(item => item.ID),
      CashDate: cashDate
    };
    this.fin64030Service.updateFIN64030(updateBody).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe(res => {
      if (res.Status === '0000') {
        this.messageService.confirm({
          header: '兌現成功',
          message: res.Message || '兌現成功',
          showRejectButton: false,
          accept: () => {
            this.dialogVisible = false;
            this.onSubmit(this.queryForm); // 刷新清單
            this.selectedItems = [];
            this.dialogQueryForm.reset();
          },
        })
      }
    });
  }
}
