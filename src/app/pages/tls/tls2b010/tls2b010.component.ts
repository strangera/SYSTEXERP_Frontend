import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CashShowupByService } from '../../../service/basic/cash-showup-by.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
// UI Imports
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { DecimalPipe, NgIf } from '@angular/common';
import { TLS2B010Service } from '../../../service/api/tls/tls2-b010.service';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';
import { ReimbursementYypeService } from './../../../service/basic/reimbursement-yype.service';

@Component({
  selector: 'app-tls2b010',
  templateUrl: './tls2b010.component.html',
  styleUrl: './tls2b010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    ReportTableGroupComponent,
    DatePipe,
    NgIf,
  ],
  providers: [CashShowupByService],
})
export class TLS2B010Component extends BasicQueryPageComponent<any> {
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  data: any[] = [];
  closeDate: string = '查詢中...';
  ECR_TypeOptions = [
    { label: '全部', value: null },
    { label: '統收', value: '1' },
    { label: '自收', value: '2' },
  ];

  CashShowupByOptions: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  CounterOptions: any[] = []; // 專櫃選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  reimbursementOptions: any[] = [
    { value: 1, label: '系統帳', disabled: true },
    { value: 2, label: '自我報帳' },
    { value: 3, label: '實收帳' },
  ];
  reporttypeOptions: any[] = [
    { value: 1, label: '支付別溢欠明細表' },
    { value: 2, label: '溢欠簡表' },
  ];
  printedAt: string = '';
  now = new Date(); // ✅ 用於 template

 

  queryForm = this.formBuilder.group({
    TXN_Date: [null, [Validators.required]], // ✅ 銷售日期（單日，必填）
    ECR_No_List: [[]], // ✅ 收銀機號（多選）
    TLT_No_List: [[]], // ✅ 專櫃編號（多選）
    tlt_building: [null], // ✅ 館別（單選）
    tlt_floor: [[]], // ✅ 樓層（多選）
    area_no: [null], // ✅ 區域
    ECR_Type: [null], // ✅ 收銀機類型（單選）
    cashShowUp: [1], // ✅ 顯示方式：1=全部, 2=金額不為0, 3=溢欠
    reimbursementType: [[1], Validators.nullValidator], // ✅ 顯示欄位（多選）
    reporttype: [1],
    // 🧾 分頁與排序
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }
  constructor(
    private tls2B010Service: TLS2B010Service,
    private cashShowupByService: CashShowupByService,
    public override messageService: NotificationService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    public  datePipe: DatePipe, // ✅ 加入這行
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2B010',
      '/tls2000/tls2B010cru',
      this.queryForm,
      (form) => this.onSubmit(form),
    );
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });

    this.cashShowupByService.getSystemTypes().subscribe((data) => {
      this.CashShowupByOptions = data;
    });
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));
    this.queryForm
      .get('reimbursementType')
      ?.valueChanges.subscribe((values) => {
        this.updateColumnVisibility(
          this.queryForm.get('reimbursementType')?.value ?? [],
        );
      });

    // 預設執行一次，根據初始值
    this.updateColumnVisibility(
      this.queryForm.get('reimbursementType')?.value || [],
    );

    this.printedAt =
      this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm') || '';
  }

  updateColumnVisibility(selectedValues: number[]) {
    const alwaysVisibleFields = [
      'tlt_building',
      'tlt_floor',
      'ECR_No',
      'USR_No',
    ];
    const visibilityMap = new Set(alwaysVisibleFields);

    if (selectedValues.includes(1)) {
      visibilityMap.add('BOOK_PayAmt');
    }
    if (selectedValues.includes(2)) {
      visibilityMap.add('SELF_PayAmt');
      visibilityMap.add('SOVER_PayAmt');
    }
    if (selectedValues.includes(3)) {
      visibilityMap.add('ACT_PayAmt');
      visibilityMap.add('OVER_PayAmt');
    }

    this.columns = this.columns.map((col) => ({
      ...col,
      visible: visibilityMap.has(col.field),
    }));
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    // 將 payload 複製並清除空值
    const payload = { ...form.value };

    Object.keys(payload).forEach((key) => {
      const value = payload[key];

      // 1. 字串清 trim 空白
      if (typeof value === 'string') {
        payload[key] = value.trim();
        if (payload[key] === '') {
          delete payload[key];
        }
      }

      // 2. 空陣列刪除
      if (Array.isArray(value) && value.length === 0) {
        delete payload[key];
      }

      // 3. null 也刪除
      if (value === null) {
        delete payload[key];
      }
    });

    // 4. 移除 UI 專用欄位（例如：reimbursementType）
    delete payload['reimbursementType'];

    this.loading = true;
    this.messageService.blockUi();

    this.tls2B010Service
      .queryTLS2B010(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            const responseData = res.Data || {};
            this.data = responseData.QueryData || []; // ✅ 這裡才是資料陣列
            this.totalRecords = res.TotalCount || 0;
            this.closeDate = responseData.LastCloseDate || '-';
            this.queryStateService.setQueryState(this.ProgNo, payload);
          } else {
            this.messageService.errorBubble(res?.Message || '查詢失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('查詢失敗，請稍後再試');
        },
      });
  }
get formattedTXNDate(): string {
  const date = this.queryForm?.controls?.TXN_Date?.value;
  return this.datePipe.transform(date, 'yyyy/MM/dd') || '';
}
  onClearForm(): void {
    this.queryForm.reset();
  }
  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }
   columns: any[] = [
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
    },
    {
      field: 'tlt_floor',
      header: '樓層',
      visible: true,
    },

    {
      field: 'ECR_No',
      header: '收銀機號',
      visible: true,
    },
    {
      field: 'USR_No',
      header: '收銀員編號/姓名',
      visible: true,
    },
    // {
    //   field: 'TLT_NO',
    //   header: '專櫃編號',
    //   visible: true,
    // },
    {
      field: 'PAY_NO',
      header: '付款別',
      visible: true,
    },
    {
      field: 'BOOK_PayAmt',
      header: '系統帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'SELF_PayAmt',
      header: '自我報帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'SOVER_PayAmt',
      header: '溢欠差異(自我報帳 - 系統帳)',
      visible: false,
    },
    {
      field: 'ACT_PayAmt',
      header: '實收帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'OVER_PayAmt',
      header: '溢欠差異(實收 - 系統帳)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
   simplecolumns: any[] = [
 {
  field: 'TXN_Date',
  header: '銷售日期',
  visible: true,
  format: (value: any) => value ? new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
},
    {
      field: 'tlt_floor',
      header: '樓層',
      visible: true,
    },
    {
      field: 'USR_No',
      header: '收銀員',
      visible: true,
    },
        {
      field: 'USR_Name',
      header: '收銀員名稱',
      visible: true,
    },
            {
      field: 'ECR_No',
      header: '收銀機號',
      visible: true,
    },

         {
     field: 'TLT_NO',
     header: '專櫃編號',
      visible: true,
   },
            {
     field: 'TLT_NO',
     header: '櫃位名稱',
      visible: true,
   },
    
    {
      field: 'PAY_NO',
      header: '付款別',
      visible: true,
    },
    {
      field: 'BOOK_PayAmt',
      header: '系統帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'SELF_PayAmt',
      header: '自我報帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'SOVER_PayAmt',
      header: '溢欠差異(自我報帳 - 系統帳)',
      visible: false,
    },
    {
      field: 'ACT_PayAmt',
      header: '實收帳',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'OVER_PayAmt',
      header: '溢欠差異(實收 - 系統帳)',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
}
