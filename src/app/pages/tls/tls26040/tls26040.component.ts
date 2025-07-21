import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLS26040Data, TLS26040QueryRequest, TLS26040Service } from '../../../service/api/tls/tls26040.service';

@Component({
  selector: 'app-tls26040',
  templateUrl: './tls26040.component.html',
  styleUrl: './tls26040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
  ]
})
export class TLS26040Component extends BasicQueryPageComponent<TLS26040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    preOrderDateFrom: ['', Validators.required],      // 預售日期(起)
    preOrderDateTo: ['', Validators.required],        // 預售日期(訖)
    settlementDateFrom: ['', Validators.required],    // 結帳日期(起)
    settlementDateTo: ['', Validators.required],      // 結帳日期(訖)
    receivingMachineNo: [''],                         // 收銀機號
    counterCode: [''],                                // 專櫃編號
    batchNo: [''],                                    // 批號
    ...createPaginationConfig([{ field: 'ID', order: 1 }])
  });

  totalRecords = 0;
  data: TLS26040Data[] = [];
  selectedItems: TLS26040Data[] = [];

  columns: Column[] = [
    { field: 'serialNo', header: '序號', visible: false },
    { field: 'preOrderDate', header: '預售日期', visible: true },
    { field: 'settlementDate', header: '結帳日期', visible: true },
    { field: 'receivingMachineNo', header: '收銀機機號', visible: true },
    { field: 'counterCode', header: '櫃別編號', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'batchNo', header: '批號', visible: true },
    { field: 'transactionNo', header: '交易序號', visible: true },
    { field: 'amount', header: '金額', visible: true }
  ];

  constructor(
    private tls26040Service: TLS26040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', 'tls/tls26040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const request: TLS26040QueryRequest = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.tls26040Service.queryTLS26040(request)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}