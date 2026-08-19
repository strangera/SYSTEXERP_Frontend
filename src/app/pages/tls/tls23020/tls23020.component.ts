import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, finalize, map, shareReplay } from 'rxjs/operators';
import { formatAmount, formatDate, ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23020Service } from '../../../service/api/tls/tls23020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-tls2320',
  templateUrl: './tls23020.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, InputNumberRangeComponent, InputTextComponent,
    DropdownComponent, CheckboxModule, InputTextModule, ButtonComponent, DialogModule,
    RadioButtonModule, TranslateModule, ButtonModule, TableReportComponent, InputTextRangeComponent,
  ],
})
export class TLS23020Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  summaryData: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any = null;
  summaryFooter: any;

  readonly groupByField = 'groupKey';
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly defaultSort: any[] = [
    { field: this.groupByField, order: 1 },
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  isRowSelectable = (row: any) => !row?.__isBackendTotal;

  // ===== 表單宣告 =====
  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null, [this.validationService.numberValidator]],
    TXN_No_End: [null, [this.validationService.numberValidator]],
    TLT_No: [],
    TXN_GUINo: [''],
    TXN_SaleAmt_Start: [null],
    TXN_SaleAmt_End: [null],
    PLU_TaxType: [],
    PRM_TXN_DiscCode: [],
    TXN_DiscCode: [],
    tlt_id: [],
    PLU_MagNo: [],
    ACT_DiscCode: [],
    IsNoPLU_No: [false],
    rece_yn: [],
    cash_yn: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    showSummary: [false],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[
      { field: this.groupByField, order: 1 },
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]],
  });

  // ===== 下拉選單資料源 =====
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly taxableOptions = [
    { value: '0', label: '免稅' },
    { value: '1', label: '應稅' },
  ];
  readonly discountOptions = [
    { value: '000', label: '正品' }, { value: '095', label: '95折' },
    { value: '090', label: '90折' }, { value: '085', label: '85折' },
    { value: '080', label: '80折' }, { value: '075', label: '75折' },
    { value: '070', label: '70折' }, { value: '065', label: '65折' },
    { value: '060', label: '60折' }, { value: '055', label: '55折' },
    { value: '050', label: '50折' }, { value: '999', label: '特價' },
  ];
  readonly deductionbigCategoryOptions = Array.from({ length: 10 }, (_, i) => ({ value: i, label: `類別${i}` }));
  readonly whetherOptions = [{ value: 'Y', label: '是' }, { value: 'N', label: '否' }, { value: null, label: '全部' }];
  readonly txnStatusOptions = [
    { value: 'N', label: '正常交易' }, { value: 'C', label: '交易取消' },
    { value: 'D', label: '發票作廢' }, { value: 'E', label: '隔日發票作廢' },
  ];
  readonly carrierTypeOptions = getSYS1000Options('TXN_GUI_CarrType');

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23020Service: TLS23020Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service,
    private readonly validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23020');
    this.queryForm.patchValue({ pageSize: 500, SortBy: this.defaultSort }, { emitEvent: false });

    // 表單狀態自動暫存
    this.queryForm.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => {
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      });

    // 銷售月份聯動起迄日期
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || Number.isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    this.queryForm.controls.TXN_DateStart.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 最佳實踐)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      buildings: this.tls11010Service.getBuildingOptions(),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name })))),
      orgs: this.dropdownApiService.querySys3100(),
      ecrs: this.dropdownApiService.queryPos1002(),
      counters: this.dropdownApiService.queryTltTalent(),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.BUILDING_NO_Options = res.buildings || [];
      this.floorOptions = res.floors || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
    });
  }

  // ========= 查詢（明細 / 彙總） =========
  onSubmit(form: FormGroup): void {
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());

    this.handleSubmit(form, () => {
      const formVal = this.queryForm.getRawValue();
      const condPayload = this.buildPayload(formVal);
      const rawSort = Array.isArray(formVal.SortBy) ? formVal.SortBy : this.defaultSort;

      const payload = {
        ...condPayload,
        pageIndex: formVal.pageIndex ?? 1,
        pageSize: formVal.pageSize ?? 500,
        SortBy: this.toBackendSort(rawSort),
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      const isSummary = !!this.queryForm.get('showSummary')?.value;
      if (isSummary) {
        this.executeSummaryQuery(payload);
      } else {
        this.executeDetailQuery(payload);
      }
    });
  }

  private executeSummaryQuery(payload: any): void {
    const test = {
      TXN_DateStart: payload.TXN_DateStart,
      TXN_DateEnd: payload.TXN_DateEnd,
      ECR_No: payload.ECR_No || null,
      TXN_No_Start: payload.TXN_No_Start || null,
      TXN_No_End: payload.TXN_No_End || null,
      TLT_No: payload.TLT_No || null,

      TXN_GUINo: payload.TXN_GUINo || null,
      TXN_SaleAmt_Start: payload.TXN_SaleAmt_Start || null,
      TXN_SaleAmt_End: payload.TXN_SaleAmt_End || null,
      TXN_TaxType: payload.PLU_TaxType || null,
      TXN_DiscCode: payload.TXN_DiscCode || null,
      tlt_id: payload.tlt_id || null,

      PLU_MagNo: payload.PLU_MagNo || null,
      IsNoPLU_No: payload.IsNoPLU_No || null,
      rece_yn: payload.rece_yn || null,
      cash_yn: payload.cash_yn || null,
      tlt_building: payload.tlt_building || null,
      tlt_floor: payload.tlt_floor || null,
      org_id: payload.org_id || null
    }
    console.log('executeSummaryQuery payload:', test);
    this.tls23020Service.queryTLS23020_Summary(test)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      )
      .subscribe({
        next: (res: any) => {
          const arr = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : [];
          this.summaryData = arr.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${i}`,
          }));
          this.totalRecords = this.summaryData.length;

          const total = res?.Data?.TotalSummary ?? {};

          this.summaryFooter = {
            TXN_Date: '總計',
            TXN_TotSaleAmt: Number(total?.Total_TXN_TotSaleAmt ?? 0),
            TXN_TotNet: Number(total?.Total_TXN_TotNet ?? 0),
            TXN_TotTax: Number(total?.Total_TXN_TotTax ?? 0),
            // SAD_Pre
            SAD_Pre_TotSaleAmt: Number(total?.Total_SAD_Pre_TotSaleAmt ?? 0),
            SAD_Pre_TotNet: Number(total?.Total_SAD_Pre_TotNet ?? 0),
            SAD_Pre_TotTax: Number(total?.Total_SAD_Pre_TotTax ?? 0),
            // Pre
            Pre_TotSaleAmt: Number(total?.Total_Pre_TotSaleAmt ?? 0),
            Pre_TotNet: Number(total?.Total_Pre_TotNet ?? 0),
            Pre_TotTax: Number(total?.Total_Pre_TotTax ?? 0),
          };

          this.data = [];
          this.detailTotals = {};
        },
        error: () => this.handleQueryError()
      });
  }

  private executeDetailQuery(payload: any): void {
    this.tls23020Service.queryTLS23020(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      )
      .subscribe({
        next: (res: any) => {
          const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
          const pageRows: any[] = [];
          const totalAgg = { Total_TXN_SaleAmt: 0, Total_TXN_Net: 0, Total_TXN_Tax: 0, Total_TXN_Disc: 0 };

          for (const w of wrappers) {
            totalAgg.Total_TXN_SaleAmt += Number(w?.Total_TXN_SaleAmt ?? 0);
            totalAgg.Total_TXN_Net += Number(w?.Total_TXN_Net ?? 0);
            totalAgg.Total_TXN_Tax += Number(w?.Total_TXN_Tax ?? 0);
            totalAgg.Total_TXN_Disc += Number(w?.Total_TXN_Disc ?? 0);

            const subTotals = w?.tLS23020_SubTotals ?? w?.TLS23020_SubTotals ?? w?.tls23020_SubTotals ?? [];
            if (!Array.isArray(subTotals)) continue;

            for (const st of subTotals) {
              const details = st?.tLS23020_Details ?? st?.TLS23020_Details ?? st?.tls23020_Details ?? [];
              for (const item of Array.isArray(details) ? details : []) {
                const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
                const _rowKey = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;
                const groupKey = `${formatDate(item.TXN_Date)}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;
                pageRows.push({ ...item, _rowKey, groupKey });
              }
            }
          }

          this.data = pageRows;
          this.summaryData = [];
          this.summaryFooter = undefined;

          const candidates = [res?.TotalCount, res?.Data?.TotalCount, wrappers?.[0]?.TotalCount];
          this.totalRecords = candidates.map(Number).find(n => Number.isFinite(n) && n >= 0) ?? pageRows.length;
          this.detailTotals = totalAgg;
        },
        error: () => this.handleQueryError()
      });
  }

  private handleQueryError(): void {
    this.data = [];
    this.summaryData = [];
    this.totalRecords = 0;
    this.summaryFooter = undefined;
    this.detailTotals = {};
  }

  onToggleSummary(): void {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  // ========= <app-table-report> 報表封裝調用（明細） =========
  public queryTLS23020ForReport = (body: any) =>
    this.tls23020Service.queryTLS23020({
      ...(body || {}),
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      SortBy: this.toBackendSort(body?.SortBy),
      pageIndex: body?.pageIndex ?? 1,
      pageSize: body?.pageSize ?? 500,
    }).pipe(
      map((res: any) => {
        const wrappers = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rows: any[] = [];
        const totalAgg = { Total_TXN_SaleAmt: 0, Total_TXN_Net: 0, Total_TXN_Tax: 0, Total_TXN_Disc: 0 };

        for (const w of wrappers) {
          totalAgg.Total_TXN_SaleAmt += Number(w?.Total_TXN_SaleAmt ?? 0);
          totalAgg.Total_TXN_Net += Number(w?.Total_TXN_Net ?? 0);
          totalAgg.Total_TXN_Tax += Number(w?.Total_TXN_Tax ?? 0);
          totalAgg.Total_TXN_Disc += Number(w?.Total_TXN_Disc ?? 0);

          const subTotals = w?.tLS23020_SubTotals ?? w?.TLS23020_SubTotals ?? w?.tls23020_SubTotals ?? [];
          for (const st of Array.isArray(subTotals) ? subTotals : []) {
            const details = st?.tLS23020_Details ?? st?.TLS23020_Details ?? st?.tls23020_Details ?? [];
            for (const item of Array.isArray(details) ? details : []) {
              const dateKey = String(item.TXN_Date ?? '').slice(0, 19);
              const _rowKey = `${dateKey}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;
              const groupKey = `${formatDate(item.TXN_Date)}|${item.ECR_No ?? ''}|${item.TXN_No ?? ''}`;
              rows.push({ ...item, _rowKey, groupKey });
            }
          }
        }

        const candidates = [res?.TotalCount, res?.Data?.TotalCount, wrappers?.[0]?.TotalCount];
        this.detailTotals = { ...totalAgg };
        return {
          Data: rows,
          TotalCount: candidates.map(Number).find(n => Number.isFinite(n) && n >= 0) ?? rows.length,
          GrandTotal: totalAgg
        };
      })
    );

  // ========= <app-table-report> 報表封裝調用（彙總） =========
  public queryTLS23020SummaryForReport = (body: any) =>
    this.tls23020Service.queryTLS23020_Summary({
      ...(body || {}),
      TXN_TaxType: body.PLU_TaxType || null,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        const arr = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : [];
        const rows = arr.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${i}`,
        }));
        return { Data: rows, TotalCount: rows.length, GrandTotal: {} };
      })
    );

  buildFooterFromTotals(): Record<string, any> | undefined {
    if (!this.detailTotals) return undefined;
    return {
      TXN_SaleAmt: this.detailTotals['Total_TXN_SaleAmt'] ?? 0,
      TXN_Net: this.detailTotals['Total_TXN_Net'] ?? 0,
      TXN_Tax: this.detailTotals['Total_TXN_Tax'] ?? 0,
      TXN_Disc: this.detailTotals['Total_TXN_Disc'] ?? 0,
    };
  }

  // ========= 匯出報表最佳實踐 =========
  private buildExportBody(): any {
    const { pageIndex, pageSize, ...body } = this.historyRequestBody ?? {};
    return body;
  }

  // ========= 匯出報表最佳實踐 =========
  private buildSummaryExportBody(): any {
    const { pageIndex, pageSize, ...body } = this.historyRequestBody ?? {};
    return {
      ...body,
      TXN_TaxType: body.PLU_TaxType ?? null,
    };
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const body = this.buildExportBody();
    const summaryBody = this.buildSummaryExportBody();

    const obs$ = this.queryForm.get('showSummary')?.value ? this.tls23020Service.exportTLS23020SummaryPDF(summaryBody) : this.tls23020Service.exportTLS23020PDF(body);

    obs$.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (res) => this.handleFileExport(res, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const body = this.buildExportBody();
    const summaryBody = this.buildSummaryExportBody();
    const obs$ = this.queryForm.get('showSummary')?.value ? this.tls23020Service.exportTLS23020SummaryExcel(summaryBody) : this.tls23020Service.exportTLS23020Excel(body);

    obs$.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (res) => this.handleFileExport(res, '.xlsx') });
  }

  private showExportWarn(): void {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const blob = response.body;
    if (blob && blob.size > 0) {
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
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

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;
    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 資料清洗與小工具群 =========
  private buildPayload(val: any) {
    const asStrArr = (x: any) => Array.isArray(x) ? x.map(String) : x == null || x === '' ? undefined : [String(x)];
    const asNum = (x: any) => x == null || x === '' || Number.isNaN(Number(x)) ? undefined : Number(x);

    const o: any = {
      TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
      ECR_No: asStrArr(val?.ECR_No),
      TXN_No_Start: asNum(val?.TXN_No_Start),
      TXN_No_End: asNum(val?.TXN_No_End),
      TLT_No: asStrArr(val?.TLT_No),
      TXN_GUINo: (val?.TXN_GUINo ?? '').toString().trim() || undefined,
      TXN_SaleAmt_Start: asNum(val?.TXN_SaleAmt_Start),
      TXN_SaleAmt_End: asNum(val?.TXN_SaleAmt_End),
      PLU_TaxType: val?.PLU_TaxType == null || val?.PLU_TaxType === '' ? undefined : String(val.PLU_TaxType),
      TXN_DiscCode: asStrArr(val?.TXN_DiscCode),
      PRM_TXN_DiscCode: asStrArr(val?.PRM_TXN_DiscCode),
      tlt_id: asStrArr(val?.tlt_id),
      PLU_MagNo: (val?.PLU_MagNo ?? '').toString().trim() || undefined,
      IsNoPLU_No: !!val?.IsNoPLU_No,
      rece_yn: val?.rece_yn == null || val?.rece_yn === '' ? undefined : String(val.rece_yn),
      cash_yn: val?.cash_yn == null || val?.cash_yn === '' ? undefined : String(val.cash_yn),
      tlt_building: asStrArr(val?.tlt_building),
      tlt_floor: asStrArr(val?.tlt_floor),
      org_id: asStrArr(val?.org_id),
    };

    if (this.includePagingAndSorting) {
      o.pageIndex = val?.pageIndex ?? 1;
      o.pageSize = val?.pageSize ?? 500;
      o.SortBy = Array.isArray(val?.SortBy) ? val.SortBy : undefined;
    }

    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) delete o[k];
    });
    return o;
  }

  private toBackendSort(sortBy: any[] | undefined) {
    const src = (Array.isArray(sortBy) ? sortBy : []).filter(s => s?.field && s.field !== 'groupKey');
    const need = (f: string) => !src.some(s => s.field === f);

    if (need('TXN_Date')) src.unshift({ field: 'TXN_Date', order: 1 });
    if (need('ECR_No')) src.push({ field: 'ECR_No', order: 1 });
    if (need('TXN_No')) src.push({ field: 'TXN_No', order: 1 });

    const seen = new Set<string>();
    const dedup: any[] = [];
    for (const s of src) {
      if (seen.has(s.field)) continue;
      seen.add(s.field);
      dedup.push({ field: String(s.field), order: s.order === -1 ? -1 : 1 });
    }
    return dedup;
  }

  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    return {
      start: new Date(year, month, 1, 0, 0, 0),
      end: new Date(year, month + 1, 0, 23, 59, 59)
    };
  }

  private clearMonthIfNotExactRange() {
    const start = this.queryForm.value.TXN_DateStart;
    const end = this.queryForm.value.TXN_DateEnd;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(new Date(start));
    if (new Date(start).getTime() !== mStart.getTime() || new Date(end).getTime() !== mEnd.getTime()) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
    }
  }

  private readonly padTxnNo = (v: any): string => String(v ?? '').trim().padStart(6, '0');
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 =====
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '單項售價', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_Net', header: '未稅金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_Tax', header: '稅額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_Disc', header: '折扣金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'tlt_id', header: '抽成別代號', visible: true },
    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'PRM_TXN_DiscName', header: '原折扣別', visible: true },
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },
    { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
    { field: 'PLU_MagNo', header: '單品編號', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];

  summaryColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true }, // 回傳日期區間
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_TotSaleAmt', header: '銷售金額(含稅)', visible: true, align: 'right', format: formatAmount }, // 總銷售金額=總應稅銷售金額+總免稅銷售金額
    { field: 'TXN_TotNet', header: '未稅金額', visible: true, align: 'right', format: formatAmount }, // 總未稅銷售金額
    { field: 'TXN_TotTax', header: '稅額', visible: true, align: 'right', format: formatAmount, isTotal: true }, // 總稅額
    // 新增
    { field: 'SAD_Pre_TotSaleAmt', header: '結帳金額', visible: true, align: 'right', format: formatAmount },
    { field: 'SAD_Pre_TotNet', header: '結帳未稅', visible: true, align: 'right', format: formatAmount },
    { field: 'SAD_Pre_TotTax', header: '結帳稅額', visible: true, align: 'right', format: formatAmount },
    { field: 'Pre_TotSaleAmt', header: '預購金額', visible: true, align: 'right', format: formatAmount }, // (預購)總銷售金額=總應稅銷售金額+總免稅銷售金額
    { field: 'Pre_TotNet', header: '預購未稅', visible: true, align: 'right', format: formatAmount }, // (預購)總未稅銷售金額
    { field: 'Pre_TotTax', header: '預購稅額', visible: true, align: 'right', format: formatAmount }
  ];

  detailTotals: Record<string, number> = {};
  detailSubtotals: Record<string, Record<string, number>> = {};
}
