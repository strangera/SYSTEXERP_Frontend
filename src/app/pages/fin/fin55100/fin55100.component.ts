import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55100Service, QueryFIN55100Request, QueryFIN55100Response } from '@service/api/fin/fin55100.service'; // 假設路徑
import { DropdownApiService } from '@service/utility/dropdown-api.service'; // 假設路徑
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component'; // 假設路徑
import { CalendarRangeComponent } from "@shared/components/calendar-range/calendar-range.component"; // 假設路徑
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component'; // 假設路徑
import { ButtonComponent } from '../../../shared/components/button/button.component'; // 假設路徑
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component'; // 假設路徑
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component'; // 假設路徑
import { TableSubheaderGroupingComponent } from '../fin55100/fin55100-table/fin55100-table.component';
import { FileExportService } from './../../../shared/service/file-export.service';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin55100',
  templateUrl: './fin55100.component.html',
  standalone: true,
  imports: [
    TableSubheaderGroupingComponent,
    ButtonModule, MenubarComponent, AccordionModule, AsyncPipe,
    FormsModule, ReactiveFormsModule, RadiobuttonComponent,
    DropdownComponent, CheckboxModule, ButtonComponent, TranslateModule, InputTextComponent,
    CalendarRangeComponent
  ]
})
// 變更泛型參數和類別名稱
export class FIN55100Component extends BasicQueryPageComponent<QueryFIN55100Response> implements OnInit {
  // 表單結構與 FIN55100 相同
  queryForm = this.formBuilder.group({
    DateFrom: this.formBuilder.nonNullable.control(null, [Validators.required]),
    DateTo: this.formBuilder.nonNullable.control(null, [Validators.required]),
    CmpDateFrom: this.formBuilder.nonNullable.control(null, [Validators.required]),
    CmpDateTo: this.formBuilder.nonNullable.control(null, [Validators.required]),
    // 類別預設為 '1' (明細)
    Ledger_MD: this.formBuilder.nonNullable.control('1', [Validators.required]),
    OrgId: this.formBuilder.control<string | null>(null),
    ProjectNo: this.formBuilder.control<string | null>(null),
    ShowZero: this.formBuilder.nonNullable.control(false),
    PrintSign: this.formBuilder.nonNullable.control(true),
  });

  // 選項與 FIN55100 相同
  Ledger_MDOptions = [
    { label: '統制', value: '0' },
    { label: '明細', value: '1' },
  ];
  OrgIdOptions = this.dropdownApi.querySys3100();
  ProjectNoOptions = this.dropdownApi.queryGls3002AcctKey();

  // 變更資料型別
  data: QueryFIN55100Response[] = [];
  historyRequestBody: any; // 使用假設的介面
  totalRecords = 0;
  footerData: QueryFIN55100Response | null = null;
  btnLoading = false;

  constructor(
    // 變更注入的 Service
    public readonly fin55100Service: Fin55100Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    // 變更 ProgNo
    this.initializePage('FIN55100');
  }
  // 查詢事件處理 (與 FIN55100 邏輯相同，但使用 FIN55100 Service)
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 強轉型為 QueryFIN55100Request
      const requestBody = {
        ...frm.value,
        DateFrom: this.datePipe.transform(frm.value.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datePipe.transform(frm.value.DateTo, 'yyyy-MM-dd'),
        CmpDateFrom: this.datePipe.transform(frm.value.CmpDateFrom, 'yyyy-MM-dd'),
        CmpDateTo: this.datePipe.transform(frm.value.CmpDateTo, 'yyyy-MM-dd'),
      } as QueryFIN55100Request;

      this.fin55100Service.queryFIN55100(requestBody).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        // 資料處理邏輯與 FIN55100 相同
        this.data = response.Data.slice(0, response.Data.length - 1).map((item: QueryFIN55100Response) => ({
          ...item,
          STYPE_NAME: (item.STYPE_ID || '') + ' ' + item.STYPE_NAME,
        }))
          // 幫我把LTYPE_NAME為營業費用的LTYPE_ID改為null 還有STYPE_NAME為"營業毛利 合計"的LTYPE_NAME改為"營業毛利"和LTYPE_ID改為null
          .map((item: QueryFIN55100Response) => {
            if (item.STYPE_NAME?.trim() === '營業損益 合計') {
              return { ...item, LTYPE_NAME: '營業損益', LTYPE_ID: null };
            }
            if (item.STYPE_NAME?.trim() === '營業毛利 合計') {
              return { ...item, LTYPE_NAME: '營業毛利', LTYPE_ID: null };
            }
            return item;
          });
        this.totalRecords = response.TotalCount - 1;
        this.footerData = {
          ...response.Data[response.Data.length - 1],
          Cur_AMT: "",
          YTD_AMT: "",
        }
        this.historyRequestBody = requestBody;
      });
    });
  }

  // 匯出 PDF 事件處理 (與 FIN55100 邏輯相同，但使用 FIN55100 Service)
  onExportPDF() {
    if (this.data.length === 0) {
      return;
    }
    // 變更匯出 Service 呼叫
    const export$: Observable<HttpResponse<Blob>> = this.fin55100Service.exportFIN55100PDF(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }

  onExportXLSX() {
    if (this.data.length === 0) {
      return;
    }
    // 變更匯出 Service 呼叫
    const export$: Observable<HttpResponse<Blob>> = this.fin55100Service.exportFIN55100Excel(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'xlsx',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}
