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
  selector: 'app-tls56060',
  templateUrl: './tls56060.component.html',
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
export class TLS56060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    organizationRequestCode: [],
    warehouseRequestCode: [],  // For 申請倉別
    productManagerCode: [],  // For 商品管理編號
    applicantCode: [],
    brandCode: [],
    issuanceCategory: [],
    organizationNumberCode: [],  // Updated field name for 部門編號
    shipmentDateFrom: [],
    shipmentDateTo: [],
    issuanceNoteStatus: [],  // For 倉別調撥單狀態
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'name', header: 'Name', visible: true },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS56060', '/TLS/TLS56060CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
