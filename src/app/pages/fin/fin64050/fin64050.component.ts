import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { Fin64050Service, Fin64050UpdateRequest, QueryFIN64050Request, QueryFIN64050Row } from '../../../service/api/fin/fin64050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@UntilDestroy()
@Component({
  selector: 'app-fin64050',
  templateUrl: './fin64050.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    MenubarComponent, AccordionModule, ButtonModule, DialogModule,
    CalendarRangeQuickComponent, CalendarComponent, InputTextComponent,
    ButtonComponent, TableReportComponent, DialogComponent,
  ],
  providers: [DatePipe]
})
export class FIN64050Component extends BasicQueryPageComponent<QueryFIN64050Row> implements OnInit {
  queryForm = this.formBuilder.group({
    BackDateFrom: [null],
    BackDateTo: [null],
    ChkNo: [null, [Validators.maxLength(10)]],
    pageSize: [30],
    pageIndex: [1],
  });

  dialogQueryForm = this.formBuilder.group({
    BackDate: [new Date(), Validators.required],
    CHK_Comment: [null, [Validators.maxLength(160)]],
  });

  data: QueryFIN64050Row[] = [
    {
      SEQ_NO: 1,
      ID: 1001,
      CHK_No: 'CH10000001',
      VEN_No: 'V001',
      VEN_Name: '測試供應商 A',
      BNK_No: '0040012',
      BNK_Name: '臺灣銀行-營業部',
      CHK_ExpireDate: '2026-02-10',
      CHK_Amt: 50000,
      CHK_BNK_No: '0070015',
      CHK_BackDate: '',
      Bounce_Tran_Status: '',
      Bounce_VouNo: '',
      Bounce_Comment: '',
      Bounce_RCV_No: '',
      CHK_Status: '2', // 託收
      CHK_Status_Name: '託收',
      IsSelectable: 'Y'
    },
    {
      SEQ_NO: 2,
      ID: 1002,
      CHK_No: 'CH10000002',
      VEN_No: 'V002',
      VEN_Name: '測試客戶 B',
      BNK_No: '8220010',
      BNK_Name: '中國信託-總行',
      CHK_ExpireDate: '2026-02-15',
      CHK_Amt: 125000,
      CHK_BNK_No: '0130020',
      CHK_BackDate: '2026-02-03',
      Bounce_Tran_Status: '1',
      Bounce_VouNo: 'VOU20260203001',
      Bounce_Comment: '存款不足',
      Bounce_RCV_No: 'RCV001',
      CHK_Status: '5', // 退票
      CHK_Status_Name: '退票',
      IsSelectable: 'N'
    },
    {
      SEQ_NO: 3,
      ID: 1003,
      CHK_No: 'CH10000003',
      VEN_No: 'V003',
      VEN_Name: '開發組測試行',
      BNK_No: '0170001',
      BNK_Name: '兆豐銀行',
      CHK_ExpireDate: '2026-01-20',
      CHK_Amt: 8800,
      CHK_BNK_No: '0040012',
      CHK_BackDate: '',
      Bounce_Tran_Status: '',
      Bounce_VouNo: '',
      Bounce_Comment: '',
      Bounce_RCV_No: '',
      CHK_Status: '3', // 兌現
      CHK_Status_Name: '兌現',
      IsSelectable: 'N'
    }
  ];
  totalRecords = 0;
  selectedItems: QueryFIN64050Row[] = [];
  dialogVisible = false;
  dialogLoading = false;

  // 防呆：僅「非兌現(3)且非退票(5)」狀態可勾選
  isRowSelectable = (row: QueryFIN64050Row) => row.CHK_Status !== '3' && row.CHK_Status !== '5';

  columns: ReportColumn[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'BNK_No', header: '全省銀行代碼(含分行)' },
    { field: 'BNK_Name', header: '票面銀行名稱' },
    { field: 'CHK_ExpireDate', header: '到期日', format: formatDate },
    { field: 'CHK_Amt', header: '票面金額', format: formatAmount },
    { field: 'CHK_BNK_No', header: '銀行代碼' },
    { field: 'CHK_BackDate', header: '退票日', format: formatDate },
    { field: 'Bounce_Tran_Status', header: '退票傳票狀態' },
    { field: 'Bounce_VouNo', header: '退票傳票編號' },
    { field: 'Bounce_Comment', header: '退票傳票備註' },
    { field: 'Bounce_RCV_No', header: '退票傳票收據編號' },
    { field: 'CHK_Status_Name', header: '支票狀態' },
  ];

  constructor(
    private readonly fin64050Service: Fin64050Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN64050', 'fin/fin64050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const raw = this.queryForm.getRawValue();
      const body: QueryFIN64050Request = {
        ...raw,
        BackDateFrom: this.datePipe.transform(raw.BackDateFrom, 'yyyy-MM-dd') || '',
        BackDateTo: this.datePipe.transform(raw.BackDateTo, 'yyyy-MM-dd') || '',
      };
      this.fin64050Service.queryFIN64050(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount || 0;
        this.selectedItems = [];
      });
    });
  }

  saveDialog(form: FormGroup) {
    if (form.invalid || this.selectedItems.length === 0) return;

    this.dialogLoading = true;
    const raw = form.getRawValue();
    const body: Fin64050UpdateRequest = {
      IdList: this.selectedItems.map(item => item.ID),
      BackDate: this.datePipe.transform(raw.BackDate, 'yyyy-MM-dd') || '',
      CHK_Comment: raw.CHK_Comment
    };

    this.fin64050Service.updateFIN64050(body).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe(res => {
      this.dialogVisible = false;
      this.messageService.successBubble(res.Message || '退票處理成功');
      this.onSubmit(this.queryForm);
    });
  }
}