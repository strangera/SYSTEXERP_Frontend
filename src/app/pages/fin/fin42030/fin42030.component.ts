/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, shareReplay } from 'rxjs/operators';

import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';


import { CheckboxModule } from 'primeng/checkbox';
import {
  FIN42030Data,
  FIN42030QueryRequest,
  FIN42030Service,
} from '../../../service/api/fin/fin42030.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

@UntilDestroy()
@Component({
  selector: 'app-fin42030',
  templateUrl: './fin42030.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    ButtonModule,
    TranslateModule,
    TableReportComponent,
    RadiobuttonComponent,
    CalendarComponent,
    CheckboxModule
  ],
})
export class FIN42030Component
  extends BasicQueryPageComponent<any>
  implements OnInit {
  data: FIN42030Data[] = [];
  totalRecords = 0;
  showTable = true;
  btnLoading = false;
  historyRequestBody: FIN42030QueryRequest | null = null;

  readonly defaultSort: any[] = [{ field: 'SortNo', order: 1 }];

  queryForm = this.formBuilder.group({
    YM: [null as Date | string | null, [Validators.required]],
    Org_ID: [''],
    IsCludeDownOrg: ['N'], // 是否含以下部門(Y=是/N=否)
    ReportType: [1, [Validators.required]],
    AmtUnit: [1, [Validators.required]],

    ...createPaginationConfig([{ field: 'SortNo', order: 1 }]),
    pageSize: [30],
  });

  reportTypeOptions = [
    { label: '統制', value: 1 },
    { label: '明細', value: 2 },
  ];

  amtUnitOptions = [
    { label: '元', value: 1 },
    { label: '千', value: 2 },
    { label: '萬', value: 3 },
  ];

  orgOptions: any[] = [];

  columns: ReportColumn[] = [
    // { field: 'SortNo', header: '排序', visible: false },
    // { field: 'LevelNo', header: '層級', visible: false },
    // { field: 'RowType', header: '列型態', visible: false },

    { field: 'AccountCode', header: '科目代號', visible: true },
    {
      field: 'AccountName',
      header: '科目名稱',
      visible: true,
      align: 'left',
    },
    {
      field: 'CurrentAmount',
      header: '本期金額',
      visible: true,
      align: 'right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CurrentRatio',
      header: '本期佔比',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'BudgetSamePeriodAmount',
      header: '預算同期金額',
      visible: true,
      align: 'right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'BudgetSamePeriodRatio',
      header: '預算同期佔比',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'GrowthRate',
      header: '增減率',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'CurrentAccumAmount',
      header: '本期累計金額',
      visible: true,
      align: 'right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CurrentAccumRatio',
      header: '本期累計佔比',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'BudgetAccumAmount',
      header: '預算累計金額',
      visible: true,
      align: 'right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'BudgetAccumRatio',
      header: '預算累計佔比',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'AccumGrowthRate',
      header: '累計增減率',
      visible: true,
      align: 'right',
      format: this.ratioFormat.bind(this),
    },
  ];

  constructor(
    private fin42030Service: FIN42030Service,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN42030',
      'fin/fin42030',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    const now = new Date();

    this.queryForm.patchValue(
      {
        YM: now, // ⭐ 這行就是預設「今年本月」
        SortBy: this.defaultSort,
        pageSize: 30,
      },
      { emitEvent: false }
    );

    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    this.tls11010Service
      .getOrgOptions()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        untilDestroyed(this)
      )
      .subscribe((res: any[]) => {
        this.orgOptions = (res || []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
          name: x.label,
        }));
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue() as any;

      const selectedOrg = this.orgOptions.find(x => x.value === raw.Org_ID);

      const payload: FIN42030QueryRequest = {
        ...raw,
        YM: this.normalizeYM(raw.YM),
        Org_ID:
          !raw.Org_ID || raw.Org_ID === '100000'
            ? undefined
            : raw.Org_ID,
        Org_Name:
          !raw.Org_ID || raw.Org_ID === '100000'
            ? '全公司'
            : selectedOrg?.name ?? selectedOrg?.label ?? '',
        ReportType: Number(raw.ReportType ?? 1),
        AmtUnit: Number(raw.AmtUnit ?? 1),
        pageIndex: Number(raw.pageIndex ?? 1),
        pageSize: Number(raw.pageSize ?? 30),
        SortBy:
          Array.isArray(raw.SortBy) && raw.SortBy.length
            ? raw.SortBy
            : this.defaultSort,
      };

      Object.keys(payload).forEach((k) => {
        const v = (payload as any)[k];
        if (v === null || v === undefined) delete (payload as any)[k];
        if (Array.isArray(v) && v.length === 0) delete (payload as any)[k];
        if (typeof v === 'string' && v.trim() === '') delete (payload as any)[k];
      });

      this.loading = true;
      this.data = [];
      this.totalRecords = 0;
      this.historyRequestBody = { ...payload };
      this.updateAmountColumnHeaders(payload.AmtUnit);
      this.fin42030Service
        .queryFIN42030(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp: any) => {
            const rows = Array.isArray(resp?.Data)
              ? resp.Data
              : Array.isArray(resp?.Data?.QueryData)
                ? resp.Data.QueryData
                : [];

            this.data = rows;
            this.totalRecords = Number(resp?.TotalCount ?? rows.length ?? 0);
            this.historyRequestBody = { ...payload };

            this.queryStateService?.setQueryState?.(
              this.ProgNo,
              this.queryForm.value
            );
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
          },
        });
    });
  }

  public queryFIN42030ForReport = (body: any) =>
    this.fin42030Service
      .queryFIN42030({
        ...body,
        YM: this.normalizeYM(body?.YM ?? this.queryForm.value?.YM),
      })
      .pipe(
        map((resp: any) => ({
          Data: Array.isArray(resp?.Data)
            ? resp.Data
            : Array.isArray(resp?.Data?.QueryData)
              ? resp.Data.QueryData
              : [],
          TotalCount: Number(resp?.TotalCount ?? 0),
          GrandTotal: null,
        }))
      );

  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.fin42030Service
      .exportFIN42030PDF(this.historyRequestBody)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
      });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.fin42030Service
      .exportFIN42030Excel(this.historyRequestBody)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
      });
  }

  private handleFileExport(
    response: HttpResponse<Blob>,
    fileExtension: string
  ): void {
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
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(
    contentDisposition: string | null,
    defaultExtension: string
  ): string {
    if (!contentDisposition) return `FIN42030_預算同期比較表${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        return decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
      } catch {
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

    return `FIN42030_預算同期比較表${defaultExtension}`;
  }

  private normalizeYM(value: any): string {
    if (!value) return '';

    if (value instanceof Date && !isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const s = String(value).trim().replace(/[^\d]/g, '');
    return s.length >= 6 ? s.substring(0, 6) : s;
  }

  moneyFormat(value: any): string {
    return value == null ? '' : Number(value).toLocaleString('en-US');
  }

  ratioFormat(value: any): string {
    if (value == null) return '';
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('en-US') : '';
  }
  private getAmtUnitText(unit?: any): string {
    const value = Number(unit ?? this.queryForm?.get('AmtUnit')?.value ?? 1);

    switch (value) {
      case 2:
        return '千元';
      case 3:
        return '萬元';
      case 1:
      default:
        return '元';
    }
  }

  private updateAmountColumnHeaders(unit?: any): void {
    const unitText = this.getAmtUnitText(unit);

    const amountHeaderMap: Record<string, string> = {
      CurrentAmount: `本期金額(${unitText})`,
      BudgetSamePeriodAmount: `預算同期金額(${unitText})`,
      CurrentAccumAmount: `本期累計金額(${unitText})`,
      BudgetAccumAmount: `預算累計金額(${unitText})`,
    };

    this.columns = this.columns.map((col: any) => ({
      ...col,
      header: amountHeaderMap[col.field] ?? col.header,
    }));
  }
}