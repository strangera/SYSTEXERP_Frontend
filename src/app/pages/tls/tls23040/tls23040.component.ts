import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import {
  createPaginationConfig,
  LazyLoadEvent,
} from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  sortMeta: any[] = [];

  // 组件內新增一個 timer 欄位
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: -1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];
  totalRecords = 0;
  data: any[] = [];

  backendTotals: Record<string, number> | null = null;
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [null], // ✅ 初始為 null（不會出現預設選項）
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [[]],
    TXN_Status: [[]],
    TXN_FlagStatus: [[]],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [[]],
    org_id: [[]],
    ...createPaginationConfig,
  });

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));
    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));

    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );

    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));

    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }
  override onLazyLoadData(event: LazyLoadEvent, queryForm: FormGroup) {
    // 1) 依是否更換排序，決定是否回到第 1 頁
    const currentSort = JSON.stringify(queryForm.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIdx = currentSort !== nextSort ? 1 : event.pageIndex;

    // 2) 只 patch 分頁/排序，不要動日期等條件
    queryForm.patchValue(
      {
        pageSize: event.pageSize,
        pageIndex: nextPageIdx,
        SortBy: event.SortBy,
      },
      { emitEvent: false },
    );

    // 3) 父層排序狀態同步（供 table 綁定）
    this.sortMeta = (event.SortBy ?? []).map((s) => ({ ...s }));

    // 4) 去重 + 0ms debounce
    const sig = JSON.stringify({
      pageIndex: nextPageIdx,
      pageSize: event.pageSize,
      SortBy: event.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(queryForm), 0);
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      // 還原 toIso
      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 19);
      };

      // ★ 強保底日期：若表單值為空，用 yesterday（或你想要的預設）
      const dateStart = val?.TXN_DateStart ?? this.yesterday;
      const dateEnd = val?.TXN_DateEnd ?? this.yesterday;

      const payload: any = {
        ...val,
        TXN_DateStart: toIso(dateStart),
        TXN_DateEnd: toIso(dateEnd),
        pageSize: val?.pageSize,
        pageIndex: val?.pageIndex,
        SortBy: val?.SortBy,
      };

      // SortBy 優先走當前 sortMeta，沒有才 fallback
      if (!Array.isArray(payload.SortBy) || payload.SortBy.length === 0) {
        payload.SortBy = this.sortMeta.length
          ? this.sortMeta
          : this.defaultSort;
      }

      // 數值欄位轉型
      if ((val?.TXN_No_Start ?? '') !== '')
        payload.TXN_No_Start = Number(val.TXN_No_Start);
      if ((val?.TXN_No_End ?? '') !== '')
        payload.TXN_No_End = Number(val.TXN_No_End);

      // 清空空值（會保留剛剛保底過後的日期）
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23040Service.queryTLS23040(payload).subscribe({
        next: (res) => {
          const items = Array.isArray(res?.Data) ? res.Data : [];

          const invoiceRows = items.flatMap(
            (x: any) => x?.invoice?.InvoiceDetail ?? [],
          );

          // ⬇️ 後端總計（優先取回傳的 TotalGUI / TotalSaleAmt，否則用明細加總）
          let totalGUI = items.reduce(
            (sum: number, x: any) => sum + Number(x?.invoice?.TotalGUI ?? 0),
            0,
          );
          let totalSaleAmt = items.reduce(
            (sum: number, x: any) =>
              sum + Number(x?.invoice?.TotalSaleAmt ?? 0),
            0,
          );

          if (invoiceRows.length && (totalGUI === 0 || totalSaleAmt === 0)) {
            totalGUI = invoiceRows.reduce(
              (s: number, r: any) => s + Number(r?.TXN_TotGUI ?? 0),
              0,
            );
            totalSaleAmt = invoiceRows.reduce(
              (s: number, r: any) => s + Number(r?.TXN_TotSaleAmt ?? 0),
              0,
            );
          }

          // ✅ 提供給 Table footer 用的外部總計（欄位名要對 columns 的 field）
          this.backendTotals = {
            TXN_TotGUI: Number(totalGUI ?? 0),
            TXN_TotSaleAmt: Number(totalSaleAmt ?? 0),
          };

          // ✅ 只放一般列到 data（避免把總計列混進分頁）
          this.data = invoiceRows.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          }));

          this.totalRecords = Number(res?.TotalCount ?? this.data.length);

          // ★ 依資料內容決定是否顯示三個「原交易*」欄位
          //   只要有任何一列不是「正常交易」就顯示；若全部都是「正常交易」就隱藏
          const hasNonNormal = this.data.some(
            (r: any) => String(r?.TXN_StatusName ?? '') !== '正常交易',
          );
          this.setOrgColumnsVisibility(hasNonNormal);
        },
        error: (err) => {
          console.error('TLS23040 查詢失敗', err);
          this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
  private setOrgColumnsVisibility(show: boolean): void {
    const keys = new Set(['ORG_TXN_Date', 'ORG_ECR_No', 'ORG_TXN_No']);
    this.columns = this.columns.map((col) =>
      keys.has(col.field) ? { ...col, visible: show } : col,
    );
  }

  columns = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      visible: true,
      style: 'text-left',
    },
    { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      isTotal: true,
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '業績金額',
      isTotal: true,
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
    {
      field: 'TXN_StatusName',
      header: '交易型態',
      visible: true,
      format: (val: any) =>
        this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      visible: true,
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime())
          ? val
          : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      },
    },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotPayScoreAmt',
      header: '會員積點折抵',
      visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0',
    },
  ];
}
