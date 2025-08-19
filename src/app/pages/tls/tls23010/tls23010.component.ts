import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import {
  TLS23010Data,
  TLS23010Service,
} from '../../../service/api/tls/tls23010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CashierService } from '../../../service/basic/cashier.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { of, from, forkJoin } from 'rxjs';
import { map, tap, catchError, mergeMap, toArray } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

//型態別報表
@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrls: ['./tls23010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23010Component
  extends BasicQueryPageComponent<TLS23010Data>
  implements OnInit
{
  data: TLS23010Data[] = [];
  totalRecords = 0;
  selectedItems: TLS23010Data[] = [];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [[]], // ✅ 收銀機號
    TXN_No_Start: [null], // 交易序號(起)
    TXN_No_End: [null], // 交易序號(迄)
    TLT_No: [[]], // ✅ 專櫃編號 → 陣列
    TXN_GUIBegNo: [''], // 發票起始號碼
    TXN_GUIEndNo: [''], // 發票結束號碼
    TXN_Status: [[]], // ✅ 狀態 → 陣列
    TXN_FlagStatus: [[]], // ✅ 狀態旗標 → 陣列
    USR_No: [''], // 收銀員編號
    TXN_PreOrderNo: [''], // 預售/訂金編號
    TXN_PkngUID: [''], // 停車卡號
    TXN_MemCard: [''], // 會員卡號
    TXN_Uniform: [''], // 統一編號
    TXN_GUILoveCode: [''], // 愛心碼
    TXN_GUI_CarrType: [[]], // ✅ 載具種類 → 陣列
    TXN_GUI_CarrId: [''], // 載具號碼
    rece_yn: [''], // 是否開立業主發票 (s/空)
    cash_yn: [''], // 是否為業主收現 (s/空)
    tlt_building: [''], // 館別
    tlt_floor: [[]], // ✅ 樓層 → 陣列
    org_id: [[]], // ✅ 組織代碼 → 陣列
    TXN_Subtype: [''], // 交易附屬型態
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]), // 包含 PageSize, PageIndex, Offset, OrderBy, SortBy
  });

  // 下拉選單選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  cashierOptions: any[] = []; // 收銀員下拉選單
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private cdr: ChangeDetectorRef,
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private txnStatusService: TxnStatusService,
    private counterNameService: CounterNameService,
    private ECRNoService: ECRNoService,
    private cashierService: CashierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', 'tls/tls23010', this.queryForm, (form) => this.onSubmit(form));
    this.totalRecords = 0;
    
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));

    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.whetherOptions = data));

    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );

    this.carrierTypeService
      .getCarrierType()
      .subscribe((data) => (this.carrierTypeOptions = data));

    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.cashierService.getCashierOptions().subscribe((res) => {
      this.cashierOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.doQuery(); // ✅ 改成呼叫同一支
    });
  }
  // 將 lazy 的分頁/排序寫回表單後，呼叫同一支查詢
  runQueryFromTable(event: any) {
    // event: { pageIndex, pageSize, SortBy }
    this.queryForm.patchValue(
      {
        pageIndex: event?.pageIndex ?? this.queryForm.value.pageIndex,
        pageSize: event?.pageSize ?? this.queryForm.value.pageSize,
        SortBy: event?.SortBy ?? this.queryForm.value.SortBy,
      },
      { emitEvent: false },
    );
    this.doQuery(); // 單一入口
  }

  private getStoreNo(): string {
    try {
      const raw = localStorage.getItem('UserInfo');
      const storeNo = raw ? JSON.parse(raw)?.SYS_StoreNo : null;
      return storeNo ? String(storeNo) : '10';
    } catch {
      return '10';
    }
  }

  /** 盡量用 ISO 前10碼，避免時區跨日 */
  private toYMDFromIso(val: string | Date): string {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      return val.slice(0, 10);
    }
    const d = new Date(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  formatISOToHHMMSS = (val: string): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
};

  private buildDetailBody(row: TLS23010Data) {
    return {
      SYS_StoreNo: this.getStoreNo(),
      TXN_Date: this.toYMDFromIso(row.TXN_Date),
      ECR_No: row.ECR_No,
      TXN_No: Number(row.TXN_No),
    };
  }
private extractQueryAndTotal(res: any) {
  const data = res?.Data;

  // 兼容：
  // 1) Data: { QueryData: [...] , TotalCount? }
  // 2) Data: [...]
  // 3) 根節點就有 QueryData / TotalCount
  const queryData =
    (Array.isArray(data) ? data
      : (data?.QueryData ?? data?.queryData)) ??
    res?.QueryData ??
    [];

  const totalCount =
    (typeof res?.TotalCount === 'number' && res.TotalCount) ||
    (typeof data?.TotalCount === 'number' && data.TotalCount) ||
    (Array.isArray(queryData) ? queryData.length : 0);

  return {
    list: Array.isArray(queryData) ? queryData : [],
    total: totalCount,
  };
}

  private doQuery(): void {
  const payload = this.buildPayload(this.queryForm.value);
  this.loading = true;
  this.messageService?.blockUi();

  this.tls23010Service.queryTLS23010(payload).subscribe({
    next: (res) => {
      const { list, total } = this.extractQueryAndTotal(res);

      // 建立 table 唯一鍵
      this.data = list.map((item: any, idx: number) => ({
        ...item,
        _rowKey: `${item.SYS_StoreNo ?? ''}|${String(item.TXN_Date ?? '').slice(0, 19)}|${item.ECR_No ?? ''}|${item.TXN_No ?? idx}`,
      }));
      this.totalRecords = total;

      // （可留用你原本的「只抓目前頁的明細」邏輯）
      const pageSize = this.queryForm.value.pageSize ?? 10;
      const pageIndex = this.queryForm.value.pageIndex ?? 1;
      const start = (pageIndex - 1) * pageSize;
      const end = Math.min(start + pageSize, this.data.length);
      const currentPageRows = this.data.slice(start, end);

      const detailRequests = currentPageRows.map((row) =>
        this.tls23010Service
          .queryTLS23010Detail(this.buildDetailBody(row))
          .pipe(
            tap((detailRes) => {
              (row as any).DetailList = Array.isArray(detailRes)
                ? detailRes
                : detailRes?.Data ?? [];
            }),
          ),
      );

      if (detailRequests.length) {
        forkJoin(detailRequests).subscribe({
          next: () => {
            this.data = [...this.data];
            this.cdr?.markForCheck?.();
          },
          error: () => {},
          complete: () => {
            this.loading = false;
            this.messageService?.unblockUi();
          },
        });
      } else {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    },
    error: (err) => {
      console.error('TLS23010 查詢失敗', err);
      this.loading = false;
      this.messageService?.unblockUi();
    },
  });
}
  /** 將日期控制項轉成後端要的 yyyy-MM-ddTHH:mm:ss（本地時間、去時區偏移） */
  private toIso(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    // 轉成本地時間字串再截到秒
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  /** 組查詢 payload，並清掉空值/空陣列，避免干擾後端繫結 */
  private buildPayload(val: any) {
    const o: any = {
      ...val,
      TXN_DateStart: this.toIso(val?.TXN_DateStart),
      TXN_DateEnd: this.toIso(val?.TXN_DateEnd),
      TXN_No_Start:
        val?.TXN_No_Start != null && val?.TXN_No_Start !== ''
          ? Number(val.TXN_No_Start)
          : undefined,
      TXN_No_End:
        val?.TXN_No_End != null && val?.TXN_No_End !== ''
          ? Number(val.TXN_No_End)
          : undefined,
    };

    // 清掉空字串 / null / undefined / 空陣列
    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (v === '' || v === null || v === undefined) delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });

    return o;
  }

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
  formatTimeToHHMM(timeStr: string): string {
    const date = new Date(`1970-01-01T${timeStr}`);
    if (isNaN(date.getTime())) return '';
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
  // 放在你的 component 內
  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${day}`;
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
  // 直接抓 YYYY-MM-DD，避免時區位移
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
// component.ts
nyToYesNo = (val: unknown): string => {
  // 去除前後空白：一般空白 \s + 不換行空白 \u00A0 + 全形空白 \u3000
  const v = String(val ?? '').replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '').toUpperCase();

  if (v === 'Y' || v === 'TRUE' || v === '1') return '是';
  if (v === 'N' || v === 'FALSE' || v === '0') return '否';
  return '';
};

// component.ts
pToYesNo = (val: unknown): string => {
  const v = String(val ?? '')
    .replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '') // trim 含全形空白
    .toUpperCase();
  return v === 'P' ? '是' : '否';
};
nullpToYesNo = (val: unknown): string => {
  if (val === null || val === undefined) return '否';
  const trimmed = String(val).replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '');
  return trimmed.length === 0 ? '否' : '是';
};

 columns = [
  { field: 'TXN_Date',       header: '銷售日期',      visible: true, format: this.formatYMD },
  { field: 'ECR_No',         header: '收銀機號',      visible: true },
  { field: 'TXN_No',         header: '交易序號',      visible: true, style: 'text-right' },
  { field: 'tlt_no',         header: '專櫃編號',      visible: true },
  { field: 'tlt_name',       header: '櫃位名稱',      visible: true, style: 'text-left' },
  { field: 'TXN_Uniform',    header: '統一編號',      visible: true },
  { field: 'gui_track',      header: '字軌',         visible: true },
  { field: 'GUIBegNo',       header: '發票起始號碼',   visible: true },
  { field: 'GUIEndNo',       header: '發票結束號碼',   visible: true },
  { field: 'TXN_TotGUI',     header: '發票金額',      visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_TotSaleAmt', header: '銷售金額',      visible: true, style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_TotOver',    header: '溢收金額',      visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'TXN_VIP',        header: '外交官零稅',     visible: true, format: this.nyToYesNo },
  { field: 'TXN_Mode',       header: '事後登錄',      visible: true, format: this.pToYesNo },
  { field: 'TXN_PreOrder',   header: '預售',         visible: true, format: this.nullpToYesNo },

  { field: 'TXN_StatusName', header: '交易型態',      visible: true },
  { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },

  { field: 'TXN_Time',       header: '交易時間',      visible: true, format: this.formatISOToHHMMSS },
  { field: 'USR_No',         header: '收銀員',       visible: true, style: 'text-left' },
  { field: 'TXN_PreOrderNo', header: '預售/訂金單號',  visible: true },

  { field: 'ORG_TXN_Date',   header: '原交易日期',     visible: true, format: this.formatYMD },
  { field: 'ORG_ECR_No',     header: '原收銀機號',     visible: true },
  { field: 'ORG_TXN_No',     header: '原交易序號',     visible: true, style: 'text-right' },

  { field: 'TXN_PkngUID',    header: '停車車牌',      visible: true },
  { field: 'TXN_MemID',      header: '會員卡號',      visible: true },

  { field: 'TXN_TotDisc',    header: '折扣/讓金額',    visible: true, style: 'text-right', format: this.moneyFormat },

  { field: 'GUILoveStatus',  header: '捐贈狀態',      visible: true,format: this.nyToYesNo },
  { field: 'TXN_GUILoveCode',header: '捐贈社福團體代碼', visible: true },
  { field: 'TXN_GUIRemark',  header: '防偽隨機碼',     visible: true },

  { field: 'TXN_GUI_CarrType', header: '載具種類',     visible: true, format: (v: any) => this.getLabelFromOptions(v, this.carrierTypeOptions) },
  { field: 'DonateType',     header: '捐贈類別',      visible: true },
  { field: 'TXN_GUI_CarrId', header: '共通性載具號碼',  visible: true },

  { field: 'TXN_PrintTimes', header: '發票列印次數',    visible: true, style: 'text-right' },
  { field: 'TXN_PrintGUI',   header: '電子發票是否列印', visible: true, format: this.getYesNoLabel },

  { field: 'CRD_Type',       header: '信用卡別',      visible: true },
  { field: 'CRD_Name',       header: '卡別',         visible: true },
  { field: 'CRD_No',         header: '號碼',         visible: true },
  { field: 'TERM_No',        header: '分期期數',      visible: true, style: 'text-right' },
  { field: 'TXN_PayAmt',     header: '金額',         visible: true, style: 'text-right', format: this.moneyFormat },
];


  private toYMD(val: string | Date): string {
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }


  loadDetail$ = (row: TLS23010Data) => {
    const body = this.buildDetailBody(row);
    return this.tls23010Service.queryTLS23010Detail(body).pipe(
      map((res) => (Array.isArray(res) ? res : res?.Data ?? [])),
      tap((details) => {
        const key = (row as any)._rowKey;
        const idx = this.data.findIndex((r) => (r as any)._rowKey === key);
        if (idx > -1) {
          // 用新物件取代該列，並確保 DetailList 也是新陣列參考
          const replaced = { ...this.data[idx], DetailList: [...details] };
          this.data = [
            ...this.data.slice(0, idx),
            replaced,
            ...this.data.slice(idx + 1),
          ];
          this.cdr.markForCheck(); // 或 this.cdr.detectChanges();
        }
        (row as any).__detailLoaded = true;
        (row as any).__detailError = false;
      }),
      catchError((err) => {
        console.error('明細載入失敗', err);
        (row as any).__detailError = true;
        // 也做一次 immutable 更新，避免 UI 卡在舊狀態
        const key = (row as any)._rowKey;
        const idx = this.data.findIndex((r) => (r as any)._rowKey === key);
        if (idx > -1) {
          const replaced = { ...this.data[idx], DetailList: [] };
          this.data = [
            ...this.data.slice(0, idx),
            replaced,
            ...this.data.slice(idx + 1),
          ];
          this.cdr.markForCheck();
        }
        return of([]); // 不中斷 UI
      }),
    );
  };

  detailcolumns = [
    { field: 'TXN_Date',header: '銷售日期',
      format: this.formatDateTimeYMDHM.bind(this),
    },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號', style: 'text-right' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },

    // { field: 'PAY_NO', header: '付款別代號' },
    { field: 'PAY_NAME', header: '付款別' },
    // { field: 'CRD_Type', header: '卡別代碼' },
    { field: 'CRD_Name', header: '卡別' },
    { field: 'CRD_No',header: '號碼',
      
    },
    { field: 'TERM_No', header: '分期期數', style: 'text-right' },
    { field: 'TXN_PayAmt',header: '金額',
      style: 'text-right',
      format: (v: number) =>
        v === null || v === undefined ? '0' : v.toLocaleString('en-US'),
    },
  ];
}
