import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CashShowupByService } from '../../../service/basic/cash-showup-by.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
// UI Imports
import { CurrencyPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip'; // 如需 tooltip 說明
import { finalize } from 'rxjs';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS2B010Service } from '../../../service/api/tls/tls2-b010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ReimbursementYypeService } from './../../../service/basic/reimbursement-yype.service';
import { tls2b010tableComponent } from '../../../shared/componentkit/tls2-b010-table/tls2b010table.component';




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
    // TableComponent,
    TableModule, // ✅ PrimeNG 原生 p-table 用於簡表
    ButtonModule, // ✅ row expansion toggle 按鈕
    TranslateModule,
    ReportTableGroupComponent,
    DatePipe,
    NgIf,
   tls2b010tableComponent,


  ],
  providers: [CashShowupByService],
})
export class TLS2B010Component extends BasicQueryPageComponent<any> {
    readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
   CounterOptions: any[] = []; // 專櫃選項
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
  simpleData: any[] = [];

  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]], // ✅ 銷售日期（單日，必填）
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
    public datePipe: DatePipe, // ✅ 加入這行
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
      this.refreshCloseDate();
  }

updateColumnVisibility(selectedValues: number[]) {
  const reporttype = this.queryForm.controls.reporttype.value;

  // 修正欄位名稱 + 在明細表時固定顯示 PAY_NO
  const alwaysVisibleFields = [
    'building_desc',
    'floor_desc',
    'ECR_No',
    'USR_No',
     ...(reporttype === 1 ? ['PAY_NO', 'PAY_Name'] : []), 
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

  this.columns = this.columns.map(col => ({
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

    const payload = { ...form.value };

    // ✅ 加入店號（來自 localStorage）
    const userInfo = localStorage.getItem('UserInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.SYS_StoreNo) {
          payload['SYS_StoreNo'] = parsed.SYS_StoreNo;
        }
      } catch (err) {
        console.error('❌ 解析 UserInfo 發生錯誤:', err);
      }
    }

    // ✅ 清除空值、空陣列、空字串
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (typeof value === 'string') {
        payload[key] = value.trim();
        if (payload[key] === '') {
          delete payload[key];
        }
      }
      if (Array.isArray(value) && value.length === 0) {
        delete payload[key];
      }
      if (value === null || value === undefined) {
        delete payload[key];
      }
    });

    // ✅ 排除前端控制欄位
    delete payload['reimbursementType'];

    this.loading = true;
    this.messageService.blockUi();

    const reporttype = form.controls['reporttype'].value;

    const apiCall =
      reporttype === 2
        ? this.tls2B010Service.simpleTLS2B010(payload) // ✅ 無 QueryData 層
        : this.tls2B010Service.queryTLS2B010(payload); // ✅ 有 QueryData 層

    apiCall
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
           this.refreshCloseDate(); 
        }),
      )
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            this.queryStateService.setQueryState(this.ProgNo, payload);

            if (reporttype === 2) {
              // ✅ 後端回傳陣列，處理 sumOVER_PayAmt 欄位
              const rawData = res.Data || [];

              // 🔢 建立加總 Map
              const grouped = new Map<string, number>();
              rawData.forEach((row: any) => {
                const key = row.ECR_No || '未指定';
                const current = grouped.get(key) || 0;
                const amt = parseFloat(row.OVER_PayAmt) || 0;
                grouped.set(key, current + amt);
              });

              // 🧩 填入 sumOVER_PayAmt 欄位
              this.simpleData = rawData.map((row: any) => ({
                ...row,
                sumOVER_PayAmt: grouped.get(row.ECR_No || '未指定') || 0,
              }));

              this.totalRecords = res.TotalCount || 0;
            } else {
              // ✅ 支付別溢欠明細表
              const responseData = res.Data || {};
              this.data = responseData.QueryData || [];
            
              this.totalRecords = res.TotalCount || 0;
            }
          } else {
            
          }
        },
        error: () => {
          
        },
      });
     
  }
handleLazyLoad(e: { pageIndex: number; pageSize: number; SortBy: any[] }, form: FormGroup) {
  form.patchValue(
    { pageIndex: e.pageIndex, pageSize: e.pageSize, SortBy: e.SortBy },
    { emitEvent: false }
  );
  this.onSubmit(form); // 集中在這裡打一次 API
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
      field: 'building_desc',
      header: '館別',
      visible: true,
    },
    {
      field: 'floor_desc',
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
      field: 'PAY_Name',
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
  style: 'text-right',
  // 只要是 0（數字或字串）都輸出字串 "0"，其他交給 moneyFormat
  format: (v: any) => (v === 0 || v === '0') ? '0' : this.moneyFormat(Number(v)),
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
      format: (value: any) =>
        value
          ? new Date(value).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          : '',
    },
    // {
    //   field: 'tlt_floor',
    //   header: '樓層',
    //   visible: true,
    // },
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
      field: 'TLT_Name',
      header: '櫃位名稱',
      visible: true,
    },
    {
      field: 'sumOVER_PayAmt',
      header: '溢欠總金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'PAY_NO',
      header: '溢欠說明',
      visible: true,
    },
    {
      field: 'OVER_PayAmt',
      header: '溢欠金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },

    {
      field: 'Remark',
      header: '備註',
      visible: false,
    },
  ];
 refreshCloseDate(): void {
  this.closeDate = '查詢中...';
  this.tls2B010Service.getCloseDate().subscribe({
    next: (res) => {
      // 後端回傳範例：
      // {
      //   "Status": "0000",
      //   "Data": { "CLS_DATE": "2025/08/31" },
      //   ...
      // }
      const d = res?.Data ?? res;
      const close =
        d?.CLS_DATE ??            // ✅ 你要的欄位
        d?.LastCloseDate ??       // 兼容舊欄位
        d?.CloseDate ??
        d?.closeDate ??
        (typeof d === 'string' ? d : null);

      this.closeDate = close || '-';
    },
    error: () => (this.closeDate = '-'),
  });
}


}
