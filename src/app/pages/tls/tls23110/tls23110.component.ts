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
    const val = this.queryForm.value as any;

    // 本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // 直接在這裡組 payload（保留分頁/排序）
    const payload: any = {
      ...val,
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      pageSize:  val?.pageSize,
      pageIndex: val?.pageIndex,
      SortBy:    val?.SortBy,
      OrderBy:   val?.OrderBy,
      Offset:    val?.Offset,
    };

    // 移除空字串 / null / undefined / 空陣列，避免干擾後端繫結
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23110Service.queryTLS23110(payload).subscribe({
      next: (res) => {
        const raw = res?.Data ?? [];
        this.data = Array.isArray(raw) ? raw : [];
        this.totalRecords = typeof res?.TotalCount === 'number'
          ? res.TotalCount
          : this.data.length; // ✅ 沒有 res.total
      },
      error: (err) => {
        console.error('TLS23110 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      }
    });
  });
}

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
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
