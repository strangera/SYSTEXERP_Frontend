import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN11080Data, FIN11080QueryRequest, FIN11080Service } from '@service/api/fin/fin11080.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin11080',
  templateUrl: './fin11080.component.html',
  styleUrl: './fin11080.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    TableReportComponent,
    TranslateModule,
  ]
})
export class FIN11080Component extends BasicQueryPageComponent<FIN11080Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_Start: ['', Validators.required], // 銷售日期_起
    TXN_Date_End: ['', Validators.required], // 銷售日期_訖
    pageSize: [30],
    pageIndex: [1],
  });

  readonly tableData = signal<FIN11080Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: FIN11080QueryRequest;

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
    { field: 'TxnCount_Normal_A', header: '一般交易(A)', visible: true, groupField: 'group1' },
    { field: 'TxnCount_VoidOrReturn_B', header: '作廢退貨(B)', visible: true, groupField: 'group1' },
    { field: 'TxnCount_Cancelled_C', header: '註銷(C)', visible: true, groupField: 'group1' },
    { field: 'ActualInv_Normal_AD', header: '一般交易(A)', visible: true, groupField: 'group2' },
    { field: 'ActualInv_CrossPeriodReturn_B', header: '作廢退貨(B)', visible: true, groupField: 'group2' },
    { field: 'ActualInv_Cancelled', header: '註銷(C)', visible: true, groupField: 'group2' },
    { field: 'CNT', header: '發票是否重號', visible: true }
  ];

  columnGroup: ColumnGroup[] = [
    { field: 'group1', header: '交易筆數' },
    { field: 'group2', header: '實際產生電子發票筆數' }
  ];

  expansionColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', visible: false, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true }
  ]

  constructor(
    private fin11080Service: FIN11080Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11080', 'fin/fin11080cru', this.queryForm, (form) => this.onSubmit(form));
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: FIN11080QueryRequest = {
      MID: 0,
      SYS_StoreNo: '10',
      TXN_Date_Start: raw.TXN_Date_Start ?? '',
      TXN_Date_End: raw.TXN_Date_End ?? '',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as FIN11080QueryRequest;
    return this.fin11080Service.queryFIN11080(clean);
  };

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        MID: 0,
        SYS_StoreNo: '10',
        TXN_Date_Start: raw.TXN_Date_Start ?? '',
        TXN_Date_End: raw.TXN_Date_End ?? '',
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
      } as FIN11080QueryRequest;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(untilDestroyed(this), finalize(() => { this.tableLoading.set(false); this.loading = false; }))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  loadExpansionData = (rowData: FIN11080Data) => {
    return this.fin11080Service.queryFIN11080_Detail({
      MID: 0,
      SYS_StoreNo: '10',
      TXN_Date: rowData.TXN_Date,
    });
  }
}
