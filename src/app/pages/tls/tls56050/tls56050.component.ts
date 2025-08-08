import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls56050',
  templateUrl: './tls56050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    TableComponent
  ],
})
export class TLS56050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    organizationRequestCode: [],
    generalCode: [],
    brandCode: [],
    warehouseOutCode: [],  // For 調出倉別
    warehouseInCode: [],   // For 調入倉別
    issuanceNoteStatus: [],  // For 倉別調撥單狀態
    applicantCode: [],
    approverCode: [],
    shipmentCode: [],  // For 發貨人編號
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    shipmentDateFrom: [],  // For 發貨日期
    shipmentDateTo: [],    // For 發貨日期
    ...createPaginationConfig([{ field: 'ECR_TmplNo', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'name', header: 'Name', visible: true },
  ];

  constructor(
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS56050', '/TLS/TLS56050CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
