import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DetailData, DetailFooter, QueryTLS57050Request, SummaryData, SummaryFooter, Tls57050Service } from '@service/api/tls/tls57050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57050',
  templateUrl: './tls57050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    InputNumberComponent,
    TableReportComponent,
    CalendarRangeQuickComponent,
    AsyncPipe,
    ProductAutocompleteComponent
  ],
})
export class TLS57050Component extends BasicQueryPageComponent<DetailData | SummaryData> implements OnInit {
  queryForm = this.formBuilder.group({
    ReportType: [1, [Validators.required]],
    TXN_Date_Start: [yesterday, [Validators.required]],
    TXN_Date_End: [yesterday, [Validators.required]],
    LOGO_No: [null],
    VEN_No: [null],
    ECR_No: [null],
    TXN_SaleNoteNo: [null, [Validators.maxLength(30)]],
    TXN_No: [null, [Validators.maxLength(8)]],
    PLU_MagNo: ['', [Validators.maxLength(20)]],
    PLU_No: [null, [Validators.maxLength(20)]],
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]],
  });
  totalRecords = 0;
  ECR_NoOptions = this.dropdown.queryPos1002(); // 收銀機
  brandCodeOptions = this.dropdown.queryPluLogo(); // 品牌
  vendorOptions = this.dropdown.queryPos2013TltTalent();// 廠商
  data: (DetailData[] | SummaryData[]) = [];
  footerData: (DetailFooter[] | SummaryFooter[]) = [];
  columns: ReportColumn[] = [];
  historyRequestBody: QueryTLS57050Request | null = null;

  constructor(
    public readonly tls57050Service: Tls57050Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57050');
  }
  updateTableColumns(displayMode: number | null) {
    if (displayMode === 1) { // 彙總模式
      this.columns = [
        { field: 'TXN_SaleNoteNo', header: '銷貨單號' },
        { field: 'TXN_Date', header: '交易日期', format: formatDate },
        { field: 'ECR_No', header: '收銀機號' },
        { field: 'TXN_No', header: '交易序號' },
        { field: 'LOGO_No', header: '品牌代碼' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'GUINO', header: '發票號碼' },
        { field: 'TXN_TotQty', header: '數量' },
        { field: 'PLU_SalePrc', header: '銷售定價', format: formatAmount },
        { field: 'TXN_TotSaleAmt', header: '銷售金額', format: formatAmount },
        { field: 'TotRebate', header: '整張折讓', format: formatAmount },
        { field: 'TotDisc', header: '整張折扣', format: formatAmount },
      ];
    } else if (displayMode === 2) { // 明細模式
      this.columns = [
        { field: 'TXN_SaleNoteNo', header: '銷貨單號' },
        { field: 'TXN_Date', header: '交易日期', format: formatDate },
        { field: 'ECR_No', header: '收銀機號' },
        { field: 'TXN_No', header: '交易序號' },
        { field: 'LOGO_No', header: '品牌代碼' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'GUINO', header: '發票號碼' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_No', header: '國際條碼' },
        { field: 'PLU_Name', header: '商品名稱' },
        { field: 'TXN_Qty', header: '數量' },
        { field: 'PLU_SalePrc', header: '銷售定價', format: formatAmount, isSubTotal: true },
        { field: 'TXN_SaleAmt', header: '銷售金額', format: formatAmount, isSubTotal: true },
        { field: 'TotRebate', header: '整張折讓', format: formatAmount, isSubTotal: true },
        { field: 'TotDisc', header: '整張折扣', format: formatAmount, isSubTotal: true },
      ];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const displayMode = formValue.ReportType;
      const requestBody: QueryTLS57050Request = {
        ReportType: displayMode === 1 ? '彙總' : '明細',
        TXN_Date_Start: formValue.TXN_Date_Start ? this.datePipe.transform(formValue.TXN_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        TXN_Date_End: formValue.TXN_Date_End ? this.datePipe.transform(formValue.TXN_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        LOGO_No: formValue.LOGO_No,
        VEN_No: formValue.VEN_No,
        ECR_No: formValue.ECR_No,
        TXN_SaleNoteNo: formValue.TXN_SaleNoteNo,
        TXN_No: formValue.TXN_No,
        PLU_MagNo: formValue.PLU_MagNo,
        PLU_No: formValue.PLU_No,
        PLU_OrgPLUNo: formValue.PLU_OrgPLUNo,
        pageIndex: 1,
        pageSize: 30,
      };

      this.tls57050Service.queryTLS57050(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data) {
          this.totalRecords = response.TotalCount;
          this.historyRequestBody = requestBody;
          this.data = response.Data;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.footerData = response.FooterData
          this.updateTableColumns(displayMode);
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.warnBubble(response.Message || '沒有找到符合條件的資料。');
        }
      });
    })
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.tls57050Service.exportTLS57050PDF(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'pdf',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();

  }
  onExportXLSX() {
    if (!this.historyRequestBody) {
      return;
    }
    // 確保使用 historyRequestBody
    const export$: Observable<any> = this.tls57050Service.exportTLS57050Excel(this.historyRequestBody);

    // 使用 fileExportService 統一處理檔案下載和 loading 狀態
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)), // 傳遞 Observable 並加入銷毀處理
      '.' + 'xlsx',        // 傳遞檔案副檔名
      (isLoading: boolean) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}
