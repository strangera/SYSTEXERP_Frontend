import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http'; //  新增匯入 HttpResponse
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls57160DataItem, Tls57160FooterItem, Tls57160Request, Tls57160Service } from '@service/api/tls/tls57160.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ColumnGroup, formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button'; //  新增匯入 ButtonModule
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { ProductAutocompleteComponent } from 'src/app/shared/biz-components/product-autocomplete/product-autocomplete';

@Component({
  selector: 'app-tls57160',
  templateUrl: './tls57160.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    TableReportComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    CheckboxModule,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule, //  匯入 p-button 所需的模組
    ProductAutocompleteComponent
  ],
  providers: [DatePipe] //  確保 DatePipe 存在
})
export class TLS57160Component extends BasicQueryPageComponent<Tls57160DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    STK_Date: [yesterday, [Validators.required]],
    HOS_NO: [null, [Validators.required]],
    LOGO_No: [null, [Validators.required]],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_NO: [null, [Validators.maxLength(20)]],
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]],
    showNegativeStock: [false],
    pageSize: [500, [Validators.required, Validators.min(30)]],
    pageIndex: [1],
  });
  HOS_NOOptions = this.dropdown.queryPos2034();
  LOGO_NoOptions = this.dropdown.queryPluLogo();
  totalRecords = 0;
  //  footerTotal 型別修正為 Tls57160FooterItem
  footerTotal: Tls57160FooterItem | null = null;
  historyRequestBody: Tls57160Request | null = null;
  data: Tls57160DataItem[] = [];
  columns: ReportColumn[] = [
    // { field: 'HOS_No', header: '倉別', visible: true },  // 倉別 (HOS_No)
    { field: 'PLU_MagNo', header: '管理編號', visible: true }, // 商品編號 (PLU_MagNo)
    { field: 'PLU_Name', header: '商品名稱', visible: true }, // 商品名稱 (PLU_Name)
    { field: 'PLU_No', header: '國際條碼', visible: true },  // 國際條碼 (PLU_No)

    // 庫齡 1-6 個月
    { field: 'STK_Qty1_6', header: '數量', visible: true, groupField: '1-6個月' },
    { field: 'STK_Cost1_6', header: '成本', visible: true, groupField: '1-6個月', format: formatAmount },

    // 庫齡 7-12 個月
    { field: 'STK_Qty7_12', header: '數量', visible: true, groupField: '7-12個月' },
    { field: 'STK_Cost7_12', header: '成本', visible: true, groupField: '7-12個月', format: formatAmount },

    // 庫齡 13-18 個月
    { field: 'STK_Qty13_18', header: '數量', visible: true, groupField: '13-18個月' },
    { field: 'STK_Cost13_18', header: '成本', visible: true, groupField: '13-18個月', format: formatAmount },

    // 庫齡 19-24 個月
    { field: 'STK_Qty19_24', header: '數量', visible: true, groupField: '19-24個月' },
    { field: 'STK_Cost19_24', header: '成本', visible: true, groupField: '19-24個月', format: formatAmount },

    // 庫齡 25-36 個月
    { field: 'STK_Qty25_36', header: '數量', visible: true, groupField: '25-36個月' },
    { field: 'STK_Cost25_36', header: '成本', visible: true, groupField: '25-36個月', format: formatAmount },

    // 庫齡 36 個月以上
    { field: 'STK_Qty36_UP', header: '數量', visible: true, groupField: '36個月以上' },
    { field: 'STK_Cost36_UP', header: '成本', visible: true, groupField: '36個月以上', format: formatAmount },

    { field: 'STK_Qty', header: '數量', visible: true, groupField: '合計' }, // 合計數量 (STK_Qty)
    { field: 'STK_Cost', header: '成本', visible: true, groupField: '合計', format: formatAmount }, // 合計成本 (STK_Cost)
    // 總計/單價
    { field: 'STK_UnitCost', header: '平均單價', visible: true, format: formatAmount }, // 平均單價 (STK_UnitCost)
    { field: 'PLU_SalePrc', header: '當期售價', visible: true, format: formatAmount }, // 當期售價 (PLU_SalePrc)
  ];

  columnGroup: ColumnGroup[] = [
    { field: '1-6個月', header: '1-6個月' },
    { field: '7-12個月', header: '7-12個月' },
    { field: '13-18個月', header: '13-18個月' },
    { field: '19-24個月', header: '19-24個月' },
    { field: '25-36個月', header: '25-36個月' },
    { field: '36個月以上', header: '36個月以上' },
    { field: '合計', header: '合計' }
  ];

  //  新增按鈕 Loading 屬性
  btnLoading = false;

  constructor(
    public readonly tls57160Service: Tls57160Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57160'); // 更改程式代號
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const requestBody: Tls57160Request = {
        ...formValue,
        STK_Date: this.datePipe.transform(formValue.STK_Date, 'yyyy-MM-dd'),
      };
      //  調整 SortBy 以符合 API 需求
      if (!requestBody.SortBy) {
        requestBody.SortBy = [{ field: 'PLU_MagNo', order: 1 }];
      }

      this.tls57160Service.queryTLS57160(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data && response.Data.length > 0) {
          this.totalRecords = response.TotalCount;
          console.log(response);

          //  總計資料使用 footerData 的第一個元素 (型別為 Tls57160FooterItem)
          this.footerTotal = response.footerData?.[0] ?? null;
          this.historyRequestBody = requestBody;
          this.data = response.Data;
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.footerTotal = null; //  查無資料時清空總計
        }
      });
    });
  }

  /**
   *  新增：匯出 PDF 報表 (呼叫 tls57160Service.exportTLS57160PDF)
   */
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls57160Service.exportTLS57160PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
      error: (err) => {
        console.error('PDF 匯出失敗:', err);
        //  可以在這裡添加錯誤提示邏輯
      }
    });
  }

  /**
   *  新增：匯出 Excel 報表 (呼叫 tls57160Service.exportTLS57160Excel)
   */
  onExportXLSX() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls57160Service.exportTLS57160Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
      error: (err) => {
        console.error('Excel 匯出失敗:', err);
        //  可以在這裡添加錯誤提示邏輯
      }
    });
  }

  /**
   *  複製自 tls57150.component.ts 的通用檔案處理邏輯
   * 處理檔案匯出的通用邏輯
   */
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
    }
  }

  /**
   *  複製自 tls57150.component.ts 的通用檔案處理邏輯
   * 輔助方法：從 header 獲取檔名
   */
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
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
