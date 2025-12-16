import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Shared
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin29010Data, Fin29010Request, Fin29010Service } from '@service/api/fin/fin29010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatYYYYMM, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

//1.2.9.1 保留款彙總表
@Component({
  selector: 'app-fin29010',
  templateUrl: './fin29010.component.html',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN29010Component extends BasicQueryPageComponent<Fin29010Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ACP_YYYYMM_Start: [null], //帳款年月
    ACP_YYYYMM_End: [null], //帳款年月
    VEN_No: [null], // 廠客代號
    ShowIfReserveAmtZero: [true], // 目前保留金額為零是否顯示
    PageSize: [30],
    PageIndex: [1],
  });
  data: Fin29010Data[] = [];
  footerData: Fin29010Data | null = null;
  historyRequestBody: Fin29010Request | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'ACP_YYYYMM', header: '年月', format: formatYYYYMM },
    { field: 'acp_termno', header: '帳次' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'ACP_ReserveAmt', header: '保留金額', format: formatAmount },
    { field: 'RET_Amt', header: '退保留金額', format: formatAmount },
    { field: 'Current_ReserveAmt', header: '目前保留金額', format: formatAmount },
  ];
  factoryIDOptions = [];
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  constructor(
    public readonly fin29010Service: Fin29010Service,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN29010');
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        ACP_YYYYMM_Start: this.datePipe.transform(frm.value.ACP_YYYYMM_Start, 'yyyyMM'),
        ACP_YYYYMM_End: this.datePipe.transform(frm.value.ACP_YYYYMM_End, 'yyyyMM'),
      }
      this.fin29010Service.queryFIN29010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.totalRecords = res.TotalCount;
        this.data = res.Data;
        this.footerData = res.footerData;
        this.historyRequestBody = body;
      })
    });
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }

    const export$ = this.fin29010Service.exportFIN29010PDF(this.historyRequestBody);

    // 呼叫 Service 執行匯出，並將直到銷毀的邏輯加入
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), // 將 untilDestroyed 加入 Service 回傳的 Observable
      '.xlsx',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );
  }
  onExportXLSX() {

    if (!this.historyRequestBody) {
      return;
    }
    const export$ = this.fin29010Service.exportFIN29010Excel(this.historyRequestBody);

    // 呼叫 Service 執行匯出，並將直到銷毀的邏輯加入
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)), // 將 untilDestroyed 加入 Service 回傳的 Observable
      '.pdf',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );
  }
}
