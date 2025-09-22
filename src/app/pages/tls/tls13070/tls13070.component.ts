import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AsyncPipe } from '@angular/common';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { RadiobuttonYNComponent } from "@shared/componentkit/radiobutton-yn/radiobutton-yn.component";
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';


@Component({
  selector: 'app-tls13070',
  templateUrl: './tls13070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    TableComponent,
    AsyncPipe,
    RadiobuttonYNComponent,
    MultiSelectComponent
  ],
})
export class TLS13070Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Apply_No: [null, [Validators.maxLength(12)]], // 專櫃招募編號
    BUS_Type: [null], // 大分類代號
    TLT_No: [null, [Validators.maxLength(12)]], // 專櫃編號
    TLT_Name: [null, [Validators.maxLength(100)]], // 專櫃名稱
    VEN_Uniform: [null], // 廠商統一編號
    Contract_SubNo_Start: [null, [Validators.max(9999)]], // 版本編號(起)
    Contract_SubNo_End: [null, [Validators.max(9999)]], // 版本編號(迄)
    approve_status: [null], // 合約狀態
    Area_No: [null], // 區域
    FLOOR_No: [null], // 樓層
    contact_USR_No: [null], // 談判者
    org_id: [null], // 組織
    tlt_openflagList: [null], // 營運狀態
    comm_comp_typeList: [null], // 抽成額計算方式
    feedback_date_Start: [null], // 回函日期(起)
    feedback_date_End: [null], // 回函日期(迄)
    due_date_Start: [null], // 回函期限(起)
    due_date_End: [null], // 回函期限(迄)
    contact_Date_Start: [null], // 談判日期(起)
    contact_Date_End: [null], // 談判日期(迄)
    paper_typeList: [null], // 營業型態
    tlt_bdate_Start: [null], // 契約起始日(起)
    tlt_bdate_End: [null], // 契約起始日(迄)
    tlt_edate_Start: [null], // 契約截止日_起
    tlt_edate_End: [null], // 契約截止日_迄
    tlt_contract_bdate_Start: [null], // 營運起始日(起)
    tlt_contract_bdate_End: [null], // 營運起始日(迄)
    tlt_contract_edate_Start: [null], // 營運截止日(起)
    tlt_contract_edate_End: [null], // 營運截止日(迄)
    tlt_kindList: [null], // 櫃別
    deco_typeList: [null], // 裝櫃方式
    tlt_term_typeList: [null], // 抽成別
    money_typeList: [null], // 結帳方式
    paytypeList: [null], // 付款方式
    store_wayList: [null], // 配合方式
    rece_yn: [null], // 是否開立發票
    pos_yn: [null], // 是否使用業主收銀機
    cash_yn: [null], // 是否為業主收現
    ...createPaginationConfig([{ field: 'apply_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  BUS_TypeOptions = this.dropdown.queryTltBusType();
  VEN_UniformOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
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
  data: any[] = [];
  columns: Column[] = [
    { field: 'name', header: 'name' },
    { field: 'age', header: 'age' },
    { field: 'email', header: 'email' },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS13070', '/tls/tls13070cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
