import { Tls55030Service } from './../../../service/api/tls/tls55030.service';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls55030',
  templateUrl: './tls55030.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, CalendarComponent, InputNumberRangeComponent, TranslateModule]
})
export class TLS55030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TABTYPE: [],
    PUR_GUINo: [],
    PUR_GUIDate: [],
    ACP_YYYYMM: [],
    PUR_RepYYYYMM: [],
    PUR_VenUniform: [],
    PUR_TaxType: [],

    amountFrom: [],
    amountTo: [],
    unTaxAmountFrom: [],
    unTaxAmountTo: [],
    taxAmountFrom: [],
    taxAmountTo: [],

    PUR_VoucherType: [],
    DIS_Status: [],

    sendDateFrom: [],
    sendDateTo: [],

    CRT_USR_No: [],
    DIS_No: [],
  });
  TABTYPEOptions = getSYS1000Options('TABTYPE');
  DIS_StatusOptions = getSYS1000Options('DIS_Status');
  PUR_TaxTypeOptions = getSYS1000Options('PUR_TaxType');
  PUR_VoucherTypeOptions = getSYS1000Options('PUR_VoucherType');
  tblUserOptions = this.dropdown.queryTblUser();
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  columns: Column[] = [
    { field: 'billingMonth', header: '結帳年月' },
    { field: 'storeCode', header: '廠商編號' },
    { field: 'documentType', header: '單據種類' },
    { field: 'format', header: '格式' },
    { field: 'status', header: '狀況' },
    { field: 'totalDiscountAmount', header: '總折讓金額' },
  ];
  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls55030Service: Tls55030Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55030', '/tls/tls55030cru', this.queryForm, (form) => this.onSubmit(form),);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls55030Service.queryTLS55030(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      })
    });
  }
}
