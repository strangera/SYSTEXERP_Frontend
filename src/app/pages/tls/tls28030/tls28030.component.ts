import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ITLS28030Data, QueryTLS28030Request, TLS28030Service } from '@service/api/tls/tls28030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatDate, formatDateTime, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';

@Component({
  selector: 'app-tls28030',
  templateUrl: './tls28030.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, CheckboxModule, DropdownComponent,
    ButtonComponent, TableReportComponent, TranslateModule, AsyncPipe
  ],
  providers: [DatePipe]
})
export class TLS28030Component extends BasicQueryPageComponent<ITLS28030Data> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date_S: [new Date()],
    TXN_Date_E: [new Date()],
    Bak_Date_S: [null],
    Bak_Date_E: [null],
    ECR_No: [null],
    TLT_No: [null],
    ECR_Group: [null],  // 館別
    ECR_LocNo: [null],  // 樓層
    ECR_Type: [null],   // 機台屬性
    BAG_Type: [null],   // 表別
    Status: [null],     // 狀態
    IsVirtualOnly: [false],
    pageSize: [30],
    pageIndex: [1],
  });

  totalRecords = 0;
  data: ITLS28030Data[] = [];
  lastQueryBody: QueryTLS28030Request | null = null;

  // 下拉選單
  // 表別：全部/現金袋/帳務袋/零用金袋
  bagTypeOptions = [
    { label: '現金袋', value: '1' },
    { label: '帳務袋', value: '2' },
    { label: '零用金袋', value: '3' },
  ];

  // 狀態：全部/未領用/未繳袋/未領用也未繳袋 (碼值對應 SP 內 @Status = '01'/'02'/'03' 的文字比對，須補零)
  statusOptions = [
    { label: '未領用', value: '01' },
    { label: '未繳袋', value: '02' },
    { label: '未領用也未繳袋', value: '03' },
  ];

  buildingOptions$ = this.dropdown.querySys3800(); // 假設 dropdownService 有此方法
  floorOptions$ = this.dropdown.querySys3900();
  ECR_NoOptions$ = this.dropdown.queryPos1002();
  TLT_NoOptions$ = this.dropdown.queryTltTalent();
  machineTypeOptions = getSYS1000Options('ECR_Type') // 機台屬性：全部/自收/統收

  columns: ReportColumn[] = [
    { field: 'BAG_TYPE_Name', header: '表別' },
    { field: 'BUILDING_DESC', header: '館別' },
    { field: 'FLOOR_DESC', header: '樓層' },
    { field: 'AREA_DESC', header: '區域' },
    { field: 'ECR_No', header: '收銀機代號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'ECR_TLT_Name', header: '專櫃名稱' },
    { field: 'TXN_Date', header: '入帳日期', format: formatDate },
    { field: 'Get_Date', header: '領袋日期', format: formatDate },
    { field: 'Get_TimeOnly', header: '領袋時間' },
    { field: 'Bak_Date', header: '繳袋日期', format: formatDate },
    { field: 'Bak_TimeOnly', header: '繳袋時間' },
    { field: 'Power_On_Time', header: '開機時間', format: formatDateTime },
    { field: 'Clear_Time', header: '清機時間', format: formatDateTime },

    // --- 稽核用附加資訊 (預設隱藏) ---
    { field: 'ECR_Group', header: '館別代碼', visible: false },
    { field: 'ECR_LocNo', header: '樓層代碼', visible: false },
    { field: 'ECR_AreaNo', header: '區域代碼', visible: false },
    { field: 'ECR_Name', header: '收銀機名稱', visible: false },
  ];

  constructor(
    public readonly tls28030Service: TLS28030Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS28030');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date_S: this.datePipe.transform(frm.value.TXN_Date_S, 'yyyy-MM-dd'),
        TXN_Date_E: this.datePipe.transform(frm.value.TXN_Date_E, 'yyyy-MM-dd'),
        Bak_Date_S: this.datePipe.transform(frm.value.Bak_Date_S, 'yyyy-MM-dd'),
        Bak_Date_E: this.datePipe.transform(frm.value.Bak_Date_E, 'yyyy-MM-dd'),
      };

      this.tls28030Service.queryTLS28030(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.lastQueryBody = body;
        });
    });
  }
}
