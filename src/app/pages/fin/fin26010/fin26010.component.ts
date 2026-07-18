/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpBackend, HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  createPaginationConfig,
  formatDateToYYYY_MM_DD,
} from '../../../others/component/table/table.model';

import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

import {
  ApiResponse,
  Aps1002BankDropDownRow,
  ExportFin26010TxtRequest,
  Fin26010Request,
  Fin26010Row,
  Fin26010Service,
} from '../../../service/api/fin/fin26010.service';

type SortItem = { field: string; order: number };

interface BankDropdownOption {
  label: string;
  value: string;
  raw: Aps1002BankDropDownRow;
}

@UntilDestroy()
@Component({
  selector: 'app-fin26010',
  templateUrl: './fin26010.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    TableReportComponent,
  ],
})
export class FIN26010Component extends BasicQueryPageComponent<any> {
  data: Fin26010Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: Fin26010Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;
  private rawHttp: HttpClient;
  btnGenerateFileLoading = false;

  columns: ReportColumn[] = [
    { field: 'WSLIP_NO', header: '匯款單號' },
    {
      field: 'CRT_Date',
      header: '建立日期',
      format: (v: string) => this.formatDateTime(v),
    },
    {
      field: 'RMT_Date',
      header: '匯款日期',
      format: (v: string) => this.formatDate(v),
    },
    { field: 'ACCNO', header: '銀行代號' },
    { field: 'ACCCNAME', header: '銀行名稱' },
    { field: 'BNK_No', header: '全省銀行代號' },
    { field: 'BNK_BRANCHNAME', header: '全省銀行名稱' },
  ];

  readonly defaultSort: SortItem[] = [{ field: 'WSLIP_NO', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  statusOptions: any[] = [
    { value: 'Y', label: '已拋轉' },
    { value: 'N', label: '未拋轉' },
  ];

  bankOptions: BankDropdownOption[] = [];

  queryForm = this.formBuilder.group({
    transferSource: [null as string | null],

    buildDateFrom: [null as Date | null],
    buildDateTo: [null as Date | null],

    transferDateFrom: [null as Date | null, [Validators.required]],
    transferDateTo: [null as Date | null, [Validators.required]],

    bankCode: [null as string | null, [Validators.required]],

    bankName: [null as string | null, [Validators.maxLength(40)]],

    status: [null as string | null],

    SummonNumber: [null as string | null, [Validators.maxLength(12)]],

    fileName: [null as string | null, [Validators.maxLength(100)]],

    ...createPaginationConfig([{ field: 'WSLIP_NO', order: 1 }]),
  });

  constructor(
    private fin26010Service: Fin26010Service,
    private cdr: ChangeDetectorRef,
    private httpBackend: HttpBackend
  ) {
    super();
    this.rawHttp = new HttpClient(this.httpBackend);
  }

  private formatDate(val: string): string {
    if (!val) return '';

    const d = new Date(val);

    if (isNaN(d.getTime())) return val;

    return `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }

  private formatDateTime(val: string): string {
    if (!val) return '';

    const d = new Date(val);

    if (isNaN(d.getTime())) return val;

    const ymd = `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;

    const hms = `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

    return `${ymd} ${hms}`;
  }

  private toYMDOrUndef(
    d: Date | string | null | undefined
  ): string | undefined {
    if (d == null) return undefined;

    const s = formatDateToYYYY_MM_DD(d as Date | string) as
      | string
      | null
      | undefined;

    return !s ? undefined : s;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];

    const cleaned = asArr
      .filter(
        (x) =>
          x &&
          typeof x.field === 'string' &&
          typeof x.order === 'number'
      )
      .map((x) => ({
        field: String(x.field),
        order: x.order as number,
      }));

    return cleaned.length ? cleaned : fallback;
  }

  private buildPayload(base: any): Fin26010Request {
    const fromForm = this.queryForm.getRawValue();

    const payload: Fin26010Request = {
      PageIndex:
        Number.isFinite(base?.pageIndex) && base.pageIndex >= 1
          ? base.pageIndex
          : 1,

      PageSize:
        Number.isFinite(base?.pageSize) && base.pageSize > 0
          ? base.pageSize
          : 30,

      SortBy: this.normalizeSort(base?.SortBy, this.defaultSort),

      WSLIP_NO:
        base?.transferSource ??
        fromForm.transferSource ??
        undefined,

      CRT_DateFrom: this.toYMDOrUndef(
        base?.buildDateFrom ?? fromForm.buildDateFrom
      ),

      CRT_DateTo: this.toYMDOrUndef(
        base?.buildDateTo ?? fromForm.buildDateTo
      ),

      RMT_DateFrom: this.toYMDOrUndef(
        base?.transferDateFrom ?? fromForm.transferDateFrom
      ),

      RMT_DateTo: this.toYMDOrUndef(
        base?.transferDateTo ?? fromForm.transferDateTo
      ),

      BNK_id:
        (base?.bankCode ?? fromForm.bankCode ?? '')
          ?.toString()
          .trim() || undefined,

      Status:
        (base?.status ?? fromForm.status)
          ?.toString()
          .trim() || undefined,

      VouNo:
        (base?.SummonNumber ?? fromForm.SummonNumber)
          ?.toString()
          .trim() || undefined,

      File_Name:
        (base?.fileName ?? fromForm.fileName)
          ?.toString()
          .trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];

      if (v === '' || v == null) {
        delete (payload as any)[k];
      }
    });

    return payload;
  }

  private loadBankOptions(): void {
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data)
            ? res.Data
            : [];

          this.bankOptions = list.map((x) => ({
            label: `${x.BNK_id}-${x.BNK_AccName}`,
            value: x.BNK_id,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入銀行代號下拉失敗', err);
          this.bankOptions = [];
        },
      });
  }

  public queryFIN26010ForReport = (body: any) =>
    this.fin26010Service
      .queryFIN26010(this.buildPayload(body || {}))
      .pipe(
        map((res: ApiResponse<Fin26010Row[]>) => {
          const rows: Fin26010Row[] = Array.isArray(res?.Data)
            ? res.Data
            : [];

          const totalCount =
            Number(res?.TotalCount ?? rows.length) ||
            rows.length;

          rows.forEach((r, idx) => {
            (r as any)._rowKey = idx + 1;
          });

          return {
            Data: rows,
            TotalCount: totalCount,
            GrandTotal: null,
          };
        })
      );

  private saveQueryState(): void {
    this.queryStateService.setQueryState(this.ProgNo, {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  ngOnInit(): void {
    const today = new Date();

    this.queryForm.patchValue({
      transferDateFrom: today,
      transferDateTo: today,
    });

    this.loadBankOptions();

    this.initializePage(
      'FIN26010',
      '/FIN2000/FIN26010CRU',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();

    const payload = this.buildPayload(raw);

    payload.PageIndex = 1;

    this._currentSortBy =
      payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.fin26010Service
      .queryFIN26010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Fin26010Row[]>) => {
          const rows: Fin26010Row[] = Array.isArray(
            response?.Data
          )
            ? response.Data
            : [];

          rows.forEach((r, idx) => {
            (r as any)._rowKey = idx + 1;
          });

          this.data = rows;
          this.viewTotalRecords = this.data.length;

          this.cdr.detectChanges();

          const realTotal =
            Number(response?.TotalCount ?? rows.length) ||
            rows.length;

          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };

            this.saveQueryState();
          });

          this.loading = false;
        },
        error: (err: any) => {
          console.error('FIN26010 API error:', err);

          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
          this.loading = false;
        },
      });
  }

  onClear(frm: FormGroup) {
    const today = new Date();

    frm.reset({
      transferSource: null,
      buildDateFrom: null,
      buildDateTo: null,
      transferDateFrom: today,
      transferDateTo: today,
      bankCode: null,
      bankName: null,
      status: null,
      SummonNumber: null,
      fileName: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;
  }

  generateRemitFile(): void {
    if (!this.selectedItems?.length) {
      this.messageService.warnBubble(
        '請先選擇資料',
        '警告'
      );
      return;
    }

    const payload: ExportFin26010TxtRequest = {
      WSLIP_NOList: this.selectedItems
        .map((x) => x.WSLIP_NO)
        .filter(Boolean) as string[],
    };

    this.btnGenerateFileLoading = true;

    this.rawHttp.post(
      `${environment.ApiUrl}/ExportLabel/ExportFIN26010TXT`,
      payload,
      {
        responseType: 'blob',
        observe: 'response',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.getUserInfo()?.AccessToken ?? ''}`
        }),
      }
    )
      .pipe(untilDestroyed(this))
      .subscribe({
        next: async (res: HttpResponse<Blob>) => {
          try {
            const blob = res.body;

            if (!blob) {
              this.messageService.errorBubble(
                '匯出失敗：檔案內容為空',
                '失敗'
              );
              return;
            }

            // 先判斷是不是 JSON
            if (
              blob.type?.includes('application/json')
            ) {
              const text = await blob.text();

              const json = JSON.parse(text);

              // 強制處理 9998
              if (json?.Status === '9998') {
                this.messageService.clearBubble();

                this.messageService.errorBubble(
                  json?.Message ||
                  '匯出失敗',
                  '失敗'
                );

                return;
              }
            }

            // 正常 TXT
            let filename = 'FIN26010.txt';

            const cd =
              res.headers.get(
                'Content-Disposition'
              );

            if (cd) {
              const match =
                /filename\*?=(?:UTF-8''|")?([^"]+)/i.exec(
                  cd
                );

              if (match?.[1]) {
                filename = decodeURIComponent(
                  match[1].replace(/"/g, '')
                );
              }
            }

            const url =
              globalThis.URL.createObjectURL(blob);

            const a =
              document.createElement('a');

            a.href = url;
            a.download = filename;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            globalThis.URL.revokeObjectURL(url);
          } catch (e) {
            console.error(e);

            this.messageService.errorBubble(
              '匯出失敗',
              '失敗'
            );
          }
        },

        // 吃掉 400
        error: async (err: any) => {
          console.error('FIN26010 TXT 匯出 API 錯誤:', err);

          let apiMessage = '匯出失敗';

          const parseApiMessage = (obj: any): string | null => {
            return (
              obj?.Message ||
              obj?.message ||
              obj?.Error?.Message ||
              obj?.Error ||
              null
            );
          };

          try {
            if (err?.error instanceof Blob) {
              const text = await err.error.text();

              if (text) {
                try {
                  const json = JSON.parse(text);
                  apiMessage = parseApiMessage(json) || apiMessage;
                } catch {
                  apiMessage = text;
                }
              }
            } else if (typeof err?.error === 'string') {
              try {
                const json = JSON.parse(err.error);
                apiMessage = parseApiMessage(json) || err.error || apiMessage;
              } catch {
                apiMessage = err.error || apiMessage;
              }
            } else {
              apiMessage =
                parseApiMessage(err?.error) ||
                parseApiMessage(err) ||
                apiMessage;
            }
          } catch (e) {
            console.error('解析匯出錯誤訊息失敗:', e);
          }

          this.messageService.clearBubble();
          this.messageService.errorBubble(apiMessage, '失敗');
        },
      })
      .add(() => {
        this.btnGenerateFileLoading = false;
      });
  }
}