import { AsyncPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { QueryPOS2005PLUNo, QueryPOS2005PLUNoResponse, QueryTLS57080DetailsApiResponse, QueryTLS57080Request, Tls57080Service } from '@service/api/tls/tls57080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
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
    StartDate: [new Date('2025/01/01') as Date | null, [Validators.required]],
    EndDate: [new Date('2025/06/09') as Date | null, [Validators.required]],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_No: ['3605970363222', [Validators.required, Validators.maxLength(20)]],
    HOS_No: ['0001', [Validators.maxLength(4)]],
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
    { field: 'PLU_NO', header: '國際條碼' },
    { field: 'PLU_Name', header: '品牌' },
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
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No + ' - ' + item.PLU_OrgPLUNo,
      }))];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  // 國際條碼
  opLoading2 = false;
  opForm2 = this.formBuilder.group({
    PLU_No: [null, [Validators.maxLength(20)]], // 國際條碼
    PLU_Name: [null, [Validators.maxLength(60)]], // 商品名稱
    LOGO_No: [null, [Validators.maxLength(60)]], // 品牌代碼
    ...createPaginationConfig([{ field: 'PLU_No', order: 1 }]), // 分頁和排序參數
  });
  suggestions2: QueryPOS2005PLUNoResponse[] = [];
  fieldsConfig2: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼', mainDataField: true },
  ];
  opData2: QueryPOS2005PLUNoResponse[] = [];
  opColumns2: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords2 = 0;
  onAutoCompleteInputChange2(event: any) {
    const body = {
      ...event,
      PLU_No: event.PLU_No || null,
      PLU_Name: null,
      LOGO_No: null,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    this.tls57080Service.queryPOS2005PLUNo(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions2 = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No,
      }))];
    });
  }
  onformValueChanged2(event: QueryPOS2005PLUNo) {
    this.opLoading2 = true;
    const body = {
      PLU_No: event.PLU_No || null,
      PLU_Name: event.PLU_Name || null,
      LOGO_No: event.LOGO_No || null,
      pageSize: 20,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    };
    this.tls57080Service.queryPOS2005PLUNo(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData2 = [...results.Data]; // 更新data資料
      this.opTotalRecords2 = results.TotalCount;
      this.opLoading2 = false;
    });
  }
}
