import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// UI Imports
import { DatePipe, NgFor /* 或改用 CommonModule */, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS2B010Service } from '../../../service/api/tls/tls2-b010.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { tls2b010tableComponent } from './tls2-b010-table/tls2b010table.component';

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
    ButtonComponent,
    TableComponent,
    TableModule,
    ButtonModule,
    TranslateModule,
    DatePipe,
    NgIf,
    NgFor,
    tls2b010tableComponent,
    RadioButtonModule, // ← 使用 PrimeNG 原生 radio
  ],
})
export class TLS2B010Component extends BasicQueryPageComponent<any> implements OnInit {
  readonly defaultPageSize = 20;
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  /** ★ 後端「明細表」Totals 承接容器（提供給 footer 總計列） */
  detailTotals: { BOOK_PayAmt: number; ACT_PayAmt: number; OVER_PayAmt: number } = {
    BOOK_PayAmt: 0,
    ACT_PayAmt: 0,
    OVER_PayAmt: 0,
  };

  /** 進頁面 initializePage 會先呼叫一次 onSubmit，用這個把第一次擋掉 */
  private skipFirstSubmit = true;
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  data: any[] = [];
  closeDate = '查詢中...';

  ECR_TypeOptions = [
    { label: '全部', value: null },
    { label: '統收', value: '1' },
    { label: '自收', value: '2' },
  ];

  CashShowupByOptions = [
    { value: 1, label: '全部' },
    { value: 2, label: '金額不為0' },
    { value: 3, label: '溢欠' },
  ];
  selectedItems: any[] = [];
  totalRecords = 0;

  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  reimbursementOptions: any[] = [
    { value: 1, label: '系統帳', disabled: true },
    { value: 3, label: '實收帳' },
  ];
  reporttypeOptions: any[] = [
    { value: 1, label: '支付別溢欠明細表' },
    { value: 2, label: '溢欠簡表' },
  ];
  printedAt = '';
  simpleData: any[] = [];

  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    ECR_No_List: [[]],
    TLT_No_List: [[]],
    tlt_building: [null],
    tlt_floor: [[]],
    area_no: [null],
    ECR_Type: [null],
    cashShowUp: [1],
    reimbursementType: [[1], Validators.nullValidator],
    reporttype: [1],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });

  constructor(
    private tls2B010Service: TLS2B010Service,
    public override messageService: NotificationService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    public datePipe: DatePipe,
  ) {
    super();
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  ngOnInit(): void {
    this.queryForm.patchValue(
      {
        pageIndex: 1,
        pageSize: this.defaultPageSize,
      },
      { emitEvent: false }
    );

    console.log('ngOnInit pageIndex =', this.queryForm.value.pageIndex);
    console.log('ngOnInit pageSize =', this.queryForm.value.pageSize);
    this.initializePage(
      'TLS2B010',
      '/tls2000/tls2B010cru',
      this.queryForm,
      (form) => this.onSubmit(form),
    );

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });

    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));

    this.queryForm.get('reimbursementType')?.valueChanges.subscribe((val) => {
      if (this.queryForm.get('reporttype')?.value === 1) {
        this.updateColumnVisibility(val ?? []);
      }
    });
    this.updateColumnVisibility(this.queryForm.get('reimbursementType')?.value || []);

    // 🔹 監聽「報表格式」切換：明細表 ↔ 簡表 時先清空 table
    this.queryForm.get('reporttype')?.valueChanges.subscribe((val) => {
      this.onReportTypeChange(val ?? 1);  // 如果是 null，就當成 1
    });

    this.printedAt = this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm') || '';
    this.refreshCloseDate();
  }
  // 報表格式切換時（1: 明細表, 2: 簡表）先清空資料與總計
  onReportTypeChange(reporttype: number): void {
    // 清空兩個 table 的資料來源
    this.data = [];
    this.simpleData = [];

    // 重置總筆數
    this.totalRecords = 0;

    // 重置明細表總計
    this.detailTotals = {
      BOOK_PayAmt: 0,
      ACT_PayAmt: 0,
      OVER_PayAmt: 0,
    };

    // 簡表 lazy key 也重置，避免之後第一次排序被當成重複而 skip
    if (reporttype === 2) {
      this.lastSimpleLazyKey = null;
    }

    // 如果你希望切換時欄位可見性也重新套一次（只影響明細表）
    if (reporttype === 1) {
      const selected = this.queryForm.get('reimbursementType')?.value || [];
      this.updateColumnVisibility(selected);
    }
  }

  updateColumnVisibility(selectedValues: number[]) {
    const reporttype = this.queryForm.controls.reporttype.value;

    const alwaysVisibleFields = [
      'building_desc',
      'floor_desc',
      'ECR_No',
      'TLT_NO',
      'TLT_Name',
      ...(reporttype === 1 ? ['PAY_NO', 'PAY_Name'] : []),
    ];
    const visibilityMap = new Set(alwaysVisibleFields);

    if (selectedValues.includes(1)) visibilityMap.add('BOOK_PayAmt');
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
    // ★ 第一次（通常是 initializePage 在 ngOnInit 叫的）直接略過，不打 API
    if (this.skipFirstSubmit) {
      this.skipFirstSubmit = false;
      return;
    }

    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }


    // 組 payload（含 TXN_Date -> yyyy-MM-dd）
    const payload: any = { ...form.value };
    payload.TXN_Date = this.toDateOnly(payload.TXN_Date);
    payload.pageSize = Number(payload.pageSize || this.defaultPageSize);
    payload.pageIndex = payload.pageIndex || 1;
    console.log('onSubmit form.pageIndex =', form.value.pageIndex);
    console.log('onSubmit form.pageSize =', form.value.pageSize);
    console.log('onSubmit payload.pageIndex =', payload.pageIndex);
    console.log('onSubmit payload.pageSize =', payload.pageSize);
    // 帶入店號
    const userInfo = localStorage.getItem('UserInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.SYS_StoreNo) payload['SYS_StoreNo'] = parsed.SYS_StoreNo;
      } catch { /* ignore */ }
    }

    // 清除空值
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (typeof value === 'string') {
        payload[key] = value.trim();
        if (payload[key] === '') delete payload[key];
      }
      if (Array.isArray(value) && value.length === 0) delete payload[key];
      if (value === null || value === undefined) delete payload[key];
    });

    // 排除前端控制欄位
    delete payload['reimbursementType'];

    this.loading = true;
    this.messageService.blockUi();

    // 查詢前清空總計，避免殘留
    this.detailTotals = { BOOK_PayAmt: 0, ACT_PayAmt: 0, OVER_PayAmt: 0 };

    const reporttype = form.controls['reporttype'].value; // 1=明細, 2=簡表
    payload.TXN_Date = this.toDateOnly(payload.TXN_Date);
    // 🔧 簡表：只把 TXN_Date 從 SortBy 拿掉，保留使用者點的欄位跟 order（含 -1）
    if (reporttype === 2) {
      const currentSort = (payload.SortBy || []).filter(
        (s: any) => s?.field && s.field !== 'TXN_Date'
      );

      payload.SortBy = currentSort.length > 0
        ? currentSort
        : [
          { field: 'ECR_No', order: 1 },
          { field: 'TLT_NO', order: 1 },
        ];
    }

    const apiCall =
      reporttype === 2
        ? this.tls2B010Service.simpleTLS2B010(payload)
        : this.tls2B010Service.queryTLS2B010(payload);

    apiCall
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
          this.refreshCloseDate();
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.Status !== '0000') {
            this.messageService.errorBubble(res?.Message || '查詢失敗');
            return;
          }

          // 成功
          this.queryStateService.setQueryState(this.ProgNo, payload);

          if (reporttype === 2) {
            // ===== 溢欠簡表 =====
            const dataObj = res.Data || {};
            const rawData: any[] = dataObj.QueryData || [];

            // 產穩定 ID，避免 dataKey 抓不到
            this.simpleData = rawData.map((row: any, idx: number) => ({
              ID: `${row.ECR_No || 'NA'}_${row.TXN_Date || ''}_${idx}`,
              ...row,
            }));

            // 綁到通用資料來源 + 切換欄位組
            this.data = this.simpleData;
            // this.columns = this.simplecolumns;

            // 總筆數
            this.totalRecords =
              (typeof dataObj.TotalCount === 'number' ? dataObj.TotalCount : null) ??
              (typeof res.TotalCount === 'number' ? res.TotalCount : 0) ??
              this.data.length;

            // 簡表不做動態欄位可見性（避免被 reimbursementType 影響）
          } else {
            // ===== 支付別溢欠明細表 =====
            const responseData = res.Data || {};
            this.data = responseData.QueryData || [];
            this.columns = this.columns; // 保持明細欄位組
            this.totalRecords =
              (typeof responseData.TotalCount === 'number' ? responseData.TotalCount : null) ??
              (typeof res.TotalCount === 'number' ? res.TotalCount : 0) ??
              this.data.length;

            // 後端總計（供頁尾顯示）
            const t = responseData.Totals || {};
            this.detailTotals = {
              BOOK_PayAmt: Number(t.SumBOOK_PayAmt ?? 0),
              ACT_PayAmt: Number(t.SumACT_PayAmt ?? 0),
              OVER_PayAmt: Number(t.SumOVER_PayAmt ?? 0),
            };

            // 依勾選（系統帳/實收帳）調整欄位顯示
            this.updateColumnVisibility(this.queryForm.get('reimbursementType')?.value || []);
          }
        },
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('查詢發生錯誤');
        },
      });
  }
  private lastSimpleLazyKey: string | null = null;
  handleLazyLoad(
    e: { pageIndex: number; pageSize: number; SortBy: any[] },
    form: FormGroup
  ) {
    const reporttype = this.queryForm.controls.reporttype.value;

    let sortBy = e.SortBy || [];
    if (reporttype === 2) {
      // 🔧 簡表：過濾掉 TXN_Date，避免 sql_variant 轉 datetime
      sortBy = sortBy.filter(s => s?.field && s.field !== 'TXN_Date');
      if (sortBy.length === 0) {
        sortBy = [
          { field: 'ECR_No', order: 1 },
          { field: 'TLT_NO', order: 1 },
        ];
      }

      // 🔐 去重：同一組 pageIndex/pageSize/SortBy 已經處理過，就不再打 API
      const keyObj = { pageIndex: e.pageIndex, pageSize: e.pageSize, SortBy: sortBy };
      const key = JSON.stringify(keyObj);

      if (this.lastSimpleLazyKey === key) {
        // console.log('skip duplicate simple lazy load', keyObj);
        return;
      }
      this.lastSimpleLazyKey = key;
    }

    form.patchValue(
      {
        pageIndex: e.pageIndex,
        pageSize: e.pageSize,
        SortBy: sortBy
      },
      { emitEvent: false }
    );

    this.onSubmit(form);
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
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_NO', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'PAY_Name', header: '付款別', visible: true },
    { field: 'BOOK_PayAmt', header: '系統帳', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'ACT_PayAmt', header: '實收帳', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'OVER_PayAmt', header: '溢欠差異(實收 - 系統帳)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
  ];

  simplecolumns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (value: any) =>
        value
          ? new Date(value).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
          : '',
    },
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_NO', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'OVER_PayAmt', header: '溢欠金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'OVER_Desc', header: '溢欠說明', visible: true },
    { field: 'Monthly_OVER_PayAmt', header: '月累計溢欠', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
    { field: 'Remark', header: '備註', visible: false },
  ];

  refreshCloseDate(): void {
    this.closeDate = '查詢中...';
    this.tls2B010Service.getCloseDate().subscribe({
      next: (res) => {
        const d = res?.Data ?? res;
        const close =
          d?.CLS_DATE ??
          d?.LastCloseDate ??
          d?.CloseDate ??
          d?.closeDate ??
          (typeof d === 'string' ? d : null);

        this.closeDate = close || '-';
      },
      error: () => (this.closeDate = '-'),
    });
  }

  // 產 payload（查詢/匯出共用）
  private buildPayload(): any {
    const form = this.queryForm;
    const payload: any = { ...form.value };

    // ✅ 轉日期成 yyyy-MM-dd
    payload.TXN_Date = this.toDateOnly(payload.TXN_Date);

    // 店號（從 localStorage）
    const userInfo = localStorage.getItem('UserInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.SYS_StoreNo) payload['SYS_StoreNo'] = parsed.SYS_StoreNo;
      } catch { /* ignore */ }
    }

    // 清除空值
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (typeof value === 'string') {
        payload[key] = value.trim();
        if (payload[key] === '') delete payload[key];
      }
      if (Array.isArray(value) && value.length === 0) delete payload[key];
      if (value === null || value === undefined) delete payload[key];
    });

    // 排除前端控制欄位
    delete payload['reimbursementType'];

    return payload;
  }

  // 從 Content-Disposition 取檔名
  private getFilenameFromResponse(res: any, fallback: string): string {
    // const cd = res.headers?.get?.('Content-Disposition') || res.headers?.get?.('content-disposition');
    // if (!cd) return fallback;
    // const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    // if (!match || !match[1]) return fallback;
    // return decodeURIComponent(match[1].replace(/['"]/g, ''));
    const cd = res.headers?.get?.('Content-Disposition') || res.headers?.get?.('content-disposition');
    if (!cd) return fallback;

    // 1. 優先找標準的 filename* (UTF-8)
    const filenameStarMatch = cd.match(/filename\*=UTF-8''([^;]+)/i);
    if (filenameStarMatch) {
      return decodeURIComponent(filenameStarMatch[1]);
    }

    // 2. 次之找一般的 filename (處理引號與非引號狀況)
    const filenameMatch = cd.match(/filename="?([^";]+)"?/i);
    if (filenameMatch) {
      return decodeURIComponent(filenameMatch[1]);
    }

    return fallback;
  }

  // 下載 blob
  private saveBlob(res: any, defaultName: string) {
    const blob = new Blob([res.body], { type: res.body?.type || 'application/octet-stream' });
    // const fileName = this.getFilenameFromResponse(res, defaultName);
    const fileName = defaultName;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // === 匯出：Excel ===
  btnLoading = false;

  downloadTLS2B010Excel(): void {
    const reporttype = this.queryForm.controls['reporttype'].value; // 1=明細, 2=簡表
    const payload = this.buildPayload();

    this.btnLoading = true;
    this.messageService.blockUi();

    const obs = reporttype === 2
      ? this.tls2B010Service.exportTLS2B010SimpleExcel(payload) // 若後端未開此路由，可改成 exportTLS2B010Excel
      : this.tls2B010Service.exportTLS2B010Excel(payload);

    obs.subscribe({
      next: (res) => {
        this.saveBlob(res, reporttype === 2
          ? `溢欠簡表_${this.formattedTXNDate}.xlsx`
          : `支付別溢欠明細表_${this.formattedTXNDate}.xlsx`);
        this.messageService.successBubble('Excel 產檔完成');
      },
      error: (err) => {
        console.error(err);
        this.messageService.errorBubble('Excel 匯出失敗');
      }
    }).add(() => {
      this.btnLoading = false;
      this.messageService.unblockUi();
    });
  }

  // === 匯出：PDF ===
  downloadTLS2B010PDF(): void {
    const reporttype = this.queryForm.controls['reporttype'].value; // 1=明細, 2=簡表
    const payload = this.buildPayload();

    this.btnLoading = true;
    this.messageService.blockUi();

    const obs = reporttype === 2
      ? this.tls2B010Service.exportTLS2B010SimplePDF(payload) // 若後端未開此路由，可改成 exportTLS2B010PDF
      : this.tls2B010Service.exportTLS2B010PDF(payload);

    obs.subscribe({
      next: (res) => {
        this.saveBlob(res, reporttype === 2
          ? `溢欠簡表_${this.formattedTXNDate}.pdf`
          : `支付別溢欠明細表_${this.formattedTXNDate}.pdf`);
        this.messageService.successBubble('PDF 產檔完成');
      },
      error: (err) => {
        console.error(err);
        this.messageService.errorBubble('PDF 匯出失敗');
      }
    }).add(() => {
      this.btnLoading = false;
      this.messageService.unblockUi();
    });
  }

  // 1) 新增這個工具函式（放在 component 裡即可）
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    // 輸出 yyyy-MM-dd（只有日期、無時間/時區）
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
