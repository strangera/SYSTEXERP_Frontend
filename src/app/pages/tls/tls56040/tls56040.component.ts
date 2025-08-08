import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls56040',
  templateUrl: './tls56040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TranslateModule,
    TableComponent
  ],
})
export class TLS56040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    organizationRequestCode: [],
    issuanceNoteStatus: [],  // Added this field for 倉別調撥單狀態
    generalCode: [],
    brandCode: [],
    warehouseCode: [],
    issuanceCategory: [],
    applicantCode: [],
    approverCode: [],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
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
    this.initializePage('TLS56040', '/TLS/TLS56040CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
