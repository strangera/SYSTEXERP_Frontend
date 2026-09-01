import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryASS11040DataWrapper, QueryASS11040Response } from '@pages/ass/ass11040/ass11040.model';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import {
  ASS13080QueryRow,
  PrintASS13080Request,
  QueryASS13080Request,
} from './ass13080.model';

/** 3.1.3.8 資產變賣作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass13080',
  templateUrl: './ass13080.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS13080Component extends BasicQueryPageComponent<ASS13080QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.nonNullable.group({
    assetSaleNo: [null as string | null],
    assetId: [null as string | null],
    goodsId: [null as string | null],
    getDateFrom: [null as Date | null],
    getDateTo: [null as Date | null],
    assetStatus: [null as string | null],
    depreId: [null as string | null],
    holdOrgId: [null as string | null],
    holdEmpId: [null as string | null],
    useOrgId: [null as string | null],
    useEmpId: [null as string | null],
    stypeId: [null as string | null],
    assetType: [null as string | null],
    getCostFrom: [null as number | null],
    getCostTo: [null as number | null],
    subcheckId: [null as string | null],
    billDateFrom: [null as Date | null],
    billDateTo: [null as Date | null],
    pageSize: [30],
    pageIndex: [1],
  });

  public readonly tableData = signal<ASS13080QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS13080Request;
  public printBtnLoading = false;

  public readonly columns: ReportColumn[] = [
    { field: 'ASSET_SALENO', header: '變賣單號', visible: true },
    { field: 'ASSET_ID', header: '資產編號', visible: true },
    { field: 'GOODS_ID', header: '品項編號', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態', visible: true },
    { field: 'HOLD_EMP_NAME', header: '保管人', visible: true },
    { field: 'USE_EMP_NAME', header: '使用人', visible: true },
    { field: 'GET_COST', header: '取得成本', visible: true, type: 'inputNumber' },
    { field: 'DEPRE_ID', header: '攤提代號', visible: true },
  ];

  /** 資產編號：queryASS13010AssetIdDropdown（全部資產編號，借用 ASS13010 主查詢） */
  assetIdOptions: { value: string; label: string }[] = [];
  /** 品項：query11040dropdown（先以 ASS11040 查詢替代） */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 資產狀態：SYS1000(ASSET_STATUS) */
  assetStatusOptions: { value: string; label: string }[] = [];
  /** 保管/使用單位：SYS3100 */
  orgOptions: { value: string; label: string }[] = [];
  /** 保管/使用人：TBLUSER */
  userOptions: { value: string; label: string }[] = [];
  /** 資產類型：對應 DEPRE_YN（1:資產 2:列管品），與 ASS13010 保持一致 */
  assetTypeOptions: { value: string; label: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];
  /** 折舊會計科目：queryGLS1005_DropDownList */
  stypeIdOptions: Option[] = [];

  constructor(
    private readonly ass13080Service: ASS13080Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass11040Service: ASS11040Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13080', 'ass/ass13080cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  private toDateStr(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString();
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        value: item.No ?? '',
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
      }));

    this.dropdownApiService
      .queryASS13010AssetIdDropdown()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.assetIdOptions = res ?? [];
      });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_STATUS' } as any)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.assetStatusOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.userOptions = toOpt(res.Data ?? []);
      });

    this.dropdownApiService
      .queryGls1005_ledgerMD()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.stypeIdOptions = res ?? [];
      });

    this.ass11040Service
      .queryASS11040({ PageSize: 9999, PageIndex: 1 } as any)
      .pipe(
        untilDestroyed(this),
        map(res => (res.Data as QueryASS11040DataWrapper | null | undefined)?.QueryData ?? []),
        map((rows: QueryASS11040Response[]) =>
          rows
            .filter(x => (x.GOODS_ID ?? '') !== '')
            .map(x => ({
              value: String(x.GOODS_ID ?? ''),
              label: `${x.GOODS_ID ?? ''} - ${x.GOODS_NAME ?? ''}`,
            }))
        ),
      )
      .subscribe(options => (this.goodsIdOptions = options));
  }

  public queryFunction = (
    body: QueryASS13080Request
  ): Observable<ApiResponse<ASS13080QueryRow[]>> => {
    const raw = this.queryForm.getRawValue();
    const payload: QueryASS13080Request = {
      ASSET_SALENO: raw.assetSaleNo ?? undefined,
      ASSET_ID: raw.assetId ?? undefined,
      GOODS_ID: raw.goodsId ?? undefined,
      GET_DATE_S: this.toDateStr(raw.getDateFrom) ?? undefined,
      GET_DATE_E: this.toDateStr(raw.getDateTo) ?? undefined,
      ASSET_STATUS: raw.assetStatus ?? undefined,
      DEPRE_ID: raw.depreId ?? undefined,
      HOLD_ORG_ID: raw.holdOrgId ?? undefined,
      HOLD_EMP_ID: raw.holdEmpId ?? undefined,
      USE_ORG_ID: raw.useOrgId ?? undefined,
      USE_EMP_ID: raw.useEmpId ?? undefined,
      STYPE_ID: raw.stypeId ?? undefined,
      DEPRE_YN: raw.assetType ?? undefined,
      GET_COST_S: raw.getCostFrom ?? undefined,
      GET_COST_E: raw.getCostTo ?? undefined,
      SUBCHECK_ID: raw.subcheckId ?? undefined,
      BILL_DATE_S: this.toDateStr(raw.billDateFrom) ?? undefined,
      BILL_DATE_E: this.toDateStr(raw.billDateTo) ?? undefined,
      PageSize: body.PageSize ?? raw.pageSize ?? 30,
      PageIndex: body.PageIndex ?? raw.pageIndex ?? 1,
      SortBy: body.SortBy,
    };
    const clean = removeEmptyValues(payload) as QueryASS13080Request;
    return this.ass13080Service.queryASS13080(clean);
  };

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue();
      this.lastQueryBody = {
        ASSET_SALENO: raw.assetSaleNo ?? undefined,
        ASSET_ID: raw.assetId ?? undefined,
        GOODS_ID: raw.goodsId ?? undefined,
        GET_DATE_S: this.toDateStr(raw.getDateFrom) ?? undefined,
        GET_DATE_E: this.toDateStr(raw.getDateTo) ?? undefined,
        ASSET_STATUS: raw.assetStatus ?? undefined,
        DEPRE_ID: raw.depreId ?? undefined,
        HOLD_ORG_ID: raw.holdOrgId ?? undefined,
        HOLD_EMP_ID: raw.holdEmpId ?? undefined,
        USE_ORG_ID: raw.useOrgId ?? undefined,
        USE_EMP_ID: raw.useEmpId ?? undefined,
        STYPE_ID: raw.stypeId ?? undefined,
        DEPRE_YN: raw.assetType ?? undefined,
        GET_COST_S: raw.getCostFrom ?? undefined,
        GET_COST_E: raw.getCostTo ?? undefined,
        SUBCHECK_ID: raw.subcheckId ?? undefined,
        BILL_DATE_S: this.toDateStr(raw.billDateFrom) ?? undefined,
        BILL_DATE_E: this.toDateStr(raw.billDateTo) ?? undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
      };

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  /** 列印變賣清單 */
  onExportPdf(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先查詢再列印');
      return;
    }
    if (!this.tableData().length) {
      this.messageService.warnBubble('查無資料可列印');
      return;
    }

    const { PageSize: _PageSize, PageIndex: _PageIndex, SortBy: _SortBy, ...rest } =
      this.lastQueryBody as Record<string, unknown>;

    const payload: PrintASS13080Request = rest as PrintASS13080Request;

    this.printBtnLoading = true;
    this.ass13080Service
      .printASS13080(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.printBtnLoading = false;
        })
      )
      .subscribe({
        next: resp => {
          const blob = resp?.body ?? (resp as unknown as Blob);
          if (!blob) return;

          const now = new Date();
          const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');

          const fileName = `變賣清單_${timestamp}.pdf`;
          const blobUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = fileName;
          anchor.click();
          URL.revokeObjectURL(blobUrl);
        },
        error: () => this.messageService.errorBubble('列印失敗'),
      });
  }
}
