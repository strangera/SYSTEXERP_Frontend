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

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import {
  FIN42040Data,
  FIN42040QueryRequest,
  FIN42040Service,
} from '../../../service/api/fin/fin42040.service';

@UntilDestroy()
@Component({
  selector: 'app-fin42040',
  templateUrl: './fin42040.component.html',
  styleUrls: ['./fin42040.component.scss'],
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
  ],
})
export class FIN42040Component
  extends BasicQueryPageComponent<any>
  implements OnInit
{
  data: FIN42040Data[] = [];
  totalRecords = 0;
  showTable = true;
  btnLoading = false;
  historyRequestBody: FIN42040QueryRequest | null = null;

  readonly defaultSort: any[] = [{ field: 'SortNo', order: 1 }];

  queryForm = this.formBuilder.group({
    YM: [null as Date | string | null, [Validators.required]],
    CompareYM: [null as Date | string | null, [Validators.required]],
    Org_ID: [''],
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

  columns = [
    { field: 'SortNo', header: '排序', visible: false },
    { field: 'LevelNo', header: '層級', visible: false },
    { field: 'RowType', header: '列型態', visible: false },

    { field: 'AccountCode', header: '科目代號', visible: true },
    {
      field: 'AccountName',
      header: '科目名稱',
      visible: true,
      style: 'text-left',
    },
    {
      field: 'CurrentAmount',
      header: '本期金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CurrentRatio',
      header: '本期佔比',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'CompareAmount',
      header: '比較年月金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CompareRatio',
      header: '比較年月佔比',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'GrowthRate',
      header: '增減率',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'CurrentAccumAmount',
      header: '本期累計金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CurrentAccumRatio',
      header: '本期累計佔比',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'CompareAccumAmount',
      header: '比較累計金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat.bind(this),
      isTotal: true,
    },
    {
      field: 'CompareAccumRatio',
      header: '比較累計佔比',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
    {
      field: 'AccumGrowthRate',
      header: '累計增減率',
      visible: true,
      style: 'text-right',
      format: this.ratioFormat.bind(this),
    },
  ];

  constructor(
    private fin42040Service: FIN42040Service,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN42040',
      'fin/fin42040',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

   const now = new Date();
const lastYear = new Date();

lastYear.setFullYear(now.getFullYear() - 1);

this.queryForm.patchValue(
  {
    YM: now,           // ⭐ 今年本月
    CompareYM: lastYear, // ⭐ 去年同月
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
        }));
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue() as any;

      const payload: FIN42040QueryRequest = {
        ...raw,
        YM: this.normalizeYM(raw.YM),
        CompareYM: this.normalizeYM(raw.CompareYM),
        Org_ID:
          !raw.Org_ID || raw.Org_ID === '100000'
            ? undefined
            : raw.Org_ID,
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

      this.fin42040Service
        .queryFIN42040(payload)
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

  public queryFIN42040ForReport = (body: any) =>
    this.fin42040Service
      .queryFIN42040({
        ...body,
        YM: this.normalizeYM(body?.YM ?? this.queryForm.value?.YM),
        CompareYM: this.normalizeYM(
          body?.CompareYM ?? this.queryForm.value?.CompareYM
        ),
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

    this.fin42040Service
      .exportFIN42040PDF(this.historyRequestBody)
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

    this.fin42040Service
      .exportFIN42040Excel(this.historyRequestBody)
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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(
    contentDisposition: string | null,
    defaultExtension: string
  ): string {
    if (!contentDisposition) return `FIN42040_去年同期比較表${defaultExtension}`;

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

    return `FIN42040_去年同期比較表${defaultExtension}`;
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
}