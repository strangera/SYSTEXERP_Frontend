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
import { of, from, forkJoin, Observable } from 'rxjs';
import { map, tap, catchError, mergeMap, toArray, finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
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
  extends BasicQueryPageComponent<any>
  implements OnInit
{
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

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
    
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));

    this.statusFlagService.getStatusFlags().subscribe((data) => (this.statusFlagOptions = data));

    this.whetherService.getWhetherOptions().subscribe((data) => (this.whetherOptions = data));

    this.TXN_SubtypeService.getTXNSubtype().subscribe(      (data) => (this.TXN_SubtypeOptions = data),    );

    this.carrierTypeService.getCarrierType().subscribe((data) => (this.carrierTypeOptions = data));

    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));

    this.tls11010Service.getOrgOptions().subscribe((res) => {      this.OrganizationCodeOptions =        res?.map((x: any) => ({         
      label: x.label,         formLabel: `${x.value} - ${x.label}`,          value: x.value,        })) || [];    });

    this.txnStatusService.getTxnStatusOptions().subscribe((data) => (this.txnStatusOptions = data));

    this.counterNameService.getCounters().subscribe((res) => {      this.CounterOptions =        res?.map((x: any) => ({
          label: x.label, 
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.ECRNoService.getECRNo().subscribe((res) => {      this.ECRNoOptions =        res?.map((x: any) => ({
          label: x.label,formLabel: `${x.value} - ${x.label}`,          value: x.value,        })) || [];    });

    this.cashierService.getCashierOptions().subscribe((res) => {      this.cashierOptions =        res?.map((x: any) => ({
          label: x.label,     formLabel: `${x.value} - ${x.label}`,value: x.value,        })) || [];    });
  }

onSubmit(frm: FormGroup) {
  this.handleSubmit(frm, () => {
    this.tls23010Service
      .queryTLS23010(frm.value)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (resp) => {
          // 後端新版：Data = { QueryData: [...], TotalSummary: {...} }
          // 兼容舊版：Data = [...]
          const queryData = Array.isArray(resp?.Data?.QueryData)
            ? resp.Data.QueryData
            : Array.isArray(resp?.Data)
              ? resp.Data
              : [];

          // 為每筆資料建立唯一鍵（給 dataKey 用）
          this.data = queryData.map((row: any) => ({
            ...row,
            id: `${row.SYS_StoreNo}_${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
          }));
          // ✅ 做完 this.data 映射之後，人工塞明細（先塞第一列就好）

console.log('[MASTER] rows after mapping (id, keys):',
  this.data.map(r => ({ id: r.id, keys: Object.keys(r) }))
);
console.log('[MASTER] first row sample:', this.data[0]);

// 確認 expansionDataKey 設定正確
console.log('[TABLE] expansionDataKey should be "details"');
          // 總筆數：以後端回傳為主，否則退回前端資料長度
          this.totalRecords = Number(resp?.TotalCount ?? this.data.length ?? 0);

          // 若要用總計，可在 class 宣告 summary:any，再解除註解
          // this.summary = resp?.Data?.TotalSummary ?? null;

          // 清空已選取，避免殘留
          this.selectedItems = [];

          // 保存查詢條件
          this.queryStateService.setQueryState(this.ProgNo, frm.value);

          // 觸發變更偵測（避免 OnPush 時不更新）
          this.cdr.markForCheck?.();
        },
        error: (_err) => {
          this.data = [];
          this.totalRecords = 0;
          this.selectedItems = [];
          this.cdr.markForCheck?.();
        },
      });
  });
}



    isRowSelectable(row: TLS23010Data): boolean {
      return true;
    }
// 放在 component 裡（直接覆蓋你現在的 loadDetails）
// ✅ 關鍵：回傳 { details: [...] }，鍵名要跟 expansionDataKey 一樣
loadDetails = (row: TLS23010Data) => {
  const body = {
    SYS_StoreNo: row.SYS_StoreNo,
    TXN_Date: row.TXN_Date, // 或 new Date(row.TXN_Date).toISOString()
    ECR_No: row.ECR_No,
    TXN_No: row.TXN_No,
  };

  return this.tls23010Service.queryTLS23010Detail(body).pipe(
    map((resp: any) => {
      const list =
        Array.isArray(resp) ? resp :
        Array.isArray(resp?.Data) ? resp.Data :
        Array.isArray(resp?.Data?.QueryData) ? resp.Data.QueryData :
        [];

      console.log('[DETAIL] final array length =', list.length, list);
      // 關鍵：回傳 { Data: [...] } 給 TableUtilityService
      return { Data: list };
    })
  );
};









  private getStoreNo(): string {
    try {
      const raw = localStorage.getItem('UserInfo');
      const storeNo = raw ? JSON.parse(raw)?.SYS_StoreNo : null;
      return storeNo ? String(storeNo) : '10';
    } catch {
      return '10';
    }
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






nyToYesNo = (val: unknown): string => {
  // 去除前後空白：一般空白 \s + 不換行空白 \u00A0 + 全形空白 \u3000
  const v = String(val ?? '').replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '').toUpperCase();

  if (v === 'Y' || v === 'TRUE' || v === '1') return '是';
  if (v === 'N' || v === 'FALSE' || v === '0') return '否';
  return '';
};


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
       format: this.moneyFormat
    },
  ];
}
