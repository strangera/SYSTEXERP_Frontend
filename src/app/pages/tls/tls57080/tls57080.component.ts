import { AsyncPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { QueryTLS57080DetailsApiResponse, QueryTLS57080Request, Tls57080Service } from '@service/api/tls/tls57080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57080',
  templateUrl: './tls57080.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    ButtonModule,
    TranslateModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    DropdownTableComponent,
    DatePipe,
    DecimalPipe,
    NgIf,
    DividerModule
  ],
})
export class TLS57080Component extends BasicQueryPageComponent<QueryTLS57080DetailsApiResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    StartDate: [null as Date | null, [Validators.required]],
    EndDate: [null as Date | null, [Validators.required]],
    PLU_MagNo: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    PLU_No: [null as string | null, [Validators.maxLength(20)]],
    HOS_No: [null, [Validators.maxLength(4)]],
    PLU_Name: [null, [Validators.maxLength(50)]],
  });
  HOS_NoOptions = this.dropdown.queryPos2034();
  data: QueryTLS57080DetailsApiResponse[] = [];
  headerData: any;
  totalRecords = 0;
  historyRequestBody: QueryTLS57080Request | null = null;
  columns: ReportColumn[] = [
    { field: 'Date', header: '日期' },
    { field: 'nos', header: '單號' },
    { field: 'VEN_NO', header: '廠商編號' },
    { field: 'HOS_NO', header: '倉別' },
    { field: 'Trntype', header: '作業' },
    { field: 'qty', header: '異動量' },
    { field: 'StockQty', header: '庫存量' },
    { field: 'GUINO', header: '發票號碼' },
    { field: 'TRN_BuyPrc', header: '進單價(未稅)', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'TRN_SalePrc', header: '售單價(含稅)', format: (v) => formatAmountWithDecimals(v, 2) },
    { field: 'TRN_BuyAmt', header: '期初成本', format: (v) => formatAmountWithDecimals(v, 2) },
  ];

  constructor(
    private readonly tls57080Service: Tls57080Service,
    private readonly tls52010Service: Tls52010Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57080');
  }

  onSubmit(frm: FormGroup) {
    const body = {
      ...frm.value,
      StartDate: this.datePipe.transform(frm.value.StartDate, 'yyyy-MM-dd'),
      EndDate: this.datePipe.transform(frm.value.EndDate, 'yyyy-MM-dd'),
      PLU_No: frm.value.PLU_No || frm.value.PLU_MagNo,
    }
    this.handleSubmit(frm, () => {
      this.tls57080Service.queryTLS57080(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        if (res.Data.length) {
          this.headerData = res.Data[0].Details[0];
          this.data = res.Data[0].Details.filter(d => d.nos.trim() !== "");
          this.totalRecords = res.Data[0].Details.length - 1;
          this.historyRequestBody = body;
        } else {
          this.headerData = null;
          this.data = [];
          this.totalRecords = 0;
          this.historyRequestBody = null;
        }
      })
    });
  }

  btnLoading = false;
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.tls57080Service.exportTLS57080PDF(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );

  }
  onExportXLSX() {
    if (!this.historyRequestBody) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.tls57080Service.exportTLS57080(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    );

  }
  // 管理編號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: any) {
    const inputString = event.PLU_MagNo || '';

    // 邏輯：檢查目前的輸入內容是否精準匹配 suggestions 中的某個 PLU_MagNo
    // 如果不匹配，則將 PLU_No 清空，避免帶到舊的或錯誤的編號
    const matchedItem = this.suggestions.find(s => s.PLU_MagNo === inputString);
    if (!matchedItem) {
      this.queryForm.controls.PLU_No.setValue('');
    } else {
      this.queryForm.controls.PLU_No.setValue(matchedItem.PLU_No);
    }

    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: inputString,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }

    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo} - ${item.PLU_Name} - ${item.PLU_No} - ${item.PLU_OrgPLUNo}`,
      }));

      // API 回傳後再次檢查，如果輸入的值剛好匹配到結果清單中的唯一一筆，就自動帶入
      const exactMatch = this.suggestions.find(item => item.PLU_MagNo === inputString);
      if (exactMatch) {
        this.queryForm.controls.PLU_No.setValue(exactMatch.PLU_No);
      }
    });
  }
  // 當使用者「選擇」一筆商品時觸發
  onPLUSelect(event: IQueryPOS2004DetailResponse) {
    if (event) {
      // 當選中商品時，自動將該商品的 PLU_No 填入 queryForm
      this.queryForm.patchValue({
        PLU_No: event.PLU_No,
      });
    }
  }
  // suggestions2: QueryPOS2005PLUNoResponse[] = [];
  // fieldsConfig2: FieldsConfig[] = [
  //   { field: 'PLU_No', header: '國際條碼', mainDataField: true },
  // ];
  // onAutoCompleteInputChange2(event: any) {
  //   const body = {
  //     ...event,
  //     PLU_No: event.PLU_No || null,
  //     PLU_Name: null,
  //     LOGO_No: null,
  //     pageSize: 30,
  //     pageIndex: 1,
  //     SortBy: [{ field: 'PLU_No', order: 1 }],
  //   }
  //   this.tls57080Service.queryPOS2005PLUNo(body).pipe(untilDestroyed(this)).subscribe((results) => {
  //     this.suggestions2 = [...results.Data.map(item => ({
  //       ...item,
  //       label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No,
  //     }))];
  //   });
  // }
}
