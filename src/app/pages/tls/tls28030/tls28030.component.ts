import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ITLS28030Data, QueryTLS28030Request, TLS28030Service } from '@service/api/tls/tls28030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatAmount, formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';

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
    MOD_Date_S: [null],
    MOD_Date_E: [null],
    ECR_No: [null],
    TLT_No: [null],
    ECR_Group: [null],  // 館別
    ECR_LocNo: [null],  // 樓層
    ECR_Type: [null],   // 機台屬性
    Check_Status: [null],
    IsVirtualOnly: [false],
    pageSize: [30],
    pageIndex: [1],
  });

  totalRecords = 0;
  data: ITLS28030Data[] = [];
  lastQueryBody: QueryTLS28030Request | null = null;

  // 下拉選單
  statusOptions = [
    { label: '已審核', value: 'Y' },
    { label: '未審核', value: 'N' }
  ];

  buildingOptions$ = this.dropdown.querySys3800(); // 假設 dropdownService 有此方法
  floorOptions$ = this.dropdown.querySys3900();
  ECR_NoOptions$ = this.dropdown.queryPos1002();
  TLT_NoOptions$ = this.dropdown.queryTltTalent();
  machineTypeOptions = getSYS1000Options('ECR_Type')

  columns: ReportColumn[] = [
    // --- 繳袋基本資訊 ---
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'MOD_Date', header: '繳袋日期', format: formatDateTime },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'PAY_No', header: '付款編號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'ECR_TLT_Name', header: '所屬專櫃名稱' },
    { field: 'USR_No', header: '收銀員編號' },

    // --- 金額核對欄位 (主額) ---
    { field: 'BOOK_PayAmt', header: '電腦金額(系統帳)', format: formatAmount },
    { field: 'ACT_PayAmt', header: '實收金額', format: formatAmount },
    { field: 'OVER_PayAmt', header: '溢欠金額(實收-系統)', format: formatAmount },
    { field: 'MOD_PayAmt', header: '現額修正實際金額', format: formatAmount },

    // --- 筆數相關 ---
    { field: 'BOOK_PayCnt', header: '應繳筆數', format: formatAmount },
    { field: 'ACT_PayCnt', header: '實繳筆數', format: formatAmount },

    // --- 自我報帳欄位 ---
    { field: 'SELF_PayAmt', header: '自我報帳金額', format: formatAmount },
    { field: 'SOVER_PayAmt', header: '自我溢欠(自報-系統)', format: formatAmount },

    // --- 分類金額 第一組 (通常為現金或主要付款) ---
    { field: 'BOOK_PayAmt1', header: '第一組電腦金額', format: formatAmount, visible: false },
    { field: 'ACT_PayAmt1', header: '第一組實收金額', format: formatAmount, visible: false },
    { field: 'OVER_PayAmt1', header: '第一組溢欠金額', format: formatAmount, visible: false },

    // --- 分類金額 第二組 (AE卡或其他) ---
    { field: 'BOOK_PayAmt2', header: '第二組電腦金額', format: formatAmount, visible: false },
    { field: 'ACT_PayAmt2', header: '第二組實收金額', format: formatAmount, visible: false },
    { field: 'OVER_PayAmt2', header: '第二組溢欠金額', format: formatAmount, visible: false },

    // --- 分類金額 第三組 (大來卡或其他) ---
    { field: 'BOOK_PayAmt3', header: '第三組電腦金額', format: formatAmount, visible: false },
    { field: 'ACT_PayAmt3', header: '第三組實收金額', format: formatAmount, visible: false },
    { field: 'OVER_PayAmt3', header: '第三組溢欠金額', format: formatAmount, visible: false },

    // --- 狀態與備註 ---
    { field: 'Check_Status', header: '審核狀態', format: (v) => v === 'Y' ? '已審核' : '未審核' },
    { field: 'Check_Date', header: '審核日期', format: formatDateTime },
    { field: 'Check_USR_Name', header: '審核人員' },
    { field: 'Remark', header: '備註' },

    // --- 收銀機主檔附加資訊 ---
    { field: 'ECR_Type', header: '機台類型', visible: false },
    { field: 'ECR_Group', header: '館別代碼', visible: false },
    { field: 'ECR_SubGroup', header: '樓層代碼', visible: false },
    { field: 'ECR_LocNo', header: '店位代碼', visible: false },
    { field: 'ECR_Status', header: '收銀機狀態', visible: false },

    // --- 稽核資訊 ---
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime, visible: false },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', format: formatDateTime, visible: false },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
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
        MOD_Date_S: this.datePipe.transform(frm.value.MOD_Date_S, 'yyyy-MM-dd'),
        MOD_Date_E: this.datePipe.transform(frm.value.MOD_Date_E, 'yyyy-MM-dd'),
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
