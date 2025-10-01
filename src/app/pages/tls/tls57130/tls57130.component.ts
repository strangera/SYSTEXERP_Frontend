import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Tls57130DataItem, Tls57130Request, Tls57130Service } from '@service/api/tls/tls57130.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { AsyncPipe } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { formatDateToYYYY_MM_DD } from '@shared/componentkit/table-report/table-report.model';

@Component({
  selector: 'app-tls57130',
  templateUrl: './tls57130.component.html',
  standalone: true,
  imports: [CalendarRangeQuickComponent, ButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class TLS57130Component extends BasicQueryPageComponent<Tls57130DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_DateStart: [null, [Validators.required]],// 交易日期(起) - 必填
    TXN_DateEnd: [null, [Validators.required]],    // 交易日期(迄) - 必填
    LOGO_No: [null],// 品牌條件
    HOS_NO: [null],// 倉別條件
    RNK_No: [null],// 顯示名次
    RNK_Status: [null, [Validators.required]],// 排名方式(1.金額2.數量)
    SortBy: [[{ field: 'LOGO_No', order: 1 }]],
    PageSize: [30],
    PageIndex: [1],
  });
  RNK_StatusOptions = [{ value: '1', label: '金額' }, { value: '2', label: '數量' }];
  LOGO_NoOptions = this.dropdown.queryPluLogo();
  HOS_NOOptions = this.dropdown.queryPos2034();
  totalRecords = 0;
  lastQueryBody: Tls57130Request | null = null;
  data: Tls57130DataItem[] = [];
  columns: EditColumn[] = [
    { field: 'LOGO_No', header: '品牌代碼' },
    { field: 'LOGO_CH_NAME', header: '品牌名稱' },
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '品名' },
    { field: 'PLU_NO', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'TotTXN_TotGUI', header: '總銷售金額(發票金額)', format: formatAmount },
    { field: 'TotTXN_Qty', header: '總銷售數量' },
    { field: 'PLU_SalePrc', header: '單價', format: formatAmount },
    { field: 'TotTXN_SaleAmt', header: '銷售金額小計', format: formatAmount },
    { field: 'RNK', header: '名次' },
  ]

  constructor(
    public readonly tls57130Service: Tls57130Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57130', '/tls/tls57130cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_DateStart: formatDateToYYYY_MM_DD(frm.value.TXN_DateStart) as string,
        TXN_DateEnd: formatDateToYYYY_MM_DD(frm.value.TXN_DateEnd) as string,
      }
      this.tls57130Service.queryTLS57130(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.lastQueryBody = body;
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
    this.tls57130Service.exportTLS57130PDF(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
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
    this.tls57130Service.exportTLS57130(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
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
