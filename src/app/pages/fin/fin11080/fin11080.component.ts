import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { FIN11080Data, FIN11080Service } from '@service/api/fin/fin11080.service';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';

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
    TableComponent,
    TranslateModule,
  ]
})
export class FIN11080Component extends BasicQueryPageComponent<FIN11080Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_Start: ['', Validators.required], // 銷售日期_起
    TXN_Date_End: ['', Validators.required], // 銷售日期_訖
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }])
  });

  totalRecords = 0;
  data: FIN11080Data[] = [];
  selectedItems: FIN11080Data[] = [];

  columns: Column[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
    { field: 'TxnCount_Normal_A', header: '一般交易(A)', visible: true, groupField: 'group1' },
    { field: 'TxnCount_VoidOrReturn_B', header: '作廢退貨(B)', visible: true, groupField: 'group1' },
    { field: 'TxnCount_Cancelled_C', header: '註銷(C)', visible: true, groupField: 'group1' },
    { field: 'ActualInv_Normal_AD', header: '一般交易(A)', visible: true, groupField: 'group2' },
    { field: 'ActualInv_CrossPeriodReturn_B', header: '作廢退貨(B)', visible: true, groupField: 'group2' },
    { field: 'ActualInv_Cancelled', header: '註銷(C)', visible: true, groupField: 'group2' },
    { field: 'CNT', header: '發票是否重號', visible: true }
  ];

  columnGroup = [
    { field: 'group1', header: '交易筆數' },
    { field: 'group2', header: '實際產生電子發票筆數' }
  ];

  expansionColumns: Column[] = [
    { field: 'TXN_Date', header: '交易日期', hidden: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true }
  ]

  constructor(
    private fin11080Service: FIN11080Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11080', 'fin/fin11080cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const requestData = {
        MID: 0, // 固定為0
        SYS_StoreNo: '10', // 固定為'10'
        ...frm.getRawValue(),
      };

      this.fin11080Service.queryFIN11080(requestData)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
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