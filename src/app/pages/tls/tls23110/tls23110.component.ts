import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { takeUntil } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';
import { TLS23110Service } from '../../../service/api/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';

// ✅ 直接從 primeng 匯入 SortMeta，避免你現在的 2459 錯誤
import { SortMeta } from 'primeng/api';
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

  // 👉 你不想用強型別，這裡就保留寬鬆 any；仍可用點語法 controls.TXN_DateStart
  queryForm: any = this.formBuilder.group(
    {
      TXN_DateStart: this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      TXN_DateEnd:   this.formBuilder.control(this.yesterday, { validators: [Validators.required] }),
      tlt_term_type: this.formBuilder.control(null),
      rece_yn:       this.formBuilder.control(null),
      IsNoPLU_No: this.formBuilder.control(null), // 預設「全部」
      TLT_No:        this.formBuilder.control(null),
      tlt_building:  this.formBuilder.control(null),
      tlt_floor:     this.formBuilder.control(null),
      org_id:        this.formBuilder.control(null),
      // createPaginationConfig 內部若是 [ ... ] 形式就能直接合併
      ...createPaginationConfig([{ field: 'Day', order: 1 as 1 } as SortMeta]),
    },
    { validators: [this.sameMonthValidator('TXN_DateStart', 'TXN_DateEnd')] }
  ) as FormGroup;

  // ---- 同月驗證器（FormGroup 等級） ----
  private sameMonthValidator(startKey: string, endKey: string): ValidatorFn {
    return (group: AbstractControl) => {
      const fg = group as FormGroup;
      const start = fg.get(startKey)?.value as Date | string | null | undefined;
      const end   = fg.get(endKey)?.value   as Date | string | null | undefined;

      const clearOurError = () => {
        const ctrl = fg.get(endKey);
        if (!ctrl) return;
        const err = ctrl.errors || {};
        if ('notSameMonth' in err) {
          delete err['notSameMonth'];
          ctrl.setErrors(Object.keys(err).length ? err : null);
        }
      };

      if (!start || !end) { clearOurError(); return null; }

      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) { clearOurError(); return null; }

      const sameMonth = (s.getFullYear() === e.getFullYear()) && (s.getMonth() === e.getMonth());
      if (!sameMonth) {
        const exist = fg.get(endKey)?.errors || {};
        fg.get(endKey)?.setErrors({ ...exist, notSameMonth: true });
        return { notSameMonth: true };
      } else {
        clearOurError();
        return null;
      }
    };
  }
//類別：只顯示自營櫃/不包含自營櫃 IsNoPLU_No 傳TF
  receYnOptions = [
    { label: '使用業主發票', value: "Y" },
    { label: '非使用業主發票', value: "N" },
  ];
  IsNoPLU_NoOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: true },
    { label: '只顯示自營櫃', value: false },
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

    // ---- 限定日期同月（自動矯正） ----
    const startCtrl = this.queryForm.controls.TXN_DateStart as FormControl;
    const endCtrl   = this.queryForm.controls.TXN_DateEnd   as FormControl;

    const clampEndToStartMonth = () => {
      const s = startCtrl?.value ? new Date(startCtrl.value) : null;
      const e = endCtrl?.value ? new Date(endCtrl.value) : null;
      if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return;

      const sameMonth = (s.getFullYear() === e.getFullYear()) && (s.getMonth() === e.getMonth());
      if (!sameMonth) {
        const lastDay = new Date(s.getFullYear(), s.getMonth() + 1, 0);
        endCtrl.patchValue(lastDay, { emitEvent: false });
        this.queryForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      } else if (e.getTime() < s.getTime()) {
        endCtrl.patchValue(s, { emitEvent: false });
        this.queryForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    };

    startCtrl.valueChanges.subscribe(clampEndToStartMonth);
    endCtrl.valueChanges.subscribe(clampEndToStartMonth);
    clampEndToStartMonth(); // 進頁先跑一次

    // ---- 載入選項 ----
    this.whetherService.getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe((data) => (this.DeductionbigCategoryOptions = data));
    this.typeService.getTypeOptions().subscribe((data) => (this.TypeOptions = data));
    this.categoryService.getCategories().subscribe((data) => (this.CategoryOptions = data));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.OrganizationNumberOptions = data));
    this.counterOpCatService.getCounterOpCat().subscribe((data) => (this.CounterOpCatOptions = data));
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  // ---- 送出查詢 ----
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val: any = this.queryForm.getRawValue();

      // 由 pageIndex/pageSize 推 Offset (0-based)
      const offset =
        Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
          ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
          : undefined;

      // SortMeta[] -> "field ASC,DESC"
      const orderBy =
        Array.isArray(val?.SortBy) && val.SortBy.length
          ? val.SortBy.map((s: SortMeta) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
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

      const toBool = (x: any) => {
        if (x === true || x === 'true' || x === 1 || x === '1') return true;
        if (x === false || x === 'false' || x === 0 || x === '0') return false;
        return undefined;
      };

      const payload: any = {
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd:   toIso(val?.TXN_DateEnd),
        tlt_term_type: val?.tlt_term_type ?? undefined, 
        rece_yn:       val?.rece_yn ?? undefined,
        IsNoPLU_No:    toBool(val?.IsNoPLU_No),
        TLT_No:        val?.TLT_No ?? undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     val?.tlt_floor ?? undefined,
        org_id:        val?.org_id ?? undefined,
        pageSize:      val?.pageSize ?? undefined,
        pageIndex:     val?.pageIndex ?? undefined,
        SortBy:        val?.SortBy ?? undefined,
        ...(offset  !== undefined ? { Offset:  offset } : {}),
        ...(orderBy ? { OrderBy: orderBy } : {}),
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23110Service.queryTLS23110(payload).subscribe({
        next: (res: any) => {
          const src: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
            Array.isArray(res?.Data)            ? res.Data :
            Array.isArray(res?.QueryData)       ? res.QueryData : [];

          const preferredOrder = [
            'OriginalPrice','Discount95','Discount90','Discount85','Discount80',
            'Discount75','Discount70','Discount60','Discount50','SpecialPrice','Total'
          ] as const;
          const metrics = ['TXN_Net','TXN_SaleNoTax','TXN_Tax','Total'] as const;

          const firstList = src.find((r:any) => r?.Discount_List && typeof r.Discount_List === 'object')?.Discount_List ?? {};
          const existingKeys = Object.keys(firstList);
          const orderedKeys = [
            ...preferredOrder.filter(k => existingKeys.includes(k)),
            ...existingKeys.filter(k => !(preferredOrder as readonly string[]).includes(k))
          ];

          (this as any).discountKeys = orderedKeys;
          (this as any).discountMetrics = metrics;

          const mapped = src.map((row: any) => {
            const flat: any = { Day: row?.Day ?? '' };
            const d = row?.Discount_List;

            let foundAnyNumber = false;
            let foundNonZero   = false;

            if (d && typeof d === 'object') {
              for (const key of orderedKeys) {
                const bucket = d[key];
                if (!bucket) continue;
                for (const m of metrics) {
                  const raw = bucket[m as string];
                  const num = Number(raw);
                  if (Number.isFinite(num)) {
                    foundAnyNumber = true;
                    if (num !== 0) foundNonZero = true;
                    flat[`${key}_${m}`] = num;
                  }
                }
              }
            }

            if (!foundAnyNumber || !foundNonZero) return null;
            return flat;
          });

          this.data = mapped.filter((x: any) => x);
          this.totalRecords = this.data.length;
        },
        error: () => {
          this.loading = false;
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

  columns: any[] = [
    { field: 'Day', header: '日期', visible: true },
    { field: 'OriginalPrice_TXN_SaleNoTax', header: '正品-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'OriginalPrice_TXN_Tax',       header: '正品-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'OriginalPrice_Total',         header: '正品-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

    { field: 'Discount90_TXN_SaleNoTax', header: '9折-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Discount90_TXN_Tax',       header: '9折-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Discount90_Total',         header: '9折-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

    { field: 'Discount80_TXN_SaleNoTax', header: '8折-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Discount80_TXN_Tax',       header: '8折-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Discount80_Total',         header: '8折-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

    { field: 'SpecialPrice_TXN_SaleNoTax', header: '特價-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'SpecialPrice_TXN_Tax',       header: '特價-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'SpecialPrice_Total',         header: '特價-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },

    { field: 'Total_TXN_SaleNoTax', header: '總計-未稅', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Total_TXN_Tax',       header: '總計-稅額', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
    { field: 'Total_Total',         header: '總計-合計', visible: true, style: 'text-right', format: this.moneyFormat.bind(this) },
  ];
}
