import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportTypeService } from '../../../service/basic/report-type.service'; // 報表型態 service
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-tls24080',
    templateUrl: './tls24080.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeComponent,
        InputTextComponent,
        DropdownComponent,
        ButtonComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS24080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDateStart: [, [Validators.required]], // 銷售日期起
    saleDateEnd: [, [Validators.required]],   // 銷售日期迄
    correctionDateStart: [], // 修正日期起
    correctionDateEnd: [],   // 修正日期迄
    cashierCode: [],  // 收銀機號
    reportType: [],  // 報表型態
  });
  reportTypeOptions: any[] = [];
  data: any[] = [];
  columns: Column[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
    { field: 'transactionSerial', header: '交易序號', visible: true },
    { field: 'originalCounterName', header: '原專櫃編號/名稱', visible: true },
    { field: 'previousCounterName', header: '前次專櫃編號/名稱', visible: true },
    { field: 'updatedCounterName', header: '修正後專櫃編號/名稱', visible: true },
    { field: 'updateDate', header: '修正日期', visible: true },
    { field: 'updatedBy', header: '修正者', visible: true }
  ];
  constructor(
    private reportTypeService: ReportTypeService,  // 報表型態 service
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24080', 'TLS/TLS24080CRU', this.queryForm, (form) => this.onSubmit(form));
    this.reportTypeService.getReportTypes().subscribe((data) => {
      this.reportTypeOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.queryStateService.setQueryState(this.ProgNo, frm.value);
    });
  }
}
