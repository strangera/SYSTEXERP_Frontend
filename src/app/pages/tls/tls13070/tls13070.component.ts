import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls13070QueryRequest, Tls13070Response, Tls13070Service } from '@service/api/tls/tls13070.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { VendorNoMultiSelectComponent } from '@shared/biz-components/vendor-no-multi-select/vendor-no-multi-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from "@shared/components/radiobutton-yn/radiobutton-yn.component";
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { Tls13070TableComponent } from './tls13070-table/tls13070-table.component';

@Component({
  selector: 'app-tls13070',
  templateUrl: './tls13070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    AsyncPipe,
    RadiobuttonYNComponent,
    MultiSelectComponent,
    Tls13070TableComponent,
    VendorNoMultiSelectComponent
  ],
})
export class TLS13070Component extends BasicQueryPageComponent<Tls13070Response> implements OnInit {
  private readonly dropdown = inject(DropdownApiService);
  public readonly tls13070Service = inject(Tls13070Service);
  private readonly datePipe = inject(DatePipe);
  protected readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.nonNullable.group({
    Apply_No: [null, [Validators.maxLength(12)]],
    bus_typeList: [null],
    tlt_noList: [null],
    tlt_name: [null, [Validators.maxLength(100)]],
    ven_uniform_List: [null],
    contract_subno_Start: [null, [Validators.max(9999)]],
    contract_subno_End: [null, [Validators.max(9999)]],
    approve_status_List: [null],
    area_no_List: [null],
    tlt_floor_List: [null],
    contact_USR_No_List: [null],
    org_id_List: [null],
    tlt_openflag_List: [null],
    comm_comp_type_List: [['2']],
    feedback_date_Start: [null],
    feedback_date_End: [null],
    due_date_Start: [null],
    due_date_End: [null],
    contact_Date_Start: [null],
    contact_Date_End: [null],
    paper_type_List: [null],
    tlt_bdate_Start: [null],
    tlt_bdate_End: [null],
    tlt_edate_Start: [null],
    tlt_edate_End: [null],
    tlt_contract_bdate_Start: [null],
    tlt_contract_bdate_End: [null],
    tlt_contract_edate_Start: [null],
    tlt_contract_edate_End: [null],
    tlt_kind_List: [['1']],
    deco_type_List: [null],
    tlt_term_type_List: [null],
    money_type_List: [null],
    paytype_List: [null],
    store_way_List: [null],
    rece_yn: [null],
    pos_yn: [null],
    cash_yn: [null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'location_no', order: 1 }]],
  });

  totalRecords = 0;
  lastQueryBody: Tls13070QueryRequest | null = null;
  data: Tls13070Response[] = [];

  readonly BUS_TypeOptions = this.dropdown.queryTltBusType();
  readonly Tlt_NoOptions = this.dropdown.queryTltTalent();
  readonly approve_statusOptions = getSYS1000Options('approve_status');
  readonly Area_NoOptions = this.dropdown.querySys3A00();
  readonly FLOOR_NoOptions = this.dropdown.querySys3900();
  readonly contact_USR_NoOptions = this.dropdown.queryTblUser();
  readonly org_idOptions = this.dropdown.querySys3100();
  readonly tlt_openflagListOptions = getSYS1000Options('tlt_openflag');
  readonly comm_comp_typeListOptions = getSYS1000Options('comm_comp_type');
  readonly paper_typeListOptions = getSYS1000Options('T101');
  readonly tlt_kindListOptions = getSYS1000Options('TLT_Kind');
  readonly deco_typeListOptions = getSYS1000Options('deco_type');
  readonly tlt_term_typeListOptions = getSYS1000Options('tlt_term_type');
  readonly money_typeListOptions = getSYS1000Options('money_type');
  readonly paytypeListOptions = getSYS1000Options('paytype');
  readonly store_wayListOptions = getSYS1000Options('store_way');
  readonly rece_ynOptions = getSYS1000Options('YES_NO');
  readonly pos_ynOptions = getSYS1000Options('YES_NO');
  readonly cash_ynOptions = getSYS1000Options('YES_NO');
  readonly aps1003_A = this.dropdown.queryAps1003({ cap_typeList: ['A'] });
  readonly aps1003_B = this.dropdown.queryAps1003({ cap_typeList: ['B'] });
  readonly aps1003_C = this.dropdown.queryAps1003({ cap_typeList: ['C'] });
  readonly aps1003_D = this.dropdown.queryAps1003({ cap_typeList: ['D'] });

  ngOnInit(): void {
    this.initializePage('TLS13070', '/tls/tls13070cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const fmt = (d: Date | null) => this.datePipe.transform(d, 'yyyy-MM-dd');
      const v = frm.value;
      const body = {
        ...v,
        feedback_date_Start: fmt(v.feedback_date_Start),
        feedback_date_End: fmt(v.feedback_date_End),
        due_date_Start: fmt(v.due_date_Start),
        due_date_End: fmt(v.due_date_End),
        contact_Date_Start: fmt(v.contact_Date_Start),
        contact_Date_End: fmt(v.contact_Date_End),
        tlt_bdate_Start: fmt(v.tlt_bdate_Start),
        tlt_bdate_End: fmt(v.tlt_bdate_End),
        tlt_edate_Start: fmt(v.tlt_edate_Start),
        tlt_edate_End: fmt(v.tlt_edate_End),
        tlt_contract_bdate_Start: fmt(v.tlt_contract_bdate_Start),
        tlt_contract_bdate_End: fmt(v.tlt_contract_bdate_End),
        tlt_contract_edate_Start: fmt(v.tlt_contract_edate_Start),
        tlt_contract_edate_End: fmt(v.tlt_contract_edate_End),
      };
      this.tls13070Service.queryTLS13070(body)
        .pipe(finalize(() => (this.loading = false)), takeUntilDestroyed(this.destroyRef))
        .subscribe(response => {
          this.lastQueryBody = body;
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          //前10筆序號
          console.log('TLS13070 前10筆序號:', response.Data.slice(0, 10).map(r => ({ seq: r.apply_no })));
        });
    });
  }
}
