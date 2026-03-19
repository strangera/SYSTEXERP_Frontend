import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { QueryASS11040DataWrapper, QueryASS11040Response } from '@pages/ass/ass11040/ass11040.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import {
  ASS13080QueryRow,
  QueryASS13080Request,
} from './ass13080.model';

/** 3.1.3.8 資產變賣作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass13080',
  templateUrl: './ass13080.component.html',
  styleUrl: './ass13080.component.scss',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS13080Component extends BasicQueryPageComponent<ASS13080QueryRow> implements OnInit {
  public readonly queryForm = this.formBuilder.nonNullable.group({
    soldNo: [null as string | null],
    assetNo: [null as string | null],
    goodsId: [null as string | null],
    buyDateFrom: [null as Date | null],
    buyDateTo: [null as Date | null],
    assetStatus: [null as string | null],
    acpNo: [null as string | null],
    keepOrgId: [null as string | null],
    keepUserNo: [null as string | null],
    useOrgId: [null as string | null],
    useUserNo: [null as string | null],
    accNo: [null as string | null],
    buyAmtFrom: [null as number | null],
    buyAmtTo: [null as number | null],
    rcvNo: [null as string | null],
    txnDateFrom: [null as Date | null],
    txnDateTo: [null as Date | null],
    pageSize: [30],
    pageIndex: [1],
  });

  public readonly tableData = signal<ASS13080QueryRow[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS13080Request;

  public readonly columns: ReportColumn[] = [
    { field: 'ASSET_NO', header: '資產代號', visible: true },
    { field: 'GOODS_ID', header: '品項編號', visible: true },
    { field: 'TXN_DATE', header: '入帳日期', visible: true, format: formatDate },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態', visible: true },
    { field: 'KEEP_USER_NAME', header: '保管人', visible: true },
    { field: 'USE_USER_NAME', header: '使用人', visible: true },
    { field: 'BUY_AMT', header: '購入金額', visible: true, type: 'inputNumber' },
    { field: 'REVAL_AMT', header: '重估金額', visible: true, type: 'inputNumber' },
    { field: 'ACP_NO', header: '攤提代號', visible: true },
    { field: 'SOLD_ASSET_DATE', header: '變賣資產日期', visible: true, format: formatDate },
    { field: 'SOLD_NTAX_AMT', header: '變賣金額(未稅)', visible: true, type: 'inputNumber' },
    { field: 'SOLD_DATE_DEPR_AMT', header: '變賣日期已提折舊', visible: true, type: 'inputNumber' },
    { field: 'SOLD_BEFORE_BOOK_AMT', header: '變賣日前之帳面價值', visible: true, type: 'inputNumber' },
    { field: 'SOLD_PL_NTAX_AMT', header: '變賣盈虧(未稅)', visible: true, type: 'inputNumber' },
  ];

  /** 品項：query11040dropdown（先以 ASS11040 查詢替代） */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 資產狀態：SYS1000(ASSET_STATUS) */
  assetStatusOptions: { value: string; label: string }[] = [];
  /** 保管/使用單位：SYS3100 */
  orgOptions: { value: string; label: string }[] = [];
  /** 保管/使用人：TBLUSER */
  userOptions: { value: string; label: string }[] = [];
  /** 會計科目：GLS1005 */
  accOptions: { value: string; label: string }[] = [];
  /** 驗收單號：來源未確認，先留白 */
  rcvNoOptions: { value: string; label: string }[] = [];

  constructor(
    private readonly ass13080Service: ASS13080Service,
    private readonly dropDownListService: DropDownListService,
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
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined;
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        value: item.No ?? '',
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
      }));

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

    this.dropDownListService
      .queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.accOptions = toOpt(res.Data ?? []);
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
      SOLD_NO: raw.soldNo ?? undefined,
      ASSET_NO: raw.assetNo ?? undefined,
      GOODS_ID: raw.goodsId ?? undefined,
      BUY_DATE_S: this.toDateStr(raw.buyDateFrom) ?? undefined,
      BUY_DATE_E: this.toDateStr(raw.buyDateTo) ?? undefined,
      ASSET_STATUS: raw.assetStatus ?? undefined,
      ACP_NO: raw.acpNo ?? undefined,
      KEEP_ORG_ID: raw.keepOrgId ?? undefined,
      KEEP_USER_NO: raw.keepUserNo ?? undefined,
      USE_ORG_ID: raw.useOrgId ?? undefined,
      USE_USER_NO: raw.useUserNo ?? undefined,
      ACC_NO: raw.accNo ?? undefined,
      BUY_AMT_S: raw.buyAmtFrom ?? undefined,
      BUY_AMT_E: raw.buyAmtTo ?? undefined,
      RCV_NO: raw.rcvNo ?? undefined,
      TXN_DATE_S: this.toDateStr(raw.txnDateFrom) ?? undefined,
      TXN_DATE_E: this.toDateStr(raw.txnDateTo) ?? undefined,
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
        SOLD_NO: raw.soldNo ?? undefined,
        ASSET_NO: raw.assetNo ?? undefined,
        GOODS_ID: raw.goodsId ?? undefined,
        BUY_DATE_S: this.toDateStr(raw.buyDateFrom) ?? undefined,
        BUY_DATE_E: this.toDateStr(raw.buyDateTo) ?? undefined,
        ASSET_STATUS: raw.assetStatus ?? undefined,
        ACP_NO: raw.acpNo ?? undefined,
        KEEP_ORG_ID: raw.keepOrgId ?? undefined,
        KEEP_USER_NO: raw.keepUserNo ?? undefined,
        USE_ORG_ID: raw.useOrgId ?? undefined,
        USE_USER_NO: raw.useUserNo ?? undefined,
        ACC_NO: raw.accNo ?? undefined,
        BUY_AMT_S: raw.buyAmtFrom ?? undefined,
        BUY_AMT_E: raw.buyAmtTo ?? undefined,
        RCV_NO: raw.rcvNo ?? undefined,
        TXN_DATE_S: this.toDateStr(raw.txnDateFrom) ?? undefined,
        TXN_DATE_E: this.toDateStr(raw.txnDateTo) ?? undefined,
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
}
