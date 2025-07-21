import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { TLS26020Data, TLS26020QueryRequest, TLS26020Service } from '../../../service/api/tls/tls26020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";

@Component({
  selector: 'app-tls26020',
  templateUrl: './tls26020.component.html',
  styleUrl: './tls26020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    MultiSelectComponent
  ]
})
export class TLS26020Component extends BasicQueryPageComponent<TLS26020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDateFrom: [''],        // 銷售日期(起)
    saleDateTo: [''],          // 銷售日期(訖)
    storeCodeFrom: [''],       // 館別(起)
    storeCodeTo: [''],         // 館別(訖)
    organizationName: [''],    // 組織名稱
    floor: [''],               // 樓層
    ...createPaginationConfig([{ field: 'ID', order: 1 }])
  });

  totalRecords = 0;
  data: TLS26020Data[] = [];
  selectedItems: TLS26020Data[] = [];

  columns: Column[] = [
    { field: 'storeCode', header: '館別', visible: true },
    { field: 'organizationName', header: '組織名稱', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'locationCode', header: '位置編號', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'preorderAmount', header: '預售金額', visible: true },
    { field: 'saleAmount', header: '銷售金額', visible: true },
    { field: 'preorderAccum', header: '預售累積', visible: true }
  ];

  orgOptions = [
    { Name: '總公司', No: '1' },
    { Name: '分公司', No: '2' }
  ];

  floorOptions = [
    { Name: '一樓', No: '1' },
    { Name: '二樓', No: '2' },
    { Name: '三樓', No: '3' }
  ];

  constructor(
    private tls26020Service: TLS26020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26020', 'tls/tls26020', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const queryRequest: TLS26020QueryRequest = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.tls26020Service.queryTLS26020(queryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}