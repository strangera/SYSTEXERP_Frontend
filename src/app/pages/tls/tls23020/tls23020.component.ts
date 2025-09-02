import { Component } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS23020Service } from '../../../service/api/tls/tls23020.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { finalize } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tls23020',
  templateUrl: './tls23020.component.html',
  styleUrls: ['./tls23020.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    CheckboxModule,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23020Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
showSummary = false;
  // --- 排序狀態 ---
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: -1 }, // 近到遠
    { field: 'ECR_No',   order:  1 },
    { field: 'TXN_No',   order:  1 },
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // 若後端要自行排序/分頁，設為 false；若要由前端傳 SortBy 給後端，設為 true
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  isRowSelectable = (row: any) => !row?.__isBackendTotal;

  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null, [this.validationService.numberValidator]],
    TXN_No_End:   [null, [this.validationService.numberValidator]],
    TLT_No: [],
    TXN_GUINo: [''],
    PLU_SalePrc_Start: [null],
    PLU_SalePrc_End:   [null],
    TXN_TaxType: [],
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
    // ✅ 帶入預設排序（與 defaultSort 一致）
    ...createPaginationConfig([
      { field: 'TXN_Date', order: -1 },
      { field: 'ECR_No',   order:  1 },
      { field: 'TXN_No',   order:  1 },
    ]),
  });

  // 下拉選單選項
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  txnStatusOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23020Service: TLS23020Service,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private floorService: FloorService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private tls11010Service: Tls11010Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private txnStatusService: TxnStatusService,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23020', 'tls/tls23020cru', this.queryForm, (form) => this.onSubmit(form));

    // 初始化 sortMeta
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.tls11010Service.getBuildingOptions().subscribe(res => this.BUILDING_NO_Options = res);
    this.taxableService.getSystemTypes().subscribe(data => this.taxableOptions = data);
    this.discountService.getLocalDiscountOptions().subscribe(data => this.discountOptions = data);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.deductionbigCategoryOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.txnStatusService.getTxnStatusOptions().subscribe(data => this.txnStatusOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);

    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.commissionTypeService.getCommissionTypes().subscribe(res => {
      this.commissionTypeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  /** 表格 lazy 事件（分頁/排序） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    // 若排序變更 → 回到第 1 頁
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    // 同步回表單（不觸發 valueChanges）
    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    // 更新表頭排序狀態
    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    // 去重簽章（pageIndex/pageSize/SortBy）
    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    // 只呼叫一次查詢
    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

 onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const payload = this.buildPayload(this.queryForm.getRawValue());

    this.loading = true;
    this.messageService?.blockUi();

    if (this.showSummary) {
      // ✅ 彙總查詢
this.tls23020Service.queryTLS23020Summary(payload).pipe(
  finalize(() => { this.loading = false; this.messageService?.unblockUi(); })
).subscribe({
  next: (res) => {
    const arr = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : [];
    this.summaryData = arr.map((r: any, i: number) => ({
      ...r,
      _rowKey: `${r?.tlt_no ?? ''}|${r?.tlt_name ?? ''}|${i}`,
    }));
    this.totalRecords = this.summaryData.length;
    this.data = []; // 清空明細
  },
  error: (err) => {
    console.error('TLS23020 Summary 查詢失敗', err);
    this.summaryData = [];
    this.totalRecords = 0;
    
  },
});

    } else {
      // ✅ 原本明細查詢
      this.tls23020Service.queryTLS23020(payload).pipe(
        finalize(() => { this.loading = false; this.messageService?.unblockUi(); })
      ).subscribe({
        next: (res: any) => {
          const dataArray = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          const details = dataArray.flatMap((wrapper: any) => {
            const subTotals =
              wrapper?.tLS23020_SubTotals ??
              wrapper?.TLS23020_SubTotals ??
              wrapper?.tls23020_SubTotals ?? [];
            if (!Array.isArray(subTotals)) return [];
            return subTotals.flatMap((st: any) =>
              st?.tLS23020_Details ??
              st?.TLS23020_Details ??
              st?.tls23020_Details ?? []
            );
          });

          this.data = details.map((item: any, idx: number) => ({
            ...item,
            _rowKey: `${item.SYS_StoreNo ?? ''}|${String(item.TXN_Date ?? '').slice(0, 19)}|${item.ECR_No ?? ''}|${item.TXN_No ?? idx}`,
          }));

          this.summaryData = []; // 清空彙總
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
        },
        error: (err) => {
 this.loading = false;
        },
      });
    }
  });
}


  /** 組查詢 payload（含排序＆分頁鍵） */
  private buildPayload(val: any) {
    const toIso = (x: any) => this.toIso(x);
    const asStrArr = (x: any) =>
      Array.isArray(x) ? x.map(String) : (x == null || x === '' ? undefined : [String(x)]);
    const asNum = (x: any) => (x == null || x === '' || isNaN(Number(x)) ? undefined : Number(x));

    const pageSize  = Number.isFinite(val?.pageSize)  ? Number(val.pageSize)  : 10;
    const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;
    const offset    = Math.max(0, (pageIndex - 1) * pageSize);

    // 🔑 排序：表單 → sortMeta → defaultSort
    const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
      ? val.SortBy
      : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

    const orderBy = sortByArr.length
      ? sortByArr.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
      : undefined;

    const o: any = {
      TXN_DateStart:     toIso(val?.TXN_DateStart),
      TXN_DateEnd:       toIso(val?.TXN_DateEnd),
      ECR_No:            asStrArr(val?.ECR_No),
      TXN_No_Start:      asNum(val?.TXN_No_Start),
      TXN_No_End:        asNum(val?.TXN_No_End),
      TLT_No:            asStrArr(val?.TLT_No),
      TXN_GUINo:         (val?.TXN_GUINo ?? '').toString().trim() || undefined,
      PLU_SalePrc_Start: asNum(val?.PLU_SalePrc_Start),
      PLU_SalePrc_End:   asNum(val?.PLU_SalePrc_End),
      TXN_TaxType:       val?.TXN_TaxType == null || val?.TXN_TaxType === '' ? undefined : String(val.TXN_TaxType),
      TXN_DiscCode:      asStrArr(val?.TXN_DiscCode),
      tlt_id:            asStrArr(val?.tlt_id),
      PLU_MagNo:         (val?.PLU_MagNo ?? '').toString().trim() || undefined,
      IsNoPLU_No:        !!val?.IsNoPLU_No,
      rece_yn:           val?.rece_yn == null || val?.rece_yn === '' ? undefined : String(val.rece_yn),
      cash_yn:           val?.cash_yn == null || val?.cash_yn === '' ? undefined : String(val.cash_yn),
      tlt_building:      val?.tlt_building == null || val?.tlt_building === '' ? undefined : String(val.tlt_building),
      tlt_floor:         asStrArr(val?.tlt_floor),
      org_id:            asStrArr(val?.org_id),
    };

    if (this.includePagingAndSorting) {
      Object.assign(o, {
        PageSize: pageSize,
        PageIndex: pageIndex,
        Offset: offset,
        SortBy: sortByArr,
        ...(orderBy ? { OrderBy: orderBy } : {}),
      });
    }

    Object.keys(o).forEach(k => {
      const v = o[k];
      if (v === undefined || v === '') delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });

    return o;
  }

  /** 將日期控制項轉成後端要的 yyyy-MM-ddTHH:mm:ss（本地時間、去時區偏移） */
  private toIso(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  // ===== 工具 =====
  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;

    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  };

  money = (val: any) => Number(val || 0).toLocaleString('en-US');

  private makeBackendTotalRow(src: any) {
    return {
      _rowKey: '__TOTAL__',
      tlt_name: '總計',
      PLU_SalePrc: Number(src?.Subtotal_PLU_SalePrc ?? 0),
      TXN_Net:     Number(src?.Subtotal_TXN_Net      ?? 0),
      TXN_Tax:     Number(src?.Subtotal_TXN_Tax      ?? 0),
      TXN_Disc:    Number(src?.Subtotal_TXN_Disc     ?? 0),
      __isBackendTotal: true,
    };
  }
  onToggleSummary() {
  // 切到另一種檢視時，重置頁碼；Offset 在 buildPayload 內會用 pageIndex/pageSize 計算
  this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
  this.onSubmit(this.queryForm);
}

  // columns
  columns: any[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatYMD },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'PLU_SalePrc', header: '單項售價', visible: true, style: 'text-right', format: this.money },
    { field: 'TXN_Net', header: '未稅(免稅)金額', visible: true, style: 'text-right', format: this.money },
    { field: 'TXN_Tax', header: '稅額', visible: true, style: 'text-right', format: this.money },
    { field: 'TXN_Disc', header: '折扣金額', visible: true, style: 'text-right', format: this.money },
    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'TXN_DiscCode', header: '歸屬折扣代號', visible: true },
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },
    { field: 'PLU_TaxType', header: '稅別代號', visible: true },
    { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
    { field: 'PLU_MagNo', header: '單品編號', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];
  // 彙總資料與欄位
summaryData: any[] = [];
summaryColumns = [
  { field: 'tlt_no',        header: '專櫃編號',  visible: true },
  { field: 'tlt_name',      header: '櫃位名稱',  visible: true, style: 'text-left' },
  // 若後端回一筆一日，可顯示日期；多日彙總可不顯示
  // { field: 'TXN_Date',   header: '銷售日期',  visible: true, format: this.formatYMD },

  // 後端提供的彙總欄位（你貼的 schema）
  { field: 'TXN_TotSaleAmt', header: '銷售金額(含稅)', visible: true, style: 'text-right', format: this.money },
  { field: 'TXN_TotNet',     header: '未稅(免稅)金額',  visible: true, style: 'text-right', format: this.money },
  { field: 'TXN_TotTax',     header: '稅額',           visible: true, style: 'text-right', format: this.money },

  // 若也要顯示「預售/訂金」彙總，可打開：
  // { field: 'Pre_TotSaleAmt', header: '預售/訂金_銷售金額', visible: true, style: 'text-right', format: this.money },
  // { field: 'Pre_TotNet',     header: '預售/訂金_未稅金額', visible: true, style: 'text-right', format: this.money },
  // { field: 'Pre_TotTax',     header: '預售/訂金_稅額',     visible: true, style: 'text-right', format: this.money },
];
}
