import { FloorService } from './../../../service/basic/floor.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { SettlementMethodService } from './../../../service/basic/settlement-method.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

// 2.2.14.8 專櫃對帳單
@Component({
  selector: 'app-tls2e080',
  templateUrl: './tls2e080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    TableComponent
  ]
})
export class TLS2E080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    counterName: [], // 專櫃編號
    commissionMethod: [], // 抽成方式
    floor: [], // 樓層
    onedatemm: [, [Validators.required]], // 查詢年月
    checkout: [], // 結帳方式/帳次
    branch: [], // 館別
    settlementMethod: [], // 對帳方式
    UID: [], // 統一編號
  });
  totalRecords = 0;
  data: any[] = [];
  columns: any[] = [
    { field: 'contactPerson', header: '洽談者', visible: true },
    { field: 'contactDate', header: '洽談日', visible: true },
    { field: 'UID', header: '統編/廠商', visible: true },
    { field: 'industryType', header: '大分類', visible: true },
    { field: 'category', header: '類型', visible: true },
    { field: 'version', header: '版本', visible: true },
    { field: 'rentNumber', header: '位置租賃數', visible: true },
    { field: 'progress', header: '進度', visible: true },
  ];
  checkoutOptions: any[] = [];
  counterNameOptions: any[] = [];
  commissionMethodOptions: any[] = [];
  floorOptions: any[] = [];
  // 1=網路對帳  2=AUTOFAX   3=AUTOMAIL  0=空白
  settlementMethodOptions: any[] = [
    { label: '網路對帳', value: '1' },
    { label: 'AUTOFAX', value: '2' },
    { label: 'AUTOMAIL', value: '3' }
  ];

  constructor(
    private settlementMethodService: SettlementMethodService,
    private counterCodeService: CounterCodeService,
    private commissionTypeService: CommissionTypeService,
    private floorService: FloorService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E080', 'tls/tls2e080', this.queryForm, (form) => this.onSubmit(form));
    this.settlementMethodService.getSettlementMethods().subscribe(data => {
      this.checkoutOptions = data;
    });
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.counterNameOptions = data;
    });
    //
    this.commissionTypeService.getCommissionTypes().subscribe(data => {
      this.commissionMethodOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
}
