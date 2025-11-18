import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55090Service, QueryFIN55090Request, QueryFIN55090Response } from '@service/api/fin/fin55090.service'; // 假設路徑
import { DropdownApiService } from '@service/utility/dropdown-api.service'; // 假設路徑
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component'; // 假設路徑
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component'; // 假設路徑
import { formatAmount2 } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component'; // 假設路徑
import { ButtonComponent } from '../../../shared/componentkit/button/button.component'; // 假設路徑
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component'; // 假設路徑
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component'; // 假設路徑
import { EditColumn } from './../../../shared/componentkit/table-edit/table-edit.model'; // 假設路徑
import { FileExportService } from './../../../shared/service/file-export.service'; // 假設路徑

@Component({
  selector: 'app-fin55090',
  templateUrl: './fin55090.component.html',
  standalone: true,
  imports: [
    ButtonModule, TableReportComponent, MenubarComponent, AccordionModule, AsyncPipe,
    FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, RadiobuttonComponent,
    DropdownComponent, CheckboxModule, ButtonComponent, TranslateModule,
  ]
})
export class FIN55090Component extends BasicQueryPageComponent<QueryFIN55090Response> implements OnInit {
  queryForm = this.formBuilder.group({
    DateFrom: this.formBuilder.nonNullable.control('', [Validators.required]),
    DateTo: this.formBuilder.nonNullable.control('', [Validators.required]),
    // 類別預設為 '0' (統制)
    Ledger_MD: this.formBuilder.nonNullable.control('0' as '0' | '1', [Validators.required]),
    // 部門/活動代碼為選填
    OrgId: this.formBuilder.control<string | null>(null),
    ProjectNo: this.formBuilder.control<string | null>(null),
    // 預設不顯示餘額為零的科目 (false)，預設列印簽核欄 (true)
    ShowZero: this.formBuilder.nonNullable.control(false),
    PrintSign: this.formBuilder.nonNullable.control(true),
  });
  // 類別選項: '0'=統制(4碼), '1'=明細(全碼)
  Ledger_MDOptions = [
    { label: '統制 (4碼)', value: '0' },
    { label: '明細 (全碼)', value: '1' },
  ];
  // 部門選項 (Sys3100)
  OrgIdOptions = this.dropdownApi.querySys3100();
  // 活動代碼選項 (假設 API 為 querySys4001)
  ProjectNoOptions = this.dropdownApi.queryTALPORDERM_DropDownList();

  data: QueryFIN55090Response[] = [];

  // 修正欄位映射，使用後端 API 回傳的實際欄位名稱 (QueryFIN55090Response)
  columns: EditColumn[] = [
    { field: 'STYPE_NAME', header: '科目名稱' },
    { field: 'Cur_AMT', header: '本期交易金額', format: formatAmount2 },
    { field: 'Cur_LTYPE_SUM', header: '合計', format: formatAmount2 },
    { field: 'Cur_PERCENT', header: '百分比 (%)' },
    { field: 'YTD_AMT', header: '累計交易金額', format: formatAmount2 },
    { field: 'YTD_LTYPE_SUM', header: '累計合計', format: formatAmount2 },
    { field: 'YTD_PERCENT', header: '累計百分比 (%)' }
  ];

  historyRequestBody: QueryFIN55090Request = {} as QueryFIN55090Request;
  totalRecords = 0;
  footerData: QueryFIN55090Response | null = null;
  btnLoading = false;

  constructor(
    public readonly fin55090Service: Fin55090Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) {
    // 需明確呼叫父類建構子
    super();
  }

  ngOnInit(): void {
    // 假設 initializePage 會設定 ProgNo 和其他父類屬性
    this.initializePage('FIN55090');
  }

  // 查詢事件處理
  onSubmit(frm: FormGroup) {
    // 確保表單是有效的，並且呼叫父類的 handleSubmit (假設它處理 loading 和 submitted 狀態)
    this.handleSubmit(frm, () => {
      // 強轉型為 QueryFIN55090Request
      const requestBody = {
        ...frm.value,
        DateFrom: this.datePipe.transform(frm.value.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datePipe.transform(frm.value.DateTo, 'yyyy-MM-dd'),
      } as QueryFIN55090Request;

      this.fin55090Service.queryFIN55090(requestBody).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        // 資料最後一筆不要放進data
        this.data = response.Data.slice(0, response.Data.length - 1);
        this.totalRecords = response.TotalCount - 1;
        // 資料最後一筆放進footerDate
        this.footerData = response.Data[response.Data.length - 1];
        // 儲存最新的查詢參數用於匯出
        this.historyRequestBody = requestBody;
      });
    });
  }

  // 匯出 PDF 事件處理
  onExportPDF() {
    if (this.data.length === 0) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<HttpResponse<Blob>> = this.fin55090Service.exportFIN55090PDF(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',              // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );
  }
}
