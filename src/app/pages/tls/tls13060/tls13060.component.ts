import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLTTALENT_columns } from './tls13060.model';
import { VendorCategoryOptionsService } from '../../../service/api/dropdownservice/vendor-category-options.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13060ResponseItem, TLS13060Service } from '../../../service/api/tls/tls13060.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';

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
    TableComponent,
    TranslateModule,
    AsyncPipe
  ],
})
export class TLS13060Component extends BasicQueryPageComponent<TLS13060ResponseItem> implements OnInit {
  queryForm = this.formBuilder.group({
    apply_no: ['', [Validators.maxLength(12)]], // 專櫃招募編號
    ven_uniformList: [null], // 廠商統一編號
    tlt_no: ['', [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(100)]], // 櫃位名稱
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
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: TLS13060ResponseItem[] = [];
  columns: Column[] = TLTTALENT_columns;
  vandorCategoryOptions: { label: string, value: string }[] = [];
  locationOptions: { label: string, value: string }[] = [];
  building_noList = this.dropdown.querySys3800();
  org_idList = this.dropdown.querySys3100();
  tlt_openflagOptions = getSYS1000Options('tlt_openflag');
  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  paytypeOptions = getSYS1000Options('paytype');
  yesNoOptions = getSYS1000Options('YES_NO');

  constructor(
    private readonly vendorCategoryOptionsService: VendorCategoryOptionsService,
    private readonly locationOptionsService: LocationOptionsService,
    private readonly tLS13060Service: TLS13060Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13060', '/TLS/TLS13060cru', this.queryForm, (form) => this.onSubmit(form));
    this.vendorCategoryOptionsService.getVendorCategoryOptions('1').pipe(untilDestroyed(this)).subscribe((res) => {
      this.vandorCategoryOptions = res;
    });
    this.locationOptionsService.getLocationOptions().pipe(untilDestroyed(this)).subscribe((res) => {
      this.locationOptions = res;
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tLS13060Service.queryTLS13060(frm.value).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
