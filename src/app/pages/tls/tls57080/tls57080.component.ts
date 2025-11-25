import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls57080Service } from '@service/api/tls/tls57080.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57080',
  templateUrl: './tls57080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    ButtonModule,
    TranslateModule,
  ],
})
export class TLS57080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    warehouseCode: [],
    initialDate: [],
    managementCode: [],
    productName: [],
    vendorCode: [],
  });
  warehouseOptions: any[] = [];
  managementIDOptions: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  columns: ReportColumn[] = [
    { field: 'date', header: '日期' },
    { field: 'order', header: '單號' },
    { field: 'vendorCode', header: '廠商編號' },
    { field: 'warehouse', header: '倉別' },
    { field: 'operation', header: '作業' },
    { field: 'quantityChange', header: '異動量' },
    { field: 'stockQuantity', header: '庫存量' },
    { field: 'batchNumber', header: '批號' },
    { field: 'unit', header: '單價' },
    { field: 'amount', header: '金額' },
  ];

  constructor(
    public readonly tls57080Service: Tls57080Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57080');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls57080Service.queryTLS57080(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = res.QueryBody;
      })
    });
  }

  btnLoading = false;
  onExportPDF() {

  }
  onExportXLSX() {

  }
}
