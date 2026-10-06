import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy'; // 假設路徑
import { TranslateModule } from '@ngx-translate/core';
import { Fin55080Service, QueryFIN55080Request, QueryFIN55080Response } from '@service/api/fin/fin55080.service'; // 假設路徑
import { DropdownApiService } from '@service/utility/dropdown-api.service'; // 假設路徑
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component'; // 假設路徑
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component'; // 假設路徑
import { ButtonComponent } from '../../../shared/components/button/button.component'; // 假設路徑
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component'; // 假設路徑
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component'; // 假設路徑
import { FileExportService } from './../../../shared/service/file-export.service'; // 假設路徑
import { TableSubheaderGroupingComponent } from './fin55080-table/fin55080-table.component';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

@Component({
  selector: 'app-fin55080',
  // 使用內嵌模板，符合單一檔案規範
  templateUrl: './fin55080.component.html',
  standalone: true,
  imports: [ReportSignatureComponent, 
    TableSubheaderGroupingComponent,
    ButtonModule, MenubarComponent, AccordionModule, AsyncPipe,
    FormsModule, ReactiveFormsModule, CalendarRangeComponent, RadiobuttonComponent,
    DropdownComponent, CheckboxModule, ButtonComponent, TranslateModule, InputTextComponent,
  ],
  providers: [DatePipe] // DatePipe 需要加入 providers
})
export class FIN55080Component extends BasicQueryPageComponent<QueryFIN55080Response> implements OnInit {
  // 由於 FIN55080 的資料結構與 FIN55090 類似，這裡使用 QueryFIN5508Response 介面
  queryForm = this.formBuilder.group({
    DateFrom: this.formBuilder.nonNullable.control(new Date(), [Validators.required]),
    DateTo: this.formBuilder.nonNullable.control(new Date(), [Validators.required]),
    // 類別預設為 '1' (明細)
    Ledger_MD: this.formBuilder.nonNullable.control('0' as '0' | '1', [Validators.required]),
    // 部門/活動代碼為選填
    OrgId: this.formBuilder.control<string | null>(null),
    IsCludeDownOrg: this.formBuilder.control('N'), // 預設不含下層部門
    ProjectNo: this.formBuilder.control<string | null>(null),
    // 預設不顯示餘額為零的科目 (N)，預設列印簽核欄 (Y)
    ShowZero: this.formBuilder.nonNullable.control('0'),
    PrintSign: this.formBuilder.nonNullable.control(1),
  });

  // 類別選項: '0'=統制(4碼), '1'=明細(全碼)
  Ledger_MDOptions = [
    { label: '統制', value: '0' },
    { label: '明細', value: '1' },
  ];
  // 部門選項 (Sys3100)
  OrgIdOptions = this.dropdownApi.querySys3100();
  ProjectNoOptions = this.dropdownApi.queryGls3002AcctKey();

  data: QueryFIN55080Response[] = [];
  historyRequestBody: QueryFIN55080Request = {} as QueryFIN55080Request;
  totalRecords = 0;
  // footerData 儲存總計資料
  footerData: QueryFIN55080Response | null = null;
  btnLoading = false;

  constructor(
    public readonly fin55080Service: Fin55080Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) {
    // 需明確呼叫父類建構子
    super();
  }

  ngOnInit(): void {
    // 初始化頁面，設定 ProgNo
    this.initializePage('FIN55080');
  }

  // 查詢事件處理
  onSubmit(frm: FormGroup) {
    // 確保表單是有效的，並且呼叫父類的 handleSubmit
    this.handleSubmit(frm, () => {
      // 強轉型為 QueryFIN5508Request，並格式化日期
      const requestBody = {
        ...frm.value,
        DateFrom: this.datePipe.transform(frm.value.DateFrom, 'yyyy-MM'),
        DateTo: this.datePipe.transform(frm.value.DateTo, 'yyyy-MM'),
      } as QueryFIN55080Request;

      this.fin55080Service.queryFIN55080(requestBody).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        const responseData = response.Data;
        if (!responseData || responseData.length === 0) {
          this.data = [];
          this.footerData = null;
          this.totalRecords = 0;
          return;
        }

        // 假設最後一筆是總計資料
        const listData = responseData.slice(0, responseData.length - 1);
        const footerItem = responseData[responseData.length - 1];

        // 數據轉換邏輯 (類似 FIN55090，用於表格顯示)
        this.data = listData.map((item: QueryFIN55080Response) => ({
          ...item,
          // 將科目代碼和名稱合併
          STYPE_NAME: (item.STYPE_ID || '') + ' ' + item.STYPE_NAME, // TODO:我前端自己改位置，但其實要SP改
          STYPE_AMT: item.STYPE_ID ? (item.STYPE_AMT ?? null) : '', // TODO:我前端自己改位置，但其實要SP改
        }));

        this.totalRecords = response.TotalCount - 1;

        // 總計行放進 footerData，並清空 STYPE_AMT (因為它是總計行的標題)
        this.footerData = {
          ...footerItem,
          STYPE_AMT: null,
          SUM_LTYPE_AMT: footerItem.STYPE_AMT ?? null, // TODO:我前端自己改位置，但其實要SP改
        } as QueryFIN55080Response;

        // 儲存最新的查詢參數用於匯出
        this.historyRequestBody = requestBody;
      });
    });
  }

  // 匯出 PDF 事件處理
  onExportPDF() {
    if (this.data.length === 0) {
      // 避免匯出空資料
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.fin55080Service.exportFIN55080PDF(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
  // 匯出 Excel 事件處理
  onExportExcel() {
    if (this.data.length === 0) {
      // 避免匯出空資料
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.fin55080Service.exportFIN55080(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'xlsx',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}
