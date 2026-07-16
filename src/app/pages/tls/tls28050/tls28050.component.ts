import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

import { ITLS28050Data, QueryTLS28050Request, TLS28050Service } from '@service/api/tls/tls28050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';

@Component({
  selector: 'app-tls28050',
  templateUrl: './tls28050.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, DropdownComponent, ButtonComponent,
    TableReportComponent, TranslateModule, AsyncPipe
  ],
  providers: [DatePipe]
})
export class TLS28050Component extends BasicQueryPageComponent<ITLS28050Data> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date_S: [new Date(), [Validators.required]],
    TXN_Date_E: [new Date(), [Validators.required]],
    BAG_TYPE: [null],
    SYS_StoreNo: [null],
    ECR_No: [null],
    TLT_No: [null],
    Status: [null], // 0=全部
  });

  totalRecords = 0;
  data: ITLS28050Data[] = [];
  lastQueryBody: QueryTLS28050Request | null = null;

  // 下拉選項
  statusOptions = [
    { label: '未領袋', value: '1' },
    { label: '未繳袋', value: '2' },
    { label: '未領袋且未繳袋', value: '3' },
  ];

  bagTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金袋' },
    { No: '2', Name: '帳務袋' },
    { No: '3', Name: '零用金袋' },
  ];

  ECR_NoOptions$ = this.dropdown.queryPos1002();
  TLT_NoOptions$ = this.dropdown.queryTltTalent();

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機代碼' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'BAG_TYPE', header: '繳袋型態' },
    { field: 'Get_Status', header: '領取狀態' },
    { field: 'Bak_Status', header: '繳回狀態' },
    { field: 'Get_Time', header: '領取時間' }, // SP 已經轉字串，不需 formatDateTime
    { field: 'Bak_Time', header: '繳回時間' },

    // 稽核人員資訊 (預設隱藏)
    { field: 'CRT_USR_No', header: '領取人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '領取人員姓名', visible: false },
    { field: 'UPD_USR_No', header: '繳回人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '繳回人員姓名', visible: false },
    { field: 'CRT_Date', header: '建立時間', visible: false },
    { field: 'UPD_Date', header: '更新時間', visible: false },
  ];

  constructor(
    public readonly tls28050Service: TLS28050Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS28050');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: QueryTLS28050Request = {
        TXN_Date_S: this.datePipe.transform(frm.value.TXN_Date_S, 'yyyy-MM-dd') ?? '',
        TXN_Date_E: this.datePipe.transform(frm.value.TXN_Date_E, 'yyyy-MM-dd') ?? '',
        BAG_TYPE: frm.value.BAG_TYPE,
        ECR_No: frm.value.ECR_No,
        TLT_No: frm.value.TLT_No,
        Status: frm.value.Status ?? '0',
      };

      this.tls28050Service.queryTLS28050(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.lastQueryBody = body;
        });
    });
  }
}
