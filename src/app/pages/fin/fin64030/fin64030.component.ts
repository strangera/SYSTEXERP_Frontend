import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize, map } from 'rxjs';
import { Fin64030Service, Fin64030UpdateRequest, QueryFIN64030Request, QueryFIN64030Row } from '../../../service/api/fin/fin64030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-fin64030',
  templateUrl: './fin64030.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    MenubarComponent, AccordionModule, ButtonModule, DialogModule,
    CalendarComponent, DropdownComponent,
    InputTextComponent, ButtonComponent, TableReportComponent,
    DialogComponent, MultiSelectComponent, CalendarRangeComponent
  ],
  providers: [DatePipe]
})
export class FIN64030Component extends BasicQueryPageComponent<QueryFIN64030Row> implements OnInit {
  queryForm = this.formBuilder.group({
    CompanyAccNoList: [null, [Validators.required]],
    ExpireDateFrom: [null],
    ExpireDateTo: [null],
    ChkNo: [null, [Validators.maxLength(10)]],
    // --- 新增查詢條件 ---
    VouNoExpire: [null, [Validators.maxLength(20)]],
    ChkStatus: [null],
    pageSize: [30],
    pageIndex: [1],
  });

  // 兌現彈窗表單
  dialogQueryForm = this.formBuilder.group({
    CashDate: [new Date(), [Validators.required]]
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
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'CHK_ExpireDate', header: '到期日', format: formatDate },
    { field: 'CHK_Amt', header: '票面金額', format: formatAmount },
    { field: 'CHK_BNK_No', header: '託收帳號' },
    { field: 'ColleDate', header: '託收日期', format: formatDate }, // 新增
    { field: 'Colle_BNK_AccNo', header: '託收銀行帳號' }, // 新增
    { field: 'VouNo_Expire', header: '到期傳票' },
    { field: 'CHK_Status_Name', header: '狀態' },
  ];

  companyAccOptions$ = this.dropDown.queryAps1002().pipe(
    map(options => options ? options : null)
  );

  chkStatusOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
    { value: 'R', label: '僅記錄' },
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
