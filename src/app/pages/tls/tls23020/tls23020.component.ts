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
    ECR_No: [],                       // 收銀機機號
    TXN_No_Start: [null, [this.validationService.numberValidator]],
    TXN_No_End:   [null, [this.validationService.numberValidator]],
    TLT_No: [],
    TXN_GUINo: [''],                  // 發票號碼
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
    isSummary: false,                 // 保留欄位，但本畫面不切換模式
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

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => this.doQuery());
  }

  // 將 lazy 的分頁/排序寫回表單後，呼叫同一支查詢
  runQueryFromTable(event: any) {
    this.queryForm.patchValue(
      {
        pageIndex: event?.pageIndex ?? this.queryForm.value.pageIndex,
        pageSize:  event?.pageSize  ?? this.queryForm.value.pageSize,
        SortBy:    event?.SortBy    ?? this.queryForm.value.SortBy,
      },
      { emitEvent: false },
    );
    this.doQuery();
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

  /** 組查詢 payload，並清掉空值/空陣列，避免干擾後端繫結 */
  private buildPayload(val: any) {
    const o: any = {
      ...val,
      TXN_DateStart: this.toIso(val?.TXN_DateStart),
      TXN_DateEnd:   this.toIso(val?.TXN_DateEnd),
      TXN_No_Start:  val?.TXN_No_Start != null && val?.TXN_No_Start !== '' ? Number(val.TXN_No_Start) : undefined,
      TXN_No_End:    val?.TXN_No_End   != null && val?.TXN_No_End   !== '' ? Number(val.TXN_No_End)   : undefined,
    };

    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (v === '' || v === null || v === undefined) delete o[k];
      if (Array.isArray(v) && v.length === 0) delete o[k];
    });

    return o;
  }

  private doQuery(): void {
    const payload = this.buildPayload(this.queryForm.value);
    this.loading = true;
    this.messageService?.blockUi();

    this.tls23020Service
      .queryTLS23020(payload) // ✅ 注意大小寫：queryTLS23020
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService?.unblockUi();
      }))
      .subscribe({
next: (res) => {
  const raw = res?.Data ?? [];

  const mapped = raw.map((item: any, idx: number) => ({
    ...item,
    _rowKey: `${item.SYS_StoreNo ?? ''}|${String(item.TXN_Date ?? '').slice(0, 19)}|${item.ECR_No ?? ''}|${item.TXN_No ?? idx}`,
  }));

  // 從回傳資料找一筆帶有 Subtotal 欄位的來源（常見是每筆都帶同值或只有一筆帶）
const totalSrc = raw.find((x: any) =>
  x?.Subtotal_PLU_SalePrc != null ||
  x?.Subtotal_TXN_Net     != null ||
  x?.Subtotal_TXN_Tax     != null ||
  x?.Subtotal_TXN_Disc    != null
);

  this.data = totalSrc ? [...mapped, this.makeBackendTotalRow(totalSrc)] : mapped;

  // 注意 totalRecords 用後端提供的（不要 +1），避免分頁數被影響
  this.totalRecords = res?.TotalCount ?? mapped.length;
},
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
