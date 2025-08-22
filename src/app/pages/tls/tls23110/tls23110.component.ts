import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { CounterOpCatService } from '../../../service/basic/counter-op-cat.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  styleUrls: ['./tls23110.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23110Component extends BasicQueryPageComponent<any> {

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, Validators.required],
    TXN_DateEnd: [this.yesterday, Validators.required],
    tlt_term_type: [], // e.g., 'st'
    rece_yn: [], // e.g., 's'
    IsNoPLU_No: [true], // 預設 true
    TLT_No: [], // string[]
    tlt_building: [],
    tlt_floor: [], // string[]
    org_id: [], // string[]

    ...createPaginationConfig([{ field: 'Day', order: 1 }]),
  });


  IsNoPLU_NoOptions = [
    { label: '使用業主發票', value: true },
    { label: '非使用業主發票', value: false },
  ];
  receYnOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: 'Y' },
    { label: '只顯示自營櫃', value: 'N' },
  ];

  DeductionbigCategoryOptions: any[] = [];
  TypeOptions: any[] = [];
  CategoryOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOpCatOptions: any[] = [];
  WhetherOptions: any[] = [];

  constructor(
    private tls23110Service: TLS23110Service,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private typeService: TypeService,
    private categoryService: CategoryService,
    private counterOpCatService: CounterOpCatService,
    private counterNameService: CounterNameService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private whetherService: WhetherService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {

    this.initializePage('TLS23110', 'tls/tls23110', this.queryForm, (form) => this.onSubmit(form));
   
    this.whetherService
      .getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.deductionbigCategoryService
      .getLocalDeductionCategories().subscribe((data) => (this.DeductionbigCategoryOptions = data));
    this.typeService
      .getTypeOptions().subscribe((data) => (this.TypeOptions = data));
    this.categoryService
      .getCategories().subscribe((data) => (this.CategoryOptions = data));
    this.counterNameService
      .getCounters().subscribe((res) => {
        this.CounterOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.organizationNumberService
      .getOrganizationNumbers().subscribe((data) => (this.OrganizationNumberOptions = data));
    this.counterOpCatService
      .getCounterOpCat().subscribe((data) => (this.CounterOpCatOptions = data));
    this.floorService
      .getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service
      .getOrgOptions().subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
  }
// 送出查詢（無 doQuery / buildPayload）
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // 由 pageIndex/pageSize 推 Offset (0-based)
    const offset =
      Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
        ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
        : undefined;

    // SortMeta[] -> "field ASC,DESC"
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    // 本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // 混合型別 -> boolean
    const toBool = (x: any) => {
      if (x === true || x === 'true' || x === 1 || x === '1') return true;
      if (x === false || x === 'false' || x === 0 || x === '0') return false;
      return undefined; // 沒選就不傳
    };

    // 組 payload（保留分頁/排序）
    const payload: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      tlt_term_type: val?.tlt_term_type != null ? String(val.tlt_term_type) : undefined,
      rece_yn:       val?.rece_yn,
      IsNoPLU_No:    toBool(val?.IsNoPLU_No),
      TLT_No:        val?.TLT_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      pageSize:      val?.pageSize,
      pageIndex:     val?.pageIndex,
      SortBy:        val?.SortBy,
      ...(offset  !== undefined ? { Offset:  offset } : {}),
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 移除空值/空陣列
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23110Service.queryTLS23110(payload).subscribe({
      next: (res: any) => {
        // res.Data: [{ Day, Discount_List: { OriginalPrice:{...}, Discount95:{...}, ... , Total:{...} } }, ...]
        const src = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

        const preferredOrder = [
          'OriginalPrice','Discount95','Discount90','Discount85','Discount80',
          'Discount75','Discount70','Discount60','Discount50','SpecialPrice','Total'
        ] as const;
        const metrics = ['TXN_Net','TXN_SaleNoTax','TXN_Tax','Total'] as const;

        // 依第一筆含 Discount_List 的資料動態決定實際 keys
        const firstList = src.find((r:any) => r?.Discount_List && typeof r.Discount_List === 'object')?.Discount_List ?? {};
        const existingKeys = Object.keys(firstList);
        const orderedKeys = [
          ...preferredOrder.filter(k => existingKeys.includes(k)),
          ...existingKeys.filter(k => !preferredOrder.includes(k as any)) // 額外 key 也顯示
        ];

        (this as any).discountKeys = orderedKeys;
        (this as any).discountMetrics = metrics;

        // 攤平 + 過濾：整列「沒有任何數字」或「所有數字都是 0」→ 不顯示
        const mapped = src.map((row: any) => {
          const flat: any = { Day: row?.Day ?? '' };
          const d = row?.Discount_List;

          let foundAnyNumber = false;  // 是否至少有一個數值
          let foundNonZero   = false;  // 是否至少有一個非 0 數值

          if (d && typeof d === 'object') {
            for (const key of orderedKeys) {
              const bucket = d[key];
              if (!bucket) continue; // 該折扣節點不存在 → 整組欄位跳過
              for (const m of metrics) {
                const raw = bucket[m as string];
                const num = Number(raw);
                if (Number.isFinite(num)) {
                  foundAnyNumber = true;
                  if (num !== 0) foundNonZero = true;
                  // 有值就寫入（0 也寫，後面用 foundNonZero 控制是否整列剔除）
                  flat[`${key}_${m}`] = num;
                }
              }
            }
          }

          // 若完全沒有數字，或所有數字皆為 0 → 返回 null，待後續 filter 移除
          if (!foundAnyNumber || !foundNonZero) return null;

          return flat;
        });

        this.data = mapped.filter((x: any) => x); // 移除 null
        this.totalRecords = this.data.length;      // 以實際顯示列數為準
      },
      error: (err) => {
        console.error('TLS23110 查詢失敗', err);
        this.messageService?.errorBubble?.(err?.error?.Message || '查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}




moneyFormat(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('en-US') : '';
}

columns = [
      { field: 'Day', header: '日期', visible: true },
      { field: 'OriginalPrice_TXN_SaleNoTax', header: '正品-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'OriginalPrice_TXN_Tax', header: '正品-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'OriginalPrice_Total', header: '正品-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Discount90_TXN_SaleNoTax', header: '9折-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount90_TXN_Tax', header: '9折-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount90_Total', header: '9折-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Discount80_TXN_SaleNoTax', header: '8折-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount80_TXN_Tax', header: '8折-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount80_Total', header: '8折-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'SpecialPrice_TXN_SaleNoTax', header: '特價-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'SpecialPrice_TXN_Tax', header: '特價-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'SpecialPrice_Total', header: '特價-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Total_TXN_SaleNoTax', header: '總計-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Total_TXN_Tax', header: '總計-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Total_Total', header: '總計-合計', visible: true, style: 'text-right', format: this.moneyFormat },
    ];

}
