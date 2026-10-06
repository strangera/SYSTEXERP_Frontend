import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55090Service, QueryFIN55090Request, QueryFIN55090Response } from '@service/api/fin/fin55090.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, Observable } from 'rxjs';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { FileExportService } from './../../../shared/service/file-export.service';
import { TableSubheaderGroupingComponent } from './fin55090-table/fin55090-table.component';
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

@Component({
  selector: 'app-fin55090',
  templateUrl: './fin55090.component.html',
  standalone: true,
  imports: [ReportSignatureComponent, 
    TableSubheaderGroupingComponent, InputTextComponent,
    ButtonModule, MenubarComponent, AccordionModule, AsyncPipe,
    FormsModule, ReactiveFormsModule, CalendarRangeComponent, RadiobuttonComponent,
    MultiSelectComponent, CheckboxModule, ButtonComponent, TranslateModule,
  ]
})
export class FIN55090Component extends BasicQueryPageComponent<QueryFIN55090Response> implements OnInit {
  queryForm = this.formBuilder.group({
    DateFrom: this.formBuilder.nonNullable.control(null, [Validators.required]),
    DateTo: this.formBuilder.nonNullable.control(null, [Validators.required]),
    // 類別預設為 '0' (統制)
    Ledger_MD: this.formBuilder.nonNullable.control('1' as '0' | '1', [Validators.required]),
    // 部門/活動代碼為選填
    OrgList: this.formBuilder.nonNullable.control([] as string[]),
    IsCludeDownOrg: this.formBuilder.control('N'), // 預設不含下層部門
    ProjectNo: this.formBuilder.control<string | null>(null, [Validators.maxLength(10)]),
    // 預設不顯示餘額為零的科目 (false)，預設列印簽核欄 (true)
    ShowZero: this.formBuilder.nonNullable.control(false),
    PrintSign: this.formBuilder.nonNullable.control(true),
  });
  // 類別選項: '0'=統制(4碼), '1'=明細(全碼)
  Ledger_MDOptions = [
    { label: '統制', value: '0' },
    { label: '明細', value: '1' },
  ];
  // 部門選項 (Sys3100)
  OrgIdOptions = this.dropdownApi.querySys3100();
  data: QueryFIN55090Response[] = [];
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
        DateFrom: this.datePipe.transform(frm.value.DateFrom, 'yyyy-MM'),
        DateTo: this.datePipe.transform(frm.value.DateTo, 'yyyy-MM'),
      } as QueryFIN55090Request;

      this.fin55090Service.queryFIN55090(requestBody).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        // 資料最後一筆不要放進data
        this.data = response.Data.slice(0, response.Data.length - 1).map((item: QueryFIN55090Response) => ({
          ...item,
          STYPE_NAME: (item.STYPE_ID || '') + ' ' + item.STYPE_NAME,
          Cur_AMT: item.STYPE_ID ? (item.Cur_AMT ?? null) : '',
          YTD_AMT: item.STYPE_ID ? (item.YTD_AMT ?? null) : '',
          Cur_LTYPE_SUM: item.STYPE_ID ? '' : (item.Cur_LTYPE_SUM ?? null),
          YTD_LTYPE_SUM: item.STYPE_ID ? '' : (item.YTD_LTYPE_SUM ?? null)
        }));
        this.totalRecords = response.TotalCount - 1;
        // 資料最後一筆放進footerDate
        this.footerData = {
          ...response.Data[response.Data.length - 1],
          Cur_AMT: "",
          YTD_AMT: "",
        }
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
      '.' + 'pdf', 			 // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }

  // 匯出 Excel 事件處理
  onExportExcel() {
    if (this.data.length === 0) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<HttpResponse<Blob>> = this.fin55090Service.exportFIN55090Excel(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'xlsx', 			 // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}
