import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls13070QueryRequest, Tls13070Response, Tls13070Service } from '@service/api/tls/tls13070.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { VendorNoMultiSelectComponent } from '@shared/biz-components/vendor-no-multi-select/vendor-no-multi-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from "@shared/componentkit/radiobutton-yn/radiobutton-yn.component";
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
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
    CalendarRangeQuickComponent,
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
  queryForm = this.formBuilder.nonNullable.group({
    Apply_No: [null, [Validators.maxLength(12)]], // 專櫃招募編號
    bus_typeList: [null], // 大分類代號
    tlt_noList: [null], // 專櫃編號
    tlt_name: [null, [Validators.maxLength(100)]], // 專櫃名稱
    ven_uniform_List: [null], // 廠商統一編號
    contract_subno_Start: [null, [Validators.max(9999)]], // 版本編號(起)
    contract_subno_End: [null, [Validators.max(9999)]], // 版本編號(迄)
    approve_status_List: [null], // 合約狀態
    area_no_List: [null], // 區域
    tlt_floor_List: [null], // 樓層
    contact_USR_No_List: [null], // 談判者
    org_id_List: [null], // 組織
    tlt_openflag_List: [null], // 營運狀態
    comm_comp_type_List: [['2']], // 抽成額計算方式
    feedback_date_Start: [null], // 回函日期(起)
    feedback_date_End: [null], // 回函日期(迄)
    due_date_Start: [null], // 回函期限(起)
    due_date_End: [null], // 回函期限(迄)
    contact_Date_Start: [null], // 談判日期(起)
    contact_Date_End: [null], // 談判日期(迄)
    paper_type_List: [null], // 營業型態
    tlt_bdate_Start: [null], // 契約起始日(起)
    tlt_bdate_End: [null], // 契約截止日(迄)
    tlt_edate_Start: [null], // 契約截止日_起
    tlt_edate_End: [null], // 契約截止日_迄
    tlt_contract_bdate_Start: [null], // 營運起始日(起)
    tlt_contract_bdate_End: [null], // 營運起始日(迄)
    tlt_contract_edate_Start: [null], // 營運截止日(起)
    tlt_contract_edate_End: [null], // 營運截止日(迄)
    tlt_kind_List: [['1']], // 櫃別
    deco_type_List: [null], // 裝櫃方式
    tlt_term_type_List: [null], // 抽成別
    money_type_List: [null], // 結帳方式
    paytype_List: [null], // 付款方式
    store_way_List: [null], // 配合方式
    rece_yn: [null], // 是否開立發票
    pos_yn: [null], // 是否使用業主收銀機
    cash_yn: [null], // 是否為業主收現
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'location_no', order: 1 }]],
  });
  totalRecords = 0;
  lastQueryBody: Tls13070QueryRequest | null = null;
  BUS_TypeOptions = this.dropdown.queryTltBusType();
  Tlt_NoOptions = this.dropdown.queryTltTalent();
  approve_statusOptions = getSYS1000Options('approve_status');
  Area_NoOptions = this.dropdown.querySys3A00();
  FLOOR_NoOptions = this.dropdown.querySys3900();
  contact_USR_NoOptions = this.dropdown.queryTblUser();
  org_idOptions = this.dropdown.querySys3100();
  tlt_openflagListOptions = getSYS1000Options('tlt_openflag');
  comm_comp_typeListOptions = getSYS1000Options('comm_comp_type');
  paper_typeListOptions = getSYS1000Options('T101');
  tlt_kindListOptions = getSYS1000Options('TLT_Kind');
  deco_typeListOptions = getSYS1000Options('deco_type');
  tlt_term_typeListOptions = getSYS1000Options('tlt_term_type');
  money_typeListOptions = getSYS1000Options('money_type');
  paytypeListOptions = getSYS1000Options('paytype');
  store_wayListOptions = getSYS1000Options('store_way');
  rece_ynOptions = getSYS1000Options('YES_NO');
  pos_ynOptions = getSYS1000Options('YES_NO');
  cash_ynOptions = getSYS1000Options('YES_NO');
  data: Tls13070Response[] = [];
  aps1003_A = this.dropdown.queryAps1003({ cap_typeList: ['A'] });
  aps1003_B = this.dropdown.queryAps1003({ cap_typeList: ['B'] });
  aps1003_C = this.dropdown.queryAps1003({ cap_typeList: ['C'] });
  aps1003_D = this.dropdown.queryAps1003({ cap_typeList: ['D'] });

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls13070Service: Tls13070Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS13070', '/tls/tls13070cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        feedback_date_Start: this.datePipe.transform(frm.value.feedback_date_Start, 'yyyy-MM-dd'),
        feedback_date_End: this.datePipe.transform(frm.value.feedback_date_End, 'yyyy-MM-dd'),
        due_date_Start: this.datePipe.transform(frm.value.due_date_Start, 'yyyy-MM-dd'),
        due_date_End: this.datePipe.transform(frm.value.due_date_End, 'yyyy-MM-dd'),
        contact_Date_Start: this.datePipe.transform(frm.value.contact_Date_Start, 'yyyy-MM-dd'),
        contact_Date_End: this.datePipe.transform(frm.value.contact_Date_End, 'yyyy-MM-dd'),
        tlt_bdate_Start: this.datePipe.transform(frm.value.tlt_bdate_Start, 'yyyy-MM-dd'),
        tlt_bdate_End: this.datePipe.transform(frm.value.tlt_bdate_End, 'yyyy-MM-dd'),
        tlt_edate_Start: this.datePipe.transform(frm.value.tlt_edate_Start, 'yyyy-MM-dd'),
        tlt_edate_End: this.datePipe.transform(frm.value.tlt_edate_End, 'yyyy-MM-dd'),
        tlt_contract_bdate_Start: this.datePipe.transform(frm.value.tlt_contract_bdate_Start, 'yyyy-MM-dd'),
        tlt_contract_bdate_End: this.datePipe.transform(frm.value.tlt_contract_bdate_End, 'yyyy-MM-dd'),
        tlt_contract_edate_Start: this.datePipe.transform(frm.value.tlt_contract_edate_Start, 'yyyy-MM-dd'),
        tlt_contract_edate_End: this.datePipe.transform(frm.value.tlt_contract_edate_End, 'yyyy-MM-dd'),
      }
      this.tls13070Service.queryTLS13070(body).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
        this.lastQueryBody = body;
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
      });
    });
  }
}
