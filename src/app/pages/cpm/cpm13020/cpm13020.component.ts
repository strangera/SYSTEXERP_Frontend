/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import type { SortMeta as PSortMeta, SortMeta } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize, map } from 'rxjs/operators';
import { Cpm13020Service, ECRDropDownOption, QueryCPM13020Request } from '../../../service/api/cpm/cmp13020.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

@UntilDestroy()
@Component({
  selector: 'app-cpm13020',
  templateUrl: './cpm13020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MenubarComponent,
    AccordionModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    MultiSelectComponent,
    TableReportComponent,
  ],
})
export class CPM13020Component extends BasicQueryPageComponent<any> implements OnInit {
  /** ALL=全館彙總 / POS=機台彙總 */
  reportMode: 'ALL' | 'POS' = 'ALL';
  apiUrl = 'queryCPM13020_All';
  apiUrlPOS = 'queryCPM13020_Pos';
  reportModeOptions = [
    { label: '全館彙總', value: 'ALL' },
    { label: '機台彙總', value: 'POS' },
  ] as { label: string; value: 'ALL' | 'POS' }[];

  // 資料/總筆數/總計
  rows: any[] = [];
  totalRecords = 0;
  grandTotal: any = null;

  // 匯出（目前後端尚未提供匯出 API，先保留 UI 開關）
  btnLoading = false;
  historyRequestBody: QueryCPM13020Request | null = null;

  ecrNoOptions: { label: string; value: string }[] = [];

  // ✅ 預設排序
  readonly defaultSort: SortMeta[] = [{ field: 'PAY_No', order: 1 }];

  // ✅ 還原用
  private _currentSortBy: SortMeta[] = this.defaultSort;
  lastQueryBody: QueryCPM13020Request | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_BDate: [this.yesterday, [Validators.required]],
    TXN_EDate: [this.yesterday, [Validators.required]],
    PAY_No: [''],
    ECR_No: [null as string[] | null],
    reportMode: ['ALL', [Validators.required]],
    // 分頁 + 排序
    ...createPaginationConfig([{ field: 'PAY_No', order: 1 }]),
    pageSize: [30],
  });

  columnsAll = [
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_Name', header: '支付別', visible: true, style: 'text-left' },
    {
      field: 'TXN_PayAmt',
      header: '停車收入',
      visible: true,
      style: 'text-right',
      format: (v: number) => this.money(v),
      isTotal: true,
    },
    { field: 'TXN_PayAmt_Rate', header: '收入佔比(%)', visible: true, style: 'text-right' },
    { field: 'TXN_CustCnt', header: '交易筆數', visible: true, style: 'text-right', isTotal: true },
  ];

  columnsPos = [
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'ECR_No', header: '繳費機編號', visible: true },
    { field: 'PAY_Name', header: '支付別', visible: true, style: 'text-left' },

    {
      field: 'TXN_PayAmt',
      header: '停車收入',
      visible: true,
      style: 'text-right',
      format: (v: number) => this.money(v),
      isTotal: true,
      isSubTotal: true, // ✅ 依 ECR_No 小計
    },
    { field: 'TXN_PayAmt_Rate', header: '收入佔比(%)', visible: true, style: 'text-right' },

    {
      field: 'TXN_CustCnt',
      header: '交易筆數',
      visible: true,
      style: 'text-right',
      isTotal: true,
      isSubTotal: true, // ✅ 依 ECR_No 小計
    },
  ];
  readonly groupByField = 'groupKey';

  // ✅ POS 預設排序：ECR_No 一定要最前（讓 group 正確）
  readonly defaultSortPos: SortMeta[] = [
    { field: 'ECR_No', order: 1 },
    { field: 'PAY_No', order: 1 },
  ];
  // paymentTypeOptions = getSYS1000Options('PK_PAY_Type');
  paymentTypeOptions: Array<{ label: string; value: string; formLabel?: string }> = [];

  constructor(
    public cpm13020Service: Cpm13020Service,

    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM13020', 'cpm/cpm13020', this.queryForm, (form) => this.onSubmit(form));

    // // 支付別下拉
    // this.dropDownListService
    //   .queryPOS1006_DropDownList()
    //   .pipe(untilDestroyed(this))
    //   .subscribe((res) => {
    //     const rows = Array.isArray(res?.Data) ? res.Data : [];
    //     this.paymentTypeOptions = rows.map((x: any) => ({
    //       label: `${x.No ?? ''}-${x.Name ?? ''}`,
    //       value: x.No ?? '',
    //       Name: x.Name ?? '',
    //       No: x.No ?? '',
    //       PAY_Type: x.PAY_Type ?? '',
    //     }));
    //   });
    this.cpm13020Service
      .queryPOS1006_PAY_No_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (rows) => {
          this.paymentTypeOptions = (rows ?? []).map((x) => ({
            label: `${x.No ?? ''}-${x.Name ?? ''}`,
            formLabel: `${x.No ?? ''} - ${x.Name ?? ''}`,
            value: x.No ?? '',
          }));
        },
        error: (err) => {
          console.error('PAY_No 下拉取得失敗', err);
          this.paymentTypeOptions = [];
        },
      });

    this.cpm13020Service
      .queryCPM13020_ECR_DropDown()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (rows: ECRDropDownOption[]) => {
          this.ecrNoOptions = (rows ?? []).map((x) => ({
            label: `${x.ECR_No} - ${x.ECR_Name}${x.building_desc ? ' - ' + x.building_desc : ''}`,
            value: x.ECR_No,
          }));
        },
        error: (err) => {
          console.error('ECR_No 下拉取得失敗', err);
          this.ecrNoOptions = [];
        },
      });
    // 檢視模式切換：清空總計 + 清空列表
    this.queryForm.controls.reportMode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((v) => {
        this.reportMode = v === 'POS' ? 'POS' : 'ALL';
        this.grandTotal = null;
        this.rows = [];
        this.totalRecords = 0;
      });

    // 清空總計的欄位變更
    const keysToWatch = ['TXN_BDate', 'TXN_EDate', 'PAY_No'] as const;
    keysToWatch.forEach((k) => {
      const ctrl = this.queryForm.get(k);
      if (ctrl) {
        ctrl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
          this.grandTotal = null;
        });
      }
    });


  }

  // 解析 API 回傳的總計物件
  private extractGrandTotal(apiResp: any): any {
    const t0 = apiResp?.Data?.totalData?.[0];
    if (!t0) return null;
    return {
      TXN_PayAmt: Number(t0.TXN_Total_PayAmt ?? 0),
      TXN_CustCnt: Number(t0.TXN_Total_CustCnt ?? 0),
    };
  }

  // === PrimeNG SortMeta -> API SortMeta（order: 1 | -1）===
  private normalizeSortMeta(meta: unknown): SortMeta[] {
    const arr = Array.isArray(meta) ? (meta as PSortMeta[]) : [];
    return arr
      .filter((s) => !!s && !!s.field)
      .map<SortMeta>((s) => ({
        field: String(s.field),
        order: (s.order as number) === -1 ? -1 : 1,
      }));
  }

  /** ✅ 儲存查詢狀態（給返回列表時還原） */
  private saveQueryState(): void {
    this.queryStateService.setQueryState('CPM13020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy?.length ? this._currentSortBy : this.defaultSort,
      lastQueryBody: this.lastQueryBody,
      reportMode: this.reportMode,
    });
  }

  // 送出：交由後端分頁/排序
  onSubmit = (frm: FormGroup) => {
    this.handleSubmit(frm, () => {
      this.grandTotal = null;

      const val: any = this.queryForm.getRawValue();
      const payNo: string[] | undefined =
        Array.isArray(val?.PAY_No) && val.PAY_No.length > 0
          ? val.PAY_No
          : undefined;

      const ecrNo: string[] | undefined =
        Array.isArray(val?.ECR_No) && val.ECR_No.length > 0 ? val.ECR_No : undefined;

      const sortBy = this.normalizeSortMeta(val?.SortBy?.length ? val.SortBy : this._currentSortBy);

      const payload: QueryCPM13020Request = {
        TXN_BDate: this.toDateOnly(val?.TXN_BDate),
        TXN_EDate: this.toDateOnly(val?.TXN_EDate),
        PAY_No: payNo,
        ECR_No: ecrNo,
        pageIndex: Number(val?.pageIndex ?? 1),
        pageSize: Number(val?.pageSize ?? 30),
        SortBy: sortBy,
      };

      this.historyRequestBody = { ...payload };
      this.lastQueryBody = { ...payload };
      this._currentSortBy = sortBy;

      this.loading = true;

      const mode = val?.reportMode === 'POS' ? 'POS' : 'ALL';
      const call$ =
        mode === 'ALL'
          ? this.cpm13020Service.queryAll(payload)
          : this.cpm13020Service.queryPos(payload);

      call$
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp) => {
            const rawRows = Array.isArray(resp?.Data?.mainData)
              ? resp.Data.mainData
              : Array.isArray(resp?.Data)
                ? resp.Data
                : [];

            const mode = val?.reportMode === 'POS' ? 'POS' : 'ALL';

            // ✅ 補 row key + groupKey
            this.rows = rawRows.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.ECR_No ?? ''}|${r?.PAY_No ?? ''}|${i}`, // ✅ dataKey 用
              groupKey: mode === 'POS' ? String(r?.ECR_No ?? '') : '', // ✅ POS 才需要分組
            }));

            this.totalRecords = Number(resp?.TotalCount ?? this.rows.length ?? 0);
            this.grandTotal = this.extractGrandTotal(resp);

            this.saveQueryState();
          },
          error: () => {
            this.rows = [];
            this.totalRecords = 0;
            this.grandTotal = null;
          },
        });
    });
  };

  // <app-table-report> 查詢（直接打後端分頁，回傳 GrandTotal）
  public queryAllForReport = (body: any) => {
    const rawPay = body?.PAY_No ?? this.queryForm.value?.PAY_No;

    const payNo: string[] | undefined =
      Array.isArray(rawPay) && rawPay.length > 0 ? rawPay : undefined;
    const sortBy = this.normalizeSortMeta(
      body?.SortBy ?? this.queryForm.value?.SortBy ?? this._currentSortBy
    );

    return this.cpm13020Service
      .queryAll({
        TXN_BDate: this.toDateOnly(body?.TXN_BDate ?? this.queryForm.value?.TXN_BDate),
        TXN_EDate: this.toDateOnly(body?.TXN_EDate ?? this.queryForm.value?.TXN_EDate),
        PAY_No: payNo,
        pageIndex: Number(body?.pageIndex ?? this.queryForm.value?.pageIndex ?? 1),
        pageSize: Number(body?.pageSize ?? this.queryForm.value?.pageSize ?? 30),
        SortBy: sortBy,
      })
      .pipe(
        map((res: any) => ({
          Data: Array.isArray(res?.Data?.mainData)
            ? res.Data.mainData
            : Array.isArray(res?.Data)
              ? res.Data
              : [],
          TotalCount: Number(res?.TotalCount ?? 0),
          GrandTotal: this.extractGrandTotal(res),
        }))
      );
  };

  public queryPosForReport = (body: any) => {
    const rawPay = body?.PAY_No ?? this.queryForm.value?.PAY_No;

    const payNo: string[] | undefined =
      Array.isArray(rawPay) && rawPay.length > 0 ? rawPay : undefined;

    // ✅ 如果 body.SortBy 沒帶，就用 POS 預設排序
    const baseSort =
      body?.SortBy ??
      this.queryForm.value?.SortBy ??
      this._currentSortBy ??
      this.defaultSortPos;

    // ✅ 正規化 + 確保 ECR_No 第一（讓 group 正確）
    const norm = this.normalizeSortMeta(baseSort);
    const sortBy = [
      { field: 'ECR_No', order: 1 as 1 },
      ...norm.filter((s) => s.field !== 'ECR_No'),
    ];

    return this.cpm13020Service
      .queryPos({
        TXN_BDate: this.toDateOnly(body?.TXN_BDate ?? this.queryForm.value?.TXN_BDate),
        TXN_EDate: this.toDateOnly(body?.TXN_EDate ?? this.queryForm.value?.TXN_EDate),
        PAY_No: payNo,
        pageIndex: Number(body?.pageIndex ?? this.queryForm.value?.pageIndex ?? 1),
        pageSize: Number(body?.pageSize ?? this.queryForm.value?.pageSize ?? 30),
        SortBy: sortBy,
      })
      .pipe(
        map((res: any) => {
          const rawRows = Array.isArray(res?.Data?.mainData)
            ? res.Data.mainData
            : Array.isArray(res?.Data)
              ? res.Data
              : [];

          const rows = rawRows.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.ECR_No ?? ''}|${r?.PAY_No ?? ''}|${i}`,
            groupKey: String(r?.ECR_No ?? ''),
          }));

          return {
            Data: rows,
            TotalCount: Number(res?.TotalCount ?? 0),
            GrandTotal: this.extractGrandTotal(res),
          };
        }),
      );
  };

  onExportPDF() {
    this.messageService?.warnBubble?.('尚未提供匯出 API。');
  }
  onExportXLSX() {
    this.messageService?.warnBubble?.('尚未提供匯出 API。');
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  money(v: number): string {
    return Number(v ?? 0).toLocaleString('en-US');
  }
  percent(v: number): string {
    const n = Number(v ?? 0);
    return isFinite(n) ? n.toFixed(2) : '0.00';
  }

}
