import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";
import { TLS26030Data, TLS26030Service, TLS26030QueryRequest } from '@service/api/tls/tls26030.service';

@Component({
  selector: 'app-tls26030',
  templateUrl: './tls26030.component.html',
  styleUrl: './tls26030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    InputTextRangeComponent,
  ]
})
export class TLS26030Component extends BasicQueryPageComponent<TLS26030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDateFrom: [''],        // 銷售日期(起)
    saleDateTo: [''],          // 銷售日期(訖)
    storeCodeFrom: [''],       // 館別(起)
    storeCodeTo: [''],         // 館別(訖)
    organizationName: [''],    // 組織名稱
    floor: [''],               // 樓層
    ...createPaginationConfig([{ field: 'saleDate', order: 1 }])
  });

  totalRecords = 0;
  data: TLS26030Data[] = [];
  selectedItems: TLS26030Data[] = [];

  columns: Column[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'hall', header: '館別', visible: true },
    { field: 'organizationName', header: '組織名稱', visible: true },
    { field: 'posMachineNo', header: 'POS機號', visible: true },
    { field: 'transactionNo', header: '交易序號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'locationCode', header: '位置編號', visible: true },
    { field: 'fieldName', header: '櫃位名稱', visible: true },
    { field: 'preOrderAmount', header: '預售金額', visible: true },
    { field: 'recognizedAmount', header: '認列金額', visible: true },
    { field: 'recognitionBatchNo', header: '認列批號', visible: true },
    { field: 'preOrderStatus', header: '預售狀態', visible: true },
    { field: 'voidOrReturnDate', header: '作廢/退貨日期', visible: true },
    { field: 'voidOrReturnMachineNo', header: '作廢/退貨機號', visible: true },
    { field: 'voidOrReturnSerialNo', header: '作廢/退貨序號', visible: true },
    { field: 'settlementDate', header: '結帳日期', visible: true },
    { field: 'settlementMachineNo', header: '結帳機號', visible: true },
    { field: 'settlementSerialNo', header: '結帳序號', visible: true }
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
    private tls26030Service: TLS26030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26030', 'tls/tls26030', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const queryRequest: TLS26030QueryRequest = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.tls26030Service.queryTLS26030(queryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}