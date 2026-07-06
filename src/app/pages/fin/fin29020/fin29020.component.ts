import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service, QueryBankAccountRequest } from '@service/api/fin/fin24010.service';
import { FIN29020Detail, FIN29020QueryRequest, FIN29020Service } from '@service/api/fin/fin29020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin29020',
  templateUrl: './fin29020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    CommonModule,
    TableReportComponent,
    InputTextRangeComponent,
    DropdownComponent,
    ButtonModule,
    AsyncPipe
  ]
})
export class FIN29020Component extends BasicQueryPageComponent<FIN29020Detail> implements OnInit {
  queryForm = this.formBuilder.group({
    DateFrom: [null],           // 匯款日期(起)
    DateTo: [null],             // 匯款日期(迄)
    BNK_No: [null],             // 公司匯出銀行代號 APS3007.BNK_No
    WslipNoFrom: [null, [Validators.maxLength(12)]],          // 匯款單號(起)
    WslipNoTo: [null, [Validators.maxLength(12)]],            // 匯款單號(迄)
    VEN_No: [null],             // 廠商代號 APS3004.PAM_Target
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'RmtDate', order: 1 }]],
  });

  data: FIN29020Detail[] = [];
  lastQueryBody: FIN29020QueryRequest | null = null;
  selectedItems: FIN29020Detail[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportXLSXbtnLoading = false;
  footerData: any | null = null;
  subtotalData: any | null = null;

  columns: ReportColumn[] = [
    { field: 'WslipNo', header: '匯款單號', visible: true },
    { field: 'BankInfo', header: '銀行代號', visible: true },
    { field: 'RmtDate', header: '匯款日期', visible: true, format: formatDate },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'VendorBankNo', header: '匯款銀行代號', visible: true },
    { field: 'VendorBankNane', header: '解款銀行名稱', visible: true },
    { field: 'VendorAccNo', header: '銀行帳號', visible: true },
    { field: 'VendorAccName', header: '帳戶名稱', visible: true },
    { field: 'PayAmount', header: '帳款金額', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'RemitAmount', header: '匯款金額', visible: true, format: formatAmount, isSubTotal: true },
  ];

  VEN_BNK_No_ParamOptions: QueryBankAccountRequest[] = []; // 匯款銀行代號
  VendorNoOptions = this.dropdownApiService.queryPos2013({ VEN_Flag: '' })
  RmtStatusOptions = [
    { label: '未確認', value: '0' },
    { label: '已確認', value: '1' }
  ];

  constructor(
    public readonly fin29020Service: FIN29020Service,
    private readonly fin24010Service: Fin24010Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN29020');
    this.fin24010Service.queryBankAccount().pipe(untilDestroyed(this)).subscribe(response => {
      this.VEN_BNK_No_ParamOptions = response.Data.map(item => ({ ...item, label: item.BNK_id + ' - ' + item.BNK_AccName }))
    });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();
      const body = {
        ...form.getRawValue(),
        DateFrom: this.datePipe.transform(formValue.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datePipe.transform(formValue.DateTo, 'yyyy-MM-dd'),
      }
      this.fin29020Service.queryFIN29020(body).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.lastQueryBody = body;
        this.data = response.Data;
        this.footerData = response.Totals;
        this.subtotalData = response.SubTotals;
        this.totalRecords = response.TotalCount ?? this.data.length;
      });
    });
  }
  // ========= 匯出 =========
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin29020Service.exportFIN29020PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.pdf',
      (isLoading) => this.exportPDFbtnLoading = isLoading
    ).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin29020Service.exportFIN29020(this.lastQueryBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.xlsx',
      (isLoading) => this.exportXLSXbtnLoading = isLoading
    ).subscribe();
  }
}
