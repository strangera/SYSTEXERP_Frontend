import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { Fin64050Service, Fin64050UpdateRequest, QueryFIN64050Request, QueryFIN64050Row } from '../../../service/api/fin/fin64050.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@UntilDestroy()
@Component({
  selector: 'app-fin64050',
  templateUrl: './fin64050.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TranslateModule,
    MenubarComponent, AccordionModule, ButtonModule, DialogModule,
    CalendarRangeComponent, CalendarComponent, InputTextComponent,
    ButtonComponent, TableReportComponent, DialogComponent, InputTextareaComponent
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

  data: QueryFIN64050Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN64050Row[] = [];
  dialogVisible = false;
  dialogLoading = false;

  // 防呆：僅「非兌現(3)且非退票(5)」狀態可勾選
  isRowSelectable = (row: QueryFIN64050Row) => row.IsSelectable === 'Y';

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
        BackDateFrom: this.datePipe.transform(raw.BackDateFrom, 'yyyy-MM-dd') || null,
        BackDateTo: this.datePipe.transform(raw.BackDateTo, 'yyyy-MM-dd') || null,
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

      this.messageService.confirm({
        header: '退票成功',
        message: res.Message || '退票處理成功',
        showRejectButton: false,
        accept: () => {
          this.dialogVisible = false;
          this.onSubmit(this.queryForm); // 刷新清單
          this.selectedItems = [];
          this.dialogQueryForm.reset();
        },
      })
    });
  }
  onClear(): void {
    this.queryForm.reset(
      {
        BackDateFrom: null,
        BackDateTo: null,
        ChkNo: null,
        pageSize: 30,
        pageIndex: 1,
      },
      {
        emitEvent: false,
      }
    );

    this.submitted = false;
  }
}
