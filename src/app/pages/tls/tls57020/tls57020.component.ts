import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls57020Service } from '@service/api/tls/tls57020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57020',
  templateUrl: './tls57020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
    AsyncPipe,
    CalendarComponent
  ],
})
export class TLS57020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    VEN_No: [null],
    ACP_YYYYMM: [null],
  });
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' })
  data: any[] = [];
  footerData: any = {};
  historyRequestBody: any = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'documentType', header: '單據種類', visible: true },
    { field: 'invoiceNumber', header: '發票收錄號碼', visible: true },
    { field: 'documentDate', header: '單據日期', visible: true },
    { field: 'totalInvoiceAmount', header: '發票總額', visible: true },
    { field: 'amountExcludingTax', header: '未稅金額', visible: true },
    { field: 'taxAmount', header: '稅額', visible: true },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls57020Service: Tls57020Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57020');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
  btnLoading = false;
  onExportPDF() {

  }
  onExportXLSX() { }
}
