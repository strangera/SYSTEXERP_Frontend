import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55020Data, Fin55020Service } from '@service/api/fin/fin55020.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { Fin55020TableReportComponent } from './fin55020-table-report/fin55020-table-report.component';
import { formatAmountNo0, formatDate, ReportColumn } from './fin55020-table-report/fin55020-table-report.model';
@Component({
  selector: 'app-fin55020',
  templateUrl: './fin55020.component.html',
  standalone: true,
  imports: [ButtonModule, AsyncPipe, InputTextComponent, Fin55020TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, ButtonComponent, TranslateModule]
})
export class FIN55020Component extends BasicQueryPageComponent<FIN55020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VOUDATE_Start: [new Date(), [Validators.required]],
    VOUDATE_End: [new Date(), [Validators.required]],
    ORG_ID: [],
    ProjectNo: [],
    vouno: [null, [Validators.maxLength(12)]],
    DetailNo: [],
    VOUCHER_KIND: [],
    PostFlag: [],
  });
  ORG_IDOptions = this.dropdown.querySys3100();
  ProjectNoOptions = this.dropdown.queryTALPORDERM_DropDownList();
  DetailNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  VOUCHER_KINDOptions = getSYS1000Options('Voucher_Type');
  PostFlagOptions = getSYS1000Options('PostFlag');
  totalRecords = 0;
  historyRequestBody: any;
  data: FIN55020Data[] = [];
  columns: ReportColumn[] = [
    { field: 'VouDate', header: '傳票日期', format: formatDate, rowgroup: true },
    { field: 'VouNo', header: '傳票號碼', rowgroup: true },
    { field: 'PostFlag', header: '狀態', format: (value: string) => getSYS1000('PostFlag', value) },
    { field: 'AccCName', header: '科目名稱', align: 'left' },
    { field: 'ORG_ID', header: '部門' },
    { field: 'Org_Name', header: '部門名稱', align: 'left' },
    { field: 'ProjectNo', header: '活動' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'D_AMT', header: '借方金額', format: formatAmountNo0, align: 'right' },
    { field: 'C_AMT', header: '貸方金額', format: formatAmountNo0, align: 'right' },
    { field: 'PTA', header: '立沖代號' }
  ];

  constructor(
    public readonly fin55020Service: Fin55020Service,
    private readonly dropdown: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN55020', 'fin/fin55020cru');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        pageSize: 30,
        pageIndex: 1,
        SortBy: [{ field: 'VouDate', order: 1 }, { field: 'VouNo', order: 1 }]
      }
      this.fin55020Service.queryFIN55020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data
        this.totalRecords = response.TotalCount;
        if (response.Data.length > 0) {
          this.historyRequestBody = body;
        }
      });
    });
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.fin55020Service.exportFIN55020PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.fin55020Service.exportFIN55020Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
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
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
