import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { TLS13030Service } from '../../../service/api/tls/tls13030.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { MultiLocationFilterComponent } from '../../../shared/componentkit/multi-location-filter/multi-location-filter.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls13030',
    templateUrl: './tls13030.component.html',
    styleUrls: ['./tls13030.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        MultiSelectComponent,
        MultiLocationFilterComponent,
        CalendarRangeQuickComponent,
        CalendarRangeComponent,
        ButtonComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS13030Component extends BasicQueryPageComponent<any> {
  isPrint = true; // 或預設為 false，視需求切換
  queryForm = this.formBuilder.group({
    tlt_no: ['', [Validators.maxLength(10)]],
    tlt_name: ['', [Validators.maxLength(50)]],
    floor_noList: [[] as string[]],
    area_noList: [[] as string[]],
    tlt_openflagList: [[] as string[]],
    tlt_bdate_start: [null],
    tlt_bdate_end: [null],
    tlt_edate_start: [null],
    tlt_edate_end: [null],
    cap_typeList: [[] as string[]],
    cap_itemList: [[] as string[]],
    tpy_bdate_start: [null],
    tpy_bdate_end: [null],
    tpy_edate_start: [null],
    tpy_edate_end: [null],
    bus_typeList: [[] as string[]],
    tlt_building: ['', [Validators.maxLength(1)]],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  operationStatusOptions: any[] = [];
  bus_typeOptions: any[] = [];
  deductionCategoryOptions: any[] = [];
  deductionCodeNameServOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];


  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    {
      field: 'tlt_name', header: '櫃位名稱', visible: true,
      style: 'text-left'
    },

    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'floor_desc', header: '樓層', visible: true },
    {
      field: 'area_desc', header: '區域', visible: true,
      style: 'text-left'
    },
    // ✅ 新增兩個欄位來取代舊的「大分類」
    {
      field: 'bus_type',
      header: '大分類代碼',
      visible: true,
      
    },
    {
      field: 'bus_type_name',
      header: '大分類名稱',
      visible: true,
      
    },
    {
      field: 'tlt_bdate',
      header: '合約起日',
      visible: true,
     
    },
    {
      field: 'tlt_edate',
      header: '合約迄日',
      visible: true,
     
    },

    { field: 'cap_type', header: '扣款類別', visible: true },
    {
      field: 'CAP_Name', header: '扣款名稱', visible: true,
      style: 'text-left'
    },
    {
      field: 'tpy_bdate',
      header: '扣款起日',
      visible: true,
      
    },
    {
      field: 'tpy_edate',
      header: '扣款迄日',
      visible: true,
     
    },


    {
      field: 'tpy_totalamt', header: '總金額', visible: true,
      format: (value: any) => this.moneyFormat(value),
      style: 'text-right'
    },
    {
      field: 'down_payment', header: '頭期款', visible: true,
      format: (value: any) => this.moneyFormat(value),
      style: 'text-right'
    },
    { field: 'period_nos', header: '期數', visible: true },
    {
      field: 'tpy_amount', header: '每期金額', visible: true,
      format: (value: any) => this.moneyFormat(value),
      style: 'text-right'
    },
    {
      field: 'tpy_rate',
      header: '比率或元(月利率%)',
      visible: true,
      style: 'text-right'
    },

    {
      field: 'defSalesAmt', header: '預設營業額', visible: true, format: (value: any) => value ?? 0,
      style: 'text-right'
    },
    {
      field: 'commRate', header: '抽成百分比%', visible: true, format: (value: any) => value ?? 0,
      style: 'text-right'
    },

  ];
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  // ✅ 合約日格式（YYYY/MM/DD）
  formatFullDate(raw: string): string {
    if (!raw) return '';
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    return raw;
  }

  // ✅ 扣款日格式（YYYY/MM）
  formatYYYYMM(raw: string): string {
    if (!raw || raw.length !== 6) return '';
    const year = raw.substring(0, 4);
    const month = raw.substring(4, 6);
    return `${year}/${month}`;
  }
  constructor(
    private RegionService: RegionService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private deductionService: DeductionService,
    private tls11010Service: Tls11010Service,
    private TLS13030Service: TLS13030Service,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13030', '', this.queryForm);
    this.operationStatusService.getOperationStatuses().subscribe(data => this.operationStatusOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.deductionService.getDeductionCategories().subscribe(data => this.deductionCategoryOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.queryForm.controls.cap_typeList.valueChanges.subscribe((selectedCapTypes: string[] | null) => {
      if (selectedCapTypes?.length) {
        const payload = { cap_typeList: selectedCapTypes };
        this.deductionService.getAPS1003DropDownList(payload).subscribe(res => {
          this.deductionCodeNameServOptions = res?.map((x: any) => ({
            label: `${x.value} - ${x.label}`,
            value: x.value
          })) || [];
          this.queryForm.controls.cap_itemList.setValue([]);
        });
      } else {
        this.deductionCodeNameServOptions = [];
        this.queryForm.controls.cap_itemList.setValue([]);
      }
    });
  }

  processResultData(resData: any[]): any[] {
    const formatYYYYMM = (value: string): string => {
      if (value && value.length === 6) {
        return `${value.substring(0, 4)}/${value.substring(4, 2)}`;
      }
      return value;
    };

    return (resData || []).map((item: any) => {
      const [code, name] = (item.bus_type ?? '').split('/');
      return {
        ...item,
        defSalesAmt: item.defSalesAmt ?? 0,
        commRate: item.commRate ?? 0,
        bus_type_code: code ?? '',
        bus_type_name: name ?? '',
        tpy_bdate: formatYYYYMM(item.tpy_bdate),
        tpy_edate: formatYYYYMM(item.tpy_edate),
      };
    });
  }


  onSubmit(form: FormGroup): void {
    console.log('送出的查詢條件：', form.value);

    this.submitted = true;
    const formValue = { ...form.value };
    for (const key in formValue) {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim(); // 去除空白
        if (formValue[key] === '') {
          formValue[key] = null;
        }
      }
    }

    // ✅ 將空字串轉成 null
    for (const key in formValue) {
      if (formValue[key] === '') formValue[key] = null;
    }

    // ✅ 映射欄位名稱
    formValue.tlt_floorList = formValue.floor_noList;
    formValue.area_noList = formValue.area_noList;

    // ✅ 明確轉型陣列欄位
    const listFieldsToConvert = [
      'tlt_idList',
      'tlt_term_typeList',
      'cag_barcodeList',
      'bus_typeList',
      'tlt_openflagList',
      'org_idList',
      'tlt_floorList',
      'area_noList',
      'floor_noList',
      'cap_typeList',
      'cap_itemList'
    ];
    for (const key of listFieldsToConvert) {
      if (Array.isArray(formValue[key])) {
        formValue[key] = formValue[key].map((v: any) => String(v));
      }
    }


    // ✅ dropdown 欄位處理
    if (formValue.tlt_building && typeof formValue.tlt_building === 'object') {
      formValue.tlt_building = formValue.tlt_building?.value;
    }

    // ✅ 顯示 loading
    this.loading = true;
    this.messageService.blockUi();

    this.TLS13030Service.queryTLS13030(formValue)
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.data = this.processResultData(res.Data);

            this.totalRecords = res.TotalCount || this.data.length;
            this.messageService.successBubble('查詢成功');
            this.queryStateService.setQueryState(this.ProgNo, formValue);
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢錯誤');
          this.loading = false;
          this.messageService.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });

  }



  onDelete(selectedItems: any[]): void {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);

    this.TLS13030Service.deleteTLS13030(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

}
