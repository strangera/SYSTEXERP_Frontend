import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

@Component({
    selector: 'app-tls23110',
    templateUrl: './tls23110.component.html',
    styleUrls: ['./tls23110.component.scss'],
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, DropdownComponent, RadiobuttonComponent, MultiSelectComponent, InputTextModule, ButtonComponent, TranslateModule]
})
export class TLS23110Component extends BasicQueryPageComponent<any> {
  showPageSizeDialog = false;
  customPageSize = 1000;

  queryForm = this.formBuilder.group({

    TXN_DateStart: [new Date('2024-01-01'), Validators.required],
    TXN_DateEnd: [new Date('2024-01-31'), Validators.required],
    tlt_term_type: [],       // e.g., 'st'
    rece_yn: [],            // e.g., 's'
    IsNoPLU_No: [true],        // 預設 true
    TLT_No: [], // string[]
    tlt_building: [],
    tlt_floor: [], // string[]
    org_id: [],  // string[]


    ...createPaginationConfig([{ field: 'Day', order: 1 }])
  });
  IsNoPLU_NoOptions = [
    { label: '使用業主發票', value: true },
    { label: '非使用業主發票', value: false }
  ];
  receYnOptions = [
    { label: '全部', value: null },
    { label: '不包含自營櫃', value: 'Y' },
    { label: '只顯示自營櫃', value: 'N' }
  ];

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'Day', header: '日期', visible: true },

    // OriginalPrice
    { field: 'OriginalPrice_TXN_SaleNoTax', header: '正品-未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'OriginalPrice_TXN_Tax', header: '正品-稅額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'OriginalPrice_Total', header: '正品-合計', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },

    // Discount90
    { field: 'Discount90_TXN_SaleNoTax', header: '9折-未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Discount90_TXN_Tax', header: '9折-稅額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Discount90_Total', header: '9折-合計', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },

    // Discount80
    { field: 'Discount80_TXN_SaleNoTax', header: '8折-未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Discount80_TXN_Tax', header: '8折-稅額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Discount80_Total', header: '8折-合計', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },

    // SpecialPrice
    { field: 'SpecialPrice_TXN_SaleNoTax', header: '特價-未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'SpecialPrice_TXN_Tax', header: '特價-稅額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'SpecialPrice_Total', header: '特價-合計', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },

    // Total
    { field: 'Total_TXN_SaleNoTax', header: '總計-未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Total_TXN_Tax', header: '總計-稅額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'Total_Total', header: '總計-合計', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
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
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading = false; // ✅ 保險起見，先還原 loading
    this.messageService.unblockUi();  // <-- 🔓 關鍵解除畫面卡住
    this.initializePage('TLS23110', 'TLS23110cru', this.queryForm);
    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.DeductionbigCategoryOptions = data);
    this.typeService.getTypeOptions().subscribe(data => this.TypeOptions = data);
    this.categoryService.getCategories().subscribe(data => this.CategoryOptions = data);
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
    });
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.OrganizationNumberOptions = data);
    this.counterOpCatService.getCounterOpCat().subscribe(data => this.CounterOpCatOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map(x => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || [];
    });
  }


  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = {
      ...this.queryForm.value,
      pageSize: this.customPageSize
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls23110Service.queryTLS23110(queryFormValue).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

          const flatData = (res.Data || []).map((row: any) => {
            const d = row.Discount_List || {};
            return {
              Day: row.Day,
              OriginalPrice_TXN_SaleNoTax: d.OriginalPrice?.TXN_SaleNoTax ?? 0,
              OriginalPrice_TXN_Tax: d.OriginalPrice?.TXN_Tax ?? 0,
              OriginalPrice_Total: d.OriginalPrice?.Total ?? 0,
              Discount90_TXN_SaleNoTax: d.Discount90?.TXN_SaleNoTax ?? 0,
              Discount90_TXN_Tax: d.Discount90?.TXN_Tax ?? 0,
              Discount90_Total: d.Discount90?.Total ?? 0,
              Discount80_TXN_SaleNoTax: d.Discount80?.TXN_SaleNoTax ?? 0,
              Discount80_TXN_Tax: d.Discount80?.TXN_Tax ?? 0,
              Discount80_Total: d.Discount80?.Total ?? 0,
              SpecialPrice_TXN_SaleNoTax: d.SpecialPrice?.TXN_SaleNoTax ?? 0,
              SpecialPrice_TXN_Tax: d.SpecialPrice?.TXN_Tax ?? 0,
              SpecialPrice_Total: d.SpecialPrice?.Total ?? 0,
              Total_TXN_SaleNoTax: d.Total?.TXN_SaleNoTax ?? 0,
              Total_TXN_Tax: d.Total?.TXN_Tax ?? 0,
              Total_Total: d.Total?.Total ?? 0,
            };
          });

this.router.navigate(['account/tls/tls23110cru'], {
  state: {
    queryFormValue,
    pageSize: this.customPageSize,
    data: flatData
  }
}).then(() => {
  this.loading = false;
  this.messageService.unblockUi();
  this.showPageSizeDialog = false;
  
});

          
        } else {
          this.messageService.errorBubble('查詢失敗');
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      }
    });
  }


}
