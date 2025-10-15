import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls57070DataItem, Tls57070Service } from '@service/api/tls/tls57070.service';
import { HttpResponse } from '@angular/common/http';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { convertDateToYYYYMM, formatAmount } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

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
    TableReportComponent,
    ButtonModule,
    TranslateModule,
    AsyncPipe,
    DropdownComponent
  ],
})
export class TLS57070Component extends BasicQueryPageComponent<Tls57070DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    pageIndex: [1],
    pageSize: [30],
    SortBy: [[{ field: 'LOGO_No', order: 1 }]], // 預設排序
    STK_YM: [new Date(), [Validators.required]], // 存貨年月
    HOS_NOList: [null], // 倉別條件
    LOGO_NoList: [null], // 品牌條件
    ShowType: ['M', [Validators.required]], // 顯示方式(M:彙總，D:明細)
  });
  HOS_NOListOptions = this.dropdown.queryPos2034(); // 倉別選項
  LOGO_NoListOptions = this.dropdown.queryPluLogo(); // 品牌選項
  showTypeOptions = [
    { label: '彙總', value: 'M' },
    { label: '明細', value: 'D' },
  ]
  totalRecords = 0;
  lastQueryBody: any
  DetailSumData: any
  footerData: any
  data: Tls57070DataItem[] = [];
  columns: ReportColumn[] = [];

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
        { field: 'STK_PRIORQTY', header: '期初數量', isSubTotal: true },
        { field: 'STK_PRIORCOST', header: '期初成本', format: formatAmount, isSubTotal: true },

        // 異動 - 進貨/退貨/銷貨
        { field: 'STK_STOCKQTY', header: '進貨數量', isSubTotal: true },
        { field: 'STK_STOCKCOST', header: '進貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_REJECTQTY', header: '退貨數量', isSubTotal: true },
        { field: 'STK_REJECTCOST', header: '退貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SALEQTY', header: '銷貨數量', isSubTotal: true },
        { field: 'STK_SALECOST', header: '銷貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SALENET', header: '銷貨售價', format: formatAmount, isSubTotal: true },

        // 異動 - 調撥
        { field: 'STK_MOVEINQTY', header: '調入數量', isSubTotal: true },
        { field: 'STK_MOVEINCOST', header: '調入成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_MOVEOUTQTY', header: '調出數量', isSubTotal: true },
        { field: 'STK_MOVEOUTCOST', header: '調出成本', format: formatAmount, isSubTotal: true },

        // 異動 - 盤點/報廢
        { field: 'STK_DIFFQTY', header: '盤點數量', isSubTotal: true },
        { field: 'STK_DIFFCOST', header: '盤點成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SCRAPQTY', header: '報廢數量', format: formatAmount, isSubTotal: true },
        { field: 'STK_SCRAPCOST', header: '報廢成本', format: formatAmount, isSubTotal: true },

        // 異動 - 領用
        { field: 'STK_TAKEQTY', header: '領用數量', isSubTotal: true },
        { field: 'STK_TAKECOST', header: '領用成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_RETAKEQTY', header: '領用退回數量', isSubTotal: true },
        { field: 'STK_RETAKECOST', header: '領用退回成本', format: formatAmount, isSubTotal: true },

        // 異動 - 同業調撥
        { field: 'STK_TRDINQTY', header: '同業調撥(入)數量', isSubTotal: true },
        { field: 'STK_TRDINCOST', header: '同業調撥(入)成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_TRDOUTQTY', header: '同業調撥(出)數量', isSubTotal: true },
        { field: 'STK_TRDOUTCOST', header: '同業調撥(出)成本', format: formatAmount, isSubTotal: true },

        // 期末結算與利潤
        { field: 'STK_SYSADJUSTCOST', header: '調整成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_CURRENTQTY', header: '期末數量', isSubTotal: true },
        { field: 'STK_CURRENTCOST', header: '期末成本', format: formatAmount, isSubTotal: true },
        { field: 'PLU_SALEPRCNET', header: '期末售價未稅', format: formatAmount, isSubTotal: true },
        { field: 'PLU_SALEPRC', header: '期末售價含稅', format: formatAmount, isSubTotal: true },
        { field: 'STK_UNITCOST', header: '平均成本', format: formatAmount, isSubTotal: true },
        { field: 'SALENET', header: '銷貨合計', format: formatAmount, isSubTotal: true }, // (銷售金額 / 1.05)
        { field: 'GROSSPROFIT', header: '銷貨毛利', format: formatAmount, isSubTotal: true },
        { field: 'GROSSPROFITMARGIN', header: '毛利率', isSubTotal: true }
      ];
      this.data = [];
    } else if (displayMode === 'D') { // 明細模式
      this.columns = [
        // 基本資訊
        { field: 'LOGO_No', header: '品牌' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_Name', header: '品名' },

        // 期初庫存
        { field: 'STK_PRIORQTY', header: '期初數量', isSubTotal: true },
        { field: 'STK_PRIORCOST', header: '期初成本', format: formatAmount, isSubTotal: true },

        // 異動 - 進貨/退貨/銷貨
        { field: 'STK_STOCKQTY', header: '進貨數量', isSubTotal: true },
        { field: 'STK_STOCKCOST', header: '進貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_REJECTQTY', header: '退貨數量', isSubTotal: true },
        { field: 'STK_REJECTCOST', header: '退貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SALEQTY', header: '銷貨數量', isSubTotal: true },
        { field: 'STK_SALECOST', header: '銷貨成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SALENET', header: '銷貨售價', format: formatAmount, isSubTotal: true },

        // 異動 - 調撥
        { field: 'STK_MOVEINQTY', header: '調入數量', isSubTotal: true },
        { field: 'STK_MOVEINCOST', header: '調入成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_MOVEOUTQTY', header: '調出數量', isSubTotal: true },
        { field: 'STK_MOVEOUTCOST', header: '調出成本', format: formatAmount, isSubTotal: true },

        // 異動 - 盤點/報廢
        { field: 'STK_DIFFQTY', header: '盤點數量', isSubTotal: true },
        { field: 'STK_DIFFCOST', header: '盤點成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_SCRAPQTY', header: '報廢數量', format: formatAmount, isSubTotal: true },
        { field: 'STK_SCRAPCOST', header: '報廢成本', format: formatAmount, isSubTotal: true },

        // 異動 - 領用
        { field: 'STK_TAKEQTY', header: '領用數量', isSubTotal: true },
        { field: 'STK_TAKECOST', header: '領用成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_RETAKEQTY', header: '領用退回數量', isSubTotal: true },
        { field: 'STK_RETAKECOST', header: '領用退回成本', format: formatAmount, isSubTotal: true },

        // 異動 - 同業調撥
        { field: 'STK_TRDINQTY', header: '同業調撥(入)數量', isSubTotal: true },
        { field: 'STK_TRDINCOST', header: '同業調撥(入)成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_TRDOUTQTY', header: '同業調撥(出)數量', isSubTotal: true },
        { field: 'STK_TRDOUTCOST', header: '同業調撥(出)成本', format: formatAmount, isSubTotal: true },

        // 期末結算與利潤
        { field: 'STK_SYSADJUSTCOST', header: '調整成本', format: formatAmount, isSubTotal: true },
        { field: 'STK_CURRENTQTY', header: '期末數量', isSubTotal: true },
        { field: 'STK_CURRENTCOST', header: '期末成本', format: formatAmount, isSubTotal: true },
        { field: 'PLU_SALEPRCNET', header: '期末售價未稅', format: formatAmount, isSubTotal: true },
        { field: 'PLU_SALEPRC', header: '期末售價含稅', format: formatAmount, isSubTotal: true },
        { field: 'STK_UNITCOST', header: '平均成本', format: formatAmount, isSubTotal: true },
        { field: 'SALENET', header: '銷貨合計', format: formatAmount, isSubTotal: true }, // (銷售金額 / 1.05)
        { field: 'GROSSPROFIT', header: '銷貨毛利', format: formatAmount, isSubTotal: true },
        { field: 'GROSSPROFITMARGIN', header: '毛利率', isSubTotal: true }
      ];
      this.data = [];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  onSubmit(frm: FormGroup) {
    this.updateTableColumns(frm.value.ShowType);
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_YM: convertDateToYYYYMM(frm.value.STK_YM),
      }
      this.tls57070Service.queryTLS57070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        console.log(res);
        this.DetailSumData = res.DetailSumData;
        this.lastQueryBody = body;
        this.footerData = res.SumData;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
