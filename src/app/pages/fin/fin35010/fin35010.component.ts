import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN35010Request, FIN35010Response, Fin35010Service } from '@service/api/fin/fin35010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { HasPermissionDirective } from '@shared/directive/has-permission.directive';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

@Component({
  selector: 'app-fin35010',
  templateUrl: './fin35010.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    TableReportComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    TranslateModule,
    CalendarRangeQuickComponent,
    HasPermissionDirective
  ],
})
export class FIN35010Component extends BasicQueryPageComponent<FIN35010Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VEN_No: [], // 廠客代號(下拉), POS2013.VEN_NO
    VEN_Name: [null, Validators.maxLength(100)], // "廠客名稱, POS2013.VEN_NAME LIKE %%" (input輸入)
    TLT_Name: [null, Validators.maxLength(100)], // 櫃位名稱(下拉)
    tlt_bdateStart: [],// 合約起日(日期範圍)
    tlt_bdateEnd: [],// 合約起日(日期範圍)
    tlt_edateStart: [],// 合約迄日(日期範圍)
    tlt_edateEnd: [],// 合約迄日(日期範圍)
    Deposit_DateStart: [], // 收票日期(日期範圍)
    Deposit_DateEnd: [], // 收票日期(日期範圍)
    CHK_ExpireDateStart: [], // 保證票到期日(日期範圍)
    CHK_ExpireDateEnd: [], // 保證票到期日(日期範圍)
    UPD_DateStart: [], // 變更日期(日期範圍)
    UPD_DateEnd: [], // 變更日期(日期範圍)
    CHK_No: [null, Validators.maxLength(10)], // 票據編號(input輸入)
    Status: [], // 票據狀態(下拉) // 狀態 (0=未繳票 1=已繳票 2=已退票 3=封存)
    CHK_Type: [], // 保證票類型(下拉) // 票據種類 (1=支票 2=本票 3=銀行保證函 4=其他)
    org_id: [], // 組織代碼(下拉)
    Remark: [null, Validators.maxLength(160)], // 摘要(input輸入)
    Deposit_Type: [], // 保證類別(下拉) // 保證金類型 (1=押金 2=履約保證金 3=施工保證金 4=開業保證金)
    CHK_Amt: [null, Validators.max(9999999999)], // 金額(數字範圍輸入)
  });
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  TLT_NameOptions = this.dropdown.queryTltTalent();
  org_idOptions = this.dropdown.querySys3100();
  StatusOptions: any[] = [];
  CHK_TypeOptions = getSYS1000Options('CHK_TYPE');
  Deposit_TypeOptions = getSYS1000Options('DEPOSIT_TYPE');
  data: FIN35010Response[] = [];
  totalRecords = 0;
  lastQuery: FIN35010Request | null = null;
  columns: ReportColumn[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'TLT_Name', header: '櫃位名稱' },
    { field: 'CHK_Amt', header: '金額' },
    { field: 'CHK_Type', header: '票據類型' },
    { field: 'Deposit_Type', header: '保證類別' },
    { field: 'Status', header: '票據狀態' },
    { field: 'Remark', header: '摘要' },
    { field: 'CRT_Date', header: '建檔日期' },
    { field: 'UPD_Date', header: '變更日期' },
  ];

  constructor(
    public readonly fin35010Service: Fin35010Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN35010', 'fin/fin35010cru', this.queryForm, (v) => this.onSubmit(v));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin35010Service.queryFIN35010(frm.value).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
}
