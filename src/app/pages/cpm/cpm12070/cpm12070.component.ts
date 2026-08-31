import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12070MatrixRequest, CPM12070MatrixResponse, CPM12070Request, CPM12070Response, Cpm12070Service } from '@service/api/cpm/cpm12070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

@Component({
  selector: 'app-cpm12070',
  templateUrl: './cpm12070.component.html',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, CalendarRangeComponent, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, RadioButtonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  providers: [DatePipe]
})
export class CPM12070Component extends BasicQueryPageComponent<CPM12070Response> implements OnInit {
  queryForm = this.formBuilder.group({
    KIND_IDs: [null],    // 改為對應後端 SP 參數名
    CLASS_IDs: [null],   // 責任單位 (CSS1005) 多選，未選=查詢範圍內查得到的全部責任單位
    DATE_FROM: [null],   // 改為對應後端 SP 參數名
    DATE_TO: [null],     // 改為對應後端 SP 參數名
    ReportType: ['0'],   // '0'=統計表, '1'=明細表(本次未實作)
  });

  data: CPM12070Response[] = [];
  totalRecords = 0;
  historyRequestBody: CPM12070Request | null = null;

  matrix: CPM12070MatrixResponse | null = null;
  matrixRowHeader = '月份'; // 統計表=月份，明細表=日期，隨最後一次查詢的報表類型變動
  lastMatrixRequest: CPM12070MatrixRequest | null = null;
  lastIsDetail = false;
  excelBtnLoading = false;
  pdfBtnLoading = false;

  private readonly destroyRef = inject(DestroyRef);

  columns: ReportColumn[] = [
    { field: 'KIND_ID', header: '客戶意見類別代號' },
    { field: 'KIND_Name', header: '客戶意見類別名稱' },
    { field: 'TotalCount', header: '總件數', align: 'right', format: formatAmount },
    { field: 'DoneCount', header: '完成件數', align: 'right', format: formatAmount },
    { field: 'PendingCount', header: '待處理件數', align: 'right', format: formatAmount },
  ];

  // 這裡建議之後可以從下拉選單 API 取得，目前先放靜態或空陣列
  opinionOptions = this.dropDown.queryCss1002()

  // 責任單位 (CSS1005) 多選選項
  unitOptions = this.dropDown.queryCss1005()

  constructor(
    public readonly cpm12070Service: Cpm12070Service,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
    private readonly dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12070');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const KIND_IDs = Array.isArray(formValue.KIND_IDs) ? formValue.KIND_IDs.join(',') : formValue.KIND_IDs;
      const CLASS_IDs = Array.isArray(formValue.CLASS_IDs) ? formValue.CLASS_IDs.join(',') : formValue.CLASS_IDs;
      // 取得當前年份
      const currentYear = new Date().getFullYear();
      const defaultDateFrom = new Date(currentYear, 0, 1);  // 今年 1 月 1 日
      const defaultDateTo = new Date(currentYear, 11, 31);  // 今年 12 月 31 日
      const DATE_FROM = this.datePipe.transform(formValue.DATE_FROM ?? defaultDateFrom, 'yyyy-MM-dd') ?? undefined;
      const DATE_TO = this.datePipe.transform(formValue.DATE_TO ?? defaultDateTo, 'yyyy-MM-dd') ?? undefined;
      // ------------------------------------------------------------------------------------
      // 舊版「意見類別清單」查詢已下架 (SPEC-CPM12070責任單位矩陣報表 子任務5)。
      // 後端 SP_CPM12070Query／queryCPM12070 API 維持現狀、未修改未刪除，這裡只是前端不再
      // 呼叫、也不再渲染對應表格；程式碼保留註解，供未來需要復原時參考，不要直接刪除。
      // ------------------------------------------------------------------------------------
      const requestBody: CPM12070Request = {
        KIND_IDs,
        DATE_FROM,
        DATE_TO,
        PageIndex: 1,
        PageSize: 30,
        SortBy: [{ field: 'KIND_ID', order: 1 }]
      };
      this.cpm12070Service.queryCPM12070(requestBody).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = requestBody;
      });

      this.queryStateService.setQueryState(this.ProgNo, formValue);

      this.matrix = null;
      const matrixRequest: CPM12070MatrixRequest = { KIND_IDs, CLASS_IDs, DATE_FROM, DATE_TO };
      const isDetail = formValue.ReportType === '1';
      this.matrixRowHeader = isDetail ? '日期' : '月份';
      this.lastMatrixRequest = matrixRequest;
      this.lastIsDetail = isDetail;
      const matrix$ = isDetail
        ? this.cpm12070Service.queryCPM12070DetailMatrix(matrixRequest)
        : this.cpm12070Service.queryCPM12070Matrix(matrixRequest);

      matrix$.pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading = false)
      ).subscribe(res => {
        this.matrix = res;
      });
    });
  }

  onExportMatrixExcel() {
    if (!this.lastMatrixRequest) return;
    const export$ = this.lastIsDetail
      ? this.cpm12070Service.exportCPM12070DetailMatrixExcel(this.lastMatrixRequest)
      : this.cpm12070Service.exportCPM12070MatrixExcel(this.lastMatrixRequest);
    this.fileExportService.executeFileExport(
      export$.pipe(takeUntilDestroyed(this.destroyRef)),
      '.xlsx',
      (loading) => this.excelBtnLoading = loading
    ).subscribe();
  }

  onExportMatrixPdf() {
    if (!this.lastMatrixRequest) return;
    const export$ = this.lastIsDetail
      ? this.cpm12070Service.exportCPM12070DetailMatrixPdf(this.lastMatrixRequest)
      : this.cpm12070Service.exportCPM12070MatrixPdf(this.lastMatrixRequest);
    this.fileExportService.executeFileExport(
      export$.pipe(takeUntilDestroyed(this.destroyRef)),
      '.pdf',
      (loading) => this.pdfBtnLoading = loading
    ).subscribe();
  }
}
