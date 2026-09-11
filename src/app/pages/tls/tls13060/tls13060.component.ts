import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS13060QueryRequest, TLS13060ResponseItem, TLS13060Service } from '../../../service/api/tls/tls13060.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonYNComponent } from '../../../shared/components/radiobutton-yn/radiobutton-yn.component';
import { Column } from '../../../others/component/table/table.model';
import { TLTTALENT_columns } from './tls13060.model';

@Component({
  selector: 'app-tls13060',
  templateUrl: './tls13060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    RadiobuttonYNComponent,
    ButtonComponent,
    TranslateModule,
    AsyncPipe,
    TableReportComponent,
    DropdownComponent
  ],
})
export class TLS13060Component extends BasicQueryPageComponent<TLS13060ResponseItem> implements OnInit {
  queryForm = this.formBuilder.group({
    apply_no: [null, [Validators.maxLength(12)]], // 專櫃招募編號
    ven_uniformList: [null], // 廠商統一編號
    tlt_no: [null, [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: [null, [Validators.maxLength(100)]], // 櫃位名稱
    location_noList: [null], // 位置編號
    building_noList: [null], // 館別
    org_idList: [null], // 【組織代碼/名稱】
    tlt_openflagList: [null], // 營運狀況
    tlt_bdate_start: [null], // 契約起始日
    tlt_bdate_end: [null], // 契約起始日
    tlt_edate_start: [null], // 契約截止日
    tlt_edate_end: [null], // 契約截止日
    tlt_contract_bdate_start: [null], // 營運起始日
    tlt_contract_bdate_end: [null], // 營運起始日
    tlt_contract_edate_start: [null], // 營運截止日
    tlt_contract_edate_end: [null], // 營運截止日
    tlt_term_typeList: [null], // 抽成別
    paytypeList: [null], // 付款方式
    rece_yn: [null], // 是否開立業主發票
    pos_yn: [null], // 是否使用業主收銀機
    cash_yn: [null], // 是否為業主收現
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });
  totalRecords = 0;
  data: TLS13060ResponseItem[] = [];
  columns: Column[] = TLTTALENT_columns;
  lastQueryBody: TLS13060QueryRequest | null = null;
  queryTLS13060Fn = (body: TLS13060QueryRequest) => this.tLS13060Service.queryTLS13060(body);
  vandorCategoryOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_nocationOptions = this.dropdown.queryTltTalent();
  locationOptions = this.dropdown.queryPos2002();
  building_noList = this.dropdown.querySys3800();
  org_idList = this.dropdown.querySys3100();
  tlt_openflagOptions = getSYS1000Options('tlt_openflag');
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  paytypeOptions = getSYS1000Options('paytype');
  yesNoOptions = getSYS1000Options('YES_NO');

  constructor(
    public readonly tLS13060Service: TLS13060Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13060');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        tlt_bdate_start: this.datePipe.transform(frm.value.tlt_bdate_start, 'yyyy-MM-dd') || null,
        tlt_bdate_end: this.datePipe.transform(frm.value.tlt_bdate_end, 'yyyy-MM-dd') || null,
        tlt_edate_start: this.datePipe.transform(frm.value.tlt_edate_start, 'yyyy-MM-dd') || null,
        tlt_edate_end: this.datePipe.transform(frm.value.tlt_edate_end, 'yyyy-MM-dd') || null,
        tlt_contract_bdate_start: this.datePipe.transform(frm.value.tlt_contract_bdate_start, 'yyyy-MM-dd') || null,
        tlt_contract_bdate_end: this.datePipe.transform(frm.value.tlt_contract_bdate_end, 'yyyy-MM-dd') || null,
        tlt_contract_edate_start: this.datePipe.transform(frm.value.tlt_contract_edate_start, 'yyyy-MM-dd') || null,
        tlt_contract_edate_end: this.datePipe.transform(frm.value.tlt_contract_edate_end, 'yyyy-MM-dd') || null,
      }
      this.lastQueryBody = body;
      this.tLS13060Service.queryTLS13060(body).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
