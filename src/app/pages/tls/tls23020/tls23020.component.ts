import { Component } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS23020Service } from '../../../service/api/tls/tls23020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
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

@Component({
  selector: 'app-tls23020',
  templateUrl: './tls23020.component.html',
  styleUrls: ['./tls23020.component.scss'],
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

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  isRowSelectable = (row: any) => !row?.__isBackendTotal;

  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]], // 交易日期起
    TXN_DateEnd:   [this.yesterday, [Validators.required]], // 交易日期訖
    ECR_No: [[]],                       // 收銀機機號
    TXN_No_Start: [ ],
    TXN_No_End:   [ ],
    TLT_No: [[]],
    TXN_GUINo: [''],                  // 發票號碼
    PLU_SalePrc_Start: [],
    PLU_SalePrc_End:   [],
    TXN_TaxType: [],
    TXN_DiscCode: [[]],
    tlt_id: [[]],
    PLU_MagNo: [],
    
    IsNoPLU_No: [false],
    rece_yn: [],
    cash_yn: [],
    tlt_building: [],
    tlt_floor: [[]],
    org_id: [[]],
  
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
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
money = (val: any) => Number(val || 0).toLocaleString('en-US');
// 👇 放在 component 內
private makeBackendTotalRow(src: any) {
  return {
    _rowKey: '__TOTAL__',          // 方便辨識 & 做樣式
    tlt_name: '總計',              // 你要顯示標題的欄位：可改成別欄
    PLU_SalePrc: Number(src?.Subtotal_PLU_SalePrc ?? 0),
    TXN_Net:     Number(src?.Subtotal_TXN_Net      ?? 0),
    TXN_Tax:     Number(src?.Subtotal_TXN_Tax      ?? 0),
    TXN_Disc:    Number(src?.Subtotal_TXN_Disc     ?? 0),
    __isBackendTotal: true,        // 特殊旗標，方便禁用勾選/動作
  };
}

// ✅ 新增：把 Data 轉成細項列 + 每組小計
private flattenTLS23020(list: any[]): { rows: any[]; detailCount: number } {
  const rows: any[] = [];
  let detailCount = 0;

  list.forEach((g: any, gi: number) => {
    const details = Array.isArray(g?.tLS23020_Details) ? g.tLS23020_Details : null;

    if (details && details.length) {
      details.forEach((d: any, di: number) => {
        rows.push({
          _rowKey: `${d?.ECR_No ?? ''}-${d?.TXN_No ?? `${gi}-${di}`}`,
          ...d,
        });
      });
      detailCount += details.length;

      // 每組加一筆「小計」列（使用你原本的 makeBackendTotalRow，吃 group 的 Subtotal_*）
      rows.push(this.makeBackendTotalRow(g));
    } else {
      // 後端若已是扁平明細（沒有 tLS23020_Details）
      rows.push({
        _rowKey: `${g?.ECR_No ?? ''}-${g?.TXN_No ?? gi}`,
        ...g,
      });
      detailCount += 1;
    }
  });

  return { rows, detailCount };
}

onSubmit(form: FormGroup): void {
  this.submitted = true;

  // 1) 補預設日期：未選就用昨天；只選一邊就補另一邊
  const y = this.yesterday; // 你原本就有
  const s0 = form.controls.TXN_DateStart.value;
  const e0 = form.controls.TXN_DateEnd.value;

  if (!s0 && !e0) {
    form.patchValue({ TXN_DateStart: y, TXN_DateEnd: y }, { emitEvent: false });
  } else if (s0 && !e0) {
    form.patchValue({ TXN_DateEnd: s0 }, { emitEvent: false });
  } else if (!s0 && e0) {
    form.patchValue({ TXN_DateStart: e0 }, { emitEvent: false });
  }

  if (form.invalid) {
    form.markAllAsTouched();
    return;
  }

  const raw = form.getRawValue();

  // 2) 日期轉本地字串（避免 Z 時區）
  const toLocalYMDT = (v: any): string | null => {
    if (!v && v !== 0) return null;
    if (v instanceof Date && !isNaN(v.getTime())) {
      const yy = v.getFullYear();
      const mm = String(v.getMonth() + 1).padStart(2, '0');
      const dd = String(v.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}T00:00:00`;
    }
    const s = String(v);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}T00:00:00`;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}T00:00:00`;
    }
    return null;
  };

  // 3) 你原本的 helpers（可留可改）
  const strOrNull = (v: any) =>
    v === undefined || v === null || v === '' ? null : String(v);
  const intOrNull = (v: any) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };
  const numOrNull = (v: any) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const boolOrNull = (v: any) =>
    v === undefined || v === null || v === '' ? null : Boolean(v);
  const toStringArray = (v: any): string[] => {
    if (v === undefined || v === null || v === '') return [];
    return (Array.isArray(v) ? v : [v]).map((x) => String(x));
  };
  const sortBy = Array.isArray(raw.SortBy)
    ? raw.SortBy.map((s: any) => ({
        field: strOrNull(s?.field),
        order: intOrNull(s?.order) ?? 0,
      }))
    : [];

  // 4) payload（日期用本地字串）
  const payload: any = {
    PageSize:   intOrNull(raw.PageSize) ?? 0,
    PageIndex:  intOrNull(raw.PageIndex) ?? 0,
    OrderBy:    strOrNull(raw.OrderBy) ?? '',
    Offset:     intOrNull(raw.Offset) ?? 0,
    SortBy:     sortBy,

    TXN_DateStart: toLocalYMDT(raw.TXN_DateStart),
    TXN_DateEnd:   toLocalYMDT(raw.TXN_DateEnd),

    ECR_No:             toStringArray(raw.ECR_No),
    TLT_No:             toStringArray(raw.TLT_No),
    TXN_No_Start:       intOrNull(raw.TXN_No_Start),
    TXN_No_End:         intOrNull(raw.TXN_No_End),
    TXN_GUINo:          strOrNull(raw.TXN_GUINo),
    PLU_SalePrc_Start:  numOrNull(raw.PLU_SalePrc_Start),
    PLU_SalePrc_End:    numOrNull(raw.PLU_SalePrc_End),
    TXN_TaxType:        strOrNull(raw.TXN_TaxType),
    TXN_DiscCode:       toStringArray(raw.TXN_DiscCode),
    tlt_id:             toStringArray(raw.tlt_id),
    PLU_MagNo:          strOrNull(raw.PLU_MagNo),
    IsNoPLU_No:         boolOrNull(raw.IsNoPLU_No),
    rece_yn:            strOrNull(raw.rece_yn),
    cash_yn:            strOrNull(raw.cash_yn),
    tlt_building:       strOrNull(raw.tlt_building),
    tlt_floor:          toStringArray(raw.tlt_floor),
    org_id:             toStringArray(raw.org_id),
  };

  // 清掉 null 欄位
  Object.keys(payload).forEach((k) => payload[k] === null && delete payload[k]);

  this.loading = true;
  this.tls23020Service.queryTLS23020(payload)
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: (res: any) => {
        const dataList = Array.isArray(res?.Data) ? res.Data : [];
        const rows: any[] = [];
        // 只展開 tLS23020_Details
        for (const item of dataList) {
          const groups = Array.isArray(item?.tLS23020_SubTotals) ? item.tLS23020_SubTotals : [];
          for (const g of groups) {
            if (Array.isArray(g?.tLS23020_Details)) {
              for (const d of g.tLS23020_Details) {
                rows.push({ _rowKey: `${d?.ECR_No ?? ''}-${d?.TXN_No ?? ''}-${d?.TXN_GUINo ?? ''}`, ...d });
              }
            }
          }
          if (Array.isArray(item?.tLS23020_Details)) {
            for (const d of item.tLS23020_Details) {
              rows.push({ _rowKey: `${d?.ECR_No ?? ''}-${d?.TXN_No ?? ''}-${d?.TXN_GUINo ?? ''}`, ...d });
            }
          }
        }
        this.data = rows;
        const tc = Number(res?.TotalCount);
        this.totalRecords = Number.isFinite(tc) && tc >= 0 ? tc : rows.length;
      },
      error: () => {
        this.data = [];
        this.totalRecords = 0;
      },
    });
}




  // columns（修正名稱＆保留你原本格式器）
  columns: any[] = [ 
    { field: 'TXN_Date',header: '銷售日期',visible: true,format: this.formatYMD    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'PLU_SalePrc', header: '單項售價', visible: true,style: 'text-right',format:this.money},
    { field: 'TXN_Net', header: '未稅(免稅)金額', visible: true, style: 'text-right',format:this.money,},
    { field: 'TXN_Tax', header: '稅額', visible: true,style: 'text-right',format:this.money},
    { field: 'TXN_Disc', header: '折扣金額', visible: true,style: 'text-right',format:this.money},
    { field: 'tlt_id_desc',header: '商品抽成類別',visible: true},
    // {
    //   field: 'ORG_TXN_DiscCode', header: '原折扣', visible: true,
    //   format: (val: any) => this.getLabelFromOptions(val, this.discountOptions),
    // },
    { field: 'TXN_DiscCode', header: '歸屬折扣代號', visible: true},
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true},
    { field: 'PLU_TaxType',header: '稅別代號',visible: true},
    { field: 'PLU_TaxTypeName',header: '稅別名稱',visible: true},
    { field: 'PLU_MagNo', header: '單品編號', visible: true },
    { field: 'TXN_StatusName',header: '狀態',visible: true},
  ];
}
