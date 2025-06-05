import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TypeService } from '../../../service/basic/type.service';
import { CategoryService } from '../../../service/basic/category.service';
import { TLS23110Service } from '../../../service/API/tls/tls23110.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls23110',
  templateUrl: './tls23110.component.html',
  styleUrls: ['./tls23110.component.scss']
})
export class TLS23110Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    saleDateStart: [null, Validators.required],
    saleDateEnd: [null, Validators.required],
    saleMonthYear: [''],
    productCategory: [''],
    type: [''],
    category: [''],
    counterCode: [''],
    organizationCode: [''],
    dateRadio: ['saleDate'],
    categoryRadio: ['category'],
          tlt_building: [''],                                  // 樓層建物
      tlt_floor: [''],                                     // 樓層編號
      org_id: [''],                                        // 組織代碼
        ...createPaginationConfig([{ field: 'saleDateStart', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'fullPriceWithoutTax', header: '正品 - 未稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'fullPriceExemptedTax', header: '正品 - 免稅', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
    { field: 'grandTotal', header: '合計 - 加總', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
  ];

  DeductionbigCategoryOptions: any[] = [];
  TypeOptions: any[] = [];
  CategoryOptions: any[] = [];
  CounterCodeOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];

    floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = []

  constructor(
    private tls23110Service: TLS23110Service,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private typeService: TypeService,
    private categoryService: CategoryService,
    private counterCodeService: CounterCodeService,
    private organizationNumberService: OrganizationNumberService,
        private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23110', '', this.queryForm, (form) => this.onSubmit(form));

    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.DeductionbigCategoryOptions = data);
    this.typeService.getTypeOptions().subscribe(data => this.TypeOptions = data);
    this.categoryService.getCategories().subscribe(data => this.CategoryOptions = data);
    this.counterCodeService.getCounterCodes().subscribe(data => this.CounterCodeOptions = data);
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.OrganizationNumberOptions = data);

    this.queryForm.controls.dateRadio.valueChanges.subscribe(value => {
      if (value === 'saleDate') {
        this.queryForm.controls.saleDateStart.enable();
        this.queryForm.controls.saleDateEnd.enable();
        this.queryForm.controls.saleMonthYear.disable();
        this.queryForm.controls.saleMonthYear.reset();
      } else {
        this.queryForm.controls.saleDateStart.disable();
        this.queryForm.controls.saleDateEnd.disable();
        this.queryForm.controls.saleDateStart.reset();
        this.queryForm.controls.saleDateEnd.reset();
        this.queryForm.controls.saleMonthYear.enable();
      }
    });

    this.queryForm.controls.categoryRadio.valueChanges.subscribe(value => {
      this.queryForm.controls.category.disable();
      this.queryForm.controls.counterCode.disable();
      this.queryForm.controls.organizationCode.disable();
      this.queryForm.controls.category.reset();
      this.queryForm.controls.counterCode.reset();
      this.queryForm.controls.organizationCode.reset();

      if (value === 'category') {
        this.queryForm.controls.category.enable();
      } else if (value === 'counterCode') {
        this.queryForm.controls.counterCode.enable();
      } else if (value === 'organizationCode') {
        this.queryForm.controls.organizationCode.enable();
      }
    });
             this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];});
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };

      // ✅ 將 'Y' / 'N' 轉成 true / false
      if (payload.IsHaveTERM_No === 'Y') {
        payload.IsHaveTERM_No = true;
      } else if (payload.IsHaveTERM_No === 'N') {
        payload.IsHaveTERM_No = false;
      }

      // ✅ 將空字串轉 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      console.log('查詢參數:', payload);

      this.tls23110Service.queryTLS23110(payload).subscribe({
        next: (res) => {
          console.log('查詢結果:', res);
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            this.messageService.successBubble('查詢成功');
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.messageService.errorBubble('查詢錯誤');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}