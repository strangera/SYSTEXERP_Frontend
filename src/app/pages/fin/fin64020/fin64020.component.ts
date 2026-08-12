import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize, map } from 'rxjs';
import { Fin64020Service, Fin64020UpdateRequest, QueryFIN64020Request, QueryFIN64020Row } from '../../../service/api/fin/fin64020.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin64020',
  templateUrl: './fin64020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    DialogModule,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    AsyncPipe,
    ButtonModule,
    DialogComponent,
    MultiSelectComponent
  ],
})
export class FIN64020Component extends BasicQueryPageComponent<QueryFIN64020Row> implements OnInit {
  queryForm = this.formBuilder.group({
    CompanyAccNoList: [null],
    ExpireDateFrom: [null],
    ExpireDateTo: [null],
    ChkNo: [null, [Validators.maxLength(10)]],
    VouNoExpire: [null, [Validators.maxLength(20)]],
    ChkStatus: [null],
    pageSize: [30],
    pageIndex: [1],
  });
  data: QueryFIN64020Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN64020Row[] = [];
  isRowSelectable = (row: QueryFIN64020Row) => row.IsSelectable === 'Y';
  lastQueryBody: QueryFIN64020Request | null = null;
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
    map(options => options ? options.filter(opt => opt['BNK_AccType'] !== '1') : null)
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
    private readonly fin64020Service: Fin64020Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN64020', 'fin/fin64020cru', this.queryForm, (form) => this.onSubmit(form));
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue();
      const body: QueryFIN64020Request = {
        ...raw,
      }
      this.fin64020Service.queryFIN64020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount || 0;
        this.lastQueryBody = body;
      })
    });
  }
  dialogVisible = false;
  companyAccOptions2$ = this.dropDown.queryAps1002().pipe(
    map(options => options ? options.filter(opt => opt['BNK_AccType'] !== '1') : null)
  );
  dialogLoading = false;
  dialogQueryForm = this.formBuilder.group({
    CollectDate: [new Date(), Validators.required],
    CollectBankNo: [null, Validators.required],
  });

  saveDialog(form: FormGroup) {
    if (form.invalid || this.selectedItems.length === 0) return;
    const raw = form.getRawValue();
    const bankNo = raw.CollectBankNo?.substring(0, 3) || '';
    const branchNo = raw.CollectBankNo?.substring(3) || '';
    const body: Fin64020UpdateRequest = {
      IdList: this.selectedItems.map(item => item.ID), // 從選中的資料抓取 ID
      ColleDate: this.datePipe.transform(raw.CollectDate, 'yyyy-MM-dd') || '',
      BNK_No: bankNo,
      BNK_BranchNo: branchNo
    };
    this.dialogLoading = true;
    this.fin64020Service.updateFIN64020(body).pipe(untilDestroyed(this), finalize(() => this.dialogLoading = false)).subscribe(res => {
      this.messageService.confirm({
        header: '支票託收成功',
        message: res.Message || '託收處理成功',
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
      CompanyAccNoList: null,
      ExpireDateFrom: null,
      ExpireDateTo: null,
      ChkNo: null,
      VouNoExpire: null,
      ChkStatus: null,
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
