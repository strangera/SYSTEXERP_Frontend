import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN35010QueryRequest, FIN35010Response, Fin35010Service } from '@service/api/fin/fin35010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from "@shared/componentkit/calendar-range-quick/calendar-range-quick.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { UpdateType } from './fin35010.model';

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
  ],
})
export class FIN35010Component extends BasicQueryPageComponent<FIN35010Response> implements OnInit {
  public readonly UpdateType = UpdateType;
  queryForm = this.formBuilder.nonNullable.group({
    VEN_No: [null], // 廠客代號(下拉), POS2013.VEN_NO
    VEN_Name: [null, Validators.maxLength(100)], // "廠客名稱, POS2013.VEN_NAME LIKE %%" (input輸入)
    TLT_Name: [null, Validators.maxLength(100)], // 櫃位名稱(下拉)
    tlt_bdateStart: [null],// 合約起日(日期範圍)
    tlt_bdateEnd: [null],// 合約起日(日期範圍)
    tlt_edateStart: [null],// 合約迄日(日期範圍)
    tlt_edateEnd: [null],// 合約迄日(日期範圍)
    Deposit_DateStart: [null], // 收票日期(日期範圍)
    Deposit_DateEnd: [null], // 收票日期(日期範圍)
    CHK_ExpireDateStart: [null], // 保證票到期日(日期範圍)
    CHK_ExpireDateEnd: [null], // 保證票到期日(日期範圍)
    UPD_DateStart: [null], // 變更日期(日期範圍)
    UPD_DateEnd: [null], // 變更日期(日期範圍)
    CHK_No: [null, Validators.maxLength(10)], // 票據編號(input輸入)
    Status: [null], // 票據狀態(下拉) // 狀態 (0=未繳票 1=已繳票 2=已退票 3=封存)
    CHK_Type: [null], // 保證票類型(下拉) // 票據種類 (1=支票 2=本票 3=銀行保證函 4=其他)
    org_id: [null], // 組織代碼(下拉)
    Remark: [null, Validators.maxLength(160)], // 摘要(input輸入)
    Deposit_Type: [null], // 保證類別(下拉) // 保證金類型 (1=押金 2=履約保證金 3=施工保證金 4=開業保證金)
    CHK_AmtFrom: [null, Validators.max(9999999999)], // 金額(數字範圍輸入)
    CHK_AmtTo: [null, Validators.max(9999999999)], // 金額(數字範圍輸入)
    pageIndex: [1],
    pageSize: [30],
  });
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  TLT_NameOptions = this.dropdown.queryTltTalent();
  org_idOptions = this.dropdown.querySys3100();
  StatusOptions = getSYS1000Options('ARS4008_Status');
  CHK_TypeOptions = getSYS1000Options('CHK_Type');
  Deposit_TypeOptions = getSYS1000Options('Deposit_Type');
  data: FIN35010Response[] = [];
  totalRecords = 0;
  lastQuery: FIN35010QueryRequest | null = null;
  columns: ReportColumn[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'TLT_Name', header: '櫃位名稱' },
    { field: 'CHK_Amt', header: '金額', format: formatAmount },
    { field: 'CHK_Type', header: '票據類型', format: (v) => getSYS1000('CHK_Type', v) },
    { field: 'Deposit_Type', header: '保證類別', format: (v) => getSYS1000('Deposit_Type', v) },
    { field: 'Status', header: '票據狀態', format: (v) => getSYS1000('ARS4008_Status', v) },
    { field: 'Remark', header: '摘要' },
    { field: 'CRT_Date', header: '建檔日期', format: formatDate },
    { field: 'CreateDate', header: '建檔日期', format: formatDate },
    { field: 'UPD_Date', header: '變更日期', format: formatDate },
  ];

  constructor(
    public readonly fin35010Service: Fin35010Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN35010', 'fin/fin35010cru', this.queryForm, (v) => this.onSubmit(v));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.value;
      const body: FIN35010QueryRequest = {
        ...rawValue,
        // 組織代碼
        OrgId: rawValue.org_id,

        // 合約起日
        TLT_BDateFrom: this.datePipe.transform(rawValue.tlt_bdateStart, 'yyyy-MM-dd'),
        TLT_BDateTo: this.datePipe.transform(rawValue.tlt_bdateEnd, 'yyyy-MM-dd'),

        // 合約迄日
        TLT_EDateFrom: this.datePipe.transform(rawValue.tlt_edateStart, 'yyyy-MM-dd'),
        TLT_EDateTo: this.datePipe.transform(rawValue.tlt_edateEnd, 'yyyy-MM-dd'),

        // 收票日期
        DepositDateFrom: this.datePipe.transform(rawValue.Deposit_DateStart, 'yyyy-MM-dd'),
        DepositDateTo: this.datePipe.transform(rawValue.Deposit_DateEnd, 'yyyy-MM-dd'),

        // 到期日
        CHK_ExpireDateFrom: this.datePipe.transform(rawValue.CHK_ExpireDateStart, 'yyyy-MM-dd'),
        CHK_ExpireDateTo: this.datePipe.transform(rawValue.CHK_ExpireDateEnd, 'yyyy-MM-dd'),

        // 變更日期
        UPD_DateFrom: this.datePipe.transform(rawValue.UPD_DateStart, 'yyyy-MM-dd'),
        UPD_DateTo: this.datePipe.transform(rawValue.UPD_DateEnd, 'yyyy-MM-dd'),
      };

      this.fin35010Service.queryFIN35010(body).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = body;
        this.queryStateService.setQueryState(this.ProgNo, body);
      });
    });
  }
}
