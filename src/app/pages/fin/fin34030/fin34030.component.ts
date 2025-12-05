/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { map } from 'rxjs/operators';
import {
  Fin34030Request,
  Fin34030Response,
  Fin34030Service,
} from '../../../service/api/fin/fin34030.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

interface SortItem {
  field: string;
  order: 1 | -1;
}

//1.3.4 應收/應付帳款查詢(FIN34030)
@UntilDestroy()
@Component({
  selector: 'app-fin34030',
  templateUrl: './fin34030.component.html',
  styleUrl: './fin34030.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
    MultiSelectComponent
  ],
})
export class FIN34030Component extends BasicQueryPageComponent<any> implements OnInit {
  /* ----------------- 狀態 ----------------- */
  data: Fin34030Response[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin34030Response[] = [];
  lastQueryBody: any = null;
  tableVer = 0;

  // 欄位定義
  columns: ReportColumn[] = [
    { field: 'PartyNo', header: '廠客代號' },
    { field: 'PartyName', header: '廠客名稱' },
    { field: 'SystemName', header: '系統別' },
    { field: 'RP_Flag', header: '收/付' },
    {
      field: 'ARAP_DocNo',
      header: '應收/應付帳款單號',
      cellClass: () => 'text-primary cursor-pointer underline'
    },
    {
      field: 'VoucherNo',
      header: '立帳傳票號碼',
      cellClass: () => 'text-primary cursor-pointer underline'
    },
    { field: 'AccNo', header: '會計科目編號' },
    { field: 'AccName', header: '會計科目名稱' },
    {
      field: 'DocDate',
      header: '立帳日期',
      format: (v: string) => this.formatDate(v),
    },
    {
      field: 'DueDate',
      header: '到期日',
      format: (v: string) => this.formatDate(v),
    },
    {
      field: 'DocAmount',
      header: '應收(付)立帳金額',
      format: this.moneyFormat.bind(this),
    },
    {
      field: 'PayAmount',
      header: '收(付)款金額',
      format: this.moneyFormat.bind(this),
    },
    {
      field: 'AdjAmount',
      header: '調整金額',
      format: this.moneyFormat.bind(this),
    },
    {
      field: 'BalanceAmount',
      header: '應收(付)帳款餘額',
      format: this.moneyFormat.bind(this),
    },
  ];

  private moneyFormat(value: number | string): string {
    if (value == null || value === '') return '0';
    const num =
      typeof value === 'string'
        ? Number(value.replace(/,/g, ''))
        : Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  readonly defaultSort: SortItem[] = [{ field: 'PartyNo', order: 1 }];

  // 下拉選單選項
  partyNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '1' }).pipe(
    map((items) =>
      (items || []).map((item) => ({
        label: `${item['VEN_No']} - ${item['Name']}`,
        value: item['VEN_No'],
      }))
    )
  );
  showAPAmountOptions: { value: string; label: string }[] = [
    { value: 'Y', label: '顯示' },
    { value: 'N', label: '隱藏' },
  ];
  showZeroBalanceOptions: { value: string; label: string }[] = [
    { value: 'Y', label: '顯示' },
    { value: 'N', label: '隱藏' },
  ];
  onlyTLTOptions: { value: string; label: string }[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  /* ----------------- 表單 ----------------- */
  queryForm = this.formBuilder.group({
    PartyNoList: [[] as string[]], // 廠客代號清單(可多選)
    DocDateFrom: [null as Date | null], // 立帳日期(起)
    DocDateTo: [null as Date | null], // 立帳日期(迄)
    PayDateFrom: [null as Date | null], // 收/付款日期(起)
    PayDateTo: [null as Date | null], // 收/付款日期(迄)
    AdjDateFrom: [null as Date | null], // 調整日期(起)
    AdjDateTo: [null as Date | null], // 調整日期(迄)
    ShowAPAmount: ['Y'], // 應付金額是否顯示 (Y/N)
    ShowZeroBalance: ['Y'], // 顯示餘額為 0 (Y/N)
    OnlyTLT: ['N'], // 只顯示專櫃 (Y/N)

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34030Service: Fin34030Service,
    private dropdown: DropdownApiService
  ) {
    super();
  }

  /* ----------------- 工具 ----------------- */
  private toISODateOrNull(d: Date | string | null | undefined): string | null {
    if (d == null) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) =>
          x && typeof x.field === 'string' && (x.order === 1 || x.order === -1)
      )
      .map((x) => ({ field: String(x.field), order: x.order as 1 | -1 }));
    return cleaned.length ? cleaned : fallback;
  }

  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}/${m}/${dd}`;
  }

  /** 把畫面上的 form/body 轉成後端需要的 Fin34030Request */
  private buildPayload(base: any): Fin34030Request {
    // 確保 PartyNoList 一定是陣列 (app-multi-select 會返回陣列)
    let partyNoList: string[] = [];
    if (Array.isArray(base?.PartyNoList)) {
      partyNoList = base.PartyNoList.filter((x: any) => x != null && x !== '');
    } else if (typeof base?.PartyNoList === 'string' && base.PartyNoList) {
      // 防禦性處理：萬一是字串，轉成單元素陣列
      partyNoList = [base.PartyNoList];
    }

    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
        ? base.pageIndex
        : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base.pageSize > 0
        ? base.pageSize
        : 30;

    const payload: Fin34030Request = {
      PartyNoList: partyNoList,
      DocDateFrom: this.toISODateOrNull(base?.DocDateFrom),
      DocDateTo: this.toISODateOrNull(base?.DocDateTo),
      PayDateFrom: this.toISODateOrNull(base?.PayDateFrom),
      PayDateTo: this.toISODateOrNull(base?.PayDateTo),
      AdjDateFrom: this.toISODateOrNull(base?.AdjDateFrom),
      AdjDateTo: this.toISODateOrNull(base?.AdjDateTo),
      ShowAPAmount: base?.ShowAPAmount || 'Y',
      ShowZeroBalance: base?.ShowZeroBalance || 'Y',
      OnlyTLT: base?.OnlyTLT || 'N',
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),
    };

    return payload;
  }

  /** 匯出用：沿用查詢條件，但移除分頁 */
  private buildExportPayload(): Fin34030Request {
    const base = this.queryForm.getRawValue();
    const payload = this.buildPayload(base);
    delete payload.PageIndex;
    delete payload.PageSize;
    return payload;
  }

  /** 把後端回傳的 Data 轉成 Fin34030Response[] */
  private mapRowsFromResponse(
    res: ApiResponse<Fin34030Response[]>
  ): Fin34030Response[] {
    const list = res?.Data ?? [];
    return Array.isArray(list) ? list : [];
  }

  /* ----------------- 給 <app-table-report> 的查詢函式 ----------------- */
  public queryFIN34030ForReport = (body: any) =>
    this.fin34030Service.queryFIN34030(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<Fin34030Response[]>) => {
        const rows = this.mapRowsFromResponse(res);
        const totalCount =
          Number(res?.TotalCount ?? rows.length) || rows.length;

        return {
          Data: rows,
          TotalCount: totalCount,
        };
      })
    );

  /* ----------------- Init ----------------- */
  ngOnInit(): void {
    this.initializePage('FIN34030', '', this.queryForm, (form) =>
      this.onSubmit(form)
    );
  }

  /* ----------------- Submit ----------------- */
  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildPayload(raw);

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin34030Service
      .queryFIN34030(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin34030Response[]>) => {
          const rows = this.mapRowsFromResponse(response);

          this.data = rows;

          const realTotal =
            Number(response?.TotalCount ?? rows.length) || rows.length;
          this.totalRecords = realTotal;
          this.viewTotalRecords = realTotal;

          // 保存小寫格式供 table-report 使用
          this.lastQueryBody = { ...raw };

          this.queryStateService.setQueryState(
            this.ProgNo,
            this.queryForm.value
          );
          this.loading = false;
        },
        error: (err: any) => {
          console.error('=== FIN34030 API Error ===', err);
          console.error('Error response:', err.error);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.loading = false;
        },
      });
  }

  onClear(frm: FormGroup) {
    frm.reset({
      PartyNoList: [],
      DocDateFrom: null,
      DocDateTo: null,
      PayDateFrom: null,
      PayDateTo: null,
      AdjDateFrom: null,
      AdjDateTo: null,
      ShowAPAmount: 'Y',
      ShowZeroBalance: 'Y',
      OnlyTLT: 'N',
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
  }

  /* ----------------- 匯出檔案共用工具 ----------------- */
  private getFilenameFromResponse(
    res: HttpResponse<Blob>,
    fallback: string
  ): string {
    const cd =
      res.headers.get('Content-Disposition') ||
      res.headers.get('content-disposition');
    if (!cd) return fallback;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    if (!match || !match[1]) return fallback;
    return decodeURIComponent(match[1].replace(/['"]/g, ''));
  }

  private saveBlob(res: HttpResponse<Blob>, defaultName: string) {
    const blob = new Blob([res.body as Blob], {
      type: res.body?.type || 'application/octet-stream',
    });
    const fileName = this.getFilenameFromResponse(res, defaultName);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 匯出按鈕 loading 狀態
  btnExportPdfLoading = false;

  /* ----------------- 匯出：PDF ----------------- */
  downloadFIN34030PDF(): void {
    const payload = this.buildExportPayload();
    const defaultName = 'FIN34030_應收應付帳款查詢.pdf';

    this.btnExportPdfLoading = true;

    this.fin34030Service
      .exportFIN34030PDF(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          this.saveBlob(res, defaultName);
        },
        error: (err: any) => {
          console.error('FIN34030 PDF export error:', err);
        },
      })
      .add(() => {
        this.btnExportPdfLoading = false;
      });
  }
}
