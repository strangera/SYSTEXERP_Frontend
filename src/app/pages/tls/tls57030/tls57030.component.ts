import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { QueryTLS57030Request, TLS57030Detail, TLS57030Service } from '../../../service/api/tls/tls57030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    AsyncPipe,
    DropdownTableComponent,
    RadiobuttonComponent,
    ButtonModule
  ],
})
export class TLS57030Component extends BasicQueryPageComponent<TLS57030Detail> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [null],
    LOGO_No: [null],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_No: [null as string | null],
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]],
    STK_Date: [new Date(), [Validators.required]],
    ShowStockRange: ['1'],
    pageSize: [30],
    pageIndex: [1]
  });

  warehouseOptions = this.dropdown.queryPos2034();
  brandCodeOptions = this.dropdown.queryPluLogo();
  stockRangeOptions = [
    { value: '1', label: '全顯示' },
    { value: '2', label: '僅顯示不為零庫存' },
    { value: '3', label: '僅顯示零庫存' },
    { value: '4', label: '僅顯示負庫存' }
  ];

  data: TLS57030Detail[] = [];
  footerData: TLS57030Detail | null = null;
  totalRecords = 0;
  historyRequestBody: QueryTLS57030Request | null = null;
  columnGroup = [{ field: '合計', header: '合計' }];
  columns: ReportColumn[] = [
    { field: 'LOGO_CH_NAME', header: '品牌名稱' },
    { field: 'HOS_NAME', header: '倉別' },
    { field: 'PLU_MagNo', header: '管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'CAT_LName', header: '大分類' },
    { field: 'CAT_MName', header: '中分類' },
    { field: 'CAT_SName', header: '小分類' },
    { field: 'PLU_OrderPrc', header: '進價(未稅)', format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價(含稅)', format: formatAmount },
    { field: 'STK_CurrentQty', header: '數量合計', format: formatAmount },
    { field: 'sumPLU_OrderPrc', header: '進價(未稅)', groupField: '合計', format: formatAmount },
    { field: 'sumPLU_SalePrc', header: '售價(含稅)', groupField: '合計', format: formatAmount },
  ];

  constructor(
    public readonly tls57030Service: TLS57030Service,
    private readonly dropdown: DropdownApiService,
    private readonly tls52010Service: Tls52010Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57030');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_Date: this.datePipe.transform(frm.value.STK_Date, 'yyyy-MM-dd'),
        pageSize: frm.value.pageSize || 30
      }

      this.tls57030Service.queryTLS57030(body).pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.footerData = res.AllData[0] || null;
        this.totalRecords = res.TotalCount ?? this.data.length;
        this.historyRequestBody = body;
      });
    });
  }
  // 管理編號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const inputString = event.label || '';
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
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }

    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];

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
  btnLoading = false;
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57030Service.exportTLS57030PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57030Service.exportTLS57030Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}
