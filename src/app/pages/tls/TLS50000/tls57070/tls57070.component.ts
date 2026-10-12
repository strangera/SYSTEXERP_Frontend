import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { convertDateToYYYYMM, formatAmount, formatAmountCN, LazyLoadEvent } from '@others/component/table/table.model';
import { Tls57070DataItem, Tls57070Service } from '@service/api/tls/tls57070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { ColumnGroup, formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { Tls57070TableComponent } from './tls57070-table.component';

@Component({
  selector: 'app-tls57070',
  templateUrl: './tls57070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarComponent,
    ButtonComponent,
    ButtonModule,
    TranslateModule,
    AsyncPipe,
    DropdownComponent,
    Tls57070TableComponent
  ],
})
export class TLS57070Component extends BasicQueryPageComponent<Tls57070DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    pageIndex: [1],
    pageSize: [500],
    STK_YM: [new Date(), [Validators.required]], // 存貨年月
    HOS_NOList: [null], // 倉別條件
    LOGO_NoList: [null], // 品牌條件
    ShowType: ['M', [Validators.required]], // 顯示方式(M:彙總，D:明細)
    ShowSTK_SYSADJUSTCOST: [null as string | null],
  });
  HOS_NOListOptions = this.dropdown.queryPos2034(); // 倉別選項
  LOGO_NoListOptions = this.dropdown.queryPluLogo(); // 品牌選項
  showTypeOptions = [
    { label: '彙總', value: 'M' },
    { label: '明細', value: 'D' },
  ]
  sysAdjustCostOptions = [
    { label: '有金額', value: '1' },
    { label: '無金額', value: '0' }
  ];
  totalRecords = 0;
  lastQueryBody: any
  DetailSumData: any
  footerData: any
  data: Tls57070DataItem[] = [];
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [
    { field: 'STK_PRIOR', header: '期初' },
    { field: 'STK_STOCK', header: '進貨' },
    { field: 'STK_REJECT', header: '退貨' },
    { field: 'STK_SALE', header: '銷貨' },
    { field: 'STK_MOVEIN', header: '調入' },
    { field: 'STK_MOVEOUT', header: '調出' },
    { field: 'STK_DIFF', header: '盤點' },
    { field: 'STK_SCRAP', header: '報廢' },
    { field: 'STK_TAKE', header: '領用' },
    { field: 'STK_RETAKE', header: '領用退回' },
    { field: 'STK_TRDIN', header: '同業調撥(入)' },
    { field: 'STK_TRDOUT', header: '同業調撥(出)' },
    { field: 'STK_CURRENT', header: '期末' },
    { field: 'PLU_SALEPRC', header: '期末售價' },
  ]

  constructor(
    public readonly tls57070Service: Tls57070Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57070');
  }
  updateTableColumns(displayMode: string | null) {
    if (displayMode === 'M') { // 彙總模式
      this.columns = [
        // 基本資訊
        { field: 'LOGO_No', header: '品牌' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        // 期初庫存
        { field: 'STK_PRIORQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_PRIOR' },
        { field: 'STK_PRIORCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_PRIOR' },

        // 異動 - 進貨/退貨/銷貨
        { field: 'STK_STOCKQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_STOCK' },
        { field: 'STK_STOCKCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_STOCK' },
        { field: 'STK_REJECTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_REJECT' },
        { field: 'STK_REJECTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_REJECT' },
        { field: 'STK_SALEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_SALE' },
        { field: 'STK_SALECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_SALE' },
        { field: 'STK_SALENET', header: '售價', format: formatAmount, isSubTotal: true, groupField: 'STK_SALE' },

        // 異動 - 調撥
        { field: 'STK_MOVEINQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_MOVEIN' },
        { field: 'STK_MOVEINCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_MOVEIN' },
        { field: 'STK_MOVEOUTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_MOVEOUT' },
        { field: 'STK_MOVEOUTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_MOVEOUT' },

        // 異動 - 盤點/報廢
        { field: 'STK_DIFFQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_DIFF' },
        { field: 'STK_DIFFCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_DIFF' },
        { field: 'STK_SCRAPQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_SCRAP' },
        { field: 'STK_SCRAPCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_SCRAP' },

        // 異動 - 領用
        { field: 'STK_TAKEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TAKE' },
        { field: 'STK_TAKECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TAKE' },
        { field: 'STK_RETAKEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_RETAKE' },
        { field: 'STK_RETAKECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_RETAKE' },

        // 異動 - 同業調撥
        { field: 'STK_TRDINQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TRDIN' },
        { field: 'STK_TRDINCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TRDIN' },
        { field: 'STK_TRDOUTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TRDOUT' },
        { field: 'STK_TRDOUTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TRDOUT' },

        // 期末結算與利潤
        { field: 'STK_SYSADJUSTCOST', header: '調整成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true },
        { field: 'STK_CURRENTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_CURRENT' },
        { field: 'STK_CURRENTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_CURRENT' },
        // { field: 'PLU_SALEPRCNET', header: '未稅', format: formatAmount, isSubTotal: true,  groupField: 'PLU_SALEPRC' },
        // { field: 'PLU_SALEPRC', header: '含稅', format: formatAmount, isSubTotal: true,  groupField: 'PLU_SALEPRC' },
        { field: 'STK_UNITCOST', header: '平均成本', format: (val) => formatAmountCN(val), isSubTotal: true },
        { field: 'SALENET', header: '銷貨合計', format: formatAmount, isSubTotal: true }, // (銷售金額 / 1.05)
        { field: 'GROSSPROFIT', header: '銷貨毛利', format: formatAmount, isSubTotal: true },
        { field: 'GROSSPROFITMARGIN', header: '毛利率', isSubTotal: true }
      ];
    } else if (displayMode === 'D') { // 明細模式
      this.columns = [
        // 基本資訊
        { field: 'LOGO_No', header: '品牌' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_Name', header: '品名' },
        // 期初庫存
        { field: 'STK_PRIORQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_PRIOR' },
        { field: 'STK_PRIORCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_PRIOR' },
        // 異動 - 進貨/退貨/銷貨
        { field: 'STK_STOCKQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_STOCK' },
        { field: 'STK_STOCKCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_STOCK' },
        { field: 'STK_REJECTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_REJECT' },
        { field: 'STK_REJECTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_REJECT' },
        { field: 'STK_SALEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_SALE' },
        { field: 'STK_SALECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_SALE' },
        { field: 'STK_SALENET', header: '售價', format: formatAmount, isSubTotal: true, groupField: 'STK_SALE' },
        // 異動 - 調撥
        { field: 'STK_MOVEINQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_MOVEIN' },
        { field: 'STK_MOVEINCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_MOVEIN' },
        { field: 'STK_MOVEOUTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_MOVEOUT' },
        { field: 'STK_MOVEOUTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_MOVEOUT' },
        // 異動 - 盤點/報廢
        { field: 'STK_DIFFQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_DIFF' },
        { field: 'STK_DIFFCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_DIFF' },
        { field: 'STK_SCRAPQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_SCRAP' },
        { field: 'STK_SCRAPCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_SCRAP' },
        // 異動 - 領用
        { field: 'STK_TAKEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TAKE' },
        { field: 'STK_TAKECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TAKE' },
        { field: 'STK_RETAKEQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_RETAKE' },
        { field: 'STK_RETAKECOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_RETAKE' },
        // 異動 - 同業調撥
        { field: 'STK_TRDINQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TRDIN' },
        { field: 'STK_TRDINCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TRDIN' },
        { field: 'STK_TRDOUTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_TRDOUT' },
        { field: 'STK_TRDOUTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_TRDOUT' },
        // 期末結算與利潤
        { field: 'STK_SYSADJUSTCOST', header: '調整成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true },
        { field: 'STK_CURRENTQTY', header: '數量', format: formatAmount, isSubTotal: true, groupField: 'STK_CURRENT' },
        { field: 'STK_CURRENTCOST', header: '成本', format: (val) => formatAmountWithDecimals(val, 2), isSubTotal: true, groupField: 'STK_CURRENT' },
        { field: 'PLU_SALEPRCNET', header: '未稅', format: (val) => formatAmountCN(val), isSubTotal: true, groupField: 'PLU_SALEPRC' },
        { field: 'PLU_SALEPRC', header: '含稅', format: (val) => formatAmountCN(val), isSubTotal: true, groupField: 'PLU_SALEPRC' },
        { field: 'STK_UNITCOST', header: '平均成本', format: (val) => formatAmountCN(val), isSubTotal: true },
        { field: 'SALENET', header: '銷貨合計', format: formatAmount, isSubTotal: true }, // (銷售金額 / 1.05)
        { field: 'GROSSPROFIT', header: '銷貨毛利', format: formatAmount, isSubTotal: true },
        { field: 'GROSSPROFITMARGIN', header: '毛利率', isSubTotal: true }
      ];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup) {
    form.value.pageIndex = event.pageIndex;
    form.value.pageSize = event.pageSize;
    form.value.SortBy = event.SortBy;
    this.onSubmit(form);
  }
  onSubmit(frm: FormGroup) {
    this.updateTableColumns(frm.value.ShowType);
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_YM: convertDateToYYYYMM(frm.value.STK_YM),
        ShowSTK_SYSADJUSTCOST: frm.value.ShowSTK_SYSADJUSTCOST,
        SortBy: frm.value.ShowType === 'M' ?
          [{ field: 'LOGO_No', order: 1 }]
          : [{ field: 'LOGO_No', order: 1 }, { field: 'PLU_MagNo', order: 1 }]
      }
      this.tls57070Service.queryTLS57070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.DetailSumData = res.DetailSumData.map((item: any) => ({
          ...item,
          STK_UNITCOST: '--',
          PLU_SALEPRCNET: '--',
          PLU_SALEPRC: '--',
        }));
        this.lastQueryBody = body;
        this.footerData =
        {
          ...res.SumData,
          STK_UNITCOST: '--',
          PLU_SALEPRCNET: '--',
          PLU_SALEPRC: '--',
        }
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.updateTableColumns(frm.value.ShowType);
      })
    })
  }
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57070Service.exportTLS57070PDF(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57070Service.exportTLS57070(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
  }

  // 處理檔案匯出的通用邏輯
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  // 輔助方法：從 header 獲取檔名
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch (error) {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
