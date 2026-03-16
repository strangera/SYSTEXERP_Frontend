import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55020MasterData, Tls55020QueryRequest, Tls55020Service } from '@service/api/tls/tls55020.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls55020',
  templateUrl: './tls55020.component.html',
  standalone: true,
  imports: [
    DropdownComponent,
    PanelModule,
    TableReportComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    ButtonComponent,
    TranslateModule,
    InputTextComponent,
    AsyncPipe,
    AutoCompleteComponent
  ]
})
export class TLS55020Component extends BasicQueryPageComponent<Tls55020MasterData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [null, Validators.required],
    ECR_No: [null],
    TLT_No: [null],
    TXN_No: [null, [Validators.maxLength(8), this.validation.numberValidator]],
    pageIndex: [1],
    pageSize: [30]
  });
  ECR_NoOptions$ = this.dropDown.queryPos1002();
  TLT_NoOptions$ = this.dropDown.queryTltTalent();
  data: Tls55020MasterData[] = [];
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '機號' },
    { field: 'TXN_No', header: '序號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'TXN_Status', header: '狀態', format: (val) => getSYS1000('TXN_Status', val) },
    { field: 'TXN_Uniform', header: '統編' },
    { field: 'GUI_Track', header: '字軌' },
    { field: 'TXN_GUIBegNo', header: '發票號碼' },
    { field: 'TXN_TaxType', header: '稅別', format: (val) => getSYS1000('TXN_TaxType', val) },
    { field: 'TXN_CustCnt', header: '來客數' },
    { field: 'TXN_MemCard', header: '會員卡號' },
    { field: 'TXN_Time', header: '交易時間' },
    { field: 'TXN_GUI_CarrType', header: '載具類別', format: (val) => getSYS1000('TXN_GUI_CarrType', val) },
    { field: 'TXN_GUIVehicle', header: '載具編號' },
    { field: 'tlt_term_type', header: '抽成別', format: (val) => getSYS1000('tlt_term_type', val) },
    { field: 'TXN_Remark', header: '備註' }
  ];
  totalRecords = 0;
  lastQueryBody: Tls55020QueryRequest | null = null;
  constructor(
    public readonly tls55020Service: Tls55020Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly validation: ValidationService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55020', '/tls/tls55020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd'),
      }
      this.tls55020Service.queryTLS55020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      });
    });
  }
}
